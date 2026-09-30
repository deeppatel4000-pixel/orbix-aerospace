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
 * - PhotoHero: `placement="banner"` (the photo
 *   across the top with the text starting on its bottom fade), a phone
 *   plate at the photo's own aspect, and separate mobile and desktop
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
 * portrait photograph stands on the right (PhotoHero `placement="right"`):
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
 * RecordRow in a profile hero: a 2x2 grid (instead of wrapping three and
 * one) and values that never break between the number and its unit. Beside
 * an aircraft photograph the column is 31 to 32rem, so the row stays 2x2 at
 * every width; a 133px column wrapped "Maximum speed" and dropped its value
 * below the others.
 */
export const STOPGAP_RECORD_ROW = [
  String.raw`[&_.orbix-record-row\_\_item_dd]:whitespace-nowrap`,
  String.raw`[&_.orbix-record-row\_\_list]:grid-cols-2`,
].join(" ");

/**
 * With `STOPGAP_RECORD_ROW`, in the aircraft profile hero: the four figures
 * in one row from 64rem, as on the launch vehicle profiles. From 64rem to
 * 80rem the column is `min(46rem, 58vw)` wide; from 80rem it is 32rem, and
 * a 0.75rem inset lets "Service ceiling" and "50,000+ ft" fit a quarter of
 * it. Two by two below 64rem.
 */
export const STOPGAP_RECORD_ROW_SIDE = [
  "xl:[--record-inset:0.75rem]",
  String.raw`lg:[&_.orbix-record-row\_\_list]:grid-cols-4`,
].join(" ");

/**
 * With `STOPGAP_RECORD_ROW`, beside a portrait photograph (a 38rem column):
 * the figures in one row from 64rem.
 */
export const STOPGAP_RECORD_ROW_WIDE = String.raw`lg:[&_.orbix-record-row\_\_list]:grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]`;

/**
 * The aircraft profile hero, for a landscape photograph whose airframe
 * reaches close to its edges. Set `--orbix-hero-aspect` (the photograph's
 * width over its height) on the hero with this class. Below 48rem the
 * PhotoHero 4:3 phone plate is unchanged.
 *
 * - 48rem to 80rem, a banner, as on the `/aircraft` registry hero: the
 *   photograph full-bleed across the top at
 *   `min(70svh, 44rem, 100vw / aspect)`, never taller than the photograph
 *   at the window's width, so it is not cropped at the sides; only a
 *   bottom fade, and the text starting on the fade over the photograph's
 *   last 6rem.
 * - From 80rem, full-bleed: no frame, no radius, no registration marks.
 *   The photograph runs from the hero's top to its bottom fade and off the
 *   right edge of the window, behind the right of the content. Its left
 *   edge sits 26rem into the content with a feathered mask, so the
 *   airframe stands right of about 55 percent and the 32rem text column
 *   is set on the page ground and the transparent start of the feather.
 *   A photograph as wide as the whole hero put the text over the
 *   airframe: the SR-71 and B-2 fill 15 to 95 percent of their frames, and
 *   `object-fit: cover` cannot move a subject right of its own position.
 *   The hero is at least as tall as the photograph at that width, so it is
 *   cropped only when the text column is taller. The credit is at the
 *   bottom right on the content edge (PhotoHero's default).
 */
export const STOPGAP_PHOTO_HERO_SIDE = [
  "[--orbix-hero-banner-h:min(70svh,44rem,calc(100vw/var(--orbix-hero-aspect,1.5)))]",
  "md:max-xl:min-h-0 md:max-xl:justify-start",
  String.raw`md:max-xl:[&_.orbix-photo-hero\_\_plate]:bottom-auto`,
  String.raw`md:max-xl:[&_.orbix-photo-hero\_\_plate]:h-(--orbix-hero-banner-h)`,
  String.raw`md:max-xl:[&_.orbix-photo-hero\_\_scrim]:[background:linear-gradient(to_bottom,transparent_55%,color-mix(in_srgb,var(--bg-page)_55%,transparent)_72%,color-mix(in_srgb,var(--bg-page)_92%,transparent)_84%,var(--bg-page)_92%)]`,
  String.raw`md:max-xl:[&_.orbix-photo-hero\_\_body]:pt-[calc(var(--orbix-hero-banner-h)-6rem)]`,
  "xl:[container-type:inline-size]",
  "xl:min-h-0",
  "xl:[--orbix-hero-plate-left:calc((100cqw-72rem)/2+2rem+26rem)]",
  String.raw`xl:[&_.orbix-photo-hero\_\_body]:min-h-[calc((100cqw-var(--orbix-hero-plate-left))/var(--orbix-hero-aspect,1.5))]`,
  String.raw`xl:[&_.orbix-photo-hero\_\_plate]:left-(--orbix-hero-plate-left)`,
  String.raw`xl:[&_.orbix-photo-hero\_\_plate]:[mask-image:linear-gradient(90deg,transparent_0,color-mix(in_srgb,var(--bg-page)_25%,transparent)_12%,color-mix(in_srgb,var(--bg-page)_70%,transparent)_24%,var(--bg-page)_36%)]`,
  String.raw`xl:[&_.orbix-photo-hero\_\_scrim]:[background:linear-gradient(to_bottom,transparent_70%,color-mix(in_srgb,var(--bg-page)_80%,transparent)_92%,var(--bg-page)_100%)]`,
  String.raw`xl:[&_.orbix-photo-hero\_\_content]:max-w-[32rem]`,
].join(" ");

/**
 * The aircraft registry hero from 48rem to 80rem: the photograph as a
 * banner at `min(70svh, 44rem)` with the text starting on its bottom fade.
 * Below 80rem the full-width overlay darkened the B-2 almost to black and
 * the spec panel covered its right wing; from 80rem the photograph runs
 * behind the text (spec 8) with the panel over open ocean.
 */
export const STOPGAP_PHOTO_HERO_BANNER_TABLET = [
  "md:max-xl:min-h-0 md:max-xl:justify-start",
  String.raw`md:max-xl:[&_.orbix-photo-hero\_\_plate]:bottom-auto`,
  String.raw`md:max-xl:[&_.orbix-photo-hero\_\_plate]:h-[min(70svh,44rem)]`,
  String.raw`md:max-xl:[&_.orbix-photo-hero\_\_scrim]:[background:linear-gradient(to_bottom,transparent_55%,color-mix(in_srgb,var(--bg-page)_55%,transparent)_72%,color-mix(in_srgb,var(--bg-page)_92%,transparent)_84%,var(--bg-page)_92%)]`,
  String.raw`md:max-xl:[&_.orbix-photo-hero\_\_body]:pt-[calc(min(70svh,44rem)-6rem)]`,
].join(" ");

/**
 * Below 48rem, a framed 3:4 plate instead of the 4:5 portrait plate, with
 * a phone crop per vehicle (`heroPhoneObjectPosition` in the rocket
 * visuals) that keeps the whole vehicle in view. A 2:3 plate, the
 * photographs' own aspect, pushed the heading below the first screen of a
 * 390px phone. The plate keeps PhotoHero's height cap.
 */
export const STOPGAP_PHOTO_HERO_PHONE_TALL = String.raw`max-md:[&_.orbix-photo-hero\_\_frame]:aspect-[3/4]`;

/**
 * A photo crop per breakpoint: below 48rem, 48rem to 64rem, from 64rem and
 * (optionally) from 80rem.
 */
export interface ResponsiveObjectPosition {
  readonly base: string;
  readonly lg: string;
  readonly md: string;
  readonly xl?: string;
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
      "xl:[--orbix-hero-pos:var(--orbix-hero-pos-xl)]",
    ].join(" "),
    objectPosition: "var(--orbix-hero-pos)",
    style: {
      "--orbix-hero-pos-base": position.base,
      "--orbix-hero-pos-lg": position.lg,
      "--orbix-hero-pos-md": position.md,
      "--orbix-hero-pos-xl": position.xl ?? position.lg,
    } as CSSProperties,
  };
}
