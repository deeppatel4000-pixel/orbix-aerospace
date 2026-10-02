import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

export type TagProps = ComponentPropsWithoutRef<"span"> & {
  /**
   * `accent` sets the text in the division color, for a classification
   * that identifies the section. `neutral` (default) is muted ink.
   */
  tone?: "accent" | "neutral";
};

/**
 * A non-interactive label, as plain text (spec 3.2, 3.6): Plex Sans 13px
 * 500, sentence case, no outline, no fill. Write the words in sentence case;
 * uppercase only for abbreviations (LEO, NASA). A clickable filter is a
 * secondary `Button` with `aria-pressed`, not a tag.
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
