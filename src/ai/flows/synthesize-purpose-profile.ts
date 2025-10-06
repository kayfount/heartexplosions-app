'use server';

/**
 * @fileOverview A flow for synthesizing insights into a Purpose Profile.
 *
 * - synthesizePurposeProfile - A function that synthesizes insights into a Purpose Profile.
 * - SynthesizePurposeProfileInput - The input type for the synthesizePurposeProfile function.
 * - SynthesizePurposeProfileOutput - The return type for the synthesizePurposeProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SynthesizePurposeProfileInputSchema = z.object({
  driverReport: z.string().describe('The Life Purpose Report generated from the Driver stage.'),
  focusArea: z.enum(['career', 'contribution', 'calling']).describe('The selected focus area (career, contribution, or calling).'),
});
export type SynthesizePurposeProfileInput = z.infer<typeof SynthesizePurposeProfileInputSchema>;

const SynthesizePurposeProfileOutputSchema = z.object({
  purposeProfile: z.string().describe('The synthesized Purpose Profile.'),
  alignedPath: z.string().describe('The most aligned path based on the focus area.'),
  edgeOfChoosingPrompts: z.string().describe('Prompts to help the user make choices.'),
  quickWins: z.string().describe('Quick wins for the user to get started.'),
});
export type SynthesizePurposeProfileOutput = z.infer<typeof SynthesizePurposeProfileOutputSchema>;

export async function synthesizePurposeProfile(input: SynthesizePurposeProfileInput): Promise<SynthesizePurposeProfileOutput> {
  return synthesizePurposeProfileFlow(input);
}

const prompt = ai.definePrompt({
  name: 'synthesizePurposeProfilePrompt',
  input: {schema: SynthesizePurposeProfileInputSchema},
  output: {schema: SynthesizePurposeProfileOutputSchema},
  prompt: `You are an AI purpose coach. You will synthesize the user's insights from their Driver report and their selected focus area to create a Purpose Profile.

Driver Report: {{{driverReport}}}
Focus Area: {{{focusArea}}}

Based on this information, identify the most aligned path for the user, provide edge of choosing prompts to help them make decisions, and suggest quick wins to get them started.

Output the purpose profile, aligned path, edge of choosing prompts, and quick wins in the appropriate fields. Follow this format strictly:

Purpose Profile:
<purpose profile>

Aligned Path:
<aligned path>

Edge of Choosing Prompts:
<edge of choosing prompts>

Quick Wins:
<quick wins>`,
});

const synthesizePurposeProfileFlow = ai.defineFlow(
  {
    name: 'synthesizePurposeProfileFlow',
    inputSchema: SynthesizePurposeProfileInputSchema,
    outputSchema: SynthesizePurposeProfileOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
