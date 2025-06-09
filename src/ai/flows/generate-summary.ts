// src/ai/flows/generate-summary.ts
'use server';

/**
 * @fileOverview Generates a summary of the golf round results for sharing.
 *
 * - generateSummary - A function that generates the summary.
 * - GenerateSummaryInput - The input type for the generateSummary function.
 * - GenerateSummaryOutput - The return type for the generateSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSummaryInputSchema = z.object({
  players: z.array(z.string()).describe('Array of player names.'),
  scores: z
    .array(z.record(z.number()))
    .describe('Array of scores for each player, where each score is for a hole.'),
  pars: z.array(z.number()).describe('Array of par values for each hole.'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

const GenerateSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the golf round results.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  return generateSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummaryPrompt',
  input: {
    schema: GenerateSummaryInputSchema,
  },
  output: {schema: GenerateSummaryOutputSchema},
  prompt: `You are an expert golf commentator. You will generate a summary of the golf round results in a suitable format.

Players: {{players}}
Scores: {{scores}}
Pars: {{pars}}

Consider the number of players and how close the scores are when determining the summary format.  If there are many players, or many holes, use a concise format. If it was a close game, highlight who won and by how much.
`,
});

const generateSummaryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFlow',
    inputSchema: GenerateSummaryInputSchema,
    outputSchema: GenerateSummaryOutputSchema,
  },
  async input => {
    const {
      players,
      scores,
      pars,
    } = input;

    // Calculate total scores for each player and relative scores to par.
    const totalPars = pars.reduce((sum, par) => sum + par, 0);
    const playerTotals = players.map((player, index) => {
      const playerScore = scores[index].reduce((sum, score) => sum + score, 0);
      const diffToPar = playerScore - totalPars;
      return {
        name: player,
        total: playerScore,
        diffToPar: diffToPar,
      };
    });

    const {output} = await prompt({
      players: players,
      scores: playerTotals.map(p => ({
        name: p.name,
        total: p.total,
        diffToPar: p.diffToPar,
      })),
      pars: pars,
    });
    return output!;
  }
);
