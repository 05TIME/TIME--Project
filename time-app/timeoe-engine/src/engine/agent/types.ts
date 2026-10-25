import type { FixedClock } from "./rng";

export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

/** Everything a rule may look at. Pure data + the per-step random draw; no I/O handles. */
export interface StepContext<S, O> {
  step: number;
  /** ISO time from the injected clock */
  now: string;
  /** one seeded draw in [0,1) per step, recorded in the trace */
  random: number;
  state: Readonly<S>;
  observation: Readonly<O>;
  /** read-only history of earlier observations (for temporal/causal features) */
  history: readonly O[];
}

export interface Action<P extends Json = Json> { type: string; payload: P }

/** A priority-ordered policy rule: first rule (lowest priority number) whose guard passes fires. */
export interface Rule<S, O> {
  id: string;
  priority: number;
  description: string;
  guard: (ctx: StepContext<S, O>) => boolean;
  action: (ctx: StepContext<S, O>) => Action;
  /** human-readable explanation of why it fired, computed from the same context */
  reason: (ctx: StepContext<S, O>) => string;
}

export interface AgentDefinition<S extends Json, O extends Json> {
  id: string;
  version: string;
  description: string;
  initialState: S;
  rules: Rule<S, O>[];
  /** pure reducer: next state from the chosen action */
  reduce: (state: Readonly<S>, action: Action, ctx: StepContext<S, O>) => S;
  /** optional fallback when no rule's guard passes (default: noop) */
  fallback?: Action;
}

export interface RunInput<S extends Json = Json, O extends Json = Json> {
  seed: number;
  clock: FixedClock;
  observations: O[];
  initialState?: S;
}

export interface TraceStep {
  step: number;
  now: string;
  random: number;
  observation: Json;
  stateBefore: Json;
  /** rules evaluated in priority order with guard results (full explainability) */
  evaluated: { ruleId: string; passed: boolean }[];
  ruleFired: string | null;
  reason: string;
  action: Action;
  stateAfter: Json;
  stepHash: string;
}

export interface Trace {
  agentId: string;
  agentVersion: string;
  seed: number;
  clock: FixedClock;
  initialState: Json;
  observations: Json[];
  steps: TraceStep[];
  finalState: Json;
  /** sha256 over canonical JSON of everything above */
  traceHash: string;
}

export interface DecisionDiff {
  step: number;
  before: { ruleFired: string | null; action: Action };
  after: { ruleFired: string | null; action: Action };
}

export interface WhatIfResult {
  change: { step: number; patch: Record<string, Json> };
  baseline: Trace;
  counterfactual: Trace;
  diffs: DecisionDiff[];
  finalStateBefore: Json;
  finalStateAfter: Json;
}
