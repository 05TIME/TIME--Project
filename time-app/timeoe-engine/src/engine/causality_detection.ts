import type { GrangerResult, LagCorrelation, Series } from "../types";
import { fPValue, ols, pearson } from "./stats";

/**
 * Cross-correlation of `cause` leading `effect` by 0..maxLag steps:
 * r(lag) = corr(cause[t], effect[t + lag]).
 */
export function lagCrossCorrelation(cause: Series, effect: Series, maxLag = 10): LagCorrelation[] {
  const n = Math.min(cause.length, effect.length);
  const out: LagCorrelation[] = [];
  for (let lag = 0; lag <= Math.min(maxLag, n - 3); lag++) {
    out.push({ lag, r: pearson(cause.slice(0, n - lag), effect.slice(lag, n)) });
  }
  return out;
}

/** The lag with the largest |r|. */
export function bestLag(cause: Series, effect: Series, maxLag = 10): LagCorrelation {
  return lagCrossCorrelation(cause, effect, maxLag).reduce((a, b) => (Math.abs(b.r) > Math.abs(a.r) ? b : a));
}

/**
 * Granger-style F-test: does adding `lag` past values of `cause` improve an
 * AR(lag) prediction of `effect`? Tests predictive precedence, not true causation.
 */
export function grangerTest(cause: Series, effect: Series, lag = 2, alpha = 0.05): GrangerResult {
  const n = Math.min(cause.length, effect.length);
  const rows = n - lag;
  const dfDen = rows - (2 * lag + 1);
  if (lag < 1 || dfDen < 1) throw new Error("Series too short for this lag");
  const y: number[] = [], Xr: number[][] = [], Xu: number[][] = [];
  for (let t = lag; t < n; t++) {
    const ownPast: number[] = [], causePast: number[] = [];
    for (let k = 1; k <= lag; k++) { ownPast.push(effect[t - k]); causePast.push(cause[t - k]); }
    y.push(effect[t]);
    Xr.push([1, ...ownPast]);
    Xu.push([1, ...ownPast, ...causePast]);
  }
  const rssR = ols(Xr, y).rss, rssU = ols(Xu, y).rss;
  const fStatistic = rssU <= 1e-15 ? (rssR > 1e-15 ? Infinity : 0) : ((rssR - rssU) / lag) / (rssU / dfDen);
  const pValue = fStatistic === Infinity ? 0 : fPValue(fStatistic, lag, dfDen);
  return { lag, fStatistic, dfNumerator: lag, dfDenominator: dfDen, pValue, significant: pValue < alpha };
}
