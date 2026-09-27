import { cn } from "@/lib/cn";

/**
 * Button variants (spec 8). `tertiary` is the deprecated name for `ghost`
 * and is accepted until phase C.
 */
export type ButtonVariant =
  "ghost" | "link" | "primary" | "secondary" | "tertiary";

export type ButtonSize = "default" | "lg";

interface ButtonClassOptions {
  className?: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

/**
 * Class string for anything that must look like a button but cannot use the
 * `Button` or `ButtonLink` components (for example a `<summary>` or a third
 * party element). Square-ish 4px corners, flat fills, no pill shapes.
 */
export function buttonClass({
  className,
  size = "default",
  variant = "primary",
}: ButtonClassOptions = {}) {
  const resolved = variant === "tertiary" ? "ghost" : variant;

  return cn(
    "orbix-button",
    `orbix-button--${resolved}`,
    size === "lg" && "orbix-button--lg",
    className,
  );
}
