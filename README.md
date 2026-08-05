# ORBIX

**Advanced Aerospace Engineering Laboratory**

ORBIX is an educational aerospace engineering platform that brings orbital mechanics, spacecraft
design, mission architecture, atmospheric reentry, thermal analysis, engineering visualization, and
technical presentation into one coherent application.

> ORBIX uses simplified educational models. It is not intended for operational mission planning,
> flight certification, or safety-critical engineering decisions.

## Overview

ORBIX demonstrates how an aerospace mission can move from configuration to analysis and then into a
professional engineering review experience. Users can explore aircraft and launch vehicles, build
mission scenarios, evaluate orbital maneuvers, study reentry and thermal-protection behavior, compare
designs, and communicate the results through reports and mission-control visualizations.

The codebase is organized so that equations remain independent of React. Pure TypeScript calculators
own physics, analysis modules compose those calculators into workflows, and the presentation layer
only collects inputs or renders completed engineering results.

## Why ORBIX Exists

Most aerospace learning tools isolate one equation or discipline at a time. ORBIX was created to show
how those pieces connect inside an integrated engineering environment: a mission concept can be
configured, analyzed, visualized, reviewed, and presented without hiding the assumptions between
each stage.

The educational goal is not to imitate certified flight software. It is to make engineering reasoning
visible—units, models, tradeoffs, limitations, and presentation all live beside the results they
produce.

## Project Showcase

ORBIX is an aerospace engineering laboratory for exploring orbital mechanics, spacecraft mission
design, atmospheric reentry systems, thermal-protection concepts, and engineering visualization.

Authentic product screenshots will be added to
[`docs/assets/screenshots`](docs/assets/screenshots/README.md). The following placeholders identify
the planned captures without presenting fabricated application imagery.

### Mission Control Center

> Screenshot placeholder: `docs/assets/screenshots/mission-control-dashboard.png`

Interactive aerospace command interface displaying mission telemetry, visualization, analysis, and
presentation systems.

### Orbital Analysis

> Screenshot placeholder: `docs/assets/screenshots/orbital-visualization.png`

Orbital transfer, delta-v budgeting, plane-change analysis, and spacecraft trajectory concepts.

### Reentry & Thermal Systems

> Screenshot placeholder: `docs/assets/screenshots/reentry-visualization.png`

Vehicle reentry evaluation, trajectory history, stagnation heating, and thermal-protection analysis.

### Mission Visualization

> Screenshot placeholder: `docs/assets/screenshots/mission-showcase.png`

Interactive orbital, planetary, replay, ground-track, and mission-storytelling visualizations.

### Trade Study

> Screenshot placeholder: `docs/assets/screenshots/trade-study.png`

Side-by-side mission architecture review using completed analysis and report outputs.

### Demo Mode

> Screenshot placeholder: `docs/assets/screenshots/demo-mode.png`

Guided platform walkthrough designed for students, educators, mentors, and portfolio reviewers.

## Featured Systems

### Mission Control

- Command-center interface for navigating completed mission workspaces.
- Telemetry-style presentation of supplied engineering outputs.
- Mission replay, status, review, briefing, and demonstration experiences.

### Orbital Engineering

- Circular-orbit and Hohmann transfer analysis.
- Delta-v mission budgeting with source-analysis preservation.
- Inclination changes and sequential transfer/plane-change workflows.

### Spacecraft Systems

- Reentry trajectory, deceleration, and thermal-history evaluation.
- Educational thermal-protection sizing and material comparison.
- Vehicle-level evaluation and side-by-side configuration comparison.

### Presentation Layer

- Structured mission reports with JSON and Markdown export.
- Engineering briefings, design reviews, trade studies, and mission showcases.
- Accessible visualization and guided demonstration interfaces.

## Features

- **Mission Control** — unified aerospace workspace for telemetry, visualization, briefings, reviews,
  and guided demonstrations.
- **Orbital Transfer Analysis** — circular-orbit properties, Vis-Viva, escape velocity, and Hohmann
  transfer workflows.
- **Delta-V Budgeting** — ordered maneuver budgets with contribution summaries and preserved source
  analyses.
- **Plane Change Analysis** — inclination-change studies and sequential transfer/plane-change mission
  analysis.
- **Reentry Analysis** — atmosphere, aerodynamics, Mach, shock, deceleration, trajectory, and thermal
  history workflows.
- **Thermal Protection Evaluation** — educational TPS sizing, material selection, material comparison,
  and vehicle-level integration.
- **Mission Reports** — structured engineering reports with JSON and Markdown export.
- **Mission Replay** — presentation-only mission-phase playback based on completed analysis results.
- **Ground Track Visualization** — clearly labeled illustrative mapping of orbital concepts onto a
  planetary view.
- **Design Review** — structured review of mission architecture, vehicle, thermal, assumptions, and
  limitations.
- **Trade Studies** — side-by-side presentation of completed mission scenarios without artificial
  feasibility scoring.
- **Scenario Library** — typed presets and reusable custom educational mission configurations.
- **Demo Mode** — guided experience for students, educators, recruiters, and portfolio reviewers.
- **Mission Showcase** — cinematic, presentation-only mission storytelling using supplied results.

Aircraft and rocket explorers provide type-safe U.S. vehicle profiles and same-category comparison
tools alongside the mission systems.

## Architecture

```text
Mission Inputs
      ↓
Engineering Analysis
      ↓
Mission Reports
      ↓
Visualization Systems
      ↓
Presentation Layer
```

- `src/features/engineering-lab/calculators` contains pure, reusable engineering equations.
- `src/features/engineering-lab/analysis` orchestrates calculators into higher-level workflows.
- `src/features/engineering-lab/materials`, `missions`, and `reports` contain typed domain data and
  transformations.
- `src/features/engineering-lab/components` owns accessible interaction and presentation.
- `src/features/vehicles` owns shared vehicle contracts and repository data.
- `src/app` contains thin App Router composition and metadata.

React Server Components remain the default. Client boundaries are limited to interactive forms and
presentation state. See the [architecture guide](docs/architecture.md) for detailed conventions.

## Technology Stack

- Next.js 15 with the App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Lucide React
- Vitest
- ESLint with `eslint-config-next`
- Prettier with Tailwind class sorting
- GitHub Actions

The current visualizations use native SVG, CSS, and React presentation state; no external 3D or
charting dependency is required.

## Engineering Principles

- **Modular architecture** — domain-focused feature boundaries keep systems independently evolvable.
- **Separation of physics and presentation** — React components do not own or duplicate engineering
  equations.
- **Typed engineering contracts** — explicit TypeScript inputs, outputs, and SI units make data flow
  inspectable.
- **Automated testing** — calculators, analyses, domain modules, and presentation components have
  regression coverage.
- **Educational modeling boundaries** — assumptions and limitations are stated wherever simplified
  models are presented.

## Live Demo

Live application: [https://orbix-aerospace.vercel.app](https://orbix-aerospace.vercel.app)

The deployment is the public portfolio edition of ORBIX. It requires no account, API keys, or local
data services.

## Running ORBIX Locally

Requirements:

- Node.js 20.9 or newer; Node.js 22 LTS is recommended
- npm 10 or newer

```bash
git clone https://github.com/deeppatel4000-pixel/orbix-aerospace.git
cd orbix-aerospace
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create and run a production build with:

```bash
npm run build
npm start
```

ORBIX currently requires no environment variables. If deployment configuration is introduced later,
document public variable names in `.env.example` and keep all secrets out of source control.

## Testing

The current release is verified by **65 test files** containing **854 passing tests**. The full
validation pipeline also enforces Prettier formatting, zero-warning ESLint, TypeScript correctness,
and a successful production Next.js build.

```bash
npm test
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Run the complete CI-equivalent pipeline with:

```bash
npm run validate
```

GitHub Actions runs the same validation command for pushes and pull requests.

## Project Status

ORBIX is an active educational aerospace engineering and visualization project. The portfolio release
includes the complete path from typed mission inputs through engineering analysis, reporting, design
review, and mission presentation.

The platform intentionally prioritizes traceable architecture, engineering communication, and
learning value over operational fidelity. It does not claim certified vehicle performance or mission
feasibility.

## Roadmap

### Phase 1 — Portfolio Release

- Publish the verified ORBIX repository and CI workflow.
- Add real product screenshots and concise portfolio walkthroughs.
- Document the engineering architecture and educational boundaries.

### Phase 2 — Improved Visualization

- Add reusable time-history plots for trajectory and thermal data.
- Improve orbital and ground-track rendering with validated source data.
- Evaluate an isolated WebGL workspace for richer 3D presentation.

### Phase 3 — Additional Spacecraft Systems

- Extend sourced spacecraft, aircraft, launch-vehicle, and TPS educational data.
- Add propulsion, power, communications, and subsystem learning modules.
- Expand instructor-ready mission presets and guided exercises.

### Phase 4 — Advanced Simulation Capabilities

- Extend atmosphere and trajectory models behind new tested calculator modules.
- Explore validated orbital propagation and mission-event sequencing.
- Add browser-level accessibility and end-to-end tests for critical workflows.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, architectural boundaries, and quality checks.

## License

This project is available under the [MIT License](LICENSE).
