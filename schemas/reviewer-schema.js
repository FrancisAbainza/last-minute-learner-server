import z from "zod";

export const reviewerSchema = z.object({
  title: z.string().describe('An appropriate title for the study topic'),
  description: z.string().describe('A short description about the study topic'),
  field: z.string().describe('Field of study (e.g., Biology, Chemistry, Physics)'),
  detailedReviewer: z.string().describe('A comprehensive study reviewer with clear section headers, bullet points, and highlighted terms'),
  terminologies: z
    .array(z.object({ 
      term: z.string().describe('The terminology term'), 
      definition: z.string().describe('The definition of the term') 
    }))
    .describe('An array of key terms and definitions (10-30 items)'),
  essentialFacts: z.array(z.string()).describe('An array of important facts to remember (5-20 items)'),
});

export const inputSchema = z.object({
  prompt: z.string().optional(),
  file: z.any().optional(), // placeholder so refine works
}).refine((data) => data.prompt || data.file, {
  message: 'Either prompt or file must be provided',
});
