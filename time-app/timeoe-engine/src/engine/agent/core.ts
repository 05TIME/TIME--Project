import { canonicalJson, hashOf } from "./canonical";
import { clockAt, mulberry32 } from "./rng";
import type { AgentDefinition, DecisionDiff, Json, RunInput, StepContext, Trace, TraceStep, WhatIfResult } from "./types";

const clone = <T>(v: T): T => JSON.parse(canonicalJson(v)) as T;

/** Run an agent over observations. Pure: same agent + input => identical trace and traceHash. */
export function runAgent<S extends Json, O extends Json>(agent: AgentDefinition<S, O>, input: RunInput<S, O>): Trace {
  const rules = [...agent.rules].sort((a, b) => a.priority - b.priority || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const rng = mulberry32(input.seed);
  const initialState = clone(input.initialState ?? agent.initialState);
  const observations = input.observations.map(clone);
  let state = clone(initialState);
  const steps: TraceStep[] = [];

  observations.forEach((observation, step) => {
    const ctx: StepContext<S, O> = Object.freeze({
      step,
      now: clockAt(input.clock, step),
      random: rng(),
      state: Object.freeze(clone(state)),
      observation: Object.freeze(clone(observation)),
      history: Object.freeze(observations.slice(0, step).map(clone)),
    });
    const evaluated: { ruleId: string; passed: boolean }[] = [];
    let fired: (typeof rules)[number] | null = null;
    for (const r of rules) {
      const passed = !!r.guard(ctx);
      evaluated.push({ ruleId: r.id, passed });
      if (passed) { fired = r; break; }
    }
    const action = clone(fired ? fired.action(ctx) : agent.fallback ?? { type: "noop", payload: null });
    const reason = fired ? fired.reason(ctx) : "No rule guard passed; fallback action.";
    const stateAfter = clone(agent.reduce(ctx.state, action, ctx));
    const body = { step, now: ctx.now, random: ctx.random, observation, stateBefore: state, evaluated, ruleFired: fired?.id ?? null, reason, action, stateAfter };
    steps.push({ ...body, stepHash: hashOf(body) });
    state = stateAfter;
  });

  const body = { agentId: agent.id, agentVersion: agent.version, seed: input.seed, clock: input.clock, initialState, observations, steps, finalState: state };
  return { ...body, traceHash: hashOf(body) };
}

export interface ReplayResult { ok: boolean; traceHash: string; expectedHash: string; firstMismatchStep: number | null; replayed: Trace }

/** Re-execute a recorded trace and verify it reproduces bit-for-bit. */
export function replayTrace<S extends Json, O extends Json>(agent: AgentDefinition<S, O>, trace: Trace): ReplayResult {
  if (trace.agentId !== agent.id) throw new Error(`Trace is for agent ${trace.agentId}, not ${agent.id}`);
  const replayed = runAgent(agent, { seed: trace.seed, clock: trace.clock, initialState: trace.initialState as S, observations: trace.observations as O[] });
  let firstMismatchStep: number | null = null;
  const n = Math.max(replayed.steps.length, trace.steps.length);
  for (let i = 0; i < n; i++) {
    if (replayed.steps[i]?.stepHash !== trace.steps[i]?.stepHash) { firstMismatchStep = i; break; }
  }
  return { ok: replayed.traceHash === trace.traceHash && firstMismatchStep === null, traceHash: replayed.traceHash, expectedHash: trace.traceHash, firstMismatchStep, replayed };
}

/** Counterfactual: patch one observation (shallow merge), rerun with same seed+clock, diff the decisions. */
export function whatIf<S extends Json, O extends Json>(
  agent: AgentDefinition<S, O>,
  input: RunInput<S, O>,
  change: { step: number; patch: Record<string, Json> },
): WhatIfResult {
  if (change.step < 0 || change.step >= input.observations.length) throw new Error(`whatIf: step ${change.step} out of range`);
  const baseline = runAgent(agent, input);
  const observations = input.observations.map((o, i) => (i === change.step ? ({ ...(o as object), ...change.patch } as O) : o));
  const counterfactual = runAgent(agent, { ...input, observations });
  return { change, baseline, counterfactual, diffs: diffDecisions(baseline, counterfactual), finalStateBefore: baseline.finalState, finalStateAfter: counterfactual.finalState };
}

export function diffDecisions(a: Trace, b: Trace): DecisionDiff[] {
  const diffs: DecisionDiff[] = [];
  for (let i = 0; i < Math.max(a.steps.length, b.steps.length); i++) {
    const x = a.steps[i], y = b.steps[i];
    const before = { ruleFired: x?.ruleFired ?? null, action: x?.action ?? { type: "none", payload: null } };
    const after = { ruleFired: y?.ruleFired ?? null, action: y?.action ?? { type: "none", payload: null } };
    if (canonicalJson(before) !== canonicalJson(after)) diffs.push({ step: i, before, after });
  }
  return diffs;
}

/** One-line-per-step explanation of a trace. */
export function explainTrace(trace: Trace): string[] {
  return trace.steps.map((s) => `#${s.step} ${s.now} [${s.ruleFired ?? "fallback"}] ${s.action.type} ${canonicalJson(s.action.payload)} — ${s.reason}`);
}
