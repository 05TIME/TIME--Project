import { generateText } from "ai";

export async function POST(request: Request) {
  try {
    const { cause, effect, timestamps } = await request.json();

    const result = await generateText({
      model: "openai/gpt-5-mini",
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
