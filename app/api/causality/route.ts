import { generateText } from "ai";
import { AI_NOT_CONFIGURED, gatewayLooksUnconfigured, isGatewayUnavailableError } from "@/lib/ai-gateway";

export async function POST(request: Request) {
  if (gatewayLooksUnconfigured()) return Response.json(AI_NOT_CONFIGURED, { status: 503 });
  try {
    const { cause, effect, timestamps } = await request.json();

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
    if (isGatewayUnavailableError(error)) {
      console.error("AI gateway unavailable");
      return Response.json(AI_NOT_CONFIGURED, { status: 503 });
    }
    console.error("Causality analysis error:", error);
    return Response.json(
      { error: "Failed to analyze causality" },
      { status: 500 }
    );
  }
}
