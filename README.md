# ORBIX

**Advanced Aerospace Engineering Laboratory**

ORBIX is a professional educational aerospace engineering platform for mission design, orbital
analysis, spacecraft evaluation, atmospheric reentry studies, thermal protection trade studies,
engineering visualization, and mission-systems communication.

The project turns typed mission inputs into reproducible engineering analyses and presents the
results through an aerospace mission-control interface. It is designed for students, educators,
engineering learners, and portfolio reviewers who want to explore how multiple aerospace
disciplines connect in one system.

> ORBIX is an educational engineering application. Its simplified models and material data are not
> suitable for flight certification, operational mission planning, or safety-critical decisions.

## Overview

ORBIX brings mission planning, vehicle evaluation, and technical presentation into a single Next.js
application. Its domain architecture keeps equations in pure TypeScript calculators, composes those
calculators through analysis workflows, and keeps React focused on accessible interaction and
presentation.

Users can explore aerospace vehicles, compare configurations, assemble educational mission
scenarios, evaluate orbital maneuvers and atmospheric entry, study thermal-protection options, and
review the completed mission through reports and visual mission-control workspaces.

## Features

- **Mission Control Center** — unified aerospace workspace with telemetry, status, review, briefing,
  showcase, and guided-demo views.
- **Orbital Transfer Analysis** — circular-orbit properties, Vis-Viva, escape velocity, Hohmann
  transfers, plane changes, and combined mission workflows.
- **Delta-V Budgeting** — ordered maneuver budgets with source-analysis preservation and contribution
  summaries.
- **Spacecraft Reentry Analysis** — atmosphere, aerodynamics, Mach, shock, deceleration, trajectory,
  and thermal-history workflows.
- **Thermal Protection Evaluation** — educational TPS sizing, material selection, material comparison,
  and vehicle-level integration.
- **Mission Reports** — structured engineering reports with JSON and Markdown export support.
- **Mission Visualization** — accessible SVG and CSS-based orbit, reentry, ground-track, and mission
  presentation views.
- **Mission Replay** — presentation-only phase playback using completed mission results.
- **Design Review** — structured mission architecture, orbital, vehicle, thermal, assumption, and
  limitation review.
- **Trade Studies** — side-by-side presentation of completed mission scenarios without inventing
  feasibility scores.
- **Demo Mode** — guided walkthrough for students, educators, recruiters, and portfolio reviewers.
- **Scenario Library** — typed mission presets and reusable custom educational scenarios.

Additional explorer experiences provide type-safe U.S. aircraft and launch-vehicle profiles and
same-category vehicle comparisons.

## Engineering Architecture

ORBIX uses explicit layers so that engineering behavior remains testable and independent of the UI:

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

- `src/features/engineering-lab/calculators` contains pure, reusable physics equations.
- `src/features/engineering-lab/analysis` composes calculators into higher-level workflows.
- `src/features/engineering-lab/materials`, `missions`, and `reports` contain typed domain data and
  transformations.
- `src/features/engineering-lab/components` renders accessible interactive tools and completed
  results.
- `src/features/vehicles` owns shared vehicle types and repository data; aircraft and rocket features
  consume those contracts without duplicating records.
- `src/app` keeps App Router routes thin and delegates implementation to feature modules.

React Server Components remain the default. Client boundaries are limited to interactive forms,
controls, and presentation state. See [the architecture guide](docs/architecture.md) for repository
conventions.

## Technology Stack

- Next.js 15 with the App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Lucide React
- Vitest
- ESLint and `eslint-config-next`
- Prettier with Tailwind class sorting
- GitHub Actions validation

No external visualization or 3D runtime is currently required; the mission visualizations use native
web technologies and existing analysis outputs.

## Getting Started

Requirements:

- Node.js 20.9 or newer (Node.js 22 LTS recommended)
- npm 10 or newer

```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/orbix.git
cd orbix
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Replace `<YOUR_GITHUB_USERNAME>` with the repository owner's GitHub username after cloning or sharing
the project.

## Testing

The project uses Vitest for calculator, analysis, domain, and presentation-component coverage. The
validation pipeline also enforces formatting, linting, TypeScript correctness, and a production
Next.js build.

```bash
npm test
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Run the complete local CI-equivalent pipeline with:

```bash
npm run validate
```

GitHub Actions runs the same `npm run validate` command for repository changes.

## Project Status

ORBIX is an actively developed educational aerospace engineering simulation and visualization
platform. The current release includes the end-to-end path from typed mission configuration through
engineering analysis, reports, design review, and mission presentation.

The models intentionally favor clarity, composability, and education over operational fidelity.
Assumptions and limitations are surfaced throughout the interface so results are interpreted in the
proper context.

## Roadmap

- Extend the standard-atmosphere and reentry models beyond the current educational range.
- Add richer orbital propagation and ground-track analysis backed by validated engineering modules.
- Introduce reusable charting for time-history and trade-study data.
- Add optional WebGL-based 3D vehicle and mission visualization behind isolated client boundaries.
- Expand aircraft, launch-vehicle, mission-preset, and TPS educational datasets with source metadata.
- Add browser-level accessibility and critical-journey tests.
- Add shareable, printable mission reports and optional PDF export.
- Develop educator-focused lesson plans, guided exercises, and classroom scenario packs.
