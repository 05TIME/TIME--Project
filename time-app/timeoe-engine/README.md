# $TIMEŒ Engine

$TIMEŒ Engine is a causal AI system designed to enhance temporal reasoning, causality detection, and counterfactual simulation. This project aims to provide insights into complex temporal relationships and causal dynamics through a user-friendly application.

## Features

- **Temporal Reasoning**: Track and interpret sequences of events over time.
- **Causality Detection**: Identify true causal relationships from event data.
- **Counterfactual Simulation**: Explore alternate realities by simulating "what if" scenarios.

## Project Structure

```
timeoe-engine
├── src
│   ├── engine
│   │   ├── temporal_reasoning.ts
│   │   ├── causality_detection.ts
│   │   └── counterfactual_simulation.ts
│   ├── app
│   │   ├── components
│   │   │   └── index.ts
│   │   ├── services
│   │   │   └── api.ts
│   │   └── views
│   │       └── dashboard.ts
│   └── types
│       └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Installation and usage

The engine has no package.json of its own. Its dependencies (zod, @supabase/supabase-js, etc.) come from the repo root, so run everything from the root:

```bash
npm install                 # at the repo root
npx vitest run              # tests (root vitest.config.ts includes time-app/timeoe-engine/test)
npm run typecheck:engine    # engine typecheck
npx grunt                   # CI: tests + engine typecheck + engine build (tsc -p time-app/timeoe-engine/tsconfig.json)
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.