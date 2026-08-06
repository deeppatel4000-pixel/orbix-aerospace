# ORBIX portfolio guide

## What ORBIX demonstrates

ORBIX is a full-stack educational aerospace engineering platform. It demonstrates how focused
physics calculators can be composed into mission workflows, preserved in typed reports, and
communicated through accessible mission-control interfaces without letting presentation code become
the source of engineering truth.

For a portfolio reviewer, the project shows four complementary capabilities:

- **Aerospace systems thinking:** orbital maneuvers, atmospheric entry, vehicle response, thermal
  protection, mission budgeting, and design review are connected through explicit contracts.
- **Software architecture:** pure TypeScript calculators, orchestration layers, domain catalogs,
  reports, server-first routes, and isolated client interaction boundaries remain separate.
- **Engineering reliability:** SI units, assumptions, validation, regression tests, CI, linting,
  formatting, type checking, and production builds make simplified models inspectable.
- **Technical communication:** Mission Control, reports, briefings, replay, trade studies, and guided
  demos present completed outputs without silently recomputing them.

ORBIX is an educational model, not certified flight software or an operational mission-planning
system.

## Technical highlights to discuss

1. Trace one input from a mission preset through a mission profile, source analysis, structured
   report, and visualization prop.
2. Show that calculator and analysis modules have no React imports.
3. Explain how client components own only form or presentation state while the dashboard remains
   server rendered.
4. Open a representative Vitest suite and the GitHub Actions validation workflow.
5. Point out explicit assumptions, limitations, units, and missing-data states in the interface.

## Recommended screenshot set

Capture authentic images using the specifications in [`../assets/screenshots`](../assets/screenshots/README.md):

1. Mission Control overview — the full analysis-to-presentation workspace.
2. Lunar transfer orbit workspace — orbital architecture and transfer communication.
3. Reentry Demonstrator workspace — trajectory, heating, deceleration, and TPS context.
4. Mission replay — presentation controls and phase communication.
5. Trade study — side-by-side mission review without winner scoring.
6. Public showcase mission gallery — the five curated presets and portfolio framing.

Use a single verified commit and consistent 1440 × 900 viewport for the primary desktop set. Add a
mobile capture only when it demonstrates a meaningful responsive layout.

## Recommended reviewer flow

1. Start at `/showcase` and describe the problem ORBIX solves.
2. Open one preset capture view to explain the mission's purpose and available systems.
3. Enter Engineering Laboratory and load Lunar Transfer Concept or Reentry Demonstrator.
4. Show the source analysis in Mission Profile, then move to Mission Control.
5. Review Orbit or Reentry, followed by Design Review or Trade Study.
6. Finish with Briefing, Showcase, or Demo Mode and the repository test architecture.

## Portfolio presentation checklist

- Link both the [live application](https://orbix-aerospace.vercel.app) and
  [source repository](https://github.com/deeppatel4000-pixel/orbix-aerospace).
- Lead with the integrated workflow, not the number of calculators.
- State the educational fidelity boundary before discussing results.
- Use real product captures only.
- Keep claims precise: ORBIX estimates, illustrates, compares, and communicates simplified models; it
  does not certify a vehicle or determine mission feasibility.
