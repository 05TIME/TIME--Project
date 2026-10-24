import { explainTrace, replayTrace, runAgent, whatIf } from "./core";
import { lekkiPricingAgent } from "./examples/lekki-pricing";
import { AgentRequestSchema, AgentResponseSchema, type AgentResponse } from "./schemas";
import type { AgentDefinition, Json, Trace } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAgent = AgentDefinition<any, any>;

/** Registry of agents exposed through the HTTP route and tool adapters. */
export const agentRegistry: Record<string, AnyAgent> = { [lekkiPricingAgent.id]: lekkiPricingAgent };

export class AgentRequestError extends Error {
  constructor(message: string, public readonly status: number, public readonly issues?: unknown) { super(message); }
}

/** Plain function API: validate an untrusted request, execute, return a validated response. */
export function handleAgentRequest(raw: unknown, registry: Record<string, AnyAgent> = agentRegistry): AgentResponse {
  const parsed = AgentRequestSchema.safeParse(raw);
  if (!parsed.success) throw new AgentRequestError("Invalid request", 400, parsed.error.issues);
  const req = parsed.data;
  const agent = registry[req.agentId];
  if (!agent) throw new AgentRequestError(`Unknown agentId: ${req.agentId}`, 404);
  let res: AgentResponse;
  try {
    if (req.mode === "replay") {
      const r = replayTrace(agent, req.trace as unknown as Trace);
      res = { mode: "replay", ok: r.ok, traceHash: r.traceHash, expectedHash: r.expectedHash, firstMismatchStep: r.firstMismatchStep };
    } else {
      const input = { seed: req.seed, clock: req.clock, observations: req.observations as Json[], initialState: req.initialState as Json | undefined };
      if (req.mode === "run") {
        const trace = runAgent(agent, input);
        res = { mode: "run", trace, explanation: explainTrace(trace) };
      } else {
        const w = whatIf(agent, input, req.change as { step: number; patch: Record<string, Json> });
        res = { mode: "whatIf", traceHashBefore: w.baseline.traceHash, traceHashAfter: w.counterfactual.traceHash, diffs: w.diffs, finalStateBefore: w.finalStateBefore, finalStateAfter: w.finalStateAfter };
      }
    }
  } catch (e) {
    throw new AgentRequestError(e instanceof Error ? e.message : String(e), 422);
  }
  return AgentResponseSchema.parse(res);
}

/** Simple tool interface for LLMs / other apps (OpenAI/MCP-style: name, description, JSON schema, invoke). */
export interface AgentTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  invoke: (input: unknown) => Promise<AgentResponse>;
}

const jsonValue = {};
export const deterministicAgentTool: AgentTool = {
  name: "timeoe_deterministic_agent",
  description:
    "Run a registered TIMEŒ deterministic agent. mode=run returns a full, hash-stamped decision trace; mode=whatIf patches one observation and returns the decision diff; mode=replay verifies a trace reproduces bit-for-bit. Same seed + inputs always give the same traceHash.",
  inputSchema: {
    type: "object",
    required: ["mode", "agentId"],
    properties: {
      mode: { type: "string", enum: ["run", "whatIf", "replay"] },
      agentId: { type: "string", enum: Object.keys(agentRegistry) },
      seed: { type: "integer", minimum: 0, maximum: 4294967295 },
      clock: { type: "object", required: ["startIso", "stepMs"], properties: { startIso: { type: "string", format: "date-time" }, stepMs: { type: "integer", minimum: 1 } } },
      observations: { type: "array", minItems: 1, items: { type: "object", additionalProperties: jsonValue } },
      initialState: { type: "object" },
      change: { type: "object", required: ["step", "patch"], properties: { step: { type: "integer", minimum: 0 }, patch: { type: "object" } } },
      trace: { type: "object", description: "A trace previously returned by mode=run (required for mode=replay)." },
    },
  },
  invoke: async (input) => handleAgentRequest(input),
};
