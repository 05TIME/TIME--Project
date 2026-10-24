import { NextResponse } from "next/server";
import { AgentRequestError, handleAgentRequest } from "@/time-app/timeoe-engine/src/engine/agent";

/** POST /api/agent — deterministic agent engine (run | whatIf | replay). Zod-validated in and out. */
export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Body must be JSON" }, { status: 400 }); }
  try {
    return NextResponse.json(handleAgentRequest(body));
  } catch (e) {
    if (e instanceof AgentRequestError) return NextResponse.json({ error: e.message, issues: e.issues }, { status: e.status });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
