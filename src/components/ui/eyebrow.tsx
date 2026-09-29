import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

export type EyebrowProps = ComponentPropsWithoutRef<"p"> & {
  /**
   * Element to render. `p` by default. The eyebrow is a label, not the
   * heading: the display line after it is the page's H1 (on the 404,
   * "Off course." is the H1 and "Page not found" is a plain eyebrow). Use `span`
   * inside inline contexts; `h2` only when an outline really needs it.
   */
  as?: "h2" | "p" | "span";
};

/**
 * A 24px accent rule followed by a sans 13px 500 label in secondary text,
 * sentence case (spec 8). Use it only above a page H1 or a major section
 * H2, never above every block, and never with `//` separators.
 */
export function Eyebrow({
  as: Element = "p",
  className,
  ...props
}: EyebrowProps) {
  return <Element className={cn("orbix-eyebrow", className)} {...props} />;
}
