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
| `src/`, `time-engine/` | Earlier Express scaffolding, not used by the Next.js app | Incomplete and left out of the build (see below) |

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
npm run typecheck        # whole Next.js app
npm run build            # next build
```

### Why `src/` is left out of the build

`src/` is an old Express server. It imports modules that don't exist (`../time-engine/src/engine`, `./TimelineDashboard`, `./DataService` and others), and nothing in `app/`, `components/` or `lib/` imports it. `tsconfig.json` leaves it out (as it already did for `time-app` and `time-engine`), so `tsc` and `next build` pass. The code is still in the repo for reference. Finish it or delete it before you put it back in the build.

## License

MIT

## Agent Board (`/agent-board`)

This is a read-only dashboard of the TIME-CORP agent board: agents, proposed spends with their simulation decisions, an AR(1) what-if chart of the treasury, and an audit log. The page cannot spend money or dispatch tasks.

### Live data

The board is reached through an MCP connector, and a deployed web app can't call it. Instead, the page reads a redacted JSON snapshot:

1. Get raw output from the read-only tools `board_get_state` and `board_analyze_past`, and save each to a file.
2. Run `npm run board:snapshot -- state.json analysis.json`. This writes `data/board-snapshot.json`. Wallet addresses are truncated; local URLs, file paths, token-like strings and telemetry fields outside the allow-list are removed.
3. Commit the file and redeploy. Or host the snapshot JSON anywhere public and set `BOARD_SNAPSHOT_URL`; the page then re-fetches it every 5 minutes (ISR), with no redeploy needed.

The page tries `BOARD_SNAPSHOT_URL` first, then the bundled snapshot, then built-in demo data.
