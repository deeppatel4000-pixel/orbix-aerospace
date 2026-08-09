# ORBIX - Claude Engineering Handoff

This document records the verified repository state at the end of the Codex development period. It is a handoff, not a substitute for inspecting the repository. Re-run every command in the startup checklist before changing code.

## 1. Project Identity

ORBIX is an educational aerospace engineering and visualization platform. It connects typed aerospace inputs to pure TypeScript calculators, higher-level analysis workflows, structured reports, and presentation-only mission visualizations.

- Product: **ORBIX**
- Tagline: **Advanced Aerospace Engineering Laboratory**
- Audience: students, educators, engineering mentors, recruiters, portfolio reviewers, and aerospace professionals evaluating educational software architecture
- Purpose: demonstrate traceable aerospace calculations, mission composition, vehicle exploration, engineering communication, and accessible product design
- Maturity: public portfolio application with a broad tested engineering core and substantial presentation systems; it is not operational or certification software
- GitHub: <https://github.com/deeppatel4000-pixel/orbix-aerospace>
- Production: <https://orbix-aerospace.vercel.app>

ORBIX models are simplified and educational. Never present their results as certified performance, navigation data, safety determinations, or mission feasibility.

## 2. Current Repository State

State originally audited on 2026-08-08. The canonical working copy is now `C:\Users\Deep\dev\orbix`.

> **Do not work inside OneDrive.** The former location `C:\Users\Deep\OneDrive\Documents\GitHub\orbix` (earlier named `aerolab`) was corrupted by OneDrive sync on 2026-08-08: `HEAD` silently reverted from the handoff checkpoint to `5bb7c05`, the checkpoint vanished from the reflog, and 23 `-Jay-Desktop` conflict copies appeared, 7 of them inside `.git`. A read-only audit was enough to trigger it. A full hash audit of that folder found no unique work, so nothing was lost. Clone outside any synced folder.

- Branch: `main`
- Upstream: `origin/main`
- Remote: `https://github.com/deeppatel4000-pixel/orbix-aerospace.git`
- Audited baseline commit: `5bb7c054e0b2d0b49fba32c7536e4810d0501675` (`Use transparent ORBIX brand assets`)
- Before the handoff commit, local `main`, `origin/main`, and the public GitHub branch were identical at that baseline.
- The final handoff checkpoint is the repository `HEAD` containing this file. Run `git rev-parse HEAD`; a commit cannot embed its own hash without changing that hash.
- Repository visibility: public
- Default branch: `main`
- GitHub homepage: `https://orbix-aerospace.vercel.app`
- No history was rewritten, squashed, reset, or force-pushed during handoff.

The handoff checkpoint preserves the legitimate presentation work that had accumulated after the baseline commit: aircraft dossiers, interaction consistency, Mission Control 3.0, Rockets Explorer 2.0, Home 3.0, and Engineering Laboratory 4.0. Learn and the Compare education layer were subsequently implemented on 2026-08-08 (sections 11 and 12).

## 3. Technology Stack

Versions come from `package.json` and the validation environment:

- Next.js `15.5.22`, App Router
- React and React DOM `19.1.0`
- TypeScript `^5`
- Tailwind CSS `^4` through `@tailwindcss/postcss`
- Lucide React `^1.28.0`
- Vitest `4.1.10`
- Playwright `@playwright/test` `^1.62.1` (dev-only; browser suite in `tests/e2e/`)
- ESLint `^9` with `eslint-config-next` `15.5.22`
- Prettier `^3.9.6` with Tailwind class sorting
- Node.js used for handoff validation: `22.17.0`
- npm used for handoff validation: `10.9.2`
- Lockfile version: 3
- Deployment: Vercel
- CI: GitHub Actions, Node 22, `npm ci`, then `npm run validate`

There is no charting, WebGL, database, authentication, analytics, or external API dependency. Current diagrams and 3D-like scenes are native React, SVG, and CSS presentation.

## 4. Architecture

### `src/app`

Thin App Router composition, metadata, route layouts, loading/not-found UI, manifest, favicon, and static parameter generation. The `(site)` route group supplies public chrome without changing URLs.

Current public routes include:

- `/`
- `/aircraft` and `/aircraft/[id]`
- `/rockets` and `/rockets/[id]`
- `/compare`
- `/engineering-lab`
- `/learn`
- `/showcase`
- `/showcase-capture/[id]`

The validated production build generated 28 page instances, including dynamic vehicle and showcase paths.

### `src/components`

Shared brand, layout, and semantic UI primitives. Reusable controls and surfaces belong here only when a second consumer justifies the abstraction.

### `src/features`

Feature-owned data, types, components, tests, and domain code:

- `aircraft`: repository facade, canonical visual mapping, explorer, and profile presentation
- `rockets`: repository facade, canonical visual mapping, explorer, and profile presentation
- `vehicles`: shared typed aircraft/rocket contracts and immutable source data
- `compare`: URL-driven same-category comparison adapters, presentation, and a presentation-side educational annotation layer
- `learn`: conceptual learning pathways linking into the Engineering Laboratory (Server Components only)
- `engineering-lab`: calculators, analysis, materials, missions, reports, types, validation, UI analyzers, and Mission Control
- `home`: public landing experience
- `showcase`: portfolio and mission showcase presentation

### `src/styles`

ORBIX Design System 2.0 tokens, global foundations, component recipes, and motion/reduced-motion behavior.

### `public`

Tracked brand, vehicle, rocket, and generated environment imagery. These are runtime assets, not disposable build output.

### `docs`

Architecture, design-system, brand, visual-source, screenshot, portfolio, and handoff documentation.

### Configuration

- `next.config.ts`: strict mode, image quality options, security headers, and disabled `X-Powered-By`
- `eslint.config.mjs`: Next.js/TypeScript/Prettier rules and generated-output exclusions
- `vitest.config.mts`: test configuration
- `.github/workflows/validate.yml`: complete CI validation
- `.gitignore`: dependencies, builds, environments, editor files, Vercel link metadata, and generated verification output

## 5. Engineering Architecture

The central ownership chain is:

```text
Typed Inputs
  -> Pure Calculators
  -> Analysis Workflows
  -> Reports / Domain Outputs
  -> React Presentation
```

- `src/features/engineering-lab/calculators`: pure TypeScript equations and numerical validation
- `src/features/engineering-lab/analysis`: orchestration of calculators and existing analyses
- `src/features/engineering-lab/materials`: immutable educational TPS material catalog
- `src/features/engineering-lab/missions`: presets, custom mission construction, and scenario storage contracts
- `src/features/engineering-lab/reports`: structured report generation and JSON/Markdown export
- `src/features/engineering-lab/types`: engineering input/output contracts and SI-unit naming
- `src/features/engineering-lab/utils/validation.ts`: shared numerical validation
- `src/features/engineering-lab/components`: input collection and rendering only

Presentation-only tasks must not change calculators, analysis equations, validation semantics, vehicle datasets, TPS data, reports, mission contracts, or physics tests. React must never become a second source of engineering truth.

The repository currently contains 20 calculator modules plus their tests and 23 analysis modules plus their tests. There are 33 registered Engineering Laboratory analyzer modules.

## 6. Completed Development History

The historical Day prompts were not stored as individual repository documents, so the following is reconstructed from implemented files, Git history, validation, and the preserved development record. Where exact early-day boundaries are unavailable, that is stated explicitly.

### Days 1-17 - Foundation

Exact per-day mapping is not recoverable from Git. The implemented foundation includes the App Router site, typed aircraft and rocket data architecture, explorers, comparison adapters, basic aerospace calculators, validation utilities, and initial Engineering Laboratory UI.

### Days 18-20 - Oblique shock system

Added the theta-beta-M weak attached-shock calculator, atmosphere-coupled condition analysis, and analyzer UI.

### Days 21-27 - Shock recovery and inlet compression

Added total-pressure recovery, normal/oblique shock-loss analysis, multi-shock sequencing, supersonic inlet compression, and their analyzers. Existing calculators remain the equation source of truth.

### Days 28-36 - Hypersonic heating and reentry history

Added Sutton-Graves-style educational stagnation heating, heating orchestration, ballistic coefficient, reentry deceleration, fixed-step trajectory integration, and thermal-history analysis/UI.

### Days 37-46 - TPS and vehicle reentry systems

Added TPS sizing, a typed material catalog, material-aware sizing/comparison, vehicle-level reentry evaluation/comparison, and the matching presentation modules.

### Days 47-54 - Orbital mechanics

Added circular orbital elements, Vis-Viva, escape velocity, Hohmann transfer, altitude-based transfer analysis, plane-change calculator/analysis, and UI.

### Delta-v and mission composition milestone

Added combined transfer/plane-change orchestration, delta-v budgeting, mission profiles, Mission Profile UI, and optional source-analysis preservation. Some original prompts reused Day 55/56 labels; trust the implemented modules rather than numbering assumptions.

### Days 58-62 - Presets and reports

Added immutable educational mission presets, preset launcher integration, structured mission reports, report viewer, and JSON/Markdown export.

### Days 63-74 - Visualization and presentation

Added orbit/reentry visualization, unified Mission Viewer, Mission Control dashboard, CSS-based 3D presentation, replay, deterministic insights, custom mission builder, scenario library, briefing, trade study, showcase, and guided Demo Mode. These consume completed objects and do not calculate physics.

### Days 75-80 - ORBIX product and portfolio

Completed the AeroLab-to-ORBIX brand transition, Mission Control shell/startup, illustrative ground track, design review, mission archive/gallery, portfolio documentation, screenshot infrastructure, and public deployment preparation.

### Days 81-83 - Design System 2.0 and official identity

Established environment-specific visual identities and installed the user-supplied ORBIX wordmark, emblem, app mark, favicon treatment, and transparent derivatives. The official marks must not be redrawn.

### Day 84 - Aircraft Explorer 2.0

Installed the five supplied canonical aircraft images and rebuilt the explorer presentation using local `next/image` assets. Data contracts and specifications were unchanged.

### Day 85 - Rocket Explorer 2.0 foundation

Installed the five supplied canonical rocket images and introduced launch-operations presentation patterns without altering vehicle data.

### Day 86 - Aircraft mission dossiers

Reorganized individual aircraft profiles into cinematic but factual dossier sections: overview, imagery, technical dashboard, performance, dimensions, propulsion, notes, variants, timeline, applications, related aircraft, and CTA.

### Day 87 - Interaction and Mission Control refinement

Audited static-versus-interactive affordances and refined Mission Control into a grouped command-center shell with explicit workspaces, status, telemetry, accessibility, and reduced-motion behavior.

### Day 88 - Rockets Explorer premium pass

Completed launch-specific explorer/profile presentation, related vehicles, applications, technical dashboard, image framing, and responsive/accessibility refinements.

### Day 89 - Home 3.0

Rebuilt the home page as a premium ORBIX landing experience with a stronger hero, featured experiences, mission preview, showcase bridge, platform highlights, and final CTA.

### Day 90 - Engineering Laboratory 4.0

Grouped all 33 analyzers into six workflows, introduced a sticky desktop/mobile workflow index, preserved analyzer state with one presentation-only client shell, corrected heading hierarchy, and redesigned calculator cards as static laboratory instruments. Full validation passed. The last recorded local Lighthouse run for `/engineering-lab` scored Performance 89, Accessibility 100, Best Practices 96, and SEO 100, with CLS 0 and TBT 150 ms.

### Day 91 - Cancelled before implementation

Only a read-only product audit occurred. No Compare or Learn Day 91 source changes were made. This handoff superseded the feature.

## 7. Current ORBIX Design System

Primary sources:

- `docs/design-system/orbix-design-system.md`
- `src/styles/orbix-tokens.css`
- `src/styles/orbix-foundations.css`
- `src/styles/orbix-components.css`
- `src/styles/orbix-motion.css`

### Color and environments

- Orbital: `#02040a` orbital black, graphite, cosmic navy, orbital cyan `#6ce6ff`, plasma violet, atmospheric blue, telemetry green, and white
- Tactical: graphite, muted olive/steel, radar green, and amber
- Launch: deep black/steel framing, white vehicle light, orange ignition accents, and orbital-blue telemetry; composed with existing semantic tokens
- Laboratory: dark blueprint surfaces, research cyan, laboratory blue, technical white/gray

### Typography

- Interface: Aptos/Inter/Segoe UI fallback stack
- Display: Bahnschrift/Arial Narrow/Aptos Display
- Telemetry: SFMono/Consolas/Liberation Mono
- Display, section, body, label, and telemetry sizes are tokenized.

### Surfaces and geometry

Glass is restrained. Technical grids, carbon textures, calibration rails, borders, and environmental lighting establish depth. Surface variants are semantic: hero, mission, engineering, telemetry, vehicle, gallery, and report.

### Interaction rules

- Buttons feel like buttons.
- Links feel like links.
- Selectors feel like controls.
- Static information stays visually static.
- Only a fully actionable card may use interactive lift/glow/pointer behavior.
- Never place a pointer cursor or hover elevation on telemetry, statistics, specifications, descriptions, or report sections.

### Motion and accessibility

Motion is brief and presentational. `prefers-reduced-motion` collapses animations, transforms, smooth scrolling, and transition durations. Global focus-visible rings are high contrast. Color is never the sole state carrier.

## 8. Vehicle Systems

Canonical typed data lives under `src/features/vehicles/data`; feature repositories expose readonly lists and ID lookup.

### Aircraft

- F-22 Raptor
- F-35 Lightning II
- F-15 Eagle
- B-2 Spirit
- SR-71 Blackbird

Images: `public/images/aircraft`. Mapping, alt text, object position, and source URL: `src/features/aircraft/data/aircraft-visuals.ts`.

### Rockets

- Falcon 9
- Falcon Heavy
- Saturn V
- Space Launch System
- Starship

Images: `public/images/rockets`. Mapping, alt text, object position, and source URL: `src/features/rockets/data/rocket-visuals.ts`.

The local images are the user-designated canonical explorer assets. Do not replace, search for alternatives, generate substitutes, or change specifications without explicit authority and source review.

## 9. Mission Control

Mission Control is a presentation orchestrator under `src/features/engineering-lab/components/visualization`. It receives completed `MissionProfileAnalysis`, `MissionReport`, and optional reentry outputs. It must not call calculators or analyses.

Current workspaces:

1. Overview
2. Unified View
3. Orbit
4. Reentry
5. Ground Track
6. Design Review
7. Replay
8. Insights
9. Briefing
10. Trade Study
11. Showcase
12. Demo Mode

The shell consists of a dashboard owner, grouped sidebar, header, workspace panel, persistent status bar, and telemetry metrics. Startup/replay/showcase state is presentation-only.

Ground track, 3D scenes, planet grids, orbit paths, spacecraft motion, mission timelines, and showcase phases are illustrative communication geometry. Labels explicitly avoid claiming orbital propagation, navigation, timing, or mission simulation.

Mission presets are the five immutable educational inputs in `missions/mission-presets.ts`: LEO Satellite Deployment, ISS Style Resupply, Lunar Transfer Concept, Reentry Demonstrator, and Mars Transfer Concept.

## 10. Engineering Laboratory

The dashboard is a Server Component. `LaboratoryShell` is the focused client boundary for presentation-only workflow selection and hash navigation. All analyzers remain mounted so user state is preserved; one workflow is foregrounded at a time.

Workflow groups:

1. Engineering foundations, modules 01-06
2. Compressible flow, modules 07-12
3. Entry and thermal systems, modules 13-19
4. Orbital and mission analysis, modules 20-24
5. Mission operations, modules 25-27
6. Scenario review and presentation, modules 28-33

The build reports `/engineering-lab` at 124 kB route size and 232 kB first-load JavaScript. Keeping inactive analyzers mounted preserves state but carries client cost; optimize only after profiling and without changing behavior.

Last recorded Lighthouse observation for this route: 89 Performance, 100 Accessibility, 96 Best Practices, 100 SEO, LCP 3.5 s, CLS 0, TBT 150 ms. This is an observation, not a permanent guarantee.

## 11. Compare

- Route: `/compare`
- Route file: `src/app/(site)/compare/page.tsx`
- Feature: `src/features/compare`
- Categories: aircraft or rockets; cross-category comparison is intentionally rejected by UX
- Selection: URL search parameters, up to three profiles
- Data: existing `listAircraft()` / `listRockets()` through category adapters
- Output: semantic horizontally scrollable table, preserved units/notes, and unavailable states; no ranking or inferred winner

Current UX is a functional two-step selection and matrix. It links to vehicle profiles but does not yet provide the intended Learn/Laboratory educational bridge. Day 91 was not implemented.

An earlier revision of this document claimed a committed mojibake string in `comparison-controls.tsx`. That claim was wrong and was corrected on 2026-08-08. The source file holds a correctly encoded UTF-8 ellipsis (`U+2026`, bytes `E2 80 A6`). The mojibake existed only in this document, introduced when it quoted the string. No source fix is required.

## 12. Learn

- Route: `/learn`
- Route file: `src/app/(site)/learn/page.tsx`
- Feature: `src/features/learn` (types, data, components)
- Architecture: entirely Server Components — zero client components

Implemented 2026-08-08, replacing the former `FeaturePlaceholder`. Six conceptual pathways mirroring the six Engineering Laboratory workflows: Aerodynamics & Flight Fundamentals, Propulsion & Vehicle Performance, High-Speed & Compressible Flow, Atmospheric Entry & Thermal Protection, Orbital Mechanics & Mission Design, and Mission Operations & Engineering Communication.

Each pathway states the concept, why it matters, and where it appears in real aerospace, then routes onward through 28 verified `/engineering-lab#<anchor>` deep links plus exploration links into the vehicle explorers, Compare, and Showcase.

**Content boundary, enforced in the type system:** every content string is general aerospace theory. `LearningArea` is documented as never carrying a vehicle specification or a computed result — computed output is only ever reached by following a laboratory link. The page states this to the reader as well. Do not add specifications, measurements, or historical claims here without a reviewed source.

Link integrity is enforced by `tests/e2e/smoke/learn.spec.ts`, which crawls every emitted link and fails if an anchor id no longer exists in the Engineering Laboratory.

## 13. Showcase / Portfolio

- `/showcase` is the public product showcase.
- `/showcase-capture/[id]` renders curated capture states for the five existing mission presets.
- `docs/assets/screenshots` defines authentic screenshot slots; most folders currently contain instructions rather than final captures.
- `docs/portfolio/portfolio-guide.md` and `demo-script.md` document portfolio flow.
- README is the GitHub landing page and links the production application.
- GitHub topics: aerospace, engineering, engineering-education, nextjs, orbital-mechanics, simulation, spacecraft, typescript.

Do not add fake screenshots. Capture the real application in a controlled state and retain assumptions/unavailable values.

## 14. Assets

### Official brand

`public/brand` contains user-supplied archival marks plus derived transparent crops. Detailed checksums and usage rules are in `docs/brand/orbix-brand-assets.md`.

- `orbix-emblem.png`: supplied circular emblem
- `orbix-app-logo.png`: supplied app logo
- `orbix-full-logo.png`: supplied full wordmark
- `orbix-brand-suite.png`: supplied suite/social-preview source
- `orbix-mark-transparent.png`: derived transparent app mark used by the application
- `orbix-wordmark-transparent.png`: derived transparent wordmark used by the application
- `orbix-wordmark.png` and `orbix-app-mark.png`: safe presentation crops
- `src/app/icon.png` and `src/app/favicon.ico`: application icon outputs

Do not redraw, recolor, distort, or substitute the official identity.

### Vehicle imagery

- Aircraft: five canonical files in `public/images/aircraft`; source URLs recorded in `aircraft-visuals.ts`
- Rockets: five canonical files in `public/images/rockets`; source URLs recorded in `rocket-visuals.ts`

Several source images are large: B-2 is about 9.2 MB, the brand suite about 6.0 MB, and several vehicle files are 2-4 MB. Next/Image mitigates delivery size, but repository and image-pipeline optimization remains future work. Preserve original/canonical files while creating optimized derivatives.

### Generated environments

Four ORBIX-generated 1600x900 WebP plates live in `public/images/environments`: orbital command, tactical aircraft, launch complex, and engineering laboratory. Their prompts, exclusions, and non-engineering usage policy are in `docs/assets/visuals/generated-environments.md`.

### Local generated output

`output/` contains local browser captures and temporary verification applications, including a copied `node_modules`. No files in `output/` were tracked before handoff. It is intentionally ignored by Git/Prettier/ESLint and is not part of the recoverable source checkpoint. Canonical runtime assets are in `public`; screenshot infrastructure is in `docs/assets/screenshots`.

## 15. Deployment

- Vercel project: `orbix-aerospace`
- Project ID is stored locally in ignored `.vercel/project.json`; do not publish account IDs as configuration.
- Production alias: <https://orbix-aerospace.vercel.app>
- At the original audit the alias resolved to a `Ready` production deployment created 2026-08-06 19:41 EDT, corresponding by timestamp to baseline commit `5bb7c05`. That mapping is historical only. Re-verified on 2026-08-08: production had since deployed the handoff checkpoint, confirmed by a content marker present in the checkpoint and absent from `5bb7c05`. Determine the deployed commit from evidence, never from this line.
- Home, Showcase, Engineering Laboratory, Compare, and Learn returned HTTP 200 during the audit.
- The deployment list and `git-main` alias indicate Git integration. Verify the new production deployment after every push rather than assuming completion.
- No application environment variables are required. No `.env.example` exists because there are no required public variables.

Typical workflow:

```bash
npm ci
npm run validate
git push origin main
npx vercel inspect https://orbix-aerospace.vercel.app
```

Never pass tokens on the command line or commit `.vercel` metadata.

## 16. Security

- `.env*` is ignored; there were no environment files in the project root at audit time.
- `.pem`, editor state, build output, coverage, Vercel metadata, and generated verification output are ignored.
- A repository pattern scan found no common API-key, GitHub-token, Vercel-token, secret, or password signatures in tracked source.
- Security headers: `nosniff`, `DENY` framing, strict-origin referrer policy, and camera/microphone/geolocation denial.
- `npm audit` on 2026-08-08 reported **3 high-severity vulnerabilities**. The advisories are against `postcss` (nested at `node_modules/next/node_modules/postcss`) and `sharp` (at `node_modules/sharp`); `next` is reported only because it depends on both, not because of an advisory against its own code. npm proposed Next `16.3.0`, a semver-major upgrade. This was not applied during preservation because it requires a dedicated compatibility/security migration and retest.
- No secret values belong in this document or `project-state.json`.

## 17. Testing

Handoff baseline results on Node 22.17.0 / npm 10.9.2:

- `npm test`: 68 test files, 863 tests passed
- `npm run format:check`: passed
- `npm run lint`: passed with zero warnings
- `npm run typecheck`: passed
- `npm run build`: passed
- `npm run validate`: passed end to end
- Production build: 28 generated page instances
- `git diff --check`: passed before documentation creation

Vitest tests live beside calculators, analyses, domain modules, and presentation components. They run in Node and render React with `renderToStaticMarkup`, so they verify markup and logic, never browser behaviour.

A committed Playwright suite covers that gap as of 2026-08-08 (`tests/e2e/`). It runs against the production build in Chromium at three viewports — desktop 1440x900, tablet 768x1024, mobile 390x844 — plus an isolated `visual` project: **216 passed, 12 skipped** (skips are viewport-conditional). It is split into `smoke/`, `a11y/`, and `visual/`, with 17 committed screenshot baselines. See `docs/testing/browser-testing.md` for how to run, debug, and update baselines.

## 18. Known Issues

1. **Resolved 2026-08-08.** Learn is implemented (`src/features/learn`, six conceptual pathways, zero client components). It is conceptual teaching only, by design — it deliberately contains no specifications or computed results.
2. **Resolved 2026-08-08.** Compare now groups rows into six engineering categories and carries a per-row, collapsed educational explanation with links into the matching Laboratory analyzers and Learn. The validated value pipeline (adapters, repository, query parsing, types) was not modified — the education layer is a separate presentation-side annotation keyed by row id.
3. **Resolved 2026-08-08 — not an issue.** An earlier revision claimed a mojibake loading string in `comparison-controls.tsx`. Verification showed the source is correctly encoded UTF-8; the mojibake was in this document's own quotation. Retained as a numbered entry so the false lead is not rediscovered.
4. **README validation counts were stale before handoff.** They were updated to 68/863 in the handoff checkpoint.
5. **Dependency advisories.** Three high-severity npm advisories require a deliberate Next.js upgrade investigation.
6. **Large canonical images.** Some source PNGs are 2-9 MB. Preserve originals; consider optimized derivatives and measurable LCP review.
7. **Engineering Laboratory bundle size.** 232 kB first-load JS; hidden analyzers remain mounted to preserve state.
8. **Resolved 2026-08-08.** A committed Playwright browser suite now exists (`tests/e2e/`, 216 passing) and runs in CI via `.github/workflows/browser-tests.yml`. Retained as a numbered entry so the history stays readable.
9. **Screenshot portfolio is empty.** Verified 2026-08-08: all six folders under `docs/assets/screenshots` contain only a `README.md`. Zero authentic captures exist, not merely an incomplete set.
10. **Asset licensing review is incomplete.** Source URLs are recorded, but not every vehicle image has a consolidated license/attribution record. Confirm redistribution terms, especially non-Wikimedia sources.
11. **Local production prefetch observation — did not reproduce.** A Day 90 local `next start` audit observed 404 responses for some navigation RSC prefetch requests. As that entry instructed, this was reproduced against a fresh build on 2026-08-08: prefetch requests returned HTTP 200 on `/aircraft`, `/rockets`, `/compare`, `/engineering-lab`, `/learn`, and `/showcase`, both locally and in production. Treat the original observation as stale unless it recurs.
12. **Resolved 2026-08-08.** Visual regression automation exists: 17 committed baselines across desktop/mobile/tablet (`tests/e2e/visual/`). Baselines are platform-specific, so the CI visual job is `workflow_dispatch`-only until Linux baselines are generated. The ~34 MB storage cost was measured and deliberately accepted — see `docs/testing/browser-testing.md`.
13. **Early milestone records are incomplete.** Exact Day 1-17 mapping is not recoverable from committed history.
14. **Fixed 2026-08-08 — mobile menu focus restoration.** Pressing Escape with the mobile navigation open closed the menu but dropped focus to `<body>`, so a keyboard user lost their place. `src/components/layout/mobile-navigation.tsx` now restores focus to the toggle button via a ref, in a post-commit effect guarded so it fires only on the Escape path — never on mount, a link click (the user is navigating away), or a plain toggle click. No focus trap was added; this is a disclosure widget, not a modal. Regression-covered in `tests/e2e/a11y/mobile-navigation.spec.ts`.

## 19. Current Work State

### COMPLETED

- Engineering calculators, analyses, mission reports, TPS systems, presets, scenario library, vehicle evaluation, and orbital/reentry workflows represented by the passing test suite
- Aircraft and Rockets explorer/profile presentation through the latest Day 84-90 source
- ORBIX Design System 2.0 and official brand assets
- Mission Control workspaces and presentation systems
- Home, Showcase, documentation infrastructure, GitHub CI, and Vercel deployment
- Engineering Laboratory 4.0 workflow redesign

### IN PROGRESS

- Nothing should be treated as actively being implemented after this handoff. Day 91 was stopped before source changes.

### PLANNED

- Learn content architecture and Compare/Learn bridge, after content/source review
- Dependency security upgrade assessment
- Authentic screenshot completion
- Browser E2E and visual-regression coverage
- Image optimization/licensing documentation

### DEFERRED

- New physics, operational-fidelity models, WebGL, databases, authentication, and external APIs. Each requires a separately scoped architecture decision.

### DO NOT TOUCH YET

- Calculator equations, analysis contracts, vehicle/TPS data, mission logic, or report semantics during visual work
- Canonical brand and vehicle imagery without explicit user direction
- Major Next.js upgrade without a clean branch, migration plan, audit validation, and visual regression pass

## 20. Recommended Next Steps

1. **Clone/open and verify this handoff.** Compare `HEAD`, origin, status, validation, routes, and live deployment before editing.
2. **Resolve dependency advisories on a dedicated branch.** Determine the safest patched Next/PostCSS/Sharp path; do not mix a major framework migration with UI work.
3. **Complete asset licensing and optimization documentation.** Preserve canonical originals while generating deliberate derivatives and measuring LCP.
4. **Add a small committed browser E2E suite.** Cover home navigation, vehicle profiles, Compare selection, Engineering Laboratory workflow selection, and Mission Control keyboard navigation.
5. **Design Learn from verified content.** Inventory existing educational text, define typed content ownership, and avoid invented claims.
6. **Then improve Compare/Learn cross-navigation.** Compare answers “what differs”; Learn explains “why it matters”; Laboratory applies the concept.
7. **Capture authentic portfolio screenshots.** Use the existing capture routes and documentation after the deployed checkpoint is visually verified.

Do not continue Day numbering blindly. Prioritize security, reproducibility, and content integrity.

## 21. Design Rules Claude MUST Preserve

- Buttons feel like buttons.
- Links feel like links.
- Selectors feel like controls.
- Static surfaces feel static.
- No pointer cursor, lift, glow, scale, shadow change, or navigation color change on non-interactive information.
- No fabricated engineering facts, specifications, telemetry, timing, feasibility, or safety claims.
- No physics or unit conversions in React.
- Use the appropriate orbital, tactical, launch, or laboratory visual environment.
- Preserve ORBIX typography, restrained aerospace lighting, technical framing, and clear hierarchy.
- Maintain semantic HTML, keyboard access, focus-visible treatment, readable contrast, responsive layouts, and reduced-motion support.
- Presentation geometry must be labeled illustrative when it is not calculated mission output.
- Prefer Server Components; add `use client` only at true interaction boundaries.

## 22. Engineering Safety Rules

During presentation work, do not modify:

- `src/features/engineering-lab/calculators`
- `src/features/engineering-lab/analysis`
- `src/features/engineering-lab/materials`
- numerical validation behavior
- `src/features/vehicles/data` or vehicle contracts
- mission/report contracts and source-analysis semantics
- TPS catalog values or sizing equations
- test expectations to make a visual change pass

If presentation appears to need a missing value, display the established unavailable state. Do not estimate or derive it in React. If an engineering change is genuinely required, stop, define a separate tested domain task, and obtain explicit approval.
