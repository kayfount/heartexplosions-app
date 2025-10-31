'use server';

/**
 * @fileOverview Generates career, calling, and contribution ideas based on a user's profile.
 *
 * - generateCareerIdeas - A function that generates ideas.
 * - GenerateCareerIdeasInput - The input type for the function.
 * - GenerateCareerIdeasOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { UserProfile } from '@/models/user-profile';

// We can't import the full UserProfile Zod schema from another file,
// so we define a simplified version for the AI flow input.
const UserProfileSchema = z.object({
    enneagramType: z.string().optional(),
    wing: z.string().optional(),
    subtype: z.string().optional(),
    instinctualStacking: z.string().optional(),
    trifix: z.string().optional(),
    coreValues: z.array(z.string()).optional(),
    skills: z.array(z.string()).optional(),
    passions: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    energizingWork: z.string().optional(),
    dreamLife: z.string().optional(),
}).describe("A user's profile containing their personality traits, values, skills, and aspirations.");


const GenerateCareerIdeasInputSchema = z.object({
  userProfile: UserProfileSchema,
});
export type GenerateCareerIdeasInput = z.infer<typeof GenerateCareerIdeasInputSchema>;

const GenerateCareerIdeasOutputSchema = z.object({
  ideas: z.array(z.string()).describe('A list of 3-5 unique and actionable career, calling, or contribution ideas.'),
});
export type GenerateCareerIdeasOutput = z.infer<typeof GenerateCareerIdeasOutputSchema>;


export async function generateCareerIdeas(
  input: GenerateCareerIdeasInput
): Promise<GenerateCareerIdeasOutput> {
  return generateCareerIdeasFlow(input);
}


const prompt = ai.definePrompt({
    name: 'generateCareerIdeasPrompt',
    input: { schema: GenerateCareerIdeasInputSchema },
    output: { schema: GenerateCareerIdeasOutputSchema },
    prompt: `You are an expert career and purpose coach. Based on the user's comprehensive profile, generate 3-5 unique and actionable career, calling, or contribution ideas. 

The ideas should be a creative synthesis of their personality (Enneagram), core values, skills, passions, and what they find energizing. The ideas should be specific and inspiring.

**User Profile:**
- **Enneagram Type:** {{{userProfile.enneagramType}}}
- **Wing:** {{{userProfile.wing}}}
- **Subtype:** {{{userProfile.subtype}}}
- **Instinctual Stacking:** {{{userProfile.instinctualStacking}}}
- **Trifix:** {{{userProfile.trifix}}}
- **Core Values:** {{#each userProfile.coreValues}}- {{{this}}}{{/each}}
- **Skills:** {{#each userProfile.skills}}- {{{this}}}{{/each}}
- **Passions:** {{#each userProfile.passions}}- {{{this}}}{{/each}}
- **Interests:** {{#each userProfile.interests}}- {{{this}}}{{/each}}
- **Work that Energizes Them:** {{{userProfile.energizingWork}}}
- **Their Dream Life:** {{{userProfile.dreamLife}}}

Based on this information, provide a list of 3-5 ideas in the 'ideas' array. Each idea should be a concise phrase or a short sentence.
`,
});


const generateCareerIdeasFlow = ai.defineFlow(
  {
    name: 'generateCareerIdeasFlow',
    inputSchema: GenerateCareerIdeasInputSchema,
    outputSchema: GenerateCareerIdeasOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
