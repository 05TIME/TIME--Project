import { describe, expect, it } from "vitest";
import { bestLag, grangerTest, lagCrossCorrelation } from "../src/engine/causality_detection";
import { changePoints, linearTrend, movingAverage } from "../src/engine/temporal_reasoning";
import { fitAR, simulateIntervention } from "../src/engine/counterfactual_simulation";
import { fPValue } from "../src/engine/stats";

// deterministic pseudo-random noise
function rng(seed: number): () => number {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296) - 0.5;
}

describe("causality_detection", () => {
  const r = rng(1);
  const x = Array.from({ length: 200 }, () => r());
  const y = x.map((_, t) => (t >= 3 ? 0.9 * x[t - 3] : 0) + 0.1 * r());

  it("finds the true lag via cross-correlation", () => {
    expect(lagCrossCorrelation(x, y, 6)).toHaveLength(7);
    const b = bestLag(x, y, 6);
    expect(b.lag).toBe(3);
    expect(b.r).toBeGreaterThan(0.9);
  });

  it("Granger test is significant x→y and not y→x", () => {
    expect(grangerTest(x, y, 3).significant).toBe(true);
    expect(grangerTest(y, x, 3).pValue).toBeGreaterThan(0.01);
  });

  it("rejects too-short series", () => {
    expect(() => grangerTest([1, 2, 3], [1, 2, 3], 2)).toThrow();
  });
});

describe("stats", () => {
  it("F p-value matches known value", () => {
    // F(2, 20) = 3.49 is about the 5% critical value
    expect(fPValue(3.49, 2, 20)).toBeCloseTo(0.05, 2);
  });
});

describe("temporal_reasoning", () => {
  it("fits a linear trend", () => {
    const t = linearTrend([1, 3, 5, 7, 9]);
    expect(t.slope).toBeCloseTo(2);
    expect(t.intercept).toBeCloseTo(1);
    expect(t.r2).toBeCloseTo(1);
  });

  it("computes a moving average", () => {
    const m = movingAverage([1, 2, 3, 4], 2);
    expect(m[0]).toBeNaN();
    expect(m.slice(1)).toEqual([1.5, 2.5, 3.5]);
  });

  it("detects a mean shift", () => {
    const r = rng(2);
    const x = Array.from({ length: 60 }, (_, i) => (i < 30 ? 0 : 5) + r());
    const cps = changePoints(x);
    expect(cps.length).toBeGreaterThanOrEqual(1);
    expect(Math.abs(cps[0].index - 30)).toBeLessThanOrEqual(1);
  });

  it("finds no change point in a flat series", () => {
    const r = rng(3);
    expect(changePoints(Array.from({ length: 60 }, () => r()))).toHaveLength(0);
  });
});

describe("counterfactual_simulation", () => {
  const x = [0];
  for (let i = 1; i < 50; i++) x.push(2 + 0.8 * x[i - 1]);

  it("recovers AR(1) coefficients", () => {
    const m = fitAR(x, 1);
    expect(m.coefficients[0]).toBeCloseTo(0.8, 6);
    expect(m.intercept).toBeCloseTo(2, 5);
  });

  it("propagates a one-step shock and decays", () => {
    const res = simulateIntervention(x, [{ start: 0, mode: "add", value: 5, duration: 1 }], 5);
    expect(res.effect[0]).toBeCloseTo(5);
    expect(res.effect[1]).toBeCloseTo(4);
    expect(res.effect[4]).toBeCloseTo(5 * 0.8 ** 4);
  });

  it("set-mode intervention holds the value", () => {
    const res = simulateIntervention(x, [{ start: 2, mode: "set", value: 0, duration: 2 }], 6);
    expect(res.counterfactual[2]).toBe(0);
    expect(res.counterfactual[3]).toBe(0);
    expect(res.effect[0]).toBe(0);
  });
});
