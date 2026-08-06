# ORBIX Design System 2.0

This foundation gives ORBIX a consistent aerospace operations identity without coupling presentation to engineering logic. It is implemented with CSS variables, Tailwind-compatible semantic colors, and server-renderable React primitives.

## Design principles

- **Precision over decoration:** technical hierarchy, measured spacing, and restrained light effects communicate engineering rigor.
- **Environment-aware identity:** orbital, tactical, and laboratory contexts have distinct accents while sharing the same geometry, typography, and accessibility contract.
- **Layered depth:** grids, radial light, glass surfaces, and accent edges replace flat navy panels without reducing readability.
- **Semantic composition:** feature code should choose a surface or status by meaning instead of recreating visual recipes.
- **Accessible motion:** motion is brief and presentational; reduced-motion preferences remove transforms and animation.

## Source files

- `src/styles/orbix-tokens.css` — color, type, spacing, geometry, depth, and motion tokens.
- `src/styles/orbix-foundations.css` — body environment, focus treatment, typography, grids, lighting, and framing utilities.
- `src/styles/orbix-components.css` — buttons, surfaces, status indicators, tags, tables, tabs, dialogs, tooltips, progress, empty states, and navigation.
- `src/styles/orbix-motion.css` — shared transitions, entry motion, signal motion, and reduced-motion overrides.
- `src/components/ui/` — typed React primitives for common semantic patterns.

## Environment themes

Use `data-orbix-theme` on the nearest meaningful container. Every theme retains ORBIX structure and accessibility while changing the operational accent language.

```tsx
<section data-orbix-theme="orbital">...</section>
<section data-orbix-theme="tactical">...</section>
<section data-orbix-theme="laboratory">...</section>
```

The existing `data-orbix-environment` attribute is also supported for environment artwork.

### Orbital

Deep orbital black, spacecraft graphite, nebula blue, orbital cyan, plasma violet, atmospheric blue, telemetry green, and telemetry white.

### Tactical

Dark graphite, muted olive, steel, radar green, and amber indicators. This is intended for aircraft and operational vehicle contexts, not warning or feasibility judgments.

### Laboratory

Dark blueprint surfaces with laboratory white, research cyan, blueprint blue, and light-gray technical text.

## Typography hierarchy

- `.orbix-display-xl` — primary brand or mission title.
- `.orbix-display-lg` — page-level display title.
- `.orbix-section-title` — section headings.
- `.orbix-body-lead` — prominent supporting descriptions.
- `.orbix-technical-label` / `.orbix-kicker` — uppercase telemetry labels.
- `.orbix-telemetry-value` — tabular engineering output.

Use interface typography for prose, display typography for major hierarchy, and telemetry typography only for labels and values.

## Surface system

Use `OrbixSurface` with the variant that matches the content:

- `hero` — high-emphasis introductions.
- `mission` — mission architecture and operations.
- `engineering` — calculators and laboratory explanations.
- `telemetry` — compact numerical status panels.
- `vehicle` — aircraft and launch-vehicle information.
- `gallery` — showcase and archive content.
- `report` — reviews, reports, and formal summaries.

Set `interactive` only when the complete surface is actionable. Static content should not imply interaction.

## Controls and feedback

- `ButtonLink` supports `primary`, `secondary`, and `tertiary` hierarchy.
- `StatusBadge` supports neutral, information, positive, caution, and critical tones. Status colors must describe supplied state, never infer engineering safety or feasibility.
- `ProgressIndicator` wraps native `progress` semantics.
- `EmptyState` provides a consistent informative absence state with an optional action.
- `Breadcrumbs` and `SectionNavigation` provide semantic page orientation and anchor navigation.
- `.orbix-table` and `.orbix-table-wrap` provide accessible, horizontally scrollable telemetry tables.
- `.orbix-tabs` and `.orbix-tab` style semantic tab controls using `aria-selected` or `data-active`.
- `.orbix-dialog` styles native dialogs without replacing native behavior.
- `.orbix-tooltip` styles tooltip content; callers remain responsible for an accessible description relationship.

## Backgrounds and motion

Use backgrounds sparingly and combine no more than two major ambient effects in one region:

- `.orbix-grid` / `.technical-grid`
- `.orbix-starfield`
- `.orbix-atmosphere-glow`
- `.orbix-light-field`
- `.orbix-carbon`

`.orbix-enter` is the standard soft page or panel entrance. `.orbix-signal-pulse` is reserved for active presentation indicators and loading marks. Neither communicates real mission timing.

## Accessibility contract

- Interactive elements retain a high-contrast global focus ring.
- Color is never the only carrier of state; status components include text and a shape indicator.
- Native elements remain the behavior source for links, progress, tables, dialogs, and controls.
- All animations collapse under `prefers-reduced-motion: reduce`.
- Surfaces maintain readable foreground and muted-text contrast against all three environment themes.
