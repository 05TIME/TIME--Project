/** A numeric time series: values ordered in time, evenly spaced. */
export type Series = readonly number[];

export interface LagCorrelation { lag: number; r: number }

export interface GrangerResult {
  lag: number;
  fStatistic: number;
  dfNumerator: number;
  dfDenominator: number;
  pValue: number;
  /** true when pValue < alpha */
  significant: boolean;
}

export interface TrendResult { slope: number; intercept: number; r2: number }

export interface ChangePoint { index: number; meanBefore: number; meanAfter: number; score: number }

export interface ARModel { order: number; intercept: number; coefficients: number[]; residualVariance: number }

export interface Intervention {
  /** index (into the forecast horizon, 0-based) at which the intervention starts */
  start: number;
  /** "set" replaces the value, "add" shifts it */
  mode: "set" | "add";
  value: number;
  /** number of steps it lasts; default: until the end */
  duration?: number;
}

export interface CounterfactualResult { baseline: number[]; counterfactual: number[]; effect: number[]; model: ARModel }
