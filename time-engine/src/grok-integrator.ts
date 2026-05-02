import { xai } from '@ai-sdk/xai';
import { generateText } from 'ai';
import { z } from 'zod';

const grokModel = xai('grok-4'); // or grok-3 for faster/cheaper

export async function runTemporalAnalysis(prompt: string, data: any) {
  const result = await generateText({
    model: grokModel,
    system: `You are $TIMEŒ Engine + Grok hybrid. 
    Always output in this JSON: { "causalityScore": number, "isCausal": boolean, "counterfactualDelta": number, "summary": string, "timelineViz": string }`,
    prompt: `Analyze this temporal data: ${JSON.stringify(data)}. 
    Question: ${prompt}. 
    Use causal reasoning + counterfactual simulation.`,
  });

  return JSON.parse(result.text);
}

// Example usage in your existing routes
const analysis = await runTemporalAnalysis(
  "What if we double the intervention variable?",
  { timestamps: [...], cause: [...], effect: [...] }
);
console.log(analysis);
