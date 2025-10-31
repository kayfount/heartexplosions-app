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
import dominantTypes from '@/lib/dominant-types.json';

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
    preferredWorkLifeBalance: z.string().optional(),
    collaborationStyle: z.string().optional(),
    structurePreference: z.string().optional(),
    careerIdeas: z.array(z.string()).optional(),
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
    prompt: `You are an expert career and purpose coach with a deep understanding of the Enneagram. Your task is to generate 3-5 unique and actionable career, calling, or contribution ideas by performing a deep synthesis of the user's complete profile.

The ideas must be bespoke, inspirational, and feel like a compass for their most ideal career path. This is not about listing generic jobs. It's about alchemy—transmuting their personality, values, skills, and dreams into novel paths that honor their full being.

**User's Unique Purpose Archetype & Profile:**
- **Enneagram Type:** {{{userProfile.enneagramType}}}
- **Wing:** {{{userProfile.wing}}}
- **Subtype (Dominant Instinct):** {{{userProfile.subtype}}}
- **Instinctual Stacking:** {{{userProfile.instinctualStacking}}}
- **Tritype/Trifix:** {{{userProfile.trifix}}}
- **Core Values:** {{#if userProfile.coreValues}}{{#each userProfile.coreValues}}- {{{this}}}{{/each}}{{else}}Not specified.{{/if}}
- **Skills:** {{#if userProfile.skills}}{{#each userProfile.skills}}- {{{this}}}{{/each}}{{else}}Not specified.{{/if}}
- **Passions:** {{#if userProfile.passions}}{{#each userProfile.passions}}- {{{this}}}{{/each}}{{else}}Not specified.{{/if}}
- **Work that Energizes Them:** {{{userProfile.energizingWork}}}
- **Ideal Work Environment:**
    - **Work/Life Balance:** {{{userProfile.preferredWorkLifeBalance}}}
    - **Collaboration Style:** {{{userProfile.collaborationStyle}}}
    - **Structure Preference:** {{{userProfile.structurePreference}}}
- **Their Own Ideas:** {{#if userProfile.careerIdeas}}{{#each userProfile.careerIdeas}}- {{{this}}}{{/each}}{{else}}None listed.{{/if}}

**Reference Data: Aligned Careers by Enneagram Dominant Type (Use for inspiration, not as a definitive list)**
${JSON.stringify(dominantTypes.map(t => ({type: t.type_number, careers: t['Type Aligned Careers Examples']})))}

**Instructions:**
1.  **Synthesize, Don't Just List:** Go beyond the reference data. How does their Trifix, Subtype, and Stacking modify the typical careers for their dominant type? For example, a creative Type 3w4 needs a different path than a corporate 3w2.
2.  **Incorporate Personal Data:** Weave in their skills, passions, and ideal work environment. If they value 'Autonomy' and 'Nature', a remote-first environmental consulting role might be a better fit than a corporate office job.
3.  **Produce Bespoke Ideas:** The output should be 3-5 concise, actionable phrases. Examples:
    *   "Founding a design studio for mission-driven startups." (For a creative, entrepreneurial 3w4)
    *   "Developing therapeutic horticulture programs for community centers." (For a nurturing, nature-loving 2w1)
    *   "Leading remote-first engineering teams with a focus on sustainable tech." (For a 5w6 who values independence and making an impact)

Generate the list of ideas and place them in the 'ideas' array.
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
