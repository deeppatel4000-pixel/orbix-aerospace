import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

export type TagProps = ComponentPropsWithoutRef<"span"> & {
  /**
   * `accent` draws the tag in the division accent, for a classification
   * that identifies the section. `neutral` (default) is for everything else.
   */
  tone?: "accent" | "neutral";
};

/**
 * A non-interactive label (spec 7): 2px radius, 1px outline, B612 Mono
 * uppercase at 11px, never a pill. A clickable filter is a secondary
 * `Button` with `aria-pressed`, not a tag.
 */
export function Tag({ className, tone = "neutral", ...props }: TagProps) {
  return (
    <span
      className={cn(
        "orbix-tag",
        tone === "accent" && "orbix-tag--accent",
        className,
      )}
      {...props}
    />
  );
}
