# ORBIX design v3: "Standards manual"

Status: binding for the v3 pass. Supersedes the visual parts of `orbix-design-v2.md` (sections 4 to
9); v2's hard rules, accessibility rules, imagery licensing and content rules still apply.

## 1. Why v3

Owner review of v2: the likeness to the original ORBIX is right, but the site still reads
AI-generated. Two named problems: the **blocky look** (bordered cards, panels, compartment grids,
framed tables everywhere) and the **gradients** (photo scrims, fades, masks, glows).

Research behind this spec (read the parts relevant to your task):
`C:\Users\Deep\AppData\Local\Temp\claude\C--Users-Deep-dev-orbix\0aef5163-b2c7-4e1b-945a-29343ae8c21d\scratchpad\research-v3\`

- `tells.md`: AI and vibe-coded signatures, especially card sprawl, gap-px compartments, cards in
  cards, framed tables, side stripes, fades and scrims, mono-caps labels, numbered 01/02 sections,
  two-tone headlines, eyebrow rules, identical section rhythm.
- `quality.md`: what makes a site read as crafted.
- `art.md`: aerospace art direction; concept 1 "Standards manual" is the base.
- `audit.md`: per-page, per-file list of v2 tells to remove and what to keep.

Direction in one line: a NASA-standards-manual and museum-catalogue sensibility on a dark ground.
Photographs are shown as hard-edged plates with catalogue captions, text sits on solid ground,
and structure comes from type, space and a few rules, never from boxes or gradients.

## 2. Keep (owner likes)

- Full-bleed, credited public-domain photographs as the main visual, with the credit line.
- The condensed IBM Plex Sans display cut (font-stretch 84%, weight 600 to 650, tight tracking,
  large sizes). It is the strongest non-generic element.
- B612 Mono, but only for numbers, units and equations.
- The dark ground and the division colours (space `#5fd3f0`, aircraft `#e3ae54`, lab `#78bdff`),
  used as small marks only.
- All content, routes, copy truthfulness and accessibility work from v2.

## 3. Kill list (zero tolerance, grep-checked)

1. **Gradients of any kind**: `linear-gradient`, `radial-gradient`, `conic-gradient`, `mask-image`
   fades, photo scrims, section fades, body light fields, glow. Exception: none. (Scroll overflow
   cues use a visible scrollbar, not a fade.)
2. **Boxes**: no bordered or filled containers around content. No cards with borders or fills, no
   panels, no `gap-px` compartment grids, no framed tables, no bordered stat tiles, no cards in cards,
   no bordered TOC items, no bordered figure plates, no corner registration ticks around content.
   Allowed borders: form controls (inputs, selects, buttons), focus rings, and horizontal rules
   (see 6). A true error summary may use a single top rule in the danger colour.
3. **Radius** above 2px anywhere. Controls 2px; photos 0.
4. **Shadows** (`box-shadow`, `drop-shadow`, `text-shadow`), except the focus ring.
5. **Text on photos.** Headlines, leads, buttons and credits never sit on top of a photograph.
6. **Mono uppercase labels** (`// LABEL`, `FEATURED AIRCRAFT`, spaced caps column headers). Labels
   are sentence-case IBM Plex Sans. Uppercase appears nowhere except abbreviations (USAF, NASA, LEO).
7. **Decorative numbering** (01 to 06 on home, profiles, reading pages, TOCs; ghost numerals).
   Numbers stay only where they are real references: lab tool IDs, equation numbers, Learn key-idea
   numbers (1.1), figure numbers.
8. **Two-tone headlines** (a second line in the accent colour) and **eyebrow + rule** labels above
   headings. Headings are one colour. At most one short kicker per page, plain text, no rule.
9. **Side stripes** (coloured left borders) and filled active states with accent bars.
10. **Page-level blueprint grid** and grain overlays.
11. **Bento / uneven card pairs** and identical card rows with hover lift.

## 4. Palette

Ground and ink shift slightly away from the generic AI navy:

| Token               | Hex       | Use                                | Contrast on ground                         |
| ------------------- | --------- | ---------------------------------- | ------------------------------------------ |
| `--bg-page`         | `#07090d` | page ground                        |                                            |
| `--bg-inset`        | `#0d1117` | only form controls and code        | 1.05:1 vs page (fill only, not a boundary) |
| `--ink`             | `#e8e4dc` | headings, body (warm paper white)  | 15.71:1 (14.93:1 on inset)                 |
| `--ink-muted`       | `#9aa3ad` | secondary text, captions           | 7.80:1 (7.40:1 on inset)                   |
| `--ink-faint`       | `#7d8793` | credits, small metadata            | 5.46:1 (5.19:1 on inset)                   |
| `--rule`            | `#2a2f36` | hairline rules (decorative)        | 1.48:1 (decorative, exempt)                |
| `--rule-strong`     | `#586270` | table header rule, control borders | 3.22:1 (3.06:1 on inset)                   |
| `--accent-space`    | `#5fd3f0` | links and marks, space division    | 11.45:1                                    |
| `--accent-aircraft` | `#e3ae54` | aircraft division                  | 9.91:1                                     |
| `--accent-lab`      | `#78bdff` | lab, learn, verification           | 9.98:1                                     |

Measured (foundation task, WCAG 2.2 relative-luminance formula, sRGB): `--bg-page` text on a
solid accent button is 11.45:1 (space), 9.91:1 (aircraft), 9.98:1 (lab). Status colours kept from
v2: success `#72e9b5` 13.32:1, warning `#f2bc68` 11.55:1, danger `#ff7d83` 8.08:1 on the page.
Decision: `--rule-strong` moved from the proposed `#4a5563` (2.63:1 on the page, under the 3:1
WCAG 1.4.11 needs for a control boundary) to `#586270`, the nearest step on the same hue that
clears 3:1 on both the page and the inset fill. v2 role names (`--text-secondary`,
`--bg-surface`, `--bg-raised`, `--border-*`) are kept as aliases: body text resolves to `--ink`,
every surface role resolves to `--bg-page` (so a leftover surface fill draws nothing), and every
border role to `--rule` except `--border-control` (`--rule-strong`).

Workers must recompute every contrast value they rely on and record it in this table. Division
colour appears as: link colour, the active nav underline, a 2px rule above a section heading, the
current item text in a list, focus ring, and one solid primary button per page. Never as a fill for
a large area and never as headline text.

## 5. Typography

- Display: IBM Plex Sans, `font-stretch: 84%`, weight 620 to 650, tracking -0.035em to -0.045em,
  line-height 0.95 to 1.0. H1 `clamp(2.75rem, 6.5vw, 6rem)`, H2 `clamp(2rem, 3.8vw, 3.5rem)`.
  Sentence case. One colour. **Decision (foundation task):** H1 line-height 1.0 (at 0.95 with
  -0.045em tracking a descender met the ascender below on `/learn`). In the split hero the H1 is
  sized by its own column, `max(2.75rem, min(H1, 12.5cqi))`, so it wraps in about four lines.
- Text: IBM Plex Sans 400/500, 17 to 18px body, line-height 1.6, measure 60 to 70ch, `text-wrap:
pretty`; headings `text-wrap: balance`.
- Labels: Plex Sans 500, 13 to 14px, sentence case, `--ink-muted`.
- Data: B612 Mono for figures, units, equations only, `tabular-nums`. Units a step smaller and muted.
- Optional long-form serif for Learn and build log body (IBM Plex Serif) only if it measurably
  improves reading; decide once in the foundation task and apply consistently.
  **Decision (foundation task): no serif.** Plex Sans at 17 to 18px, line-height 1.6 and a 66ch
  measure already meets the reading targets, and nothing measurable favours a serif on a dark
  ground at these sizes. A third family would add font weight to every page for no measured
  gain, and the NASA manual reference is one type family. Learn and the build log use Plex Sans.
- Details: real minus sign, thin space before units where the design uses it, proper quotes,
  `hanging-punctuation: first` where supported.

## 6. Structure without boxes

- Separation by whitespace first, then type scale, then a single horizontal rule.
- Rules: 1px `--rule` between major sections or between rows of a real list; a 2px division-colour
  rule (48px wide) may sit above a section heading. No vertical rules except inside true tables.
- Lists of vehicles and tools: ruled catalogue rows (thumbnail or none, name, one-line summary,
  two key figures right-aligned, arrow) or open grids with no card chrome (photo plate, caption
  block below on the ground).
- Key figures: a definition list. Label above value, values in B612 Mono, groups separated by space.
  One to three primary figures may be larger. No compartment cells.
- Tables: no outer frame, no radius, header row separated by a 1px `--rule-strong`, body rows by
  1px `--rule`, numbers right-aligned tabular, units in the header. Mobile: horizontal scroll with a
  visible scrollbar and a sticky first column without fills or shadows.
- Equations: display-math style, centred or indented, with an equation number `(2.1)` at the right
  margin and a variables list below as plain text. No panel.
- Figures: `<figure>` with a hard-edged image and a catalogue caption below:
  `Fig. 3  SR-71B over the Sierra Nevada. NASA, public domain. Source.` Caption in Plex Sans 14px
  muted, figure number in `--ink`.

## 7. Photographs and heroes

- A hero is: solid ground with the H1, lead and actions in the text column; the photograph as a
  hard-edged plate beside it (desktop, 50 to 60 percent width, bleeding to the viewport edge) or
  below it (full-bleed band). The caption sits under the plate on the ground.
- Crops are art-directed per image and breakpoint (`objectPosition` per image) so the vehicle reads.
- No overlays, no saturation filters beyond the existing mild ones (`saturate(0.9)` allowed), no
  masks, no feathered edges.

## 8. Signature asset: to-scale technical drawings

- Launch vehicles: a to-scale height lineup (SVG) of the five rockets as simple outlined profiles
  or labelled bars built only from the recorded heights in the vehicle data, with a metre scale bar
  and dimension lines. Placed on `/rockets` and optionally the home page.
- Aircraft: a to-scale length and wingspan comparison (SVG) built only from recorded dimensions.
- Linework: 1.5px and 0.75px strokes in `--ink-muted`, dimension text in B612 Mono, callouts with
  leader lines. No fills except the ground. Every dimension must come from the data; if a value is
  missing, the vehicle is omitted from that drawing with a note.
- Existing orbit diagrams (lab, showcase) keep their linework but lose frames, plates and ticks.

## 9. Components

- Buttons: rectangular, 2px radius, 44px min height. Primary: solid division colour with
  `--bg-page` text (one per view). Secondary: 1px `--rule-strong` outline. Tertiary: underlined text
  link with an arrow. Hover changes fill or underline; no lift.
- Links: underline offset 3px, thickness 1px, colour shift on hover.
- Inputs: the only filled boxes. `--bg-inset` fill, 1px `--rule-strong`, 2px radius; unit shown as
  plain muted text after the field, not in a bordered suffix cell.
- Header: solid ground, wordmark left, text links right, active link underlined in the division
  colour. No hairline under the bar, or a 1px `--rule` only.
- Footer: solid ground, one rule above, plain text links, operator and contact line.
- Section nav on long pages: a plain list of links (no rules per item, no numbers), sticky only
  if it does not cover content.

## 10. Motion

Colour and underline transitions only, 150 to 200ms. No entrance animation, no hover scale, no
scroll effects. `prefers-reduced-motion` removes all transitions.

## 11. Page notes (from `audit.md`)

- Home: H1 plus one-line lead and two actions on solid ground; a full-bleed hard-edged photo band
  with a catalogue caption; aircraft and launch vehicles as two photo bands or two open catalogue
  columns (no bento); "Beyond the registries" as a plain ruled list without numbers; sourcing note
  as a sentence-case paragraph.
- Aircraft / Rockets: hero per section 7; featured vehicle as a caption line with 3 key figures as
  a definition list (no panel); registry as open catalogue (no card chrome); rockets keep full
  portrait crops; add the to-scale drawing.
- Profiles: hero per section 7; key figures as a definition list; in-page nav plain; sections
  without numbers; open tables; engineering analysis labels as sentence-case bold; related vehicles
  as catalogue rows.
- Compare: vehicle choice as a list of selectable rows or open tiles with a checkbox control (the
  control is the only border), comparison as an open table.
- Engineering lab: keep the orbit drawing unframed; tool index as a plain list with tool IDs,
  active item by colour and weight; equations per section 6; results as a definition list with the
  headline value large.
- Learn: no ghost numerals, no ruled 01 to 06 contents; equations numbered; figures with captions.
- Showcase: flatten the architecture diagram to linework on the ground; unframe diagrams and tables.
- Verification, build log, about, legal: open tables, plain TOC, no section numbers, no mono caps.

## 12. Definition of done

- Grep on `src/` (excluding tests and comments) returns zero: `gradient(`, `mask-image`,
  `box-shadow` (except focus), `drop-shadow`, `text-shadow`, `rounded-(md|lg|xl|2xl|3xl|full)` on
  non-circular content, `gap-px`, `uppercase` except abbreviation-only strings.
- Per page at 1440 and 390: no bordered or filled content container except form controls; no text
  on photos; photos hard-edged with captions; no two-tone headline; no decorative numbering.
- WCAG 2.2 AA (contrast measured), keyboard, reduced motion, no horizontal overflow at
  320/360/768/1440, `npm run validate` and `npm run test:e2e` pass.
- It still reads as ORBIX (dark, photographic, condensed display type, aerospace) and does not read
  as a template: judged against `tells.md`.
