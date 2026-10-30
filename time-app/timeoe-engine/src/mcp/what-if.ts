import { agentRegistry } from "../engine/agent/adapters";
import { replayTrace, whatIf } from "../engine/agent/core";
import { TraceSchema } from "../engine/agent/schemas";
import type { Json, Trace } from "../engine/agent/types";
import { entryHash } from "../traces/chain";
import { canonicalJson } from "../engine/agent/canonical";
import type { TraceStore } from "../traces/store";
import { z } from "zod";

/**
 * A logged decision can carry an engine trace in decision.inputs.engineTrace; it is then
 * addressable by trace id "<bot>:<seq>". Alternatively the caller passes the trace itself.
 */
export const WhatIfInputSchema = z.object({
  traceId: z.string().regex(/^.+:\d+$/).optional(),
  trace: z.unknown().optional(),
  change: z.object({ step: z.number().int().min(0), patch: z.record(z.string(), z.unknown()) }),
}).refine((v) => (v.traceId ? 1 : 0) + (v.trace !== undefined ? 1 : 0) === 1, { message: "provide exactly one of traceId or trace" });

export interface WhatIfToolResult {
  source: "traceId" | "trace";
  traceId?: string;
  replay: { ok: boolean; storedHash: string; replayedHash: string; firstMismatchStep: number | null; entryHashOk?: boolean };
  ranWhatIf: boolean;
  change: { step: number; patch: Record<string, Json> };
  sideBySide?: { step: number; changed: boolean; before: { ruleFired: string | null; action: Json }; after: { ruleFired: string | null; action: Json } }[];
  traceHashBefore?: string;
  traceHashAfter?: string;
  finalStateBefore?: Json;
  finalStateAfter?: Json;
  error?: string;
}

/** Read-only: never writes to the store and never mutates the given trace. */
export async function runWhatIfTool(raw: unknown, store: TraceStore): Promise<WhatIfToolResult> {
  const input = WhatIfInputSchema.parse(raw);
  const change = input.change as { step: number; patch: Record<string, Json> };
  let trace: Trace;
  let entryHashOk: boolean | undefined;
  if (input.traceId) {
    const i = input.traceId.lastIndexOf(":");
    const bot = input.traceId.slice(0, i), seq = Number(input.traceId.slice(i + 1));
    const entry = (await store.list(bot)).find((e) => e.seq === seq);
    if (!entry) throw new Error(`trace ${input.traceId} not found`);
    entryHashOk = entryHash(entry) === entry.hash;
    const t = (entry.decision.inputs as Record<string, unknown>)?.engineTrace;
    if (!t) throw new Error(`trace ${input.traceId} has no inputs.engineTrace`);
    trace = TraceSchema.parse(structuredClone(t)) as unknown as Trace;
  } else {
    trace = TraceSchema.parse(structuredClone(input.trace)) as unknown as Trace;
  }
  const agent = agentRegistry[trace.agentId];
  if (!agent) throw new Error(`unknown agentId ${trace.agentId}`);
  const r = replayTrace(agent, trace);
  // replayTrace compares step hashes; also require the full replayed trace to equal the given one,
  // so edits to step contents that leave the stored stepHash/traceHash untouched are caught.
  let firstMismatchStep = r.firstMismatchStep;
  if (firstMismatchStep === null) {
    const n = Math.max(r.replayed.steps.length, trace.steps.length);
    for (let i = 0; i < n; i++) if (canonicalJson(r.replayed.steps[i] ?? null) !== canonicalJson(trace.steps[i] ?? null)) { firstMismatchStep = i; break; }
  }
  const contentOk = firstMismatchStep === null && canonicalJson(r.replayed) === canonicalJson(trace);
  const replay = { ok: r.ok && contentOk && entryHashOk !== false, storedHash: trace.traceHash, replayedHash: r.traceHash, firstMismatchStep, ...(entryHashOk === undefined ? {} : { entryHashOk }) };
  const base = { source: input.traceId ? "traceId" as const : "trace" as const, ...(input.traceId ? { traceId: input.traceId } : {}), replay, change };
  if (!replay.ok) return { ...base, ranWhatIf: false, error: "stored trace does not replay to its hash; refusing what-if" };
  const w = whatIf(agent, { seed: trace.seed, clock: trace.clock, initialState: trace.initialState, observations: trace.observations }, change);
  const n = Math.max(w.baseline.steps.length, w.counterfactual.steps.length);
  const sideBySide = Array.from({ length: n }, (_, step) => {
    const a = w.baseline.steps[step], b = w.counterfactual.steps[step];
    const before = { ruleFired: a?.ruleFired ?? null, action: (a?.action ?? null) as unknown as Json };
    const after = { ruleFired: b?.ruleFired ?? null, action: (b?.action ?? null) as unknown as Json };
    return { step, changed: w.diffs.some((d) => d.step === step), before, after };
  });
  return { ...base, ranWhatIf: true, sideBySide, traceHashBefore: w.baseline.traceHash, traceHashAfter: w.counterfactual.traceHash, finalStateBefore: w.finalStateBefore, finalStateAfter: w.finalStateAfter };
}
