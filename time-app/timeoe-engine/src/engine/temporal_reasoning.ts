import type { ChangePoint, Series, TrendResult } from "../types";
import { mean } from "./stats";

/** Least-squares linear trend against index 0..n-1. */
export function linearTrend(x: Series): TrendResult {
  const n = x.length;
  if (n < 2) throw new Error("Need at least 2 points");
  const mt = (n - 1) / 2, mx = mean(x);
  let stx = 0, stt = 0, sxx = 0;
  for (let t = 0; t < n; t++) { stx += (t - mt) * (x[t] - mx); stt += (t - mt) ** 2; sxx += (x[t] - mx) ** 2; }
  const slope = stx / stt;
  return { slope, intercept: mx - slope * mt, r2: sxx === 0 ? 1 : (stx * stx) / (stt * sxx) };
}

/** Trailing simple moving average; first window-1 outputs are NaN. */
export function movingAverage(x: Series, window: number): number[] {
  if (window < 1) throw new Error("window must be >= 1");
  const out: number[] = [];
  let sum = 0;
  for (let i = 0; i < x.length; i++) {
    sum += x[i];
    if (i >= window) sum -= x[i - window];
    out.push(i >= window - 1 ? sum / window : NaN);
  }
  return out;
}

/**
 * Mean-shift change points by binary segmentation. A split is kept when it
 * reduces squared error by more than `minGain` (default: 2·variance·ln n) and
 * both sides have at least `minSize` points.
 */
export function changePoints(x: Series, opts: { minSize?: number; minGain?: number; maxPoints?: number } = {}): ChangePoint[] {
  const minSize = opts.minSize ?? 3, maxPoints = opts.maxPoints ?? 5;
  const m = mean(x);
  const variance = x.reduce((s, v) => s + (v - m) ** 2, 0) / Math.max(1, x.length - 1);
  const minGain = opts.minGain ?? 2 * Math.max(variance, 1e-12) * Math.log(Math.max(x.length, 2));
  const found: ChangePoint[] = [];
  const sse = (a: number, b: number): number => { const s = x.slice(a, b); const mm = mean(s); return s.reduce((q, v) => q + (v - mm) ** 2, 0); };
  const split = (a: number, b: number): void => {
    if (found.length >= maxPoints || b - a < 2 * minSize) return;
    const whole = sse(a, b);
    let best = -1, gain = 0;
    for (let i = a + minSize; i <= b - minSize; i++) {
      const g = whole - sse(a, i) - sse(i, b);
      if (g > gain) { gain = g; best = i; }
    }
    if (best < 0 || gain < minGain) return;
    found.push({ index: best, meanBefore: mean(x.slice(a, best)), meanAfter: mean(x.slice(best, b)), score: gain });
    split(a, best); split(best, b);
  };
  split(0, x.length);
  return found.sort((p, q) => p.index - q.index);
}
