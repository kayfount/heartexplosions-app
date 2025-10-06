'use server';

/**
 * @fileOverview Creates a realistic route plan based on user inputs.
 *
 * - createRealisticRoutePlan - A function that generates a route plan.
 * - RoutePlanInput - The input type for the createRealisticRoutePlan function.
 * - RoutePlanOutput - The return type for the createRealisticRoutePlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RoutePlanInputSchema = z.object({
  availableHours: z
    .number()
    .describe('The number of hours available per week for the plan.'),
  commitments: z
    .string()
    .describe('A description of the user\'s existing commitments.'),
  timeline: z.string().describe('The desired timeline for the route plan.'),
});

export type RoutePlanInput = z.infer<typeof RoutePlanInputSchema>;

const RoutePlanOutputSchema = z.object({
  routePlan: z
    .string()
    .describe(
      'A realistic route plan that includes milestones, weekly action steps, pacing suited to real capacity, and integrated progress tracking.'
    ),
});

export type RoutePlanOutput = z.infer<typeof RoutePlanOutputSchema>;

export async function createRealisticRoutePlan(
  input: RoutePlanInput
): Promise<RoutePlanOutput> {
  return createRealisticRoutePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createRealisticRoutePlanPrompt',
  input: {schema: RoutePlanInputSchema},
  output: {schema: RoutePlanOutputSchema},
  prompt: `Based on the user's available hours, commitments, and timeline, create a realistic route plan.

Available Hours: {{{availableHours}}}
Commitments: {{{commitments}}}
Timeline: {{{timeline}}}

The route plan should include milestones, weekly action steps, pacing suited to the user's real capacity, and integrated progress tracking.`,
});

const createRealisticRoutePlanFlow = ai.defineFlow(
  {
    name: 'createRealisticRoutePlanFlow',
    inputSchema: RoutePlanInputSchema,
    outputSchema: RoutePlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
