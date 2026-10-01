import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

export type EyebrowProps = ComponentPropsWithoutRef<"p"> & {
  /**
   * Element to render. `p` by default; `span` inside inline contexts; `h2`
   * only when an outline really needs it. The kicker is a label, not the
   * heading: the display line after it is the heading.
   */
  as?: "h2" | "p" | "span";
};

/**
 * The page kicker (spec 3.8): one short line of plain sentence-case text in
 * the muted ink, with no rule, no accent and no uppercase. At most one per
 * page, and only where it carries information the heading does not (the
 * breadcrumbs already give the section). Kept under its v2 name so existing
 * imports compile; most v2 eyebrows should be deleted rather than kept.
 */
export function Eyebrow({
  as: Element = "p",
  className,
  ...props
}: EyebrowProps) {
  return <Element className={cn("orbix-eyebrow", className)} {...props} />;
}
