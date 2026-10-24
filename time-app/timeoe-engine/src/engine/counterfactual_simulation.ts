import type { ARModel, CounterfactualResult, Intervention, Series } from "../types";
import { ols } from "./stats";

/** Fit AR(p): x[t] = c + Σ a_k x[t-k] + e, by least squares. */
export function fitAR(x: Series, order = 1): ARModel {
  if (order < 1 || x.length < order + 3) throw new Error("Series too short for this order");
  const X: number[][] = [], y: number[] = [];
  for (let t = order; t < x.length; t++) {
    const row = [1];
    for (let k = 1; k <= order; k++) row.push(x[t - k]);
    X.push(row); y.push(x[t]);
  }
  const { beta, rss } = ols(X, y);
  return { order, intercept: beta[0], coefficients: beta.slice(1), residualVariance: rss / Math.max(1, y.length - order - 1) };
}

/** Deterministic forecast `horizon` steps ahead, applying optional interventions. */
export function forecast(history: Series, model: ARModel, horizon: number, interventions: Intervention[] = []): number[] {
  const buf = [...history];
  const out: number[] = [];
  for (let h = 0; h < horizon; h++) {
    let v = model.intercept;
    for (let k = 1; k <= model.order; k++) v += model.coefficients[k - 1] * buf[buf.length - k];
    for (const iv of interventions) {
      const end = iv.duration === undefined ? Infinity : iv.start + iv.duration;
      if (h >= iv.start && h < end) v = iv.mode === "set" ? iv.value : v + iv.value;
    }
    buf.push(v); out.push(v);
  }
  return out;
}

/**
 * What-if: fit AR(order) to history, forecast a baseline, then forecast again with
 * interventions. Effects propagate through the AR dynamics after the intervention ends.
 */
export function simulateIntervention(history: Series, interventions: Intervention[], horizon = 10, order = 1): CounterfactualResult {
  const model = fitAR(history, order);
  const baseline = forecast(history, model, horizon);
  const counterfactual = forecast(history, model, horizon, interventions);
  return { baseline, counterfactual, effect: counterfactual.map((v, i) => v - baseline[i]), model };
}
