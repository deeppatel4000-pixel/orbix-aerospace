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
