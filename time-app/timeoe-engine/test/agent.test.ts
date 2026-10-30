import { describe, expect, it } from "vitest";
import {
  canonicalJson, sha256Hex, mulberry32, runAgent, replayTrace, whatIf, handleAgentRequest, AgentRequestError,
  deterministicAgentTool, lekkiPricingAgent, LEKKI_EXAMPLE_INPUT,
} from "../src/engine/agent";

describe("canonical + sha256 + rng", () => {
  it("sha256 matches known vectors", () => {
    expect(sha256Hex("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
  it("canonical JSON sorts keys", () => {
    expect(canonicalJson({ b: 1, a: [2, { d: 1, c: 2 }] })).toBe('{"a":[2,{"c":2,"d":1}],"b":1}');
  });
  it("mulberry32 is seeded", () => {
    const a = mulberry32(7), b = mulberry32(7), c = mulberry32(8);
    const sa = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(sa);
    expect(c()).not.toBe(sa[0]);
  });
});

describe("deterministic agent engine", () => {
  it("same seed + inputs => identical trace hash", () => {
    const t1 = runAgent(lekkiPricingAgent, LEKKI_EXAMPLE_INPUT);
    const t2 = runAgent(lekkiPricingAgent, structuredClone(LEKKI_EXAMPLE_INPUT));
    expect(t1.traceHash).toMatch(/^[0-9a-f]{64}$/);
    expect(t2.traceHash).toBe(t1.traceHash);
    expect(canonicalJson(t2)).toBe(canonicalJson(t1));
    expect(t1.steps).toHaveLength(LEKKI_EXAMPLE_INPUT.observations.length);
    for (const s of t1.steps) { expect(s.ruleFired).toBeTruthy(); expect(s.reason.length).toBeGreaterThan(0); }
  });
  it("different seed changes the hash (random draw is in the trace)", () => {
    expect(runAgent(lekkiPricingAgent, { ...LEKKI_EXAMPLE_INPUT, seed: 43 }).traceHash).not.toBe(runAgent(lekkiPricingAgent, LEKKI_EXAMPLE_INPUT).traceHash);
  });
  it("replays bit-for-bit and detects tampering", () => {
    const t = runAgent(lekkiPricingAgent, LEKKI_EXAMPLE_INPUT);
    const r = replayTrace(lekkiPricingAgent, JSON.parse(JSON.stringify(t)));
    expect(r.ok).toBe(true);
    expect(r.traceHash).toBe(t.traceHash);
    const tampered = JSON.parse(JSON.stringify(t));
    tampered.steps[3].stepHash = "0".repeat(64);
    const bad = replayTrace(lekkiPricingAgent, tampered);
    expect(bad.ok).toBe(false);
    expect(bad.firstMismatchStep).toBe(3);
  });
  it("counterfactual: changing one observation produces a decision diff", () => {
    const w = whatIf(lekkiPricingAgent, LEKKI_EXAMPLE_INPUT, { step: 3, patch: { bookingRequest: { nights: 3, offeredRateNgn: 90000 } } });
    expect(w.diffs.length).toBeGreaterThan(0);
    expect(w.diffs[0].step).toBe(3);
    expect(w.diffs[0].before.ruleFired).toBe("counter-booking");
    expect(w.diffs[0].after.ruleFired).toBe("accept-booking");
    expect(w.counterfactual.traceHash).not.toBe(w.baseline.traceHash);
    // no-op patch => no diff
    expect(whatIf(lekkiPricingAgent, LEKKI_EXAMPLE_INPUT, { step: 0, patch: {} }).diffs).toEqual([]);
  });
});

describe("adapters", () => {
  const good = { mode: "run", agentId: "lekki-pricing", ...LEKKI_EXAMPLE_INPUT };
  it("function API returns validated trace", () => {
    const r = handleAgentRequest(good);
    expect(r.mode).toBe("run");
  });
  it("Zod rejects bad input", () => {
    for (const bad of [{}, { ...good, seed: -1 }, { ...good, clock: { startIso: "nope", stepMs: 1 } }, { ...good, observations: [] }, { ...good, mode: "explode" }]) {
      expect(() => handleAgentRequest(bad)).toThrow(AgentRequestError);
    }
    try { handleAgentRequest({ ...good, agentId: "missing" }); } catch (e) { expect((e as AgentRequestError).status).toBe(404); }
  });
  it("tool interface invokes", async () => {
    expect(deterministicAgentTool.inputSchema).toHaveProperty("properties.mode");
    const r = await deterministicAgentTool.invoke({ ...good, mode: "whatIf", change: { step: 7, patch: { occupancy7d: 0.3 } } });
    expect(r.mode).toBe("whatIf");
  });
});

describe("replayTrace step integrity", () => {
  it("fails when a recorded observation is edited but its stepHash is left alone", () => {
    const t = runAgent(lekkiPricingAgent, LEKKI_EXAMPLE_INPUT);
    expect(replayTrace(lekkiPricingAgent, t).ok).toBe(true);
    const bad = structuredClone(t);
    (bad.steps[2] as { observation: unknown }).observation = { forged: true };
    const r = replayTrace(lekkiPricingAgent, bad);
    expect(r.ok).toBe(false);
    expect(r.firstMismatchStep).toBe(2);
  });
  it("fails when a recorded action is edited but its stepHash is left alone", () => {
    const bad = structuredClone(runAgent(lekkiPricingAgent, LEKKI_EXAMPLE_INPUT));
    bad.steps[1].action = { type: "forged", payload: null };
    const r = replayTrace(lekkiPricingAgent, bad);
    expect(r).toMatchObject({ ok: false, firstMismatchStep: 1 });
  });
  it("fails when finalState is edited with the traceHash left alone", () => {
    const bad = structuredClone(runAgent(lekkiPricingAgent, LEKKI_EXAMPLE_INPUT));
    bad.finalState = { forged: true };
    expect(replayTrace(lekkiPricingAgent, bad).ok).toBe(false);
  });
});
