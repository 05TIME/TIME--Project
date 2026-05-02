/**
 * $TIMEOE Causal Temporal Engine
 * Grok + TIMEOE Integration Layer
 * 
 * Core capabilities:
 * - Granger causality testing
 * - Counterfactual simulation via do-calculus
 * - Temporal decomposition and forecasting
 * - Causal graph construction
 */

export interface CausalEdge {
  from: string;
  to: string;
  weight: number;
  lagDays: number;
  pValue: number;
}

export interface CausalGraph {
  nodes: string[];
  edges: CausalEdge[];
}

export interface TemporalDecomposition {
  trend: number[];
  seasonal: number[];
  residual: number[];
  periodicity: number;
}

export interface CounterfactualResult {
  factualOutcome: number;
  counterfactualOutcome: number;
  ate: number; // Average Treatment Effect
  att: number; // Average Treatment on Treated
  confidence: number;
  pValue: number;
}

export interface TimeOEAnalysis {
  causalityScore: number;
  isCausal: boolean;
  optimalLag: number;
  direction: "X→Y" | "Y→X" | "bidirectional" | "none";
  counterfactualDelta: number;
  decomposition: {
    trend: string;
    seasonality: string;
    anomalies: string[];
  };
  forecast: {
    nextPeriod: number;
    confidence95: [number, number];
  };
  summary: string;
  methodology: string;
  engine: string;
  version: string;
  timestamp: string;
}

export interface CounterfactualSimulation {
  causalGraph: CausalGraph;
  intervention: {
    variable: string;
    originalValue: number;
    counterfactualValue: number;
    type: "increase" | "decrease" | "set";
  };
  potentialOutcomes: {
    Y0_factual: number;
    Y1_counterfactual: number;
  };
  treatmentEffect: {
    ATE: number;
    ATT: number;
    confidence: number;
    pValue: number;
  };
  temporalPropagation: {
    immediateEffect: number;
    laggedEffects: Array<{ lag: number; effect: number }>;
    totalEffect: number;
    horizonDays: number;
  };
  assumptions: string[];
  narrative: string;
  engine: string;
  version: string;
  timestamp: string;
}

// TIMEOE Engine configuration
export const TIMEOE_CONFIG = {
  engine: "$TIMEOE + Grok",
  version: "1.0.0",
  capabilities: [
    "granger_causality",
    "counterfactual_simulation",
    "temporal_decomposition",
    "causal_graph_construction",
    "treatment_effect_estimation",
    "synthetic_control",
    "interrupted_time_series",
  ],
  supportedModels: ["xai/grok-3-mini", "xai/grok-3"],
} as const;

/**
 * Calculate simple Granger causality score
 * (Client-side approximation - full analysis done server-side with Grok)
 */
export function approximateGrangerScore(
  x: number[],
  y: number[],
  maxLag: number = 5
): { score: number; optimalLag: number } {
  if (x.length !== y.length || x.length < maxLag + 2) {
    return { score: 0, optimalLag: 0 };
  }

  let bestScore = 0;
  let bestLag = 1;

  for (let lag = 1; lag <= maxLag; lag++) {
    // Simple correlation as proxy for causality
    const xLagged = x.slice(0, -lag);
    const yTarget = y.slice(lag);
    
    const correlation = pearsonCorrelation(xLagged, yTarget);
    const score = Math.abs(correlation);
    
    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }

  return { score: bestScore, optimalLag: bestLag };
}

/**
 * Pearson correlation coefficient
 */
function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
  const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Simple temporal decomposition
 */
export function decomposeTimeSeries(
  data: number[],
  period: number = 12
): TemporalDecomposition {
  const n = data.length;
  
  // Moving average for trend
  const trend: number[] = [];
  const halfPeriod = Math.floor(period / 2);
  
  for (let i = 0; i < n; i++) {
    const start = Math.max(0, i - halfPeriod);
    const end = Math.min(n, i + halfPeriod + 1);
    const window = data.slice(start, end);
    trend.push(window.reduce((a, b) => a + b, 0) / window.length);
  }

  // Detrended data
  const detrended = data.map((val, i) => val - trend[i]);

  // Seasonal component (average by position in cycle)
  const seasonalAvg: number[] = new Array(period).fill(0);
  const counts: number[] = new Array(period).fill(0);
  
  detrended.forEach((val, i) => {
    const pos = i % period;
    seasonalAvg[pos] += val;
    counts[pos]++;
  });
  
  const seasonalPattern = seasonalAvg.map((sum, i) => 
    counts[i] > 0 ? sum / counts[i] : 0
  );
  
  const seasonal = data.map((_, i) => seasonalPattern[i % period]);

  // Residual
  const residual = data.map((val, i) => val - trend[i] - seasonal[i]);

  return { trend, seasonal, residual, periodicity: period };
}

/**
 * Format analysis for display
 */
export function formatAnalysisSummary(analysis: TimeOEAnalysis): string {
  const causalityLabel = analysis.isCausal ? "CAUSAL" : "NON-CAUSAL";
  const directionLabel = analysis.direction.replace("→", " causes ");
  
  return `
## $TIMEOE Analysis Results

**Causality:** ${causalityLabel} (score: ${(analysis.causalityScore * 100).toFixed(1)}%)
**Direction:** ${directionLabel}
**Optimal Lag:** ${analysis.optimalLag} periods
**Treatment Effect:** ${analysis.counterfactualDelta > 0 ? "+" : ""}${(analysis.counterfactualDelta * 100).toFixed(2)}%

### Temporal Decomposition
- **Trend:** ${analysis.decomposition.trend}
- **Seasonality:** ${analysis.decomposition.seasonality}
- **Anomalies:** ${analysis.decomposition.anomalies.join(", ") || "None detected"}

### Forecast
- **Next Period:** ${analysis.forecast.nextPeriod.toFixed(2)}
- **95% CI:** [${analysis.forecast.confidence95[0].toFixed(2)}, ${analysis.forecast.confidence95[1].toFixed(2)}]

### Methodology
${analysis.methodology}

---
*Engine: ${analysis.engine} v${analysis.version}*
  `.trim();
}
