# AeroLab

AeroLab is an interactive aerospace engineering learning platform focused on U.S. military aircraft
and launch vehicles. The project is currently in its foundation phase: application architecture,
shared layout, navigation, global styling, and route shells are in place.

## Requirements

- Node.js 20.9 or newer (Node.js 22 LTS recommended)
- npm 10 or newer

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Run the full verification pipeline with `npm run validate`.

## Architecture

- `src/app` owns routing, metadata, and route-level layouts.
- `src/components` contains application-wide layout and UI primitives.
- `src/features` contains domain-oriented feature implementations.
- `src/config` contains typed, static application configuration.
- `src/lib` contains framework-agnostic helpers.

See [`docs/architecture.md`](docs/architecture.md) for conventions and future extension guidance.

## Current scope

The repository intentionally contains no aircraft or launch-vehicle datasets, engineering
calculators, 3D experiences, charts, or simulations. Those capabilities should be introduced as
independent feature slices in later phases.
