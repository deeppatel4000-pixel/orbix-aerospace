# ORBIX Redesign 2026: Binding Specification

Status: binding for every task on branch `redesign/anti-vibe-legal`.
Supersedes: `docs/design-system/orbix-design-system.md` (Design System 2.0) wherever the two disagree. That document stays as history until the foundation task rewrites it to point here.

This spec tells every later task what ORBIX must look like, sound like, and which files each task may touch. When a design skill, an older doc, or a code comment conflicts with this file, this file wins. When this file conflicts with the hard rules in section 1, section 1 wins.

---

## 1. Hard rules (non-negotiable)

1. No purple, violet, indigo, or fuchsia anywhere: no tokens, gradients, glows, strokes, SVG fills, Tailwind classes (`plasma`, `violet-*`, `purple-*`, `indigo-*`, `fuchsia-*`). `--plasma-violet` and `--color-plasma` are deleted.
2. No pill shapes on anything interactive or label-like. `rounded-full` and `border-radius: 999px` are forbidden on buttons, links styled as buttons, chips, tags, badges, status labels, inputs, selects, tabs, segmented controls, and progress bars. `rounded-full` is allowed only on genuinely circular, non-interactive shapes: status dots, orbit and planet diagrams, timeline nodes.
3. No em dash (U+2014) in any user-visible string, metadata, manifest, `alt`, `aria-label`, `title`, or placeholder. Use a comma, colon, period, parentheses, or "to" for ranges. An empty calculator value is never a dash of any kind; it is the text `Not calculated` (section 13.4).
4. No fake reviews, testimonials, customer names, user counts, uptime figures, invented statistics, fabricated telemetry, or unsupported claims.
5. No emoji anywhere, including code comments that render, commit-visible UI strings, and `metadata`.
6. No scroll-driven animation, parallax, entrance animation on scroll, custom cursors, cursor followers, magnetic buttons, or infinite decorative motion.
7. No AI-generated imagery. No AI-slop copy (banned list in section 13.3).
8. WCAG 2.2 AA: text 4.5:1 (3:1 for large text of 24px, or 18.66px bold), UI component boundaries and focus indicators 3:1, visible focus on every interactive element, full keyboard operation, labels above inputs, descriptive link and button text.
9. Never `#000000` (or `rgb(0 0 0)`, `black`, `bg-black`, `text-black`) anywhere, including shadows and overlays. Use `--orbix-shadow-color` (`#05070a`) for shadows.
10. Stack is fixed: Next.js 16 App Router, React 19, Tailwind v4, lucide-react, IBM Plex Sans and IBM Plex Mono via `next/font`. No new npm dependencies.

---

## 2. Survey summary: why the current UI reads as generated

Measured on branch `redesign/anti-vibe-legal` at commit `c0ee291`, `src/**` excluding tests:

| Pattern                                           | Uses | Files |
| ------------------------------------------------- | ---: | ----: |
| `rounded-xl` / `rounded-2xl` / `rounded-3xl`      |  246 |    71 |
| `rounded-full` (many on buttons and chips)        |  118 |    64 |
| Ad-hoc tiny type `text-[0.5x-0.6xrem]`            |  292 |    89 |
| Ultra-wide tracking `tracking-[0.1xem]`           |  220 |    84 |
| Grid overlays `orbix-grid` / `technical-grid`     |   36 |    31 |
| Gradient backgrounds in markup                    |   30 |    19 |
| `animate-pulse` / `bounce` / `spin`               |   20 |    15 |
| `backdrop-blur` (frosted glass)                   |   20 |    15 |
| `plasma` / violet references                      |   16 |     8 |
| Arbitrary colored glow shadows `shadow-[0_0_...]` |  40+ |   30+ |
| Em dash used as empty calculator value            |  12+ |    12 |

Other signals: a cyan-to-violet gradient primary button with a sheen pseudo-element and hover lift; HUD clip-path corners (`.orbix-frame`); a starfield, radial "atmosphere" blobs and a fixed grid behind every page; a scripted mission "startup sequence"; mono uppercase letter-spaced labels on nearly everything; five division accents; "premium" and "advanced" in copy; hero imagery of unclear provenance.

---

## 3. Design direction

ORBIX should read like a well-made engineering reference: the register of a flight manual, a NASA technical report, or a good textbook's companion site. Not a SaaS landing page, not a game HUD.

Concretely:

- **Type and rules carry the structure.** Hierarchy comes from size, weight, spacing, and 1px hairlines. Not from glows, gradients, glass, or card stacks.
- **One accent, used sparingly.** The accent marks links, the primary action, the current nav item, and focus. Roughly one accent element per screen region. Everything else is neutral.
- **Flat surfaces.** Page ground, one surface tone, one raised tone. Panels are separated by borders, not shadows.
- **Tables are first-class.** Specifications, comparisons, and results are tables or definition lists with units, set in Plex Mono with tabular numerals.
- **Real things only.** Photographs are credited real photographs. Diagrams are SVG drawn from the actual numbers. Nothing pretends to be live telemetry.
- **Quiet chrome.** Header and footer are plain; no blur, no glow line, no division tint.
- **Dark theme only** for this redesign (the existing product is dark and `colorScheme: "dark"` is set). Dark means graphite, not black.

What to avoid, by name: glassmorphism, neon glow, bento grids of identical cards, gradient text, gradient borders, "status" chips that report no status, `// SYS-01` style kickers, fake terminal readouts, numbered badges as decoration, oversized display headlines, full-bleed photo heroes with text over them.

---

## 4. Color

### 4.1 Tokens

The raw palette section of `src/styles/orbix-tokens.css` is replaced by exactly these values. Canonical role names (`--orbix-*`) are kept so existing Tailwind bridge names keep working; their values change.

```css
:root {
  /* Ground and surfaces */
  --orbix-bg-page: #0e1114; /* page ground */
  --orbix-surface: #14181d; /* panels, cards, table body */
  --orbix-surface-raised: #1a1f25; /* table header rows, popovers, active tab */
  --orbix-surface-input: #101317; /* text inputs, selects, code wells */

  /* Borders */
  --orbix-border-subtle: #20262d; /* dividers inside a panel */
  --orbix-border: #2a3139; /* panel edges, table rules */
  --orbix-border-strong: #3a434d; /* emphasis rules, section breaks */
  --orbix-border-control: #6b7580; /* input, select, checkbox and secondary button edges (UI 3:1) */

  /* Text */
  --orbix-text-primary: #e6e9ec;
  --orbix-text-secondary: #b7bfc8;
  --orbix-text-muted: #949ea9;
  --orbix-text-disabled: #6a737d; /* only on disabled controls (AA exempt) */
  --orbix-text-on-accent: #0e1114;

  /* The one accent: instrument blue */
  --orbix-accent: #6fb3dc;
  --orbix-accent-hover: #93c7e7;
  --orbix-accent-subtle: color-mix(
    in srgb,
    #6fb3dc 12%,
    transparent
  ); /* selected row / active tab fill only */
  --orbix-focus: #6fb3dc;

  /* Status: describes supplied state only, never decoration */
  --orbix-status-success: #6cc08e;
  --orbix-status-warning: #dcab4e;
  --orbix-status-danger: #ec8479;
  --orbix-status-info: var(--orbix-text-secondary);

  /* Data visualization */
  --orbix-data-1: #6fb3dc; /* series 1 = accent */
  --orbix-data-2: #dcab4e; /* series 2 */
  --orbix-data-3: #6cc08e; /* series 3 */
  --orbix-data-4: #b7bfc8; /* series 4 / reference */
  --orbix-data-grid: #2a3139;
  --orbix-data-axis: #949ea9;

  /* Shadows use this, never black */
  --orbix-shadow-color: #05070a;
}
```

`--orbix-data-1..4` may only be used for chart marks and legends. Where two series must be told apart, also vary line dash or marker shape; color is never the only carrier.

### 4.2 Measured contrast (WCAG 2.x relative luminance)

Computed with the WCAG formula. Columns are backgrounds.

| Foreground     | Hex       | page `#0e1114` | surface `#14181d` | raised `#1a1f25` | input `#101317` | Use                               |
| -------------- | --------- | -------------: | ----------------: | ---------------: | --------------: | --------------------------------- |
| text-primary   | `#e6e9ec` |          15.54 |             14.63 |            13.60 |           15.28 | body, headings                    |
| text-secondary | `#b7bfc8` |          10.19 |              9.59 |             8.92 |           10.02 | lead text, labels                 |
| text-muted     | `#949ea9` |           6.96 |              6.56 |             6.10 |            6.85 | captions, help text, units        |
| text-disabled  | `#6a737d` |           3.93 |              3.70 |             3.44 |            3.87 | disabled controls only            |
| accent         | `#6fb3dc` |           8.26 |              7.77 |             7.23 |            8.12 | links, focus, primary fill        |
| accent-hover   | `#93c7e7` |          10.43 |              9.82 |             9.13 |           10.26 | link hover, primary hover fill    |
| status-success | `#6cc08e` |           8.63 |              8.12 |             7.55 |            8.49 | text and icons                    |
| status-warning | `#dcab4e` |           9.00 |              8.47 |             7.88 |            8.85 | text and icons                    |
| status-danger  | `#ec8479` |           7.34 |              6.91 |             6.43 |            7.22 | error text and icons              |
| border-control | `#6b7580` |           4.04 |              3.80 |             3.54 |            3.97 | UI component boundary (needs 3:1) |
| border-strong  | `#3a434d` |           1.88 |              1.77 |             1.65 |            1.85 | decorative rule only              |
| border         | `#2a3139` |           1.44 |              1.36 |             1.26 |            1.42 | decorative rule only              |
| border-subtle  | `#20262d` |           1.24 |              1.17 |             1.09 |            1.22 | decorative rule only              |

On-accent text: `#0e1114` on `#6fb3dc` = 8.26, on `#93c7e7` = 10.43.

Rules that follow from the table:

- Any border that is the only thing showing where a control is (inputs, selects, checkboxes, secondary buttons, the outline of an unselected tab) must be `--orbix-border-control`. `--orbix-border*` below that are for dividers between content, which WCAG does not require to meet 3:1.
- `--orbix-text-disabled` never carries information a user needs. Disabled buttons also get `cursor: not-allowed` and keep their label.
- New colors may only be added by the foundation task, with a measured ratio added to this table.

### 4.3 Deleted color tokens

Deleted outright: `--plasma-violet`, `--color-plasma`, `--orbital-black`, `--spacecraft-graphite`, `--cosmic-navy`, `--nebula-blue`, `--orbital-cyan`, `--atmospheric-blue`, `--telemetry-green`, `--telemetry-white`, the tactical and laboratory raw palettes, `--orbix-bg-recessed` (`#010308`, near black), `--orbix-surface-translucent`, `--surface-glass`, `--shadow-accent`, `--ring-accent`, `--glass-blur`, `--orbix-data-grid` (cyan rgba).

The five-division accent system (`[data-orbix-division="..."]` overrides) and the legacy `[data-orbix-theme]` / `[data-orbix-environment]` overrides are removed: one accent sitewide. `--orbix-division-accent*` become plain aliases of `--orbix-accent*` so existing consumers keep compiling. `SiteShell` may keep writing `data-orbix-division` (tests assert it) but no CSS may key off it.

Compatibility aliases (`--accent`, `--muted`, `--border`, `--foreground`, `--surface`, `--background`, and their `@theme inline` Tailwind names) stay, pointing at the new values, so `text-muted`, `text-accent`, `border-border` and friends keep working. Tailwind names `bg-orbital`, `bg-graphite`, `bg-cosmic`, `text-plasma`, `text-atmosphere`, `text-telemetry`, `text-tactical`, `text-tactical-amber`, `text-laboratory` are removed from the bridge once page tasks have stopped using them (section 16, phase C).

`viewport.themeColor` and the manifest `theme_color` / `background_color` become `#0e1114`.

---

## 5. Typography

Families stay as loaded in `src/app/layout.tsx`: IBM Plex Sans (variable weight and width) and IBM Plex Mono (400, 500, 600). No other family.

- **Plex Sans** for all prose, headings, navigation, buttons, and labels.
- **Plex Mono** only for machine values: numbers with units, equations, identifiers, coordinates, code. Always with `font-variant-numeric: tabular-nums`.
- **No condensed display cut.** `--font-display-stretch` becomes `100%`. `.font-display` keeps working (57 usages) but now resolves to normal-width Plex Sans at weight 600.
- **Uppercase** is allowed only for table column headers and the footer group headings, at `--tracking-caps`. Everything else is sentence case.

### 5.1 Scale

Fixed rem sizes. `clamp()` only on H1 and H2.

| Token            | Size                                                    | Line height | Weight | Tracking                   | Use                                |
| ---------------- | ------------------------------------------------------- | ----------- | ------ | -------------------------- | ---------------------------------- |
| `--text-h1`      | `clamp(1.875rem, 1.5rem + 1.2vw, 2.5rem)` (30 to 40px)  | 1.15        | 600    | -0.015em                   | one per page                       |
| `--text-h2`      | `clamp(1.375rem, 1.2rem + 0.6vw, 1.75rem)` (22 to 28px) | 1.25        | 600    | -0.01em                    | page sections                      |
| `--text-h3`      | `1.125rem` (18px)                                       | 1.35        | 600    | 0                          | panel titles                       |
| `--text-h4`      | `1rem` (16px)                                           | 1.4         | 600    | 0                          | sub-groups                         |
| `--text-lead`    | `1.125rem` (18px)                                       | 1.6         | 400    | 0                          | one intro paragraph per page       |
| `--text-body`    | `1rem` (16px)                                           | 1.6         | 400    | 0                          | prose                              |
| `--text-body-sm` | `0.875rem` (14px)                                       | 1.55        | 400    | 0                          | table cells, help text, nav        |
| `--text-label`   | `0.8125rem` (13px)                                      | 1.4         | 500    | 0                          | form labels, captions, eyebrow     |
| `--text-caps`    | `0.75rem` (12px)                                        | 1.3         | 600    | 0.06em (`--tracking-caps`) | column headers only, uppercase     |
| `--text-data`    | `0.875rem` (14px) mono                                  | 1.4         | 500    | 0                          | values in tables                   |
| `--text-data-lg` | `1.5rem` (24px) mono                                    | 1.2         | 500    | -0.01em                    | the primary result of a calculator |

Nothing below 12px. The 292 `text-[0.5x-0.6xrem]` usages map to `--text-caps` (if a column header) or `--text-label`. The 220 `tracking-[0.1xem]` usages are removed.

Deleted: `--text-display`, `--type-display-xl`, `.orbix-display-xl`, `.orbix-display-lg` (redefine `.orbix-display-lg` as an alias of H1 until consumers are migrated, then delete), `--tracking-display`, `--tracking-technical`, `.orbix-kicker`, `.orbix-technical-label` (replaced by `.orbix-label`), `.orbix-environment-label`.

Utility classes the foundation task provides in `orbix-foundations.css`: `.orbix-h1`, `.orbix-h2`, `.orbix-h3`, `.orbix-lead`, `.orbix-label`, `.orbix-caps`, `.orbix-data`, `.orbix-data-lg`, `.orbix-prose` (68ch measure, paragraph spacing 1em, link styling).

---

## 6. Spacing, layout grid, measure

### 6.1 Spacing scale (4px base)

| Token       | Value          | Tailwind equivalent |
| ----------- | -------------- | ------------------- |
| `--space-1` | 0.25rem (4px)  | `1`                 |
| `--space-2` | 0.5rem (8px)   | `2`                 |
| `--space-3` | 0.75rem (12px) | `3`                 |
| `--space-4` | 1rem (16px)    | `4`                 |
| `--space-5` | 1.5rem (24px)  | `6`                 |
| `--space-6` | 2rem (32px)    | `8`                 |
| `--space-7` | 3rem (48px)    | `12`                |
| `--space-8` | 4rem (64px)    | `16`                |
| `--space-9` | 6rem (96px)    | `24`                |

Use Tailwind steps from this list only: 1, 2, 3, 4, 6, 8, 12, 16, 24 (plus 0 and 0.5 for hairline offsets). No arbitrary spacing values.

- Between page sections: `--space-8` (64px) desktop, `--space-7` (48px) below 640px. Replaces `--space-section` (up to 136px).
- Panel padding: `--space-5` (24px), `--space-4` below 640px.
- Label to input: `--space-2`. Field to field: `--space-5`.

### 6.2 Grid

- Container: `max-width: 72rem` (1152px), side padding 1rem below 640px, 1.5rem from 640px, 2rem from 1024px. `src/components/layout/container.tsx` implements it; a `wide` variant at `84rem` exists only for Compare and the Engineering Lab workspace.
- Columns: 12-column CSS grid, `column-gap: 1.5rem`, from 1024px. Below 1024px, single column except where a template says otherwise.
- Prose measure: `68ch` max.
- Breakpoints: Tailwind defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280). No custom breakpoints.
- The page must work at 320px wide with no horizontal scroll; only tables scroll horizontally, inside `.orbix-table-wrap`.

---

## 7. Radius, borders, elevation

### 7.1 Radius

| Token             | Value | Use                                                   |
| ----------------- | ----- | ----------------------------------------------------- |
| `--radius-0`      | 0     | tables, full-width bands, header, footer              |
| `--radius-1`      | 2px   | tags, status labels, checkboxes, inline code          |
| `--radius-2`      | 4px   | buttons, inputs, selects, tabs, tooltips              |
| `--radius-3`      | 6px   | panels, cards, images, dialogs. The maximum anywhere. |
| `--radius-circle` | 50%   | non-interactive circular shapes only (section 1.2)    |

Deleted: `--radius-md` (10px), `--radius-lg` (16px), `--radius-full`, `--radius-pill`, `--radius-panel` (1.35rem), `--radius-card`. During migration they alias to `--radius-3` (and `--radius-pill` to `--radius-2`) so nothing renders round while page tasks catch up. In markup: `rounded-sm` (2px after the bridge below), `rounded` (4px), `rounded-md` (6px) are the only radius utilities allowed. The foundation task sets Tailwind's `--radius-sm: 2px; --radius: 4px; --radius-md: 6px; --radius-lg: 6px; --radius-xl: 6px; --radius-2xl: 6px; --radius-3xl: 6px` in `@theme` so any `rounded-xl` left behind degrades to 6px. Page tasks still replace them.

### 7.2 Borders

- 1px solid only. No dashed borders except the empty-state outline and "not calculated" wells. No gradient borders, no double borders, no inset highlight lines (`inset 0 1px rgba(255,255,255,...)`).
- A panel is `background: var(--orbix-surface); border: 1px solid var(--orbix-border); border-radius: var(--radius-3)`.
- Do not nest bordered panels more than one level. Inside a panel, divide with `border-top: 1px solid var(--orbix-border-subtle)`.
- The one allowed accent rule: a 2px `--orbix-accent` left border on the currently selected item in a vertical list (lab tool index, profile "on this page" nav). Nothing else gets an accent border at rest.

### 7.3 Elevation

- Default: none. Panels are flat.
- `--elevation-overlay: 0 8px 24px color-mix(in srgb, var(--orbix-shadow-color) 60%, transparent)` for dialogs, popovers, dropdown menus, tooltips, and the mobile nav sheet. Nothing else.
- No colored shadows, no glows (`shadow-[0_0_...]`), no `drop-shadow` filters, no `backdrop-filter`. Overlays use a solid `color-mix(in srgb, var(--orbix-bg-page) 80%, transparent)` scrim.

---

## 8. Buttons

Implemented as CSS classes in `src/styles/orbix-components.css` and exposed through `ButtonLink` (for `<Link>`) and a new `Button` primitive (for `<button>`) in `src/components/ui/`. The `variant` prop becomes `"primary" | "secondary" | "ghost" | "link"`; `"tertiary"` is kept as a deprecated alias of `"ghost"` until phase C.

Shared base, `.orbix-button`:

```css
.orbix-button {
  align-items: center;
  border: 1px solid transparent;
  border-radius: var(--radius-2);
  display: inline-flex;
  font-family: var(--font-interface);
  font-size: var(--text-body-sm); /* 14px */
  font-weight: 500;
  gap: var(--space-2);
  justify-content: center;
  letter-spacing: 0;
  line-height: 1.25;
  min-height: 2.5rem; /* 40px; 2.75rem when it is the only action on a mobile row */
  padding: 0.5rem 1rem;
  text-decoration: none;
  text-transform: none;
  transition:
    background-color var(--motion-fast) var(--motion-ease),
    border-color var(--motion-fast) var(--motion-ease),
    color var(--motion-fast) var(--motion-ease);
}
.orbix-button:focus-visible {
  outline: 2px solid var(--orbix-focus);
  outline-offset: 2px;
}
.orbix-button:is(:disabled, [aria-disabled="true"]) {
  background: transparent;
  border-color: var(--orbix-border);
  color: var(--orbix-text-disabled);
  cursor: not-allowed;
}
```

No `::after` sheen, no `transform` on hover or active, no box-shadow at any state.

| Variant       | Rest                                                                                                                                                 | Hover                                                    | Active                                    | Disabled                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------- | ------------------------------------------ |
| `--primary`   | bg `--orbix-accent`, text `--orbix-text-on-accent` (8.26:1)                                                                                          | bg `--orbix-accent-hover` (10.43:1)                      | bg `--orbix-accent-hover`, `opacity: 0.9` | base disabled rule                         |
| `--secondary` | bg `--orbix-surface`, border `--orbix-border-control` (3.80:1), text `--orbix-text-primary`                                                          | bg `--orbix-surface-raised`, border `--orbix-text-muted` | bg `--orbix-surface-raised`               | base disabled rule                         |
| `--ghost`     | bg transparent, text `--orbix-text-secondary`                                                                                                        | bg `--orbix-surface-raised`, text `--orbix-text-primary` | same as hover                             | text `--orbix-text-disabled`, no border    |
| `--link`      | inline, no padding, no min-height, text `--orbix-accent`, `text-decoration: underline; text-underline-offset: 0.2em; text-decoration-thickness: 1px` | text `--orbix-accent-hover`, thickness 2px               | same as hover                             | text `--orbix-text-disabled`, no underline |

Rules:

- At most one `primary` per view region (hero actions, a form, a dialog footer).
- Button text is a verb phrase naming the outcome: "Compare aircraft", "Calculate delta-v", "Open the F-22 profile". Never "Go", "Submit", "Click here", "Learn more" on its own, "Get started".
- Icons: lucide-react at 16px, `aria-hidden="true"`, after the label for navigation (`ArrowRight`, not `ArrowUpRight` unless it leaves the site), before the label for actions. Icon-only buttons (`.orbix-icon-control`) are 2.5rem square, radius `--radius-2`, and require `aria-label`.
- External links append the visually hidden text "(opens in a new tab)" when `target="_blank"`, and use `ExternalLink` at 14px.
- `.orbix-home-cta`, `.orbix-home-cta--secondary`, and `.orbix-home-link` are deleted; home uses the standard variants.

Tailwind equivalent (for places that cannot import the component), primary:
`inline-flex min-h-10 items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium bg-accent text-background hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-text-disabled transition-colors duration-150`

---

## 9. Form fields

One pattern for every input in the product (lab calculators, compare selectors, registry search).

```tsx
<div className="orbix-field">
  <label className="orbix-field__label" htmlFor="altitude">
    Altitude
  </label>
  <div className="orbix-field__control">
    <input
      aria-describedby="altitude-help altitude-error"
      aria-invalid={hasError || undefined}
      className="orbix-input"
      id="altitude"
      inputMode="decimal"
      type="text"
    />
    <span className="orbix-field__unit" aria-hidden="true">
      km
    </span>
  </div>
  <p className="orbix-field__help" id="altitude-help">
    Geometric altitude, 0 to 86 km.
  </p>
  {hasError && (
    <p className="orbix-field__error" id="altitude-error">
      <CircleAlert aria-hidden="true" size={14} /> Enter a number between 0 and
      86.
    </p>
  )}
</div>
```

- **Label** above the control, always visible, `--text-label` 500, `--orbix-text-secondary`. Never placeholder-as-label. The unit is part of the accessible name when it matters: `Altitude (km)` in the label, or the visible unit suffix plus the label.
- **Control** `.orbix-input` / `.orbix-select`: height 2.5rem, padding `0.5rem 0.75rem`, bg `--orbix-surface-input`, border 1px `--orbix-border-control`, radius `--radius-2`, text `--orbix-text-primary`, `--text-body-sm`; numeric inputs in Plex Mono with tabular numerals, right-aligned.
- **Unit suffix** sits in a joined box to the right: same height, bg `--orbix-surface-raised`, border `--orbix-border-control`, text `--orbix-text-muted` mono.
- **Hover**: border `--orbix-text-muted`.
- **Focus-visible**: `outline: 2px solid var(--orbix-focus); outline-offset: 1px;` border stays. No glow.
- **Invalid** (`aria-invalid="true"`): border `--orbix-status-danger`; error text below in `--orbix-status-danger`, `--text-label`, with a `CircleAlert` icon so color is not the only signal. Error text states what to enter, not just that it is wrong.
- **Disabled**: bg `--orbix-bg-page`, border `--orbix-border`, text `--orbix-text-disabled`, `cursor: not-allowed`.
- **Placeholder** only for example format ("e.g. 400"), color `--orbix-text-muted`.
- **Help text** `--text-label` 400, `--orbix-text-muted`, linked via `aria-describedby`.
- **Selects** use native `<select>`, with a lucide `ChevronDown` 16px positioned over the right edge and `appearance: none`.
- **Checkbox / radio**: native inputs with `accent-color: var(--orbix-accent)`, 1rem, label to the right, whole row clickable, 24px minimum target.
- **Grouping**: related fields in a `<fieldset>` with a `<legend>` styled as `.orbix-h4`. Two columns from 768px, one below.
- **Validation summary**: `ValidationErrorSummary` stays; restyle to a bordered panel with a 2px `--orbix-status-danger` left border, heading "Check these inputs", and anchor links to each field.
- **Search**: `type="search"`, label "Search aircraft" visible (can be `--text-label`), lucide `Search` icon inside left padding.

`src/features/engineering-lab/components/shared/calculator-number-field.tsx` is the canonical implementation for the lab; the foundation task adds the CSS classes, the lab task migrates the component.

---

## 10. Other components (foundation task implements, page tasks consume)

- **Panel** (`OrbixSurface`): collapse all seven variants (`hero`, `mission`, `engineering`, `telemetry`, `vehicle`, `gallery`, `report`) to one flat panel. The `variant` prop is accepted and ignored until phase C, then removed. `interactive` panels change border to `--orbix-border-strong` on hover, no lift, no glow.
- **Card link** (`.orbix-vehicle-card`): flat panel, image top at 16:9 with `--radius-3` top corners only, title `.orbix-h3`, one line of classification in `--orbix-text-muted`, a 3-row `<dl>` of key values. Whole card is one `<a>`; focus ring on the card. Hover: border `--orbix-border-strong`, title underline. No "Explore" pseudo-button inside.
- **Tag** (`.orbix-tag`): `--radius-1`, 1px `--orbix-border-strong`, `--text-label`, sentence case, padding `0.125rem 0.5rem`, no fill. Tags are not interactive; if clickable, it is a filter button using `.orbix-button--secondary` with `aria-pressed`.
- **Status** (`StatusBadge`, `.orbix-status`): `--radius-1`, text plus a 0.5rem circle dot (`--radius-circle`, allowed) in the status color, no glow, no uppercase. Only for states the data actually supplies ("Retired", "In service", "Input out of range").
- **Tabs** (`.orbix-tabs`): underline tabs. Selected: text `--orbix-text-primary`, 2px bottom border `--orbix-accent`. Unselected: `--orbix-text-secondary`, transparent bottom border. Roving tabindex with arrow keys where they are real tabs; otherwise use links with `aria-current`.
- **Tables** (`.orbix-table`): `border-collapse: collapse`, header row bg `--orbix-surface-raised` with `.orbix-caps` text, cell padding `0.625rem 0.75rem`, row rule `--orbix-border-subtle`, numbers right-aligned mono, units in a separate `--orbix-text-muted` span or column. `<caption>` present (may be visually hidden). First column `<th scope="row">`. Wrapper `.orbix-table-wrap` has `overflow-x: auto`, `tabindex="0"`, `role="region"`, and an `aria-label`.
- **Progress** (`.orbix-progress`): 0.5rem tall, `--radius-1`, track `--orbix-border`, fill solid `--orbix-accent`. No gradient, no glow.
- **Empty state**: dashed 1px `--orbix-border-strong`, `--radius-3`, no radial gradient, H3, one sentence, optional one secondary button.
- **Dialog**: native `<dialog>`, `--radius-3`, `--elevation-overlay`, scrim per 7.3.
- **Tooltip**: `--radius-2`, bg `--orbix-surface-raised`, border `--orbix-border`, `--text-label`. Never the only way to get information.
- **Breadcrumbs**: `--text-body-sm`, separator is the lucide `ChevronRight` 12px `aria-hidden`, current item `aria-current="page"`, not a link.
- **Figure**: see section 12.3.
- **Equation block** (`.orbix-lab-equation`): `--orbix-surface-input` well, `--radius-2`, Plex Mono, horizontal scroll if long, variable definitions as a `<dl>` below.
- **Site header**: solid `--orbix-bg-page`, bottom border `--orbix-border`, height 3.5rem, wordmark left at 1.25rem tall, nav links `--text-body-sm` 500 `--orbix-text-secondary`; current page `--orbix-text-primary` with a 2px `--orbix-accent` underline at the header's bottom edge. No blur, no accent glow line.
- **Mobile nav**: disclosure button "Menu" / "Close menu" with `aria-expanded`, opening a full-width sheet below the header; focus moves to the first link; Escape closes and returns focus.
- **Footer**: two rows. Row one: wordmark, one-sentence plain description, then link groups "Platform" (existing nav items) and "About" (About, Image credits, Privacy, Terms, Accessibility; see 14). Row two: `(c) 2026 ORBIX. Educational use only. Not for operational or certification use.` written with the `©` sign.
- **Skip link**: unchanged behavior; restyle to a primary button when focused.

---

## 11. Motion

- Tokens: `--motion-fast: 120ms`, `--motion-base: 160ms`, `--motion-slow: 200ms` (the maximum), `--motion-ease: cubic-bezier(0.2, 0, 0, 1)`. Delete `--duration-slow` (420ms), `--duration-base` (220ms), `--ease-orbix`, and the 520ms page transition.
- Allowed: `color`, `background-color`, `border-color`, `opacity`, `text-decoration-color`, and `transform` for disclosure chevron rotation or a sheet sliding under 200ms, triggered by hover, focus, or a state change the user made.
- Not allowed: hover lift (`translateY`), press scale, page-enter fades, staggered reveals, scroll-triggered anything, `scroll-behavior: smooth` on `html`, pulsing dots, bouncing arrows, spinning orbit icons, scan lines, shimmer, typewriter effects, count-up numbers, scripted "startup sequences".
- Infinite animation is allowed in exactly one case: a functional loading indicator shown only while something is loading (`src/app/loading.tsx`, Suspense fallbacks). It is a 16px ring spinner (`border: 2px solid var(--orbix-border-strong); border-top-color: var(--orbix-accent); border-radius: 50%;` rotating at 800ms linear) next to the visible text "Loading". Under reduced motion it does not rotate.
- User-started playback is content, not decoration: the mission replay and ground-track animations may animate while the user has pressed Play. They start paused, expose Pause, and under `prefers-reduced-motion: reduce` they start paused and step instead of tween. The 3D scene and orbit views never auto-rotate.
- `prefers-reduced-motion: reduce` keeps the existing global override in `orbix-motion.css` (durations to 0.01ms, iterations to 1) and additionally stops the spinner and disables replay tweening.

---

## 12. Imagery

### 12.1 What is allowed

1. **Real photographs** with verified license: US federal government works (NASA, USAF, US Navy, DoD via DVIDS) which are public domain in the US; Wikimedia Commons files whose file page states Public Domain, CC0, CC BY, or CC BY-SA; UK MOD / Crown copyright under the Open Government Licence v3.0 (credit required). Company press images (SpaceX, Boeing, Lockheed Martin, Northrop Grumman) only when the specific file is released under CC0 or a CC license that allows reuse, confirmed on the file's own page, not assumed.
2. **SVG diagrams** drawn in-repo from real numbers (orbits, trajectories, shock geometry, vehicle silhouettes to scale). Inline React SVG using the data tokens.
3. **Authentic screenshots** of ORBIX itself (showcase only), captured from a real build.
4. **The ORBIX logo and wordmark** in `public/brand/`, as supplied by the owner (see 12.5).

### 12.2 What is forbidden

- AI-generated or AI-edited images (including AI upscaling, outpainting, background replacement, "enhancement").
- Images whose source is a news site CDN, a flight-sim product page, an aggregator, or anything without a stated license.
- Stock-style "concept" renders presented as missions.
- Images as page backgrounds behind text. Text never sits on a photo.
- Decorative raster textures (starfields, grids, noise, carbon fiber).

### 12.3 Credit and markup

Every raster image renders inside a `<figure>` with a `<figcaption>` giving: subject, author or agency, license, and a link to the source file page. Example: `F-22 Raptor over Alaska. U.S. Air Force photo by Staff Sgt. Name. Public domain. Source: Wikimedia Commons.` The source link text is "Source", "View original file", or the site name, never a bare URL. Where a caption would clutter a registry card, the card omits it and the profile page plus `/credits` carry it.

Each visual record in `aircraft-visuals.ts` and `rocket-visuals.ts` gains required fields:

```ts
readonly credit: string;        // "U.S. Air Force photo by Tech. Sgt. Name"
readonly license: "Public domain" | "CC0 1.0" | "CC BY 4.0" | "CC BY-SA 4.0" | "OGL v3.0" | string;
readonly licenseUrl: string;
readonly sourcePageUrl: string; // the file page, not the raw upload URL
readonly modifications: string; // "Cropped and resized" or "None"
```

`alt` describes what is in the photo in plain words, no em dashes, no marketing ("F-15C in a banking turn over clouds", not "F-15 Eagle dominating the skies").

### 12.4 Current inventory and required action

The owner has stated that some current images are AI-generated and some came from the internet. Until a file is re-sourced from a verified original with the fields in 12.3, treat it as not usable.

| File(s)                                                                                                                                                      | Recorded source                                     | Action                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/images/environments/*.webp` (4 files: engineering-lab, launch-complex, orbital-command, tactical-aircraft)                                           | none recorded                                       | Treat as AI-generated. Remove all usages, then delete files. No replacement backgrounds.                                                                                                                               |
| `public/images/missions/*.webp` (5 files: iss-style-resupply, leo-satellite-deployment, lunar-transfer-concept, mars-transfer-concept, reentry-demonstrator) | none recorded; "concept" subjects                   | Treat as AI-generated. Remove all usages, then delete. Replace with SVG mission diagrams from the mission data, or with nothing.                                                                                       |
| `public/images/aircraft/sr-71-blackbird.png`                                                                                                                 | `blackbirdsims.com` flight-simulator product render | Not a photograph, not licensed. Replace with a NASA Armstrong (Dryden) SR-71 photo from the NASA image library or Wikimedia Commons (public domain).                                                                   |
| `public/images/rockets/falcon-9.png`                                                                                                                         | `storage.googleapis.com/nextspaceflight/...`        | Aggregator, no license. Replace with a Wikimedia Commons Falcon 9 photo whose file page states CC0 or public domain.                                                                                                   |
| `public/images/rockets/falcon-heavy.png`                                                                                                                     | `cdn.mos.cms.futurecdn.net` (news-site CDN)         | No license. Replace as for Falcon 9.                                                                                                                                                                                   |
| `public/images/aircraft/b-2-spirit.png`                                                                                                                      | Wikimedia Commons, RAF/USAF photo                   | Verify license on the file page (likely OGL v3.0, "Crown copyright", credit required). Re-derive from the original, crop and resize only.                                                                              |
| `f-15-eagle.png`, `f-22-raptor.png`, `f-35-lightning-ii.jpg`                                                                                                 | Wikimedia Commons, likely USAF                      | Verify public-domain status on each file page; re-derive from original; record credit.                                                                                                                                 |
| `saturn-v.png` (Apollo 11, NASA GPN-2000-000630), `space-launch-system.png` (Artemis II, NASA)                                                               | Wikimedia Commons, NASA                             | Public domain as NASA works; record credit "NASA"; re-derive from original.                                                                                                                                            |
| `starship.png`                                                                                                                                               | Wikimedia Commons, IFT-5                            | Verify license on the file page (SpaceX releases vary). Replace if not CC0 or PD.                                                                                                                                      |
| Local files are `.png` while sources are `.jpg`                                                                                                              | Processing unknown                                  | Every re-derived image is exported as WebP or JPEG from the original with crop and resize only. Record this in `modifications`.                                                                                        |
| `public/brand/orbix-brand-suite.png` (used as Open Graph image)                                                                                              | brand board                                         | Stop using it as the OG image. Use a real screenshot of the home page at 1200x630 or a plain typographic OG image generated by `next/og` from the wordmark and tagline (no new dependency; `next/og` ships with Next). |

NASA media usage: NASA imagery is generally not copyrighted, but it may not be used to imply endorsement. The credits page states that ORBIX is not affiliated with or endorsed by NASA or any manufacturer.

### 12.5 Brand assets

`public/brand/*` is owner-supplied and is not redrawn by any task. Because the owner has said some images were AI-generated without listing which, the imagery and legal task asks the owner to confirm the logo's origin. If the logo was AI-generated, that is recorded on the Credits page under "ORBIX logo" rather than hidden; replacing the logo is the owner's decision, not a task's. Glows and drop shadows applied to the logo in code (`orbix-mark.tsx`, `site-logo.tsx`, `.orbix-loading-mark`) are removed regardless.

---

## 13. Copy rules

### 13.1 Voice

Plain, factual, specific, third person or second person. Write the way a good textbook or a flight manual does: say what a thing is, what it does, and its limits. Short sentences. No hype, no rhetorical questions, no exclamation marks.

- Say "Calculates the delta-v for a Hohmann transfer between two circular, coplanar orbits." Not "Unlock the power of orbital mechanics."
- Every simplified model states its assumptions and limits next to the result.
- Numbers carry units and, where they are vehicle specifications, a source.

### 13.2 Punctuation and formatting

- No em dash (U+2014). En dash (U+2013) is also avoided in UI text; ranges use "to" ("0 to 86 km"). Hyphens are for compound words only.
- No `//` separators, no `SYS-01` codes, no decorative numbering (`01`, `02`) unless the list is a real sequence of steps.
- Sentence case for headings and buttons. Title case only for proper nouns (vehicle names, "Engineering Lab").
- No emoji, no decorative Unicode symbols (arrows as text, bullets as text, stars).
- The middle dot `·` is allowed only in footer and metadata lines.

### 13.3 Banned words and phrases (UI copy, metadata, alt text, docs meant for users)

elevate, seamless, seamlessly, unleash, unlock, next-gen, next-generation, cutting-edge, revolutionary, empower, world-class, premium, advanced (as a self-description), state-of-the-art, mission-critical (as hype), game-changing, supercharge, harness the power, dive in, deep dive, journey, immersive, stunning, sleek, robust (as praise), powerful (as self-praise), leverage, synergy, best-in-class, blazing, effortless, reimagine, transform (as hype), curated, "take X to the next level", "whether you're X or Y", "everything you need", "Get started", "Learn more" (alone).

Known offenders to rewrite (non-exhaustive): `src/config/site.ts` (`tagline: "Advanced Aerospace Engineering Laboratory"`, description "A professional educational..."), `src/app/manifest.ts`, `package.json` `description` (not user-visible, fix anyway), and "premium" in `showcase-hero.tsx`, `showcase-capture.tsx`, `visualization-showcase.tsx`, `technology-and-philosophy.tsx`, `portfolio-highlights.tsx`, `mission-gallery.tsx`, `mission-control-preview.tsx`, `engineering-systems-overview.tsx`, `engineering-dashboard.tsx`, `orbix-mission-array.tsx`.

Suggested replacements (foundation task owns `site.ts` and `manifest.ts`):

- Tagline: `Aerospace engineering, explained with real vehicles`
- Description: `ORBIX is an educational site about aircraft, launch vehicles and the engineering behind them: vehicle records with sources, side-by-side comparison, and calculators for orbital mechanics, compressible flow and atmospheric entry.`
- Manifest `name`: `ORBIX`, `description`: the description above.

### 13.4 Claims and empty values

- No claim the repo cannot prove. "Every value traced back to its published source" (home hero) is allowed only if every displayed vehicle value has a source reference in the data files; otherwise write "Vehicle values cite their published sources where available."
- Test counts, module counts, or line counts may appear on Showcase only if computed from the repo at build time or quoted with the date and command that produced them.
- No invented users, schools, partners, or quotes. No "trusted by".
- Empty calculator result: `Not calculated` in `--orbix-text-muted`, `--text-body-sm`, not mono, not large. When inputs are invalid: `Not calculated. Check the inputs above.`
- Missing vehicle value: `Not published` when no public figure exists, `Not applicable` when the field does not apply (for example "Payload to LEO" for an aircraft).
- Engineering status words describe computed results only; never "Mission feasible" or "Safe".

### 13.5 Accessibility copy

- Link text makes sense out of context: "Read the F-22 Raptor profile", not "Read more".
- `aria-label` only when there is no visible text; it starts with the visible label if there is one.
- `alt=""` for purely decorative SVG; there should be very little of it.

---

## 14. Page templates by route

All pages share: `SiteHeader`, `<main id="main-content">` without the `orbix-page-transition` class, `SiteFooter`. One `<h1>` per page. A **page intro** block: optional breadcrumb, optional eyebrow (`.orbix-label`, sentence case, muted, not accent, not mono), `<h1 class="orbix-h1">`, one `.orbix-lead` paragraph (max 60ch), optional action row. The intro is left-aligned, never centered, and sits on the plain page ground with `padding-block: 3rem 2rem` and a bottom border `--orbix-border`. No background image, grid, or glow behind it.

### `/` Home (`src/app/(site)/page.tsx`, `src/features/home/**`)

1. Intro: eyebrow none; `<h1>` is the wordmark image (keep current accessible pattern) sized at most 15rem wide; lead sentence (see 13.3); actions: primary "Browse the aircraft registry", secondary "Open the Engineering Lab".
2. Right column from 1024px (5 of 12 columns): one credited real photograph in a `<figure>` (Apollo 11 Saturn V, NASA, public domain, is a safe choice). No overlay, `--radius-3`.
3. "What is here": a plain list of the five sections (Aircraft, Rockets, Compare, Engineering Lab, Learn), each an `<h3>` link and one sentence. Two columns from 768px. No cards, no icons in colored wells.
4. "Featured records": three vehicle card links (existing `VehicleRecordCard`).
5. "How values are sourced": one short paragraph and a link to `/about#sources`.

Delete: `analysis-preview`, `mission-preview` (uses mission images), `research-preview` if they only restate the list above; `final-cta`. The home task decides which of these become the list in step 3.

### `/aircraft` and `/rockets` registries

Intro (h1 "Aircraft" / "Launch vehicles", lead one sentence). Filter row: search field and, if present today, a classification `<select>`, labels above, plus a results count as live text (`aria-live="polite"`: "5 aircraft"). Results: grid of vehicle card links, 1 column below 640px, 2 from 640px, 3 from 1024px. Below the grid, a sources note. No explorer HUD frame, no carbon texture, no environment backdrop.

### `/aircraft/[id]` and `/rockets/[id]` profiles

- Breadcrumb: Home / Aircraft / F-22 Raptor.
- Intro: eyebrow = classification (e.g. "Air superiority fighter"), h1 = name, lead = one-sentence summary from data, status tag if the data has one (e.g. "In service").
- Body grid from 1024px: main 8 columns, aside 4 columns.
  - Aside (sticky at `top: 4.5rem`): the credited `<figure>`; "On this page" nav (links to section ids, current section gets the 2px accent left border); "Compare with..." secondary button linking to `/compare?...`.
  - Main, in order: Overview (prose), Key specifications (table), Propulsion (table + prose), Performance (table), History (ordered list with years; timeline dots allowed as circles), Variants (table), Engineering notes (prose, `.orbix-prose`), Sources (ordered list of citations with links).
- Every section: `<section aria-labelledby>`, `<h2 class="orbix-h2">`, separated by `--space-8` and a top border `--orbix-border-subtle`.
- Related vehicles at the end as up to three card links.
- No dashboard of big glowing numbers. Key figures appear once, in the specifications table.

### `/compare`

Uses the `wide` container. Intro (h1 "Compare vehicles"). Controls: vehicle type as two radio buttons in a fieldset ("Aircraft", "Launch vehicles"), then two to three labeled `<select>` elements ("First vehicle", "Second vehicle", "Third vehicle (optional)"), then primary button "Compare" only if selection does not update live. Identity strip: a table header row with each vehicle's name, classification and small credited thumbnail. Comparison table: sticky first column, rows grouped by category with a full-width `<th scope="rowgroup">` category row, units column or unit spans, magnitude bars (`.orbix-magnitude`) as flat 4px bars with `--radius-1`, per-row education as a native `<details>` with summary text "What this measures". Empty state per section 10.

### `/engineering-lab`

Uses the `wide` container. Intro (h1 "Engineering Lab", lead one sentence, plus a one-line educational-use notice).

- From 1024px, two columns: tool index 16rem (grouped by discipline under `.orbix-caps` headings, each tool a link with `aria-current` on the active one, active item gets the 2px accent left border and `--orbix-accent-subtle` fill), workspace in the rest.
- Workspace per module: h2 module name, one-sentence purpose, equation block, "Inputs" fieldset (section 9, two columns from 768px), "Results" section: a `<dl>` where the primary result uses `.orbix-data-lg` and secondary results use `.orbix-data`, each with unit and short description; empty state `Not calculated`. Then "Assumptions and limits" as a bulleted list. Then "Related" links.
- Below 1024px the tool index becomes a labeled `<select>` ("Choose a tool") plus the list in a `<details>`.
- Mission control, replay, 3D scene, ground track: keep the functionality; restyle to flat panels; remove glows, pulses, bouncing markers, blur, and the startup sequence animation (show its checklist content statically or remove it; see 15.4). Visualization colors come from `--orbix-data-*`.
- Calculator physics files are frozen (section 17).

### `/learn`

Reading layout. Intro (h1 "Learn"). From 1024px: 3-column "Contents" sidebar (sticky), 9-column content with prose measure. Each pathway: `<h2>`, summary paragraph, "Key ideas" list, "Try it in the lab" links to the relevant module anchors, "Further reading" with real sources. No per-pathway color accents (the `accent` field in `learning-areas.ts` and its type union are removed or collapsed to a single value). No icon wells.

### `/showcase`

This is the portfolio and architecture page. Intro (h1 "How ORBIX is built", lead one sentence). Sections: Architecture (prose plus an SVG layer diagram: data, calculators, analyses, reports, React), Engineering boundaries (list), Quality checks (what runs in CI, stated plainly, figures only per 13.4), Screenshots (authentic screenshots in figures with captions; if none exist, omit the section rather than showing mock-ups), Source code link (external link pattern). Remove `mission-gallery` imagery (AI), `mission-control-preview` glow composition, `visualization-showcase` glows. No "premium".

### `/showcase-capture/[id]`

Internal capture route. Same tokens, no chrome changes needed, keep `noindex`. Must not reference removed images.

### `not-found`

Intro only: h1 "Page not found", lead "The page you asked for does not exist or has moved.", actions: primary "Go to the home page", secondary "Browse the aircraft registry". No brand rule, no glow.

### `loading`

Centered within the main area: the spinner from section 11 and the text "Loading". No wordmark glow, no light field, no pulse.

### New: `/about`, `/credits`, `/privacy`, `/terms`, `/accessibility`

Reading template: intro (h1, "Last updated 27 September 2026" as `.orbix-label`), then `.orbix-prose` with h2 sections, 68ch. No images except in `/credits`.

Required content, for the legal task to write (owner to review; this is not legal advice):

- **About**: what ORBIX is (an educational project built by a student); that it is run from Massachusetts, United States; contact email `deep.patel4000@gmail.com` (the repository's Git commit email; to be replaced by a dedicated ORBIX address later, so it lives in one config constant, `src/config/site-legal.ts`, `contactEmail`); a "How values are sourced" section (`id="sources"`); educational-use boundary.
- **Credits** (`/credits`): table of every image with thumbnail, subject, credit, license (linked), source page (linked), modifications; fonts (IBM Plex, SIL Open Font License 1.1); icons (lucide, ISC license); the non-affiliation and no-endorsement statement for NASA, the US Air Force, SpaceX, Lockheed Martin, Boeing, Northrop Grumman and other manufacturers; trademark statement ("Vehicle and company names are trademarks of their respective owners and are used only to identify the vehicles described."); the AI imagery statement: "ORBIX does not use AI-generated images." (true only after section 12.4 is complete; if the logo is AI-generated per 12.5, say so here).
- **Privacy**: what is actually collected. Verify before writing: there are no accounts, forms that submit, analytics packages, or cookies in `package.json` and `src/` today; the host (Vercel) processes request logs such as IP address. Say exactly that, plus the contact email. Do not claim compliance with laws not assessed.
- **Terms**: educational use only; no warranty; calculations are simplified and must not be used for operational, safety, or certification decisions; content licenses as stated on Credits; governing law is the Commonwealth of Massachusetts, United States.
- **Accessibility**: target WCAG 2.2 AA, known limitations (list real ones found in testing, for example the 3D scene), how to report a problem (contact email).

---

## 15. Decorative elements to delete

Deletion means: remove the usage from markup, then remove the definition when no usage remains (phase C). Page tasks remove usages in their own directories; the foundation task neutralises the definitions in phase A (makes them render nothing) so pages look right before their task lands.

### 15.1 Global CSS (foundation task)

| Element                                                                                                                                       | File                                                                 | What to do                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------- |
| Body radial gradients (blue, cyan, and violet `rgb(194 140 255)`) and linear gradient using `#02040a`                                         | `src/styles/orbix-foundations.css` `body`                            | Replace with `background: var(--orbix-bg-page)`.         |
| Fixed page grid `body::before`                                                                                                                | `src/styles/orbix-foundations.css`                                   | Delete.                                                  |
| `html { scroll-behavior: smooth }`                                                                                                            | `src/styles/orbix-foundations.css`                                   | Delete.                                                  |
| `::selection` cyan rgba                                                                                                                       | `src/styles/orbix-foundations.css`                                   | `background: var(--orbix-accent-subtle)` variant at 35%. |
| `:active { opacity: 0.84 }` on all links and buttons                                                                                          | `src/styles/orbix-foundations.css`                                   | Delete (buttons define their own active state).          |
| `.technical-grid`, `.orbix-grid`                                                                                                              | `src/styles/orbix-foundations.css` (+ `orbix-grid-mask.test.ts`)     | Neutralise, then delete; update or delete the test.      |
| `.orbix-starfield` (includes violet `rgb(163 139 255)`)                                                                                       | `src/styles/orbix-foundations.css`                                   | Delete.                                                  |
| `.orbix-atmosphere-glow`                                                                                                                      | `src/styles/orbix-foundations.css`                                   | Delete.                                                  |
| `.orbix-light-field` (violet)                                                                                                                 | `src/styles/orbix-foundations.css`                                   | Delete.                                                  |
| `.orbix-brand-glow` (violet)                                                                                                                  | `src/styles/orbix-foundations.css`                                   | Delete.                                                  |
| `.orbix-brand-rule` (cyan to violet gradient)                                                                                                 | `src/styles/orbix-foundations.css`                                   | Delete.                                                  |
| `.orbix-frame` (HUD clip-path corners, accent corner ticks)                                                                                   | `src/styles/orbix-foundations.css`                                   | Delete.                                                  |
| `.orbix-carbon` (carbon fiber texture)                                                                                                        | `src/styles/orbix-foundations.css`                                   | Delete.                                                  |
| `.orbix-environment-label`, `.orbix-kicker`, `.orbix-technical-label`, `.orbix-display-xl`, `.orbix-display-lg`                               | `src/styles/orbix-foundations.css`                                   | Replace per section 5.                                   |
| `@keyframes orbix-scan` (scan line)                                                                                                           | `src/styles/orbix-motion.css`                                        | Delete.                                                  |
| `@keyframes orbix-signal-pulse`, `.orbix-signal-pulse` (infinite)                                                                             | `src/styles/orbix-motion.css`                                        | Delete.                                                  |
| `@keyframes orbix-fade-in`, `.orbix-enter`, `.orbix-page-transition` (520ms)                                                                  | `src/styles/orbix-motion.css`, `orbix-components.css`                | Delete.                                                  |
| `.orbix-button::after` sheen, hover `translateY`, active `scale`, primary gradient `#dff8ff > accent > #a7c8ff`, `--shadow-accent` glow       | `src/styles/orbix-components.css`                                    | Replace with section 8.                                  |
| `.orbix-premium-card` and `::before` cyan to violet gradient, hover lift and glow                                                             | `src/styles/orbix-components.css`                                    | Delete; consumers use the panel.                         |
| `.orbix-surface::before` accent line, `.orbix-surface--*` gradients (incl. `--gallery` violet radial), hover lift and glow                    | `src/styles/orbix-components.css`                                    | Collapse per section 10.                                 |
| `.orbix-status` pill radius and glowing dot `box-shadow: 0 0 10px currentColor`                                                               | `src/styles/orbix-components.css`                                    | Per section 10.                                          |
| `.orbix-progress` pill, gradient fill, glow                                                                                                   | `src/styles/orbix-components.css`                                    | Per section 10.                                          |
| `.orbix-empty-state` radial gradient                                                                                                          | `src/styles/orbix-components.css`                                    | Per section 10.                                          |
| `.orbix-loading-mark` drop-shadow glow                                                                                                        | `src/styles/orbix-components.css`                                    | Delete.                                                  |
| `.orbix-site-header` `backdrop-filter: blur(12px)` and `::after` accent line                                                                  | `src/styles/orbix-components.css`                                    | Per section 10.                                          |
| `.orbix-home-cta`, `.orbix-home-link`                                                                                                         | `src/styles/orbix-components.css`                                    | Delete after home migrates.                              |
| `--shadow-card`, `--shadow-panel`, `--shadow-accent`, `--ring-accent`, `--glass-blur`, `--elevation-2`, division and environment theme blocks | `src/styles/orbix-tokens.css`                                        | Delete per 4.3 and 7.3.                                  |
| `.card` in `calculator-card.module.css` references `--orbix-bg-surface` (undefined token)                                                     | `src/features/engineering-lab/components/calculator-card.module.css` | Lab task: switch to `--orbix-surface`.                   |

### 15.2 Brand and layout components (foundation task)

| Element                                                                                                         | File                                                                                  |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `OrbixBackground`: starfield, grid, orbit SVG with `var(--plasma-violet)` stroke and dot, atmosphere glow blob  | `src/components/brand/orbix-background.tsx` (delete component)                        |
| `OrbixEnvironmentBackdrop`: AI environment photos with gradient overlays                                        | `src/components/brand/orbix-environment.tsx` (delete component after usages are gone) |
| `OrbixMissionArray`: glow shadows incl. `var(--plasma-violet)`, `backdrop-blur-xl`, pill shapes, "premium" copy | `src/components/brand/orbix-mission-array.tsx` (delete)                               |
| `drop-shadow-[0_0_18px_var(--plasma-violet)]` on the emblem                                                     | `src/components/brand/orbix-mark.tsx`                                                 |
| `shadow-[0_0_18px_rgb(88_220_255/0.2)]` on the logo                                                             | `src/components/layout/site-logo.tsx`                                                 |
| `shadow-[0_0_40px_...]` glow, grid                                                                              | `src/components/layout/feature-placeholder.tsx`                                       |
| `orbix-light-field`, `orbix-brand-rule`, `orbix-signal-pulse`, `orbix-enter`, `orbix-grid`                      | `src/app/loading.tsx`                                                                 |
| `orbix-brand-rule`, environment backdrop                                                                        | `src/app/not-found.tsx`                                                               |
| `orbix-brand-suite.png` as OG and Twitter image                                                                 | `src/app/layout.tsx`                                                                  |

### 15.3 Feature directories (page tasks)

Each page task searches its own directories for: `orbix-grid`, `technical-grid`, `orbix-starfield`, `orbix-atmosphere-glow`, `orbix-light-field`, `orbix-brand-glow`, `orbix-brand-rule`, `orbix-frame`, `orbix-carbon`, `orbix-premium-card`, `orbix-kicker`, `orbix-enter`, `orbix-signal-pulse`, `OrbixBackground`, `OrbixEnvironmentBackdrop`, `OrbixMissionArray`, `plasma`, `violet`, `purple`, `indigo`, `fuchsia`, `backdrop-blur`, `blur-`, `shadow-[`, `drop-shadow-[`, `animate-pulse`, `animate-bounce`, `animate-spin`, `animate-ping`, `bg-gradient-to`, `bg-[linear-gradient`, `bg-[radial-gradient`, `rounded-full`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `tracking-[0.1`, `text-[0.5`, `text-[0.6`, U+2014 (em dash), and removes or replaces every hit. Known concentrations:

- **Aircraft** (`src/features/aircraft/components/`): `orbix-frame` in `aircraft-explorer`, `aircraft-visual-panel`, `engineering-notes-panel`, `historical-timeline`, `mission-applications`, `mission-overview`, `propulsion-panel`, `specification-grid`, `variants-panel`, `aircraft-profile-cta`; `orbix-carbon` in `aircraft-explorer`, `aircraft-profile-cta`, `mission-applications`, `mission-overview`, `propulsion-panel`; `blur-3xl` blob in `aircraft-profile-cta`; `backdrop-blur` in `aircraft-explorer`, `aircraft-profile`, `aircraft-visual-panel`; environment backdrop in `aircraft-explorer`.
- **Rockets** (`src/features/rockets/components/`): `orbix-frame` in `architecture-panel`, `engineering-notes-panel`, `performance-panel`, `propulsion-panel`, `rocket-explorer`; amber glow in `architecture-panel`; `backdrop-blur` and pill shapes in `rocket-explorer`.
- **Vehicles** (`src/features/vehicles/components/`): grid overlays in `vehicle-media-frame`, `vehicle-profile-hero`.
- **Compare** (`src/features/compare/components/`): environment backdrop in `compare-page`; pill in `comparison-controls`; grid in `comparison-empty-state`.
- **Engineering Lab** (`src/features/engineering-lab/components/`): 30+ `rounded-full` pills across analyzers; cyan glow `shadow-[0_12px_40px_rgb(87_215_255/0.18)]` in `atmosphere-calculator`, `drag-equation-calculator`, `flight-condition-analyzer`, `lift-equation-calculator`, `rocket-equation-calculator`, `thrust-to-weight-calculator`; `orbix-brand-glow` and environment backdrop in `engineering-dashboard`; `presentation/*` (star-field `shadow-[5rem_2rem_0...]` hacks in `briefing-header` and `showcase-stage`, `blur-3xl` blobs in `briefing-header`, `demo-mode`, `mission-showcase`, `mission-trade-study`, `showcase/gallery-header`, pulses in `briefing-header`, `mission-startup-sequence`, `showcase-stage`, `showcase/gallery-header`, `animate-bounce` in `mission-briefing`); `visualization/*` (glow shadows, pulses, `blur-*`, `backdrop-blur` in `earth-model`, `spacecraft-marker`, `mission-control-*`, `mission-status-panel`, `mission-timeline`, `mission-viewer`, `mission-3d-scene`, `orbit-path-3d` incl. `animate-spin`, `orbit-ground-path`, `ground-track-visualization`, `mission-replay`); em dash empty values in 12+ analyzers.
- **Learn** (`src/features/learn/`): `orbix-brand-glow` in `learn-hero`; `plasma` accent in `learning-areas.ts`, `learning-area.ts`, `learning-pathway-section.tsx`.
- **Showcase** (`src/features/showcase/`): `orbix-brand-glow`, `backdrop-blur`, glow dot, `from-accent to-plasma` gradient in `showcase-hero`; `orbix-brand-glow` in `mission-control-preview`; glows in `visualization-showcase`, `showcase-capture`; `blur-3xl` in `engineering-systems-overview`; AI mission images in `data/mission-showcase.ts` and `mission-gallery`.
- **Home** (`src/features/home/`): environment backdrop and gradient scrim in `hero`; mission images in `mission-preview`.

### 15.4 Theatrical components to remove or reduce (engineering lab task decides the exact cut)

- `presentation/mission-startup-sequence.tsx`, `startup-check-list.tsx`, `startup-progress.tsx`: a scripted boot sequence that implies live systems. Remove the animation and the "startup" framing; if the checklist summarizes real computed checks, render it statically as "Checks performed".
- `presentation/demo-mode.tsx`, `showcase-stage.tsx`, `mission-showcase.tsx`, `briefing-header.tsx`: remove star-field shadows, blobs and pulses; keep content.
- `visualization/mission-control-status-bar.tsx`: must not display pulsing "live" indicators; state labels only describe replay state ("Paused", "Playing").

---

## 16. Execution phases

- **Phase A, foundation (one task, runs first, alone):** new tokens and aliases; neutralise every decorative class in 15.1 so it renders nothing; new button, field, panel, tag, status, table, progress, tabs styles; `Button` primitive; header, footer (with the About link group pointing at the five new routes, even before they exist), loading, not-found; `site.ts`, `manifest.ts`, layout metadata; `src/config/site-legal.ts` is created by the legal task, not here. The foundation task must not delete any exported component or class that feature code still imports.
- **Phase B, page tasks (in parallel):** home, vehicles, compare, engineering lab, learn, showcase, imagery and legal. Each edits only its own files (section 17). Anything needed outside its files is requested from the foundation owner, not edited.
- **Phase C, cleanup and verification (one task, runs last):** delete neutralised classes, dead components (`OrbixBackground`, `OrbixEnvironmentBackdrop`, `OrbixMissionArray`), deprecated aliases, removed Tailwind bridge names, deleted images; tighten `design-debt-baseline.json`; update Playwright snapshots; run all checks in section 18.

---

## 17. File ownership map

A task may create, edit, or delete only paths it owns. Paths marked **frozen** may not be edited by any redesign task. Colocated unit tests (`*.test.ts(x)` beside a file) belong to the owner of that file.

| Task                                                     | Owns (may edit)                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T1 Foundation** (phase A, then available for requests) | `src/styles/**`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/loading.tsx`, `src/app/not-found.tsx`, `src/app/manifest.ts`, `src/app/icon.png`, `src/app/favicon.ico`, `src/app/(site)/layout.tsx`, `src/components/**` (brand, layout, ui), `src/config/site.ts`, `src/config/navigation.ts`, `src/config/divisions.ts` (+ test), `src/lib/**`, `scripts/check-raw-colors.mjs`, `design-debt-baseline.json`, `docs/design-system/**`     |
| **T2 Home**                                              | `src/features/home/**`, `src/app/(site)/page.tsx`                                                                                                                                                                                                                                                                                                                                                                                                  |
| **T3 Vehicles**                                          | `src/features/aircraft/components/**`, `src/features/aircraft/utils/**`, `src/features/aircraft/index.ts`, `src/features/rockets/components/**`, `src/features/rockets/utils/**`, `src/features/rockets/index.ts`, `src/features/vehicles/components/**`, `src/features/vehicles/utils/format-measurement.ts`, `src/app/(site)/aircraft/**`, `src/app/(site)/rockets/**`                                                                           |
| **T4 Compare**                                           | `src/features/compare/components/**`, `src/features/compare/education/**` (copy only), `src/app/(site)/compare/**`                                                                                                                                                                                                                                                                                                                                 |
| **T5 Engineering Lab**                                   | `src/features/engineering-lab/components/**` (including `calculator-card.module.css`, `presentation/`, `review/`, `showcase/`, `shared/`, `visualization/`), `src/app/(site)/engineering-lab/**`                                                                                                                                                                                                                                                   |
| **T6 Learn**                                             | `src/features/learn/**`, `src/app/(site)/learn/**`                                                                                                                                                                                                                                                                                                                                                                                                 |
| **T7 Showcase**                                          | `src/features/showcase/**` (components, data, `showcase-page.tsx`), `src/app/(site)/showcase/**`, `src/app/showcase-capture/**`                                                                                                                                                                                                                                                                                                                    |
| **T8 Imagery and legal**                                 | `public/images/**`, `src/features/aircraft/data/aircraft-visuals.ts`, `src/features/rockets/data/rocket-visuals.ts`, new `src/features/legal/**`, new `src/config/site-legal.ts`, new `src/app/(site)/about/**`, `src/app/(site)/credits/**`, `src/app/(site)/privacy/**`, `src/app/(site)/terms/**`, `src/app/(site)/accessibility/**`, `docs/assets/**`, new `docs/legal/**`. `public/brand/**` is read-only unless the owner approves a change. |
| **T9 Cleanup and verification** (phase C)                | `tests/e2e/**` (including `__screenshots__`), final deletions listed in phase C across any path, `docs/CLAUDE_HANDOFF.md`, `docs/project-state.json`, `docs/testing/**`                                                                                                                                                                                                                                                                            |

**Frozen (no redesign task edits):** `src/features/engineering-lab/calculators/**`, `analysis/**`, `reports/**`, `materials/**`, `missions/**`, `types/**`, `utils/**`, `index.ts`; `src/features/vehicles/data/**` (vehicle specifications), `src/features/vehicles/types/**`, `src/features/vehicles/utils/is-measurement.ts`, `vehicle-type-guards.ts`, `src/features/vehicles/index.ts`; `src/features/aircraft/data/aircraft-repository.ts`, `src/features/rockets/data/rocket-repository.ts`; `src/features/compare/adapters/**`, `data/**`, `types/**`, `utils/**`, `index.ts`; `package.json`, `package-lock.json`, `next.config.ts`, `eslint.config.mjs`, `.github/**`, `playwright.config.*`, `vitest.config.*`.

Cross-boundary handoffs, fixed here so no two tasks touch one file:

- Mission images: T7 removes references in `src/features/showcase/data/mission-showcase.ts` and gallery components; T2 removes the reference in `mission-preview.tsx`; T8 deletes `public/images/missions/**` only after both are done (or leaves it for T9).
- Environment images: each page task removes its own `OrbixEnvironmentBackdrop` usage; T1 removes it from `not-found.tsx`; T9 deletes the component and `public/images/environments/**`.
- Image credits in UI: T8 adds fields to the two visuals files; T3 renders them in profile figures; T8 renders `/credits`.
- Footer links to legal routes: T1 adds them in phase A; T8 creates the routes.
- E2E tests that break because of intended visual or copy changes: the page task reports the failing spec and expected change; T9 edits `tests/e2e/**`.
- If a page task needs a new token or shared component, it asks T1; it does not add one locally.

---

## 18. Verification (every task runs before handing off)

1. `npm run validate` (format check, lint, `check:design`, typecheck, unit tests, build).
2. Grep checks on the task's owned paths, all must return nothing:
   - `rg -n "\x{2014}" <paths>` (em dash; applies to user-visible strings, but keep code comments clean too)
   - `rg -n -i "plasma|violet|purple|indigo|fuchsia" <paths>`
   - `rg -n "rounded-full" <paths>` then confirm each remaining hit is a non-interactive circle
   - `rg -n "rounded-(xl|2xl|3xl)|backdrop-blur|animate-(pulse|bounce|ping)|shadow-\[0_0|drop-shadow-\[|bg-black|#000000|#000\b" <paths>`
   - `rg -n -i "\b(elevate|seamless|unleash|next-gen|cutting-edge|revolutionary|empower|world-class|premium|state-of-the-art)\b" <paths>`
   - emoji: `rg -n "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" <paths>`
3. Keyboard pass on every owned route: Tab order follows reading order, every control reachable and operable, focus ring visible on every stop, no trap, Escape closes overlays.
4. Contrast: any new color pairing added must be measured and added to section 4.2.
5. Reduced motion: with `prefers-reduced-motion: reduce` emulated, nothing moves except user-started replay steps.
6. 320px and 1440px widths: no horizontal page scroll; tables scroll inside their wrapper.
7. `npm run test:e2e` where the environment allows; failures caused by intended changes are reported to T9 with the spec name.
