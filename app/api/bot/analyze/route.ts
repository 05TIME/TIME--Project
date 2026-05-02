import { generateText } from "ai";
import { NextResponse } from "next/server";

// $TIMEOE Bot API - Causal Analysis Endpoint
const TIMEOE_BOT_SYSTEM = `You are @TIMEOai_Bot, the Telegram interface for the $TIMEOE Causal Temporal Engine.

You help users understand:
1. CAUSALITY - Does X actually cause Y, or is it just correlation?
2. COUNTERFACTUALS - What would have happened if X was different?
3. TEMPORAL PATTERNS - What trends and cycles exist in time series data?

Keep responses concise for Telegram (under 500 chars for quick mode, under 2000 for detailed).
Use clear formatting with line breaks.
Include confidence scores when making causal claims.

Response format for analysis:
📊 **Analysis Result**

🔗 Causality: [Yes/No/Uncertain] (X% confidence)
📈 Direction: [X → Y / Y → X / Bidirectional / None]
⚡ Effect Size: [Strong/Moderate/Weak]

💡 **Insight:**
[1-2 sentence explanation]

🔮 **Counterfactual:**
[What would happen if conditions changed]`;

export async function POST(request: Request) {
  try {
    const { query, userId, chatId, mode = "quick" } = await request.json();

    // Validate API key for bot requests
    const authHeader = request.headers.get("authorization");
    const botApiKey = process.env.TIMEOE_BOT_API_KEY;
    
    if (botApiKey && authHeader !== `Bearer ${botApiKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const maxOutputTokens = mode === "detailed" ? 1000 : 300;

    const result = await generateText({
      model: "xai/grok-3-mini",
      system: TIMEOE_BOT_SYSTEM,
      prompt: `User Query: ${query}\n\nMode: ${mode}\nProvide ${mode === "detailed" ? "comprehensive" : "concise"} causal analysis.`,
      maxOutputTokens,
    });

    // Log usage for analytics
    console.log(`[TIMEOai_Bot] User: ${userId}, Chat: ${chatId}, Query: ${query.substring(0, 50)}...`);

    return NextResponse.json({
      success: true,
      response: result.text,
      usage: {
        tokens: result.usage?.totalTokens || 0,
        mode,
      },
      engine: "$TIMEOE + Grok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[TIMEOai_Bot] Analysis error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Analysis failed. Please try again.",
        engine: "$TIMEOE + Grok",
      },
      { status: 500 }
    );
  }
}
