import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type TagProps = ComponentPropsWithoutRef<"span">;

/**
 * A non-interactive label (spec 10): 2px radius, 1px border, no fill. A
 * clickable filter is a secondary `Button` with `aria-pressed`, not a tag.
 */
export function Tag({ className, ...props }: TagProps) {
  return <span className={cn("orbix-tag", className)} {...props} />;
}
