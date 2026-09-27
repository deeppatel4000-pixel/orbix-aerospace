# Contributing to ORBIX

Thank you for your interest in improving ORBIX. Contributions should keep the project's focus on
traceable, educational aerospace engineering.

## Local setup

Requirements:

- Node.js 20.9 or newer (Node.js 22 LTS recommended)
- npm 10 or newer

```bash
npm install
npm run dev
```

## Architecture expectations

- Keep physics equations in pure TypeScript calculator modules.
- Use analysis modules to combine existing calculators into higher-level workflows.
- Keep React components focused on input collection and presentation.
- Keep explicit units in engineering contracts.
- Document assumptions and limitations for educational models.
- Do not present simplified results as flight-certified or operational guidance.
- Use only public, published information. Do not add export-controlled technical data (for
  example, material covered by ITAR or the EAR) or anything that is not already public.

See [`docs/architecture.md`](docs/architecture.md) for the full repository conventions.

## Licensing of contributions

- ORBIX source code is licensed under the [MIT License](LICENSE). By submitting a contribution,
  you agree that it is licensed under the MIT License on the same terms.
- You must own the rights to everything you submit, or have permission to submit it under the MIT
  License. Do not copy code, text, or data from sources whose licence does not allow it.
- Read [NOTICE.md](NOTICE.md) for what the MIT License does not cover, including the ORBIX name and
  logo.

## Images

- Do not add an image unless it has a verified free licence (for example, public domain, CC0,
  CC BY, or CC BY-SA) that allows use in this project.
- Record every image in [`docs/assets/image-provenance.md`](docs/assets/image-provenance.md) in the
  same change: subject, author or agency, licence, source page URL, and any modifications. The
  site's `/credits` page must list it too.
- Do not add AI-generated images of any kind.
- Do not add images that suggest endorsement by NASA, a branch of the U.S. armed forces, or any
  manufacturer.

## Before submitting a change

Run the full validation pipeline:

```bash
npm run validate
```

This checks formatting, ESLint, the design colour check, TypeScript, Vitest, and the production
Next.js build.

When adding engineering behaviour, include focused unit tests beside the calculator or analysis
module. Presentation changes should keep keyboard access, semantic structure, visible focus, and
reduced-motion support.

## Pull requests

- Keep changes focused and explain their educational or architectural purpose.
- Describe any new engineering assumptions and limitations.
- Cite the public source for any new vehicle figures.
- Avoid unrelated dependency or formatting churn.
- Confirm that `npm run validate` passes.
