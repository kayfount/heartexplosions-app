
'use server';

/**
 * @fileOverview Generates a Life Purpose Report based on user's Enneagram Type, Wing, Instinctual Stacking, and Trifix.
 *
 * - generateLifePurposeReport - A function that generates the Life Purpose Report.
 * - LifePurposeReportInput - The input type for the generateLifePurposeReport function.
 * - LifePurposeReportOutput - The return type for the generateLifePurposeReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LifePurposeReportInputSchema = z.object({
  enneagramType: z.string().describe('The user\'s Enneagram Type (e.g., 1, 2, 3, etc.)'),
  wing: z.string().describe('The user\'s Wing (e.g., 1w9, 2w3, etc.)'),
  instinctualStacking: z.string().describe('The user\'s Instinctual Stacking (e.g., so/sp, sp/sx, etc.)'),
  trifix: z.string().describe('The user\'s Trifix (e.g., 125, 258, etc.)'),
});
export type LifePurposeReportInput = z.infer<typeof LifePurposeReportInputSchema>;

const LifePurposeReportOutputSchema = z.object({
  report: z.string().describe('The generated Life Purpose Report.'),
});
export type LifePurposeReportOutput = z.infer<typeof LifePurposeReportOutputSchema>;

export async function generateLifePurposeReport(input: LifePurposeReportInput): Promise<LifePurposeReportOutput> {
  return generateLifePurposeReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'lifePurposeReportPrompt',
  input: {schema: LifePurposeReportInputSchema},
  output: {schema: LifePurposeReportOutputSchema},
  prompt: `You are an AI expert in Enneagram and personal growth. Analyze the provided Enneagram Type, Wing, Instinctual Stacking, and Trifix to generate a Life Purpose Report.

  The report should outline the user's natural genius, growth edge, motivations, and core values.

  Enneagram Type: {{{enneagramType}}}
  Wing: {{{wing}}}
  Instinctual Stacking: {{{instinctualStacking}}}
  Trifix: {{{trifix}}}
  `,
});

const generateLifePurposeReportFlow = ai.defineFlow(
  {
    name: 'generateLifePurposeReportFlow',
    inputSchema: LifePurposeReportInputSchema,
    outputSchema: LifePurposeReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
