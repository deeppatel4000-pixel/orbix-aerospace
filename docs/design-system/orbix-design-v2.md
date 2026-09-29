# ORBIX design v2: "Flight manual"

Status: binding for the v2 redesign (supersedes the visual sections 3 to 11 and 14 of
`orbix-redesign-2026.md`; that file's rules on content, copy, accessibility, imagery licensing and
file ownership still apply unless changed here).

## 1. Intent

ORBIX v1 (commit c0ee291) had a strong mood: a blue-black instrument-panel ground, full-bleed
photographs behind tall condensed headlines, a different accent colour per section, and a faint
blueprint grid. It also had AI-generated backdrops, violet glows, gradient buttons, pills, fake
telemetry and "cinematic" copy. The first redesign removed those and, with them, the mood.

v2 restores the mood with only honest materials: real public-domain photography, real data set as
instrument readouts, real technical linework, and strong typography. It must read like a
well-made flight manual or museum catalogue built by an engineer, never like a SaaS template.

Reference research (read before designing, do not copy):
`C:\Users\Deep\AppData\Local\Temp\claude\C--Users-Deep-dev-orbix\0aef5163-b2c7-4e1b-945a-29343ae8c21d\scratchpad\research-v2\`
(`before.md` audit of v1 with file references, `tells.md` catalogue of vibe-coded tells,
`taste.md` digest of the taste skills, `refs.md` aerospace reference sites). Screenshots of v1:
`.playwright-mcp/before/*.png`; the bland v1.5: `.playwright-mcp/current/*.png`.

## 2. Hard rules (owner, non-negotiable)

- No purple or violet in UI, gradients, glows or tokens. The existing ORBIX logo image is the one
  accepted exception; never add violet around it.
- No pill-shaped buttons, chips, tags, badges or toggles. `rounded-full` only on genuinely circular
  non-interactive shapes.
- No em dashes (U+2014) in any user-visible text, metadata, alt text or aria labels.
- No emoji. No fake reviews, metrics, statuses, badges ("verified", "active", "linked"), KPI
  counters, or unsupported claims. No fake telemetry chrome (`// REGISTRY 02`, "Interface 01").
- No AI-generated images. Only the photos in `public/images/**` recorded in
  `docs/assets/image-provenance.md`, always with a visible credit.
- No AI-slop copy: elevate, seamless, unleash, next-gen, cutting-edge, revolutionary, empower,
  world-class, premium, state-of-the-art, cinematic, journey, immersive, "engineering narrative".
- No cursor effects, magnetic buttons, custom cursors, scroll hijacking, parallax, infinite
  decorative animation or over-the-top scroll reveals.
- WCAG 2.2 AA: text contrast >= 4.5:1, UI boundaries >= 3:1, visible focus, keyboard operable,
  label-in-name, reduced motion honoured.

## 3. Anti-template rules (from research)

Avoid these vibe-coded signatures even though they are not owner rules:

- Fonts: Inter, Geist, Space Grotesk, Space Mono, DM Sans, Sora, Outfit, Manrope, Plus Jakarta Sans,
  Instrument Serif, Fraunces. The italic-serif accent word trick.
- Gradient text, glassmorphism panels, glow shadows, blurred colour orbs, aurora backgrounds.
- Centered hero with a pill badge above the H1 and two buttons below.
- Three equal feature cards with an icon in a tinted rounded square above each title.
- Logo clouds, stat banners about the site itself, testimonial carousels, FAQ accordions.
- Colored left-border "callout" stripes on cards, status dots that encode nothing.
- Uniform `rounded-2xl shadow-lg` cards, cards inside cards.
- Uppercase eyebrow above every single section.

## 4. Palette (blue-black, from v1, violet removed)

Tokens (CSS custom properties in `src/styles/orbix-tokens.css`). Contrast measured with the WCAG
formula against page / surface / raised.

| Token               | Hex       | Use                                     | vs page                           | vs surface | vs raised |
| ------------------- | --------- | --------------------------------------- | --------------------------------- | ---------- | --------- |
| `--bg-page`         | `#03060c` | page ground                             |                                   |            |           |
| `--bg-surface`      | `#080d17` | panels, footer                          |                                   |            |           |
| `--bg-raised`       | `#0d1627` | inputs, selected rows, hovered cards    |                                   |            |           |
| `--text-primary`    | `#f2f6fb` | headings, body                          | 18.69                             | 17.91      | 16.66     |
| `--text-secondary`  | `#c1ccd7` | body secondary                          | 12.45                             | 11.93      | 11.10     |
| `--text-muted`      | `#91a3b7` | labels, captions, credits               | 7.85                              | 7.52       | 7.00      |
| `--border-subtle`   | `#17243a` | hairline dividers (decorative)          |                                   |            |           |
| `--border-default`  | `#22344d` | panel outlines (decorative)             |                                   |            |           |
| `--border-control`  | `#4a6785` | input and button outlines               | 3.45                              | 3.30       | 3.07      |
| `--accent-space`    | `#5fd3f0` | default accent; rockets, home, showcase | 11.65                             | 11.17      | 10.39     |
| `--accent-aircraft` | `#e3ae54` | aircraft division                       | 10.09                             | 9.67       | 9.00      |
| `--accent-lab`      | `#78bdff` | engineering lab, learn, verification    | 10.16                             | 9.74       | 9.06      |
| `--on-accent`       | `#03060c` | text on accent fills                    | 11.65 on space, 10.09 on aircraft |            |           |

Status colours only where they encode state: success `#72e9b5`, warning `#f2bc68`,
danger `#ff7d83` (all >= 7:1 on page).

Division accents: each route sets `data-division="space|aircraft|lab"` on its main wrapper; the
division overrides only `--accent` (the header hairline, active nav rule, eyebrow rule, the second
word of the H1, card classification lines, primary button fill, focus ring). Accent covers roughly
10 percent of a screen at most.

Background: `--bg-page` plus one static radial light field, `radial-gradient(60rem 40rem at 85% -10%,
rgb(73 99 183 / 0.16), transparent 70%)`. No violet radial. No starfield.

## 5. Typography

Loaded with `next/font/google` (no new npm dependency):

- **Display:** IBM Plex Sans with the `wdth` axis. Display cut: `font-stretch: 84%`, weight 600 to
  650, tracking -0.04em to -0.05em, line-height 0.92 to 0.98, sentence or title case as in v1
  ("Aircraft Explorer" style two-word headings, second word in the division accent). Not uppercase
  at large sizes.
- **Body:** IBM Plex Sans 400/500, 16 to 18px, line-height 1.6, measure <= 68ch.
- **Data and labels:** B612 Mono (designed for Airbus cockpit displays) 400/700, tabular numerals,
  for readouts, spec values, units, table figures, small uppercase labels (11 to 12px, tracking
  0.12em). Replaces IBM Plex Mono.

Scale (clamp): display `clamp(3.25rem, 7.5vw, 7rem)`, h1 `clamp(2.75rem, 6vw, 5.5rem)`, h2
`clamp(2rem, 4vw, 3.5rem)`, h3 `1.375rem`, readout-lg `clamp(1.75rem, 3vw, 2.5rem)` in B612 Mono,
body 1rem to 1.125rem, label 0.75rem. Use `text-wrap: balance` on headings, `pretty` on paragraphs.
Weights: 400, 500, 600, 650 (display only).

## 6. Texture and linework

- Blueprint grid: fixed `body::before`, 72px cells, 1px lines at `rgb(95 211 240 / 0.025)`, masked
  to fade toward the bottom; plus an optional 12px minor grid inside hero sections only at 0.012.
  Static, `pointer-events: none`.
- Grain: fixed full-screen pseudo-element with an inline SVG `feTurbulence` noise at opacity 0.035,
  `pointer-events: none`, never on scrolling containers.
- Registration marks: small 8px corner ticks (1px, `--border-control`) on hero photo frames and on
  the showcase diagrams, like a technical drawing. No clip-path chamfers.
- **Amendment (owner approved, T1 attempt 3).** Measured in the browser, the values above left the
  grid invisible and the grain lifted the ground to about `#080b11`. They are now: grid lines
  `color-mix(in srgb, var(--accent-space) 4.5%, transparent)` (0.045), grain opacity 0.02 with
  normal blend, light field tint 22% (0.22). The grid mask keeps its shape (solid to 30%,
  transparent by 85%), and the grid is positioned at `round(down, calc(50% - 4px), 1px) 0`
  (plain `calc()` as the fallback) so lines sit on whole pixels even at odd layout widths, such as
  1425px with a classic scrollbar, and one lands on the 72rem container's text edge.
  Vertically the grid starts at the 64px header height, so horizontal lines fall at 64 + 72n px
  and the first one sits on the header's bottom edge (orchestrator approved, F-fix).
- **Amendment (T1 attempt 4): registration marks.** The hero photo is only framed below 48rem: a
  4:3 plate inside the container gutter with a 6px radius, 24px (1.5rem) below the header so the
  top crop marks clear the header hairline. The marks sit outside the trim like
  crop marks, the tick corners 6px outside each photo corner, in the gutter, in
  `--border-control` on the page ground; they are never drawn on the photograph. From 48rem the
  photo is full-bleed and has no frame to mark, so the marks are hidden there and are otherwise
  used on showcase diagrams.
- Hairline compartments: spec panels use `gap-px` on a `--border-default` background so cells are
  separated by 1px rules (v1 pattern).

## 7. Shape, depth, motion

- Radius: controls 4px; tags and small labels 2px; panels and cards 8px; photos 0 when full-bleed,
  6px when framed. Never above 12px.
- Shadows: none on cards. Overlays only: `0 24px 48px -24px rgb(1 3 8 / 0.8)`.
- Hover: cards shift border to `--border-control` and background to `--bg-raised`; photos scale to
  1.03 inside an overflow-hidden frame over 500ms. Buttons change fill; press `translateY(1px)`.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)`, 180 to 500ms. No `linear` UI easing.
- Load: hero text may fade and rise 12px once on first paint (400ms, staggered 60ms per line).
  No scroll-triggered reveals below the hero. Everything is off under `prefers-reduced-motion`.
- No infinite animation except a loading indicator.

## 8. Components

- **Buttons:** 4px radius, 44px min height, sans 500 15px, trailing arrow icon at 16px.
  Primary: solid `--accent` fill, `--on-accent` text, hover lightens 8 percent. Secondary: 1px
  `--border-control`, transparent fill, hover `--bg-raised`. Tertiary: text link with 1px underline
  offset 4px and arrow. Never a gradient, never a glow.

  API (`src/components/ui`): `Button` renders a `<button>` (defaults to `type="button"`) for
  actions; `ButtonLink` renders a Next.js `Link` for navigation and takes every `Link` prop;
  `buttonClass({ variant, size, className })` returns the same classes for an element that cannot
  be either. Props shared by both:

  | Prop      | Values                                                        | Default   |
  | --------- | ------------------------------------------------------------- | --------- |
  | `variant` | `primary`, `secondary`, `tertiary`, `ghost`, `link`           | `primary` |
  | `size`    | `default` (44px), `lg` (48px, a single hero action)           | `default` |
  | `arrow`   | `right` (another page), `down` (this page), `external` (site) | none      |

  `ghost` is a quiet toolbar control (secondary text, no outline, `--bg-raised` on hover, 44px).
  `link` is an inline accent link inside running text with no minimum height. A `secondary`
  button with `aria-pressed="true"` gets an accent outline. The arrow is decorative and hidden
  from assistive technology, so the text names the destination. Pages must not hand-roll buttons
  or arrows.

- **Eyebrow:** 24px accent rule plus sans 13px 500 label in `--text-secondary`, sentence case. Use
  only above page H1s and major section H2s, not every block. No `//` separators.
- **Photo hero (aircraft, rockets, vehicle profiles, home):** full-bleed photo behind content,
  `min-height: min(88svh, 60rem)`, image `saturate(0.85) contrast(1.05)`, overlay
  `linear-gradient(90deg, rgb(3 6 12 / 0.96) 0%, rgb(3 6 12 / 0.86) 38%, rgb(3 6 12 / 0.35) 70%,
rgb(3 6 12 / 0.6) 100%)` plus a bottom fade to `--bg-page`. Credit line bottom-right in B612 Mono
  11px `--text-muted` with the licence and source link. On mobile the photo sits above the text
  (not behind) at 4:3.
  **Amendment (orchestrator approved, F-fix):** from 48rem to 80rem the content column is capped
  at `min(46rem, 58vw)` and the horizontal overlay eases with no knee: `--bg-page` at 96 percent
  at 0%, 94 at 30%, 88 at 46%, 78 at 60%, 64 at 72%, 55 at 84% and 60 at 100%. The spec gradient
  thins out behind the lead at those widths and let it fall below 4.5:1; an earlier two-step ramp
  (0.92 at 50%, then 0.55) left a visible vertical edge in the photo. Measured on the 404 hero the
  lead is at least 7.5:1 against the brightest pixel behind it at 768, 900, 1024 and 1279px. From
  80rem the gradient above applies unchanged.
- **Spec panel:** hairline compartment grid (2 or 3 columns) with B612 Mono label (uppercase 11px)
  and readout (readout-lg), anchored bottom-right of a hero on desktop. Dual units where the data
  has them.
- **Record row (vehicle profile):** three to four key figures separated by vertical hairlines, the
  v1 `.orbix-profile-hero__record` pattern.
- **Vehicle cards:** aircraft 16:10 photo, rockets 3:4 portrait photo (rockets are tall; show them
  whole); below: division-accent classification line (B612 Mono 11px uppercase), condensed display
  name 28px, one-line description, two-spec hairline row. Whole card is one link. Vary emphasis:
  the first card in a registry spans two columns on desktop.
- **Section index:** numbered rows (`01` to `06` in B612 Mono accent) with hairline rules, for home
  and learn.
- **Equation block (lab and learn):** equation set large (1.5rem to 2rem) in B612 Mono on a raised
  panel with a thin top rule and a variables legend as a definition list.
- **Tables:** hairline rows, B612 Mono tabular numbers right-aligned, sticky first column on mobile
  scroll, caption above in sans 500.
  Documented exception: the compare spec sheet keeps its vehicle columns left-aligned, because
  it is read across each row, its cells mix text and labelled figures, and its magnitude bars grow
  from the left edge.
- **Forms:** label above (sans 500 14px), input 44px, 4px radius, `--bg-raised`, 1px
  `--border-control`, unit suffix in B612 Mono, inline error below in danger colour with icon.
- **Header:** opaque `--bg-page` at 92 percent with no blur, 64px, logo left at its natural aspect,
  text links right, active link has 2px accent rule, 1px accent hairline under the bar at 45
  percent opacity. Mobile: full-height sheet menu, links 24px display cut, no stagger gimmicks.
  **Amendment (T1 attempt 4, orchestrator approved):** the bar is fully opaque `--bg-page`. At 92
  percent without blur, display type scrolled under the bar stayed legible (about 19 levels over
  the ground), and at 97 percent a large heading was still readable behind the links. The wordmark
  is 36px tall at every breakpoint.
  **Mobile menu toggle (orchestrator decision, F-fix):** icon plus a visible label, 44px tall,
  at least 6.5rem wide, with a 1px `--border-control` outline (3:1, WCAG 1.4.11) that is the same
  in both states and a `--bg-raised` hover. The label reads "Menu" when closed and "Close" when
  open (accessible name "Close menu", which contains the visible word). The root sets
  `scrollbar-gutter: stable` so locking page scroll while the sheet is open does not shift the
  header.
- **Footer:** lighter than v1.5: one row with the logo and a one-line description, a row of links,
  and one line with operator, contact email link and copyright.
  **Amendment (orchestrator approved, F-fix):** one DOM order at every width and no CSS `order`,
  so focus order matches the visual order (WCAG 1.3.2, 2.4.3): site sections, about and legal
  links, operator and contact line, copyright. Below 40rem the site sections (44px rows) and the
  about and legal links (36px rows) are each a two-column grid, 24px apart, then the operator and
  copyright lines. From 40rem the two navs share one wrapping row, site sections (14px) at the
  left and about and legal (13px, `--text-muted`) at the right edge of the container; where the
  row is too narrow (below about 70rem) the about and legal links drop to their own line,
  left-aligned. Under them the operator and contact line, with the copyright and
  educational-use notice below it, or at the right of the same line from 80rem when it fits.

## 9. Page directions

- **Home:** full-bleed hero using the SR-71 or Saturn V photo, the large logo, a display H1 such as
  "Aerospace engineering, explained with real vehicles." (existing tagline), lead paragraph and
  two buttons, with the credit line. Then an asymmetric split: "Aircraft" large card (F-22 or SR-71)
  and "Launch vehicles" tall portrait card (Saturn V) side by side at different sizes. Then the
  numbered section index (Compare, Engineering Lab, Learn, Verification, How I built ORBIX,
  Showcase). Then a short sourcing note. No three equal cards.
- **Aircraft / Rockets:** v1 photo hero with "Aircraft Explorer" / "Launch Vehicle Explorer"
  style two-tone H1, spec panel of the featured vehicle, then the registry with search and the
  varied card grid.
- **Vehicle profile:** full-bleed photo hero with display name, classification, record row, credit;
  sticky in-page section nav (hairline, B612 Mono labels); sections as spec sheets with generous
  spacing; photo also shown large once; related vehicles as cards.
- **Compare:** typographic hero on blueprint grid; selectable vehicle tiles with thumbnail (8px
  radius, accent border and check mark when selected, `aria-pressed`), category segmented control
  (square, 4px), then the comparison as a spec-sheet table with magnitude bars in accent.
- **Engineering Lab:** typographic hero with a large real orbit diagram (existing SVG) on the right;
  numbered tool index (B612 Mono numbers) grouped by discipline; each tool shows its equation block
  prominently above the form.
- **Learn:** six pathways as numbered chapters with a huge faint numeral, a "Why it matters" pull
  quote with a top rule (not a coloured left stripe), equation blocks, and a link to the matching
  lab tool.
- **Showcase, Verification, Build log, About, legal pages:** editorial single column (68ch) with a
  wider figure track for diagrams and tables; diagrams shown large with registration marks.
- **404:** display "Off course." style heading with a link home and to the registries.

## 10. File ownership for the v2 build

Same ownership map as `orbix-redesign-2026.md` section 17, with these changes:

- T1 foundation owns tokens, fonts in `src/app/layout.tsx`, global texture, shared primitives
  (Button, ButtonLink, Tag, Eyebrow, PhotoHero, SpecPanel, SectionIndex, EquationBlock, DataTable,
  RegistrationMarks) in `src/components/**`, header, footer, 404, loading.
- Legal, about, build-log and verification pages belong to one "editorial pages" team.
- Page teams must use the shared primitives and may not create local look-alikes.

## 11. Definition of done (every page)

- Looks deliberate, atmospheric and specific to aerospace at first glance at 1440 and 390; would
  not be mistaken for a template.
- Passes every hard rule and anti-template rule above (grep checks plus visual review).
- No horizontal overflow at 320, 360, 768, 1440. Keyboard pass. Contrast pass. Reduced motion pass.
- `npm run validate` and `npm run test:e2e` pass (e2e updated only for intended changes).
