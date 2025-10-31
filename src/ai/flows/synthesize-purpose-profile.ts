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
  focusArea: z.enum(['contribution', 'calling']).describe('The selected focus area (contribution, or calling).'),
});
export type SynthesizePurposeProfileInput = z.infer<typeof SynthesizePurposeProfileInputSchema>;

const SynthesizePurposeProfileOutputSchema = z.object({
  purposeProfile: z.string().describe('The synthesized Purpose Profile in 1-2 paragraphs based on the selected focus area.'),
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

Based on this information, generate a 1-2 paragraph response for the selected focus area.

If the focus area is 'contribution', describe the unique contributions, gifts, and offerings this person's archetype can offer the world.
If the focus area is 'calling', describe the highest spiritual calling of this person's unique purpose archetype.

Output the response in the 'purposeProfile' field.
`,
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
