# ORBIX architecture

## Application boundaries

The Next.js App Router owns URLs, metadata, loading boundaries, and route composition. Route files
stay thin: they select a feature or reusable page shell and provide route-specific metadata. Domain
and presentation implementations live outside `src/app`.

The `(site)` route group provides the public header, main-content landmark, and footer without adding
a URL segment. Areas with materially different chrome—such as a future authenticated educator
workspace—can receive separate route-group layouts without changing public URLs.

## Source organization

- `src/components/layout`: global structural components shared across routes.
- `src/components/ui`: small reusable interface primitives without domain behavior.
- `src/features/<feature>`: feature-owned components, types, domain data, analyses, and tests. Keep
  code local to a feature until a second consumer establishes a real shared abstraction.
- `src/config`: typed site-level configuration, including product metadata and navigation.
- `src/lib`: small framework-agnostic helpers; it is not a catch-all directory.

Vehicle datasets remain separate from UI components and use explicit domain types at the feature
boundary. Engineering values preserve units in their contracts instead of relying on display labels.

## Engineering Laboratory layers

The Engineering Laboratory enforces one-way ownership between engineering and presentation:

```text
Typed Inputs
    ↓
Pure Calculators
    ↓
Analysis Workflows
    ↓
Reports and Domain Outputs
    ↓
React Presentation
```

- `calculators` owns pure TypeScript equations and numerical validation.
- `analysis` composes calculators and existing analyses into higher-level workflows.
- `materials`, `missions`, and `reports` provide typed domain data and transformations without taking
  ownership of physics.
- `components` collects inputs or renders completed results; it does not duplicate equations.

This separation lets Vitest exercise engineering behavior without React and prevents visualization
state from becoming a source of mission truth.

## Rendering strategy

Components are React Server Components by default. Add `"use client"` only at interaction boundaries,
including calculator forms and presentation controls. Route and dashboard composition remains on the
server, while client components receive typed inputs or completed analysis objects. This keeps data
and engineering ownership outside presentation state.

## Styling

Tailwind CSS v4 provides utility classes, while global design tokens live in `src/app/globals.css`.
Use semantic color tokens such as `background`, `surface`, `foreground`, `muted`, `border`, `accent`,
and `signal` rather than one-off colors. New tokens should represent reusable design decisions.

## Dependency policy

Add a dependency only when a feature uses it. Current engineering visualizations use native SVG,
CSS, and React presentation state. If heavier visualization runtimes are introduced, isolate them
behind focused client boundaries and dynamic imports.

## Quality gates

Every change should pass formatting, ESLint, TypeScript, Vitest, and a production build through
`npm run validate`. Tests live beside the calculator, analysis, domain, or component they cover.
Future end-to-end tests should focus on critical user journeys rather than visual implementation
details.
