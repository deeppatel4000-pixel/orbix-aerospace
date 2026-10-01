import { cn } from "@/lib/cn";

/**
 * Button variants (design v3, spec 9). Five variants share one class
 * system; `Button` and `ButtonLink` default to `primary`.
 *
 * - `primary`: solid division colour with page-ground text; the fill
 *   lightens on hover. One per view, for the main action.
 * - `secondary`: 1px `--rule-strong` outline, no fill; the outline turns to
 *   ink on hover. With `aria-pressed="true"` the outline turns to the
 *   division colour (toggle buttons).
 * - `tertiary`: an underlined text link (1px, 3px offset, division-colour
 *   underline) with an arrow. Keeps the 44px target; pair it with `arrow`.
 * - `ghost`: a quiet toolbar control in muted ink, no outline, ink on
 *   hover. 44px target.
 * - `link`: an inline accent link inside running text, no minimum height
 *   and no padding.
 *
 * Every variant except `link` is at least 44px tall. Boxed variants have a
 * 2px radius. Hover changes colour only: nothing lifts, scales or moves.
 * None is a pill, a gradient, a glow or a shadow.
 */
export type ButtonVariant =
  "ghost" | "link" | "primary" | "secondary" | "tertiary";

/**
 * `default` is 44px tall; `lg` is 48px with wider padding, for a single
 * hero action.
 */
export type ButtonSize = "default" | "lg";

interface ButtonClassOptions {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

/**
 * Class string for anything that must look like a button but cannot use the
 * `Button` or `ButtonLink` components (for example a `<summary>` or a third
 * party element).
 */
export function buttonClass({
  className,
  size = "default",
  variant = "primary",
}: ButtonClassOptions = {}) {
  return cn(
    "orbix-button",
    `orbix-button--${variant}`,
    size === "lg" && "orbix-button--lg",
    className,
  );
}
