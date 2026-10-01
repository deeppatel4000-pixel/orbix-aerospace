import type { CSSProperties } from "react";

/**
 * A photo crop per layout (spec 7: crops are art-directed per image and
 * breakpoint): `base` below 64rem, where every `PhotoHero` is a band under
 * the text, and `lg` from 64rem, where a split hero sets the photograph as
 * a plate beside the text.
 */
export interface HeroCrop {
  readonly base: string;
  readonly lg: string;
}

/**
 * `PhotoHero` takes one `objectPosition`, which may be a CSS variable. This
 * passes `var(--hero-crop)` as the crop and sets the variable on the hero
 * through its public `className` and `style` props. Spread `className` and
 * `style` onto the `PhotoHero` and pass `objectPosition` in its visual.
 */
export function heroCrop(crop: HeroCrop) {
  return {
    className:
      "[--hero-crop:var(--hero-crop-base)] lg:[--hero-crop:var(--hero-crop-lg)]",
    objectPosition: "var(--hero-crop)",
    style: {
      "--hero-crop-base": crop.base,
      "--hero-crop-lg": crop.lg,
    } as CSSProperties,
  };
}

/**
 * A portrait plate beside the text (from 64rem) in the photograph's own
 * proportions, as tall as the screen under the header allows and at most
 * half the viewport wide, so the whole vehicle stands in view uncropped
 * and the plate reads as a plate, not an inset. A 2:3 photograph stays
 * near 36 percent of a 1440 by 900 screen: widening it further would cut
 * the nose or the pad. Spread `className` and `style` onto the
 * `PhotoHero` with `plate="portrait"`.
 */
export function portraitPlate(size: {
  readonly height: number;
  readonly width: number;
}) {
  return {
    className:
      "lg:[&>figure>div:first-child]:aspect-(--plate-ratio) lg:[&>figure>div:first-child]:h-[min(calc(100svh_-_var(--header-height)_-_5rem),56rem)] lg:[&>figure>div:first-child]:max-w-[50vw]",
    style: {
      "--plate-ratio": `${size.width} / ${size.height}`,
    } as CSSProperties,
  };
}
