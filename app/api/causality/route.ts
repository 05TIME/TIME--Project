import { generateText } from "ai";
import { CausalityInput, parseBody } from "@/lib/api-schemas";

export async function POST(request: Request) {
  try {
    const parsed = await parseBody(request, CausalityInput);
    if (!parsed.ok) return parsed.response;
    const { cause, effect, timestamps } = parsed.data;

    const result = await generateText({
      model: "xai/grok-3-mini",
      system: `You are TIMEOE Engine analyzing causal relationships.
      
Respond with valid JSON:
{
  "causalStrength": <number 0-1>,
  "confidence": <number 0-1>,
  "lag": <number in time units>,
  "direction": "forward" | "reverse" | "bidirectional",
  "mechanism": "<explanation of causal pathway>",
  "confounders": ["<potential confounding variables>"]
}`,
      prompt: `Analyze causality between:
Cause variable: ${JSON.stringify(cause)}
Effect variable: ${JSON.stringify(effect)}
Timestamps: ${JSON.stringify(timestamps)}

Determine the causal relationship, strength, and potential mechanisms.`,
    });

    const analysis = JSON.parse(result.text);
    return Response.json(analysis);
  } catch (error) {
    console.error("Causality analysis error:", error);
    return Response.json(
      { error: "Failed to analyze causality" },
      { status: 500 }
    );
  }
}
