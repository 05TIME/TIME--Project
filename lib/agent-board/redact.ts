import type { BoardState, BoardTask, PastAnalysis } from "./types";

export interface BoardSnapshot {
  generated_at: string; // ISO time the snapshot was built
  source: "time-corp-board (board_get_state + board_analyze_past, read-only)";
  state: BoardState;
  analysis: PastAnalysis;
}

const BASE58_ADDR = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
const LOCAL_URL = /\bhttps?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0)(?::\d+)?\S*/gi;
const LOCAL_HOST = /\b(?:127\.0\.0\.1|localhost):\d+\b/gi;
const FS_PATH = /(?:\/workspace|\/home|\/Users|\/root)\/\S+/g;
const DO_NOT_PUBLISH = /\bMDADE\b/g;
const SECRETISH = /\b(?:sk|pk|xai|ghp|gho|key|token|secret)[-_][A-Za-z0-9_-]{12,}\b/gi;

export const truncateAddress = (a: string): string => (a.length > 12 ? `${a.slice(0, 4)}…${a.slice(-4)}` : a);

/** Redact wallet-like addresses, local URLs, file paths and token-like strings; cap length. */
export function redactText(s: string | null, max = 220): string | null {
  if (s === null) return null;
  const r = s
    .replace(SECRETISH, "[redacted]")
    .replace(DO_NOT_PUBLISH, "[redacted]")
    .replace(LOCAL_URL, "[local-url]")
    .replace(LOCAL_HOST, "[local]")
    .replace(FS_PATH, "[path]")
    .replace(BASE58_ADDR, (m) => truncateAddress(m));
  return r.length > max ? `${r.slice(0, max - 1)}…` : r;
}

function redactTask(t: BoardTask): BoardTask {
  return {
    ...t,
    instruction: redactText(t.instruction) ?? "",
    result: redactText(t.result),
    simulation: { ...t.simulation, rationale: redactText(t.simulation.rationale) ?? "", proposed_strategy: redactText(t.simulation.proposed_strategy, 120) ?? "" },
  };
}

/** Only allow-listed telemetry fields go public. */
function redactMetrics(m: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of ["event", "agent", "agents", "picked_up", "blockers"]) if (k in m) out[k] = m[k];
  return out;
}

export function buildSnapshot(state: BoardState, analysis: PastAnalysis, now = new Date()): BoardSnapshot {
  return {
    generated_at: now.toISOString(),
    source: "time-corp-board (board_get_state + board_analyze_past, read-only)",
    state: {
      ...state,
      treasury_address: truncateAddress(state.treasury_address),
      task_history: state.task_history.map(redactTask),
      telemetry: state.telemetry.map((t) => ({ ...t, metrics: redactMetrics(t.metrics) })),
      metadata: { engine: state.metadata.engine ?? null, note: "Public snapshot. Addresses truncated; no keys." },
    },
    analysis: { ...analysis, recent_failures: analysis.recent_failures.map(redactTask) },
  };
}
