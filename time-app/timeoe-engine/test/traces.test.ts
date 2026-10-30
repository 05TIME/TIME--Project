import { describe, expect, it } from "vitest";
import { GENESIS_HASH, InMemoryTraceStore, logDecision, makeLogDecisionTool, verifyChain } from "../src/traces";
import { SupabaseTraceStore } from "../src/traces/supabase-store";
import { checkAction } from "../src/rules";

const now = () => "2026-10-30T12:00:00.000Z";
const action = { bot: "sales", kind: "post" as const, target: "x", details: { text: "Use 0147TIME" } };
const decision = (n: number) => ({ bot: "sales", action, inputs: { n }, outcome: "posted", reason: `run ${n}`, seed: 42 });

describe("log_decision", () => {
  it("golden hashes for a fixed decision chain", async () => {
    const store = new InMemoryTraceStore();
    const e0 = await logDecision(decision(0), store, { now });
    const e1 = await logDecision(decision(1), store, { now });
    expect(e0.prevHash).toBe(GENESIS_HASH);
    expect(e0.seq).toBe(0);
    expect(e1.prevHash).toBe(e0.hash);
    expect([e0.hash, e1.hash]).toEqual(["e9c1963d0971972d6250e31a16a07d600a8879b586be422244b1a87bd29eb2ed", "5374e1ce12f4b366d8fa5947353784ff7b52f2f2a9b2a79e9d91f64ff73119e5"]);
  });

  it("same inputs give same hash regardless of key order", async () => {
    const a = await logDecision(decision(0), new InMemoryTraceStore(), { now });
    const d = decision(0);
    const reordered = { seed: d.seed, reason: d.reason, outcome: d.outcome, inputs: d.inputs, action: { details: action.details, target: "x", kind: "post", bot: "sales" }, bot: "sales" };
    const b = await logDecision(reordered, new InMemoryTraceStore(), { now });
    expect(b.hash).toBe(a.hash);
  });

  it("chains are per bot", async () => {
    const store = new InMemoryTraceStore();
    await logDecision(decision(0), store, { now });
    const other = await logDecision({ ...decision(0), bot: "shop" }, store, { now });
    expect(other.seq).toBe(0);
    expect(other.prevHash).toBe(GENESIS_HASH);
  });

  it("stores a checkResult and validates input", async () => {
    const store = new InMemoryTraceStore();
    const checkResult = checkAction(action);
    const e = await logDecision({ ...decision(0), checkResult }, store, { now });
    expect(e.decision.checkResult?.verdict).toBe("pass");
    await expect(logDecision({ bot: "sales", outcome: "x" }, store, { now })).rejects.toThrow();
    await expect(logDecision({ ...decision(0), checkResult: { verdict: "maybe" } }, store, { now })).rejects.toThrow();
  });

  it("verifyChain passes on an untouched chain and detects tampering", async () => {
    const store = new InMemoryTraceStore();
    for (let i = 0; i < 4; i++) await logDecision(decision(i), store, { now });
    const good = verifyChain(await store.list("sales"));
    expect(good).toMatchObject({ ok: true, length: 4, firstBadSeq: null });

    const edited = await store.list("sales");
    edited[2].decision.outcome = "deleted everything";
    expect(verifyChain(edited)).toMatchObject({ ok: false, firstBadSeq: 2 });

    const rehashed = await store.list("sales");
    rehashed[1].decision.reason = "forged";
    const { entryHash } = await import("../src/traces");
    rehashed[1].hash = entryHash(rehashed[1]);
    expect(verifyChain(rehashed)).toMatchObject({ ok: false, firstBadSeq: 2 });

    const dropped = (await store.list("sales")).filter((e) => e.seq !== 1);
    expect(verifyChain(dropped).ok).toBe(false);
  });

  it("in-memory store rejects seq conflicts (append-only)", async () => {
    const store = new InMemoryTraceStore();
    const e = await logDecision(decision(0), store, { now });
    await expect(store.append(e)).rejects.toThrow(/seq conflict/);
  });

  it("timeoe_log_decision tool wraps logDecision", async () => {
    const store = new InMemoryTraceStore();
    const tool = makeLogDecisionTool(store, { now });
    expect(tool.name).toBe("timeoe_log_decision");
    const e = await tool.invoke(decision(0));
    expect(verifyChain(await store.list("sales")).headHash).toBe(e.hash);
  });

  it("Supabase store refuses to start without env vars", () => {
    const saved = { u: process.env.SUPABASE_URL, k: process.env.SUPABASE_SERVICE_ROLE_KEY };
    delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    try { expect(() => new SupabaseTraceStore()).toThrow(/must be set/); }
    finally { if (saved.u) process.env.SUPABASE_URL = saved.u; if (saved.k) process.env.SUPABASE_SERVICE_ROLE_KEY = saved.k; }
  });
});
