'use server';

/**
 * @fileOverview An AI coach interaction flow.
 *
 * - interactWithAiCoach - A function that allows users to interact with an AI coach.
 * - InteractWithAiCoachInput - The input type for the interactWithAiCoach function.
 * - InteractWithAiCoachOutput - The return type for the interactWithAiCoach function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InteractWithAiCoachInputSchema = z.object({
  query: z.string().describe('The user query to the AI coach.'),
});
export type InteractWithAiCoachInput = z.infer<typeof InteractWithAiCoachInputSchema>;

const InteractWithAiCoachOutputSchema = z.object({
  response: z.string().describe('The AI coach response to the user query.'),
});
export type InteractWithAiCoachOutput = z.infer<typeof InteractWithAiCoachOutputSchema>;

export async function interactWithAiCoach(input: InteractWithAiCoachInput): Promise<InteractWithAiCoachOutput> {
  return interactWithAiCoachFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interactWithAiCoachPrompt',
  input: {schema: InteractWithAiCoachInputSchema},
  output: {schema: InteractWithAiCoachOutputSchema},
  prompt: `You are a compassionate and insightful AI coach, dedicated to helping users discover and live their purpose.\n\nRespond to the following user query with personalized guidance and support:\n\nQuery: {{{query}}}`,
});

const interactWithAiCoachFlow = ai.defineFlow(
  {
    name: 'interactWithAiCoachFlow',
    inputSchema: InteractWithAiCoachInputSchema,
    outputSchema: InteractWithAiCoachOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
