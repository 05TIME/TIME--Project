# $TIMEŒ Project

$TIMEŒ is an experimental toolkit for analysing time series: what happens over time, what seems to drive what, and "what if" scenarios.

## What's in this repo

| Path | What it is | Status |
| --- | --- | --- |
| `app/`, `components/` | Next.js 16 dashboard (pages for temporal, causality, counterfactuals, datasets, bot) | Works with an AI Gateway / xAI key |
| `app/api/{temporal,causality,counterfactual}/route.ts` | API routes that ask Grok (`xai/grok-3-mini` via AI SDK 6) for a JSON analysis | Grok-based; inputs checked with Zod (`lib/api-schemas.ts`) |
| `app/api/bot/*` | Bot analyze, usage, and webhook routes | Zod-checked; auth checked before the body is read |
| `docs/` | Project notes and the meme-contest submission PDF | Reference only |
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

## CI

`docs/ci-workflow.yml` is a ready GitHub Actions workflow that runs typecheck, the engine typecheck, the tests and `next build` on every pull request and push to `main`. To turn it on, move it to `.github/workflows/ci.yml`. The push token needs `workflow` scope, or you can add the file in the GitHub web UI.

## License

MIT. See `LICENSE`.

## Agent Board (`/agent-board`)

This is a read-only dashboard of the TIME-CORP agent board: agents, proposed spends with their simulation decisions, an AR(1) what-if chart of the treasury, and an audit log. The page cannot spend money or dispatch tasks.

### Live data

The board is reached through an MCP connector, and a deployed web app can't call it. Instead, the page reads a redacted JSON snapshot:

1. Get raw output from the read-only tools `board_get_state` and `board_analyze_past`, and save each to a file.
2. Run `npm run board:snapshot -- state.json analysis.json`. This writes `data/board-snapshot.json`. Wallet addresses are truncated; local URLs, file paths, token-like strings and telemetry fields outside the allow-list are removed.
3. Commit the file and redeploy. Or host the snapshot JSON anywhere public and set `BOARD_SNAPSHOT_URL`; the page then re-fetches it every 5 minutes (ISR), with no redeploy needed.

The page tries `BOARD_SNAPSHOT_URL` first, then the bundled snapshot, then built-in demo data.

### Refreshing the snapshot (agent-run)

The refresh is **not** a GitHub Action. The board data comes only from the TIME-CORP MCP connector, and CI runners have no MCP access or credentials for it, so a scheduled workflow would have nothing to fetch. An agent with the connector runs the refresh instead:

1. Call **only** the read-only tools `board_get_state` and `board_analyze_past`. Never call `board_dispatch_task`, `board_complete_task`, `board_ingest_telemetry` or `board_manipulate_time`.
2. Save the raw JSON output to `state.json` and `analysis.json` *outside* the repo. Never commit the raw files.
3. Run `npm run board:snapshot -- state.json analysis.json`.
4. Check the diff of `data/board-snapshot.json`. It should contain no full wallet addresses, keys, tokens or local paths.
5. Run `npm test`, then commit and push. The Vercel deployment rebuilds from the commit.
