import { generateText } from "ai";

export async function POST(request: Request) {
  try {
    const { prompt, data } = await request.json();

    const result = await generateText({
      model: "xai/grok-3-mini",
      system: `You are TIMEOE Engine, an advanced temporal intelligence system specializing in causal analysis and counterfactual simulation.
      
Always respond with valid JSON in this exact format:
{
  "causalityScore": <number between 0 and 1>,
  "isCausal": <boolean>,
  "counterfactualDelta": <number>,
  "summary": "<string with analysis>",
  "timelineViz": "<optional string for timeline visualization>"
}

Analyze temporal data for:
- Causal relationships between variables
- Counterfactual scenarios (what-if analysis)
- Time series patterns and anomalies
- Predictive insights based on historical trends`,
      prompt: `Analyze this temporal data: ${JSON.stringify(data || {})}

Question: ${prompt}

Provide causal reasoning and counterfactual simulation results.`,
    });

    const analysis = JSON.parse(result.text);
    return Response.json(analysis);
  } catch (error) {
    console.error("Temporal analysis error:", error);
    return Response.json(
      {
        causalityScore: 0,
        isCausal: false,
        counterfactualDelta: 0,
        summary: "Unable to complete analysis. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
