import type { CSSProperties } from "react";

/**
 * STOPGAPS. Every class string in this file reaches inside a shared
 * primitive (`PhotoHero`, `SpecPanel`, `RecordRow`, owned by T1) through its
 * internal BEM class names. They are collected here, and only here, so they
 * can be deleted in one place once the primitives offer the behaviour
 * themselves. Each one has been raised with T1 as a missing prop:
 *
 * - SpecPanel: keep a value and its unit on one line, and share one value
 *   baseline across a row when a label wraps (a per-cell subgrid).
 * - RecordRow: a column count (2 below 64rem, auto-fit from 64rem) and a
 *   no-wrap value, plus a `secondary` line under the value.
 * - PhotoHero: `placement="right"` (the photo on the right with a feathered
 *   left edge and a matching overlay), and separate mobile and desktop
 *   `objectPosition`.
 *
 * If a primitive renames its internal classes these rules stop matching
 * silently, so check the registry and profile heroes after any change to
 * `src/components/ui/{photo-hero,spec-panel,record-row}.tsx`.
 *
 * Underscores inside the selectors are escaped (`\_`): Tailwind reads a bare
 * `_` in an arbitrary variant as a space.
 */

/**
 * SpecPanel in a registry hero aside (about 20rem wide from 64rem): each
 * cell is a three-row subgrid (label, value, second line) so values in a
 * row share a baseline when one label wraps, and the readout steps down to
 * 1.5rem to fit. Below 24rem the panel is one column: two cells of a 320px
 * screen are about 6.5rem wide inside, narrower than "118,000 kg" or
 * "50,000+ ft" at 1.5rem, and a value is never broken from its unit.
 */
export const STOPGAP_HERO_SPEC_PANEL = [
  "[--text-readout-lg:1.5rem]",
  "[&_.orbix-spec-cell]:row-span-3",
  "[&_.orbix-spec-cell]:grid",
  "[&_.orbix-spec-cell]:grid-rows-subgrid",
  "[&_.orbix-spec-cell]:gap-y-2",
  "[&_.orbix-spec-cell>dt]:self-end",
  String.raw`[&_.orbix-spec-cell\_\_value]:whitespace-nowrap`,
  "max-[24rem]:[&_.orbix-spec-grid]:grid-cols-1",
].join(" ");

/**
 * The hero spec panel as one 44rem strip from 64rem, for a hero whose
 * portrait photograph stands on the right (`STOPGAP_PHOTO_HERO_RIGHT`):
 * the kicker and title on the left of a top row with the profile link on
 * its right, then the four figures in one row. It sits under the text,
 * left-aligned with the H1, and ends where the photo plate begins, so it
 * never covers the vehicle. Use with `STOPGAP_HERO_SPEC_PANEL` on the
 * panel and `STOPGAP_PHOTO_HERO_ASIDE_BELOW` on the hero.
 */
export const STOPGAP_HERO_SPEC_PANEL_STRIP = [
  "lg:w-[44rem]",
  "lg:grid",
  "lg:grid-cols-[minmax(0,1fr)_auto]",
  "lg:[&_.orbix-spec-grid]:col-span-2",
  "lg:[&_.orbix-spec-grid]:row-start-2",
  "lg:[&_.orbix-spec-grid]:grid-cols-4",
  String.raw`lg:[&_.orbix-spec-panel\_\_head]:flex`,
  String.raw`lg:[&_.orbix-spec-panel\_\_head]:items-baseline`,
  String.raw`lg:[&_.orbix-spec-panel\_\_head]:gap-4`,
  String.raw`lg:[&_.orbix-spec-panel\_\_head]:py-4`,
  String.raw`lg:[&_.orbix-spec-panel\_\_title]:mt-0`,
  String.raw`lg:[&_.orbix-spec-panel\_\_foot]:row-start-1`,
  String.raw`lg:[&_.orbix-spec-panel\_\_foot]:col-start-2`,
  String.raw`lg:[&_.orbix-spec-panel\_\_foot]:flex`,
  String.raw`lg:[&_.orbix-spec-panel\_\_foot]:items-center`,
  String.raw`lg:[&_.orbix-spec-panel\_\_foot]:border-t-0`,
  String.raw`lg:[&_.orbix-spec-panel\_\_foot]:border-b`,
  String.raw`lg:[&_.orbix-spec-panel\_\_foot]:border-b-(--orbix-border)`,
].join(" ");

/**
 * PhotoHero from 64rem: the aside below the text, on the content's left
 * edge (under the H1), instead of in a 5-of-12 column beside it. For the
 * strip panel above.
 */
export const STOPGAP_PHOTO_HERO_ASIDE_BELOW = [
  String.raw`lg:[&_.orbix-photo-hero\_\_body[data-has-aside=true]]:grid-cols-1`,
  String.raw`lg:[&_.orbix-photo-hero\_\_aside]:justify-self-start`,
].join(" ");

/**
 * RecordRow in a profile hero: a 2x2 grid below 64rem (instead of wrapping
 * three and one), four across from 64rem, and values that never break
 * between the number and its unit.
 */
export const STOPGAP_RECORD_ROW = [
  String.raw`[&_.orbix-record-row\_\_item_dd]:whitespace-nowrap`,
  String.raw`[&_.orbix-record-row\_\_list]:grid-cols-2`,
  String.raw`lg:[&_.orbix-record-row\_\_list]:grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]`,
].join(" ");

/**
 * PhotoHero with a portrait photograph on the right, from 64rem: the photo
 * plate starts at the larger of 50% + 10rem and 46rem. That is the content
 * edge (the 72rem container's left edge plus its 2rem gutter) plus 44rem at
 * every width from 64rem, so the 44rem strip panel ends where the plate
 * begins and the 38rem lead and record row stay clear of it; its left edge is
 * feathered into the page over 22 percent of its width; and the overlay on
 * it keeps only the bottom fade. The spec's horizontal overlay is not
 * applied to the plate: it was drawn for a photo spanning the whole hero
 * and, squeezed onto the right half, it darkened the vehicle a second
 * time. No text sits on the photograph.
 */
export const STOPGAP_PHOTO_HERO_RIGHT = [
  String.raw`lg:[&_.orbix-photo-hero\_\_plate]:left-[max(calc(50%+10rem),46rem)]`,
  String.raw`lg:[&_.orbix-photo-hero\_\_plate]:[mask-image:linear-gradient(90deg,transparent_0,#000_22%)]`,
  String.raw`lg:[&_.orbix-photo-hero\_\_scrim]:[background:linear-gradient(to_bottom,transparent_62%,color-mix(in_srgb,var(--bg-page)_80%,transparent)_90%,var(--bg-page)_100%)]`,
].join(" ");

/** A photo crop per breakpoint: below 48rem, 48rem to 64rem, from 64rem. */
export interface ResponsiveObjectPosition {
  readonly base: string;
  readonly lg: string;
  readonly md: string;
}

/**
 * PhotoHero takes one `objectPosition`. Until it takes one per breakpoint,
 * this passes `var(--orbix-hero-pos)` as the crop and sets that variable on
 * the hero (through its public `className` and `style` props, not its
 * internal classes) to the base, 48rem and 64rem values. Spread `className`
 * and `style` onto the PhotoHero and pass `objectPosition` in its visual.
 */
export function responsiveHeroPosition(position: ResponsiveObjectPosition) {
  return {
    className: [
      "[--orbix-hero-pos:var(--orbix-hero-pos-base)]",
      "md:[--orbix-hero-pos:var(--orbix-hero-pos-md)]",
      "lg:[--orbix-hero-pos:var(--orbix-hero-pos-lg)]",
    ].join(" "),
    objectPosition: "var(--orbix-hero-pos)",
    style: {
      "--orbix-hero-pos-base": position.base,
      "--orbix-hero-pos-lg": position.lg,
      "--orbix-hero-pos-md": position.md,
    } as CSSProperties,
  };
}
