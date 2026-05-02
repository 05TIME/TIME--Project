import { generateText } from "ai";

// $TIMEOE Causal Temporal Layer - Core Engine
const TIMEOE_TEMPORAL_SYSTEM = `You are the $TIMEOE Temporal Intelligence Engine powered by xAI Grok.

## Core Capabilities

### 1. Granger Causality Analysis
Test if past values of X help predict Y beyond Y's own past:
- F-statistic for significance
- Optimal lag selection via AIC/BIC
- Bidirectional causality detection

### 2. Temporal Pattern Recognition
- Trend extraction (linear, polynomial, exponential)
- Seasonality detection (daily, weekly, monthly, yearly)
- Structural break identification (Chow test, CUSUM)
- Anomaly detection (isolation forest on residuals)

### 3. Causal Inference on Time Series
- Synthetic control methods
- Difference-in-differences for policy analysis
- Interrupted time series analysis
- Regression discontinuity in time

### 4. Forecasting with Causal Constraints
- Vector Autoregression (VAR) with causal ordering
- Bayesian structural time series
- Causal impact estimation

Respond with valid JSON:
{
  "causalityScore": <0-1, Granger F-test p-value inverted>,
  "isCausal": <boolean, p < 0.05>,
  "optimalLag": <number of periods>,
  "direction": "X→Y" | "Y→X" | "bidirectional" | "none",
  "counterfactualDelta": <estimated treatment effect>,
  "decomposition": {
    "trend": "<description>",
    "seasonality": "<pattern>",
    "anomalies": ["<dates/events>"]
  },
  "forecast": {
    "nextPeriod": <value>,
    "confidence95": [<lower>, <upper>]
  },
  "summary": "<detailed causal narrative>",
  "methodology": "<statistical methods used>"
}`;

export async function POST(request: Request) {
  try {
    const { prompt, data, analysisType } = await request.json();

    const result = await generateText({
      model: "xai/grok-3-mini",
      system: TIMEOE_TEMPORAL_SYSTEM,
      prompt: `## $TIMEOE Temporal Analysis Request

**Analysis Type:** ${analysisType || "causal_inference"}

**Temporal Data:**
${JSON.stringify(data || {}, null, 2)}

**Query:** ${prompt}

Apply rigorous causal inference methods. Identify true causal relationships vs spurious correlations. Provide actionable insights with confidence bounds.`,
    });

    const analysis = JSON.parse(result.text);
    return Response.json({
      ...analysis,
      engine: "$TIMEOE + Grok",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("TIMEOE temporal analysis error:", error);
    return Response.json(
      {
        causalityScore: 0,
        isCausal: false,
        counterfactualDelta: 0,
        summary: "Unable to complete analysis. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
        engine: "$TIMEOE + Grok",
        fallback: true,
      },
      { status: 500 }
    );
  }
}
