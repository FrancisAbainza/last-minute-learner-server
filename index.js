// server.js
import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import cors from 'cors';
import 'dotenv/config';

const app = express();

// configure multer to hold file in memory
const upload = multer({ storage: multer.memoryStorage() });

// Zod schema (only prompt; file validated separately)
const reviewerSchema = z
  .object({
    prompt: z.string().optional(),
    file: z.any().optional(), // placeholder so refine works
  })
  .refine((data) => data.prompt || data.file, {
    message: 'Either prompt or file must be provided',
  });

app.use(cors({ origin: ["http://localhost:3000", "https://last-minute-learner.vercel.app"] }));

// POST endpoint
app.post('/api/generate-reviewer', upload.single('file'), async (req, res) => {
  try {
    const input = {
      prompt: req.body.prompt,
      file: req.file,
    };

    // validate prompt & presence of at least one
    reviewerSchema.parse({ prompt: input.prompt, file: input.file });

    // validate file type
    if (input.file && input.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // extract PDF text
    let pdfText = '';
    if (input.file) {
      const { default: pdf } = await import('pdf-parse');
      const data = await pdf(input.file.buffer);
      pdfText = data.text;
    }

    const content = [input.prompt, pdfText].filter(Boolean).join('\n\n');

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        title: z.string(),
        description: z.string(),
        field: z.string(),
        detailedReviewer: z.string(),
        terminologies: z
          .array(z.object({ term: z.string(), definition: z.string() }))
          .min(10)
          .max(30),
        essentialFacts: z.array(z.string()).min(5).max(20),
      }),
      prompt: `You are a helpful study reviewer generator. Based on the content below, produce:
1. Title: An appropriate title for the topic
2. Description: A short description about the topic
3. Field: Field of study (e.g., Biology, Chemistry, etc.)
4. Detailed Reviewer: A comprehensive study reviewer based on the content. Use clean, readable formatting with:
   - Clear section headers
   - Bullet points for lists
   - Important terms highlighted
   - Natural organization that flows well
   Make it comprehensive enough to serve as a complete study guide that students would actually want to use.
5. Terminologies: An array of objects (term & definition, at least 10, max 30)
6. Essential Facts: An array of strings (at least 5, max 20)

Content: ${content}`,
    });

    res.json(result.object);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
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
