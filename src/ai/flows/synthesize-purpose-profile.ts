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
  enneagramType: z.string().optional(),
  wing: z.string().optional(),
  subtype: z.string().optional(),
  instinctualStacking: z.string().optional(),
  trifix: z.string().optional(),
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
  prompt: `You are an AI purpose coach with deep wisdom about the Enneagram. Your task is to generate a 1-2 paragraph "Purpose Profile" for the user based on their Unique Purpose Archetype and their chosen focus area.

**User's Unique Purpose Archetype:**
- **Dominant Type:** {{{enneagramType}}}
- **Wing:** {{{wing}}}
- **Subtype (Dominant Instinct):** {{{subtype}}}
- **Instinctual Stacking:** {{{instinctualStacking}}}
- **Tritype/Trifix:** {{{trifix}}}

**Chosen Focus Area:** {{{focusArea}}}

**Instructions:**

- **If the focus area is 'contribution':** Write 1-2 paragraphs describing the unique **contributions, gifts, and offerings** this person's specific archetype can offer the world. How does their combination of Type, Wing, Subtype, and Trifix create a unique strength? What is their zone of genius? Be specific and inspiring.

- **If the focus area is 'calling':** Write 1-2 paragraphs describing the **highest spiritual calling** of this person's unique purpose archetype. What is the deeper, soul-level work they are here to do? How can they use their specific Enneagram configuration to serve a higher purpose and find profound meaning?

The response should be insightful, affirmative, and directly address the user's archetype. Output the response in the 'purposeProfile' field.
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
