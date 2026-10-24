# $TIMEŒ Project

$TIMEŒ is an experimental toolkit for analysing time series: what happens over time, what seems to drive what, and "what if" scenarios.

## What's in this repo

| Path | What it is | Status |
| --- | --- | --- |
| `app/`, `components/` | Next.js 16 dashboard (pages for temporal, causality, counterfactuals, datasets, bot) | Works with an AI Gateway / xAI key |
| `app/api/{temporal,causality,counterfactual}/route.ts` | API routes that ask Grok (`xai/grok-3-mini` via AI SDK 6) for a JSON analysis | Grok-based; no local maths yet |
| `app/api/bot/*` | Bot analyze, usage, and webhook routes | Grok-based |
| `time-app/timeoe-engine/src/engine/` | The TypeScript engine (no runtime dependencies) | Implemented and tested |
| `time-app/timeoe-engine/test/` | Vitest unit tests for the engine | 11 tests |
| `src/`, `time-engine/` | Earlier Express scaffolding | Incomplete; it imports modules that don't exist and makes `tsc` / `next build` fail |

### Engine modules

- `causality_detection.ts`: `lagCrossCorrelation`, `bestLag`, and `grangerTest`, a Granger-style F-test with a p-value. A Granger test shows whether one series helps predict another. It does not prove that one causes the other.
- `temporal_reasoning.ts`: `linearTrend` (slope, intercept, R²), `movingAverage`, and `changePoints` (finds shifts in the mean by binary segmentation).
- `counterfactual_simulation.ts`: `fitAR` (a least-squares AR(p) model), `forecast`, and `simulateIntervention`. It forecasts a baseline and a what-if path with "set" or "add" interventions, and returns the difference.
- `stats.ts`: Pearson correlation, OLS, and the F-distribution p-value.

```ts
import { grangerTest, changePoints, simulateIntervention } from "./time-app/timeoe-engine/src/engine";
```

## Install and run

Requires Node 20+.

```bash
git clone https://github.com/05TIME/TIME--Project.git
cd TIME--Project
npm install
npm run dev              # Next.js dashboard on http://localhost:3000
```

The AI routes need an AI Gateway key (`AI_GATEWAY_API_KEY`) or a Vercel-linked project with access to xAI models.

## Tests and type checks

```bash
npm test                 # vitest: engine unit tests
npm run typecheck:engine # strict tsc on the engine and tests
npm run typecheck        # whole repo; currently fails because of the legacy src/ scaffolding
```

## License

MIT
