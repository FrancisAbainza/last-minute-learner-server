// server.js
import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { gateway, generateObject } from 'ai';
import cors from 'cors';
import 'dotenv/config';
import { inputSchema, reviewerSchema } from './schemas/reviewer-schema.js';
import { extractText } from './util/text-extractor.js';

const app = express();
const model = gateway('anthropic/claude-sonnet-4');

// configure multer to hold file in memory
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: [/* "http://localhost:3000",  */"https://last-minute-learner.vercel.app"] }));

// POST endpoint
app.post('/api/generate-reviewer', upload.single('file'), async (req, res) => {
  try {
    const input = {
      prompt: req.body.prompt,
      file: req.file,
    };

    // validate prompt & presence of at least one
    inputSchema.parse({ prompt: input.prompt, file: input.file });

    // validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
    ];
    
    if (input.file && !allowedMimeTypes.includes(input.file.mimetype)) {
      return res.status(400).json({ error: 'Only PDF, DOCX, and PPTX files are allowed' });
    }

    // Extract file text
    const fileText = await extractText(input.file);

    const content = [input.prompt, fileText].filter(Boolean).join('\n\n');
    console.log(fileText);

    const { object } = await generateObject({
      model,
      schema: reviewerSchema,
      messages: [
        {
          role: 'system',
          content:
            `You are a helpful study reviewer generator. ` +
            `Based on the content provided, produce:\n` +
            `1. Title: An appropriate title for the topic\n` +
            `2. Description: A short description about the topic\n` +
            `3. Field: Field of study (e.g., Biology, Chemistry, etc.)\n` +
            `4. Reviewer: An object containing:\n` +
            `   - Detailed Reviewer: A comprehensive study reviewer based on the content. ` +
            `Use clean, readable formatting with clear section headers, ` +
            `bullet points for lists, important terms highlighted, ` +
            `and natural organization that flows well. ` +
            `Make it comprehensive enough to serve as a complete study guide that students would actually want to use.\n` +
            `   - Terminologies: An array of objects (term & definition, at least 10, max 30)\n` +
            `   - Essential Facts: An array of strings (at least 5, max 20)\n` +
            `5. Flashcards: An array of objects (front & back, at least 10, max 30). ` +
            `The front should contain a question or prompt, and the back should contain the answer or explanation. ` +
            `Focus on key concepts, definitions, and important facts from the content.\n` +
            `6. Quiz: An array of quiz questions (at least 10, max 20). Each question must have exactly 4 choices and 1 correct answer. ` +
            `The correct answer must match one of the 4 choices exactly. ` +
            `Cover a range of difficulty levels and topics from the content.`,
        },
        {
          role: 'user',
          content,
        },
      ],
    });

    res.json(object);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues });
    }
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// a simple test endpoint
app.get('/api/custom', (req, res) => {
  res.json({ message: 'Hello from Express API' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API server listening on ${port}`));