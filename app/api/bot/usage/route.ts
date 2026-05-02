import { NextResponse } from "next/server";

// In-memory storage for demo (use database in production)
const userUsage = new Map<string, { 
  queries: number; 
  tier: "free" | "pro" | "alpha";
  lastReset: string;
  totalQueries: number;
}>();

const TIER_LIMITS = {
  free: 5,
  pro: 100,
  alpha: Infinity,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const usage = userUsage.get(userId) || {
    queries: 0,
    tier: "free" as const,
    lastReset: new Date().toISOString().split("T")[0],
    totalQueries: 0,
  };

  // Reset daily if needed
  const today = new Date().toISOString().split("T")[0];
  if (usage.lastReset !== today) {
    usage.queries = 0;
    usage.lastReset = today;
    userUsage.set(userId, usage);
  }

  const limit = TIER_LIMITS[usage.tier];

  return NextResponse.json({
    userId,
    tier: usage.tier,
    queriesUsed: usage.queries,
    queryLimit: limit === Infinity ? "unlimited" : limit,
    queriesRemaining: limit === Infinity ? "unlimited" : Math.max(0, limit - usage.queries),
    canQuery: usage.queries < limit,
    totalQueries: usage.totalQueries,
  });
}

export async function POST(request: Request) {
  try {
    const { userId, action } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];
    let usage = userUsage.get(userId) || {
      queries: 0,
      tier: "free" as const,
      lastReset: today,
      totalQueries: 0,
    };

    // Reset daily if needed
    if (usage.lastReset !== today) {
      usage.queries = 0;
      usage.lastReset = today;
    }

    if (action === "increment") {
      const limit = TIER_LIMITS[usage.tier];
      if (usage.queries >= limit) {
        return NextResponse.json({
          success: false,
          error: "Daily limit reached",
          upgradeUrl: "https://timeoe.app/pricing",
        });
      }
      usage.queries++;
      usage.totalQueries++;
    }

    userUsage.set(userId, usage);

    return NextResponse.json({
      success: true,
      usage: {
        queriesUsed: usage.queries,
        queryLimit: TIER_LIMITS[usage.tier],
        tier: usage.tier,
      },
    });
  } catch (error) {
    console.error("[TIMEOai_Bot] Usage error:", error);
    return NextResponse.json({ error: "Failed to update usage" }, { status: 500 });
  }
}
