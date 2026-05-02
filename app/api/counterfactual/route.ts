import { generateText } from "ai";

export async function POST(request: Request) {
  try {
    const { scenario, baselineData, intervention } = await request.json();

    const result = await generateText({
      model: "openai/gpt-5-mini",
      system: `You are TIMEOE Engine performing counterfactual simulation.
      
Respond with valid JSON:
{
  "baselineOutcome": <number or description>,
  "counterfactualOutcome": <number or description>,
  "delta": <difference>,
  "percentChange": <number>,
  "confidence": <number 0-1>,
  "assumptions": ["<list of assumptions made>"],
  "narrative": "<explanation of what would have happened>"
}`,
      prompt: `Counterfactual scenario: ${scenario}

Baseline data: ${JSON.stringify(baselineData)}
Intervention: ${JSON.stringify(intervention)}

Simulate what would have happened under the alternative scenario.`,
    });

    const simulation = JSON.parse(result.text);
    return Response.json(simulation);
  } catch (error) {
    console.error("Counterfactual simulation error:", error);
    return Response.json(
      { error: "Failed to run counterfactual simulation" },
      { status: 500 }
    );
  }
}
