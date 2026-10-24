import { describe, expect, it } from "vitest";
import { DemoBoardClient } from "../lib/agent-board/client";
import { buildAuditLog, projectSpend, treasuryHistory } from "../lib/agent-board/model";

describe("agent board", async () => {
  const client = new DemoBoardClient();
  const state = await client.getState();

  it("demo client returns board-shaped data and copies", async () => {
    expect(state.task_history).toHaveLength(5);
    state.treasury_sol = 0;
    expect((await client.getState()).treasury_sol).toBe(4.3);
    expect((await client.analyzePast()).recent_failures[0].simulation.approval_status).toBe("REJECTED");
  });

  it("treasury history ends at current balance", async () => {
    const s = await client.getState();
    const h = treasuryHistory(s);
    expect(h[h.length - 1]).toBe(4.3);
    expect(h).toHaveLength(6);
  });

  it("audit log is chronological and records every decision", async () => {
    const s = await client.getState();
    const log = buildAuditLog(s);
    for (let i = 1; i < log.length; i++) expect(log[i].at).toBeGreaterThanOrEqual(log[i - 1].at);
    expect(log.filter((e) => e.event === "approved")).toHaveLength(4);
    expect(log.filter((e) => e.event === "rejected")).toHaveLength(1);
    expect(log.some((e) => e.event === "completed")).toBe(true);
  });

  it("projection subtracts the budget at step 0 and zero-budget has no effect", async () => {
    const s = await client.getState();
    const big = projectSpend(s, s.task_history[2]);
    expect(big.approved).toBe(false);
    expect(big.baseline[0] - big.withSpend[0]).toBeCloseTo(10);
    const zero = projectSpend(s, s.task_history[3]);
    expect(zero.withSpend).toEqual(zero.baseline);
    expect(big.baseline.every(Number.isFinite)).toBe(true);
  });
});
