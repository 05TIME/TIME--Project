import { logDecision } from "./log-decision";
import type { TraceEntry } from "./schemas";
import type { TraceStore } from "./store";

/** MCP-style tool wrapper. The store is injected (in-memory in tests, Supabase on the server). */
export function makeLogDecisionTool(store: TraceStore, opts: { now?: () => string } = {}) {
  return {
    name: "timeoe_log_decision",
    description:
      "Log a bot decision as a hash-chained, replayable TIMEŒ trace entry. Returns the entry with its seq, prevHash and sha256 hash.",
    inputSchema: {
      type: "object",
      required: ["bot", "action", "outcome", "reason"],
      properties: {
        bot: { type: "string" },
        action: { type: "object", required: ["bot", "kind", "target"], properties: { bot: { type: "string" }, kind: { type: "string", enum: ["post", "spend", "send", "edit"] }, target: { type: "string" }, details: { type: "object" } } },
        inputs: { type: "object" },
        outcome: { type: "string" },
        reason: { type: "string" },
        seed: { type: "integer", minimum: 0, maximum: 4294967295 },
        checkResult: { type: "object", description: "Result of timeoe_check_action, if run." },
      },
    } as Record<string, unknown>,
    invoke: (input: unknown): Promise<TraceEntry> => logDecision(input, store, opts),
  };
}
