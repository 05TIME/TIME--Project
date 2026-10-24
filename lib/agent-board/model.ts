import { simulateIntervention } from "@/time-app/timeoe-engine/src/engine";
import type { BoardState, BoardTask } from "./types";

export interface AuditEntry { at: number; taskId: string; agent: string; event: string; detail: string }

/** Chronological audit log: simulate → decision → completion, plus telemetry. */
export function buildAuditLog(state: BoardState): AuditEntry[] {
  const out: AuditEntry[] = [];
  for (const t of state.task_history) {
    const s = t.simulation;
    out.push({ at: t.timestamp, taskId: t.task_id, agent: t.target_agent, event: "simulated",
      detail: `${t.budget_sol} SOL · risk ${s.risk_factor} · success p ${s.counterfactual_success_probability}` });
    out.push({ at: t.timestamp, taskId: t.task_id, agent: t.target_agent, event: s.approval_status === "APPROVED" ? "approved" : "rejected", detail: s.rationale });
    if (t.completed_at) out.push({ at: t.completed_at, taskId: t.task_id, agent: t.target_agent, event: t.success ? "completed" : "failed", detail: t.result ?? "" });
  }
  for (const m of state.telemetry) out.push({ at: m.timestamp, taskId: "", agent: m.source, event: "telemetry", detail: String(m.metrics.event ?? "") });
  return out.sort((a, b) => a.at - b.at);
}

/** Treasury balance as seen by each simulation, in task order, ending at the current balance. */
export function treasuryHistory(state: BoardState): number[] {
  const tasks = [...state.task_history].sort((a, b) => a.timestamp - b.timestamp || a.task_id.localeCompare(b.task_id));
  return [...tasks.map((t) => t.simulation.treasury_sol), state.treasury_sol];
}

export interface SpendProjection { taskId: string; approved: boolean; baseline: number[]; withSpend: number[]; method: "ar1" | "flat" }

/**
 * What-if projection for one proposed spend: fit AR(1) to the treasury history and
 * forecast `horizon` steps with and without a one-off draw of `budget_sol`.
 * Illustrative only; it doesn't predict real revenue. Falls back to a flat line when AR(1) can't be fitted.
 */
export function projectSpend(state: BoardState, task: BoardTask, horizon = 6): SpendProjection {
  const history = treasuryHistory(state);
  const approved = task.simulation.approval_status === "APPROVED";
  const iv = [{ start: 0, mode: "add" as const, value: -task.budget_sol, duration: 1 }];
  try {
    const r = simulateIntervention(history, iv, horizon, 1);
    if (r.baseline.every(Number.isFinite)) return { taskId: task.task_id, approved, baseline: r.baseline, withSpend: r.counterfactual, method: "ar1" };
  } catch { /* fall through */ }
  const last = history[history.length - 1];
  const baseline = Array<number>(horizon).fill(last);
  return { taskId: task.task_id, approved, baseline, withSpend: baseline.map((v) => v - task.budget_sol), method: "flat" };
}

export const round = (x: number, d = 3): number => Math.round(x * 10 ** d) / 10 ** d;
