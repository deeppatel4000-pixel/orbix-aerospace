# ORBIX - Claude Start Here

Copy the prompt below into Claude after cloning or opening the repository.

---

You are taking over ORBIX from Codex.

ORBIX is a public educational aerospace engineering platform that separates pure TypeScript calculations from analysis orchestration, reports, and React presentation. It includes typed aircraft and rocket data, orbital mechanics, compressible flow, reentry/thermal/TPS workflows, mission composition, Mission Control, reporting, visualization, and portfolio presentation. It is educational software, not operational or certification software.

Before modifying any code:

1. Read `docs/CLAUDE_HANDOFF.md` completely.
2. Inspect the repository structure and all files relevant to the current state.
3. Read `package.json`, `next.config.ts`, `eslint.config.mjs`, `.gitignore`, and `.github/workflows/validate.yml`.
4. Inspect recent Git history with `git log --oneline --decorate -20`.
5. Check `git status --short` and identify every staged, modified, untracked, or ignored artifact relevant to the task.
6. Verify the current branch with `git branch --show-current`.
7. Verify `origin` with `git remote -v` and compare local `HEAD` with `origin/main`.
8. Run `npm test` and `npm run validate`. Report actual results; do not hide failures.
9. Inspect the current application locally and compare key public routes with `https://orbix-aerospace.vercel.app`.
10. Compare the actual repository against the handoff document. Treat the handoff as evidence, not infallible truth.
11. Do not immediately modify code.
12. First report what you understand about project identity, architecture, engineering boundaries, design system, Git state, deployment, tests, known issues, and unfinished work.
13. Explicitly list every discrepancy between the repository and the handoff.
14. Ask for confirmation before beginning the next feature or dependency migration.

Design philosophy to preserve:

- ORBIX uses environment-specific identities: orbital, tactical aircraft, launch operations, and engineering laboratory.
- Buttons, links, and selectors must clearly appear interactive; static information must remain visually static.
- Use the user-supplied ORBIX brand assets and canonical local vehicle images. Do not redraw or replace them.
- Keep Server Components as the default and client boundaries focused.
- Respect keyboard navigation, focus visibility, contrast, responsive behavior, and reduced motion.

Engineering boundaries to preserve:

- Calculators own equations and numerical validation.
- Analyses orchestrate existing domain modules.
- Reports format completed outputs.
- React collects inputs and renders results; it never duplicates physics.
- Never invent vehicle specifications, mission telemetry, TPS properties, engineering facts, or feasibility claims.
- Presentation-only work must not change calculators, analyses, vehicle data, mission logic, TPS data, report semantics, or engineering contracts.

Current development stage:

- The legitimate Day 84-90 visual/UX work is preserved in the handoff checkpoint.
- Compare and Learn are implemented: Learn provides six conceptual pathways, and Compare groups rows by engineering category with per-row educational context.
- Browser E2E and visual regression coverage exists (`tests/e2e/`, 225 passing). The remaining priority order is verification, dependency security, then asset licensing/optimization.

Known issues include large canonical images, an empty authentic-screenshot gallery, and an incomplete vehicle-image licensing record. Verify all of these before acting.

Begin by returning an evidence-backed takeover report. Do not start a feature until the user confirms the next scope.

---
