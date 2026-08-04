# AeroLab architecture

## Application boundaries

The App Router is responsible for URLs, metadata, loading boundaries, and composition. Route files
should stay thin: they select a feature or reusable page shell and provide route-specific metadata.
Reusable business and presentation logic belongs outside `src/app`.

The `(site)` route group provides the public header, main-content landmark, and footer without adding
a URL segment. Future areas with materially different chrome—such as an immersive 3D viewer or an
authenticated educator workspace—can receive separate route-group layouts without changing public
URLs.

## Source organization

- `src/components/layout`: global structural components shared across routes.
- `src/components/ui`: small reusable interface primitives without domain behavior.
- `src/features/<feature>`: feature-owned components, hooks, schemas, services, and tests. Keep code
  local to a feature until a second consumer establishes a real shared abstraction.
- `src/config`: typed site-level configuration, such as product metadata and navigation.
- `src/lib`: small framework-agnostic helpers. Do not turn this into a catch-all directory.

When datasets arrive, keep validated source data separate from UI components and define explicit
domain types at the feature boundary. Engineering values should preserve units in their types or
schemas instead of relying on display labels.

## Rendering strategy

Components are React Server Components by default. Add `"use client"` only at interaction boundaries.
The current client surface is limited to active navigation state and the mobile menu. This keeps the
initial JavaScript footprint small and leaves future data access on the server by default.

## Styling

Tailwind CSS v4 provides utility classes, while global design tokens live in `src/app/globals.css`.
Use the semantic color tokens (`background`, `surface`, `foreground`, `muted`, `border`, `accent`, and
`signal`) rather than hard-coded colors in feature components. New tokens should represent reusable
design decisions, not one-off values.

## Dependency policy

Add a dependency when a feature uses it, not in anticipation of future work. React Three Fiber,
Three.js, Recharts, and Framer Motion are intentionally deferred. When introduced, isolate heavy
interactive experiences behind dynamic imports and route-level loading states.

## Quality gates

Every change should pass formatting, ESLint, TypeScript, and a production build. Tests should be added
with the first domain logic; unit tests belong beside the feature they cover, and end-to-end tests
should cover critical user journeys rather than visual implementation details.
