# ORBIX

ORBIX is an educational web application about aerospace engineering. It lets you browse U.S.
aircraft and launch vehicles, compare vehicles in the same category, and work through simplified
calculations for orbital transfers, delta-v budgets, plane changes, atmospheric reentry, and
thermal protection. Results can be reviewed side by side and exported as reports.

## Educational use

ORBIX uses simplified, textbook-level models for learning. It is not intended for operational
mission planning, flight certification, or any safety-critical engineering decision, and its
results should not be relied on for those purposes. Vehicle figures come from published, public
sources and may be approximate or out of date.

## What the app does

The codebase keeps equations independent of React. Pure TypeScript calculators hold the physics,
analysis modules combine those calculators into workflows, and the presentation layer only
collects inputs or renders completed results.

The aim is to show how the pieces of a mission analysis connect: a scenario can be configured,
analysed, visualised, and reviewed, with the assumptions and limitations stated beside each result.

### Main areas

- **Aircraft and rocket explorers:** typed profiles of U.S. aircraft and launch vehicles, with
  same-category comparison.
- **Orbital transfer analysis:** circular-orbit properties, vis-viva, escape velocity, and Hohmann
  transfers.
- **Delta-v budgeting:** ordered maneuver budgets with per-maneuver contributions and the source
  analyses kept alongside.
- **Plane change analysis:** inclination changes and combined transfer and plane-change sequences.
- **Reentry analysis:** atmosphere, aerodynamics, Mach, shock, deceleration, trajectory, and
  thermal history.
- **Thermal protection:** simplified TPS sizing, material selection, and material comparison.
- **Mission reports:** structured reports with JSON and Markdown export.
- **Mission control, replay, and showcase views:** presentation of completed analysis results,
  including an illustrative ground-track view that is labelled as such.
- **Design review and trade studies:** side-by-side review of completed scenarios, without
  artificial feasibility scores.
- **Scenario library and demo mode:** preset educational scenarios and a guided walkthrough.

## Screenshots

Screenshots have not been captured yet. When they are, they will be stored under
[`docs/assets/screenshots`](docs/assets/screenshots/README.md) and linked here.

## Architecture

```text
Mission inputs
      ↓
Engineering analysis
      ↓
Mission reports
      ↓
Visualisation
      ↓
Presentation
```

- `src/features/engineering-lab/calculators` contains pure, reusable engineering equations.
- `src/features/engineering-lab/analysis` combines calculators into higher-level workflows.
- `src/features/engineering-lab/materials`, `missions`, and `reports` contain typed domain data and
  transformations.
- `src/features/engineering-lab/components` handles interaction and presentation.
- `src/features/vehicles` holds shared vehicle contracts and repository data.
- `src/app` contains thin App Router composition and metadata.

React Server Components are the default. Client components are limited to interactive forms and
presentation state. See the [architecture guide](docs/architecture.md) for conventions.

## Technology

- Next.js 16 with the App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Lucide icons
- Vitest and Playwright
- ESLint and Prettier
- GitHub Actions

Visualisations use native SVG, CSS, and React state; there is no external 3D or charting library.

## Engineering principles

- **Feature boundaries:** each domain lives in its own feature folder.
- **Physics separate from presentation:** React components do not contain or duplicate equations.
- **Typed contracts:** explicit TypeScript inputs and outputs with SI units.
- **Tests:** calculators, analyses, domain modules, and components have unit tests.
- **Stated limits:** assumptions and limitations are shown wherever a simplified model is used.

## Live site

[https://orbix-aerospace.vercel.app](https://orbix-aerospace.vercel.app)

The site needs no account, API keys, or server-side data services. It has no sign-up and no
analytics code. Custom scenarios saved in the scenario library stay in your browser's local
storage and are not sent to a server. The hosting provider may keep standard request logs.

## Running locally

Requirements:

- Node.js 20.9 or newer (Node.js 22 LTS recommended)
- npm 10 or newer

```bash
git clone https://github.com/deeppatel4000-pixel/orbix-aerospace.git
cd orbix-aerospace
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

ORBIX needs no environment variables. If configuration is added later, list public variable names
in `.env.example` and keep secrets out of source control.

## Testing

```bash
npm test
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Run the full CI-equivalent pipeline with:

```bash
npm run validate
```

GitHub Actions runs the same command on pushes and pull requests.

A separate Playwright suite (`npm run test:e2e`) covers behaviour that only a real browser can
check. See [`docs/testing/browser-testing.md`](docs/testing/browser-testing.md) for what it covers
and how to run it.

## Project status

ORBIX is an active personal educational project. It prioritises clear architecture, stated
assumptions, and learning value over operational fidelity. It makes no claim about certified
vehicle performance or mission feasibility.

## Roadmap

- Capture real screenshots and add short walkthroughs.
- Add reusable time-history plots for trajectory and thermal data.
- Improve orbital and ground-track rendering using validated public source data.
- Extend sourced aircraft, launch-vehicle, and TPS educational data.
- Add propulsion, power, and communications learning modules.
- Extend atmosphere and trajectory models behind new tested calculator modules.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, architecture rules, licensing of contributions,
and image rules.

## Legal

- The source code is available under the [MIT License](LICENSE).
- [NOTICE.md](NOTICE.md) explains what the MIT License does not cover: third-party images, fonts
  and libraries, the ORBIX name and logo, and third-party trademarks.
- Images are credited to their authors and used under the licences recorded in
  [`docs/assets/image-provenance.md`](docs/assets/image-provenance.md) and on the site's `/credits`
  page.
- ORBIX is not affiliated with or endorsed by NASA, the U.S. Department of Defense, or any
  manufacturer or organisation named in it.

## Contact

Deep Patel: deep.patel4000@gmail.com
