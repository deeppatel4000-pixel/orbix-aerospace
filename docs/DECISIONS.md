# ORBIX Engineering and Product Decisions

These decisions are supported by the current repository and development history. Revisit them only through an explicit architecture task.

## 1. Engineering behavior is separated from presentation

Pure calculators own equations and numerical validation. Analyses compose existing domain outputs. Reports format completed results. React collects inputs and renders output. This prevents visual state from becoming a second engineering engine and keeps physics testable without a browser.

## 2. Visual identity changes by engineering environment

ORBIX shares typography, geometry, spacing, accessibility, and interaction rules while using distinct environments:

- orbital command: deep space, cyan/violet telemetry, planetary context
- tactical aircraft: graphite/olive/steel, radar green, amber, dossier framing
- launch operations: deep black/steel, bright vehicle light, ignition orange, orbital-blue telemetry
- engineering laboratory: blueprint surfaces, research cyan, technical white

This avoids making every area look identical while preserving a recognizable ORBIX family.

## 3. Official identity assets are not redrawn

The wordmark, emblem, app mark, and suite in `public/brand` came from the user. Transparent derivatives remove background only; they do not redesign the logo. Application code uses contained sizing and safe space.

## 4. Canonical vehicle images are local

The five aircraft and five rocket images were explicitly supplied/designated by the user. Local copies provide stable rendering, responsive Next/Image optimization, and independence from remote availability. Source URLs remain recorded with the visual mappings. Replacing these assets requires explicit direction.

## 5. No fabricated engineering information

Missing values use a visible unavailable state. Presentation does not estimate specifications, normalize comparisons, create fake telemetry, infer safety, or claim mission feasibility. New facts require a reviewed source and the appropriate typed data boundary.

## 6. Static surfaces must not look interactive

Pointers, lift, glow, scale, active press feedback, and navigation color changes are reserved for genuine controls and links. Telemetry, specifications, summaries, reports, and descriptive cards remain static. This is a product-wide accessibility and trust rule.

## 7. Accessibility and reduced motion are foundational

Native semantics, keyboard operation, focus-visible treatment, responsive containment, live announcements where appropriate, and reduced-motion overrides are requirements rather than later polish. Motion never communicates engineering timing or required state.

## 8. Mission Control receives completed objects

Mission Control, replay, 3D scenes, ground track, briefing, trade study, and showcase components consume completed analyses/reports. They do not call calculators, analyses, report generators, or vehicle/TPS systems.

## 9. Illustrative geometry is labeled

Orbit paths, planet grids, spacecraft movement, timelines, ground tracks, and cinematic phases may use presentation geometry. They must be labeled illustrative and must not be presented as navigation, propagation, or flight prediction.

## 10. Generated environment art is presentation-only

The four environment plates are ORBIX-generated artwork, stored separately from engineering data and documented in `docs/assets/visuals/generated-environments.md`. They are atmosphere, not evidence of computed results or real hardware.

## 11. Server Components are the default

Routes and composition remain server-rendered. Client boundaries are introduced only for actual inputs, workflow selection, replay, or presentation state. This limits JavaScript and keeps data/engineering ownership outside client UI.

## 12. Generated verification output is not source

Local Playwright captures, copied verification apps, build directories, and temporary `node_modules` belong under ignored `output/`. Canonical runtime assets live in `public`; durable screenshot instructions live in `docs/assets/screenshots`. Only deliberate, reviewed portfolio captures should be promoted into tracked documentation.
