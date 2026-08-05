# Contributing to ORBIX

Thank you for your interest in improving ORBIX. Contributions should preserve the project's focus on
traceable, educational aerospace engineering.

## Local setup

Requirements:

- Node.js 20.9 or newer; Node.js 22 LTS is recommended
- npm 10 or newer

```bash
npm install
npm run dev
```

## Architecture expectations

- Keep physics equations in pure TypeScript calculator modules.
- Use analysis modules to compose existing calculators into higher-level workflows.
- Keep React components focused on input collection and presentation.
- Preserve explicit units in engineering contracts.
- Document assumptions and limitations for educational models.
- Do not present simplified results as flight-certified or operational guidance.

See [`docs/architecture.md`](docs/architecture.md) for the complete repository conventions.

## Before submitting a change

Run the full validation pipeline:

```bash
npm run validate
```

This checks formatting, ESLint, TypeScript, Vitest, and the production Next.js build.

When adding engineering behavior, include focused unit tests beside the calculator or analysis module.
Presentation changes should preserve keyboard access, semantic structure, and reduced-motion support.

## Pull requests

- Keep changes focused and explain their educational or architectural purpose.
- Describe any new engineering assumptions and limitations.
- Avoid unrelated dependency or formatting churn.
- Confirm that `npm run validate` passes.
