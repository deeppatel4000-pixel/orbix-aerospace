import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

/**
 * A technical drawing on the page ground (spec 6, 8): a plain `<figure>`
 * with no frame, fill, radius or corner marks, so the linework sits on the
 * sheet like a drawing in a manual. Pass the caption as a child
 * `<figcaption className="orbix-caption">` below the drawing, and name the
 * figure with `aria-labelledby`.
 */
export function DiagramPlate({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"figure">) {
  return (
    <figure className={cn("orbix-figure m-0", className)} {...props}>
      {children}
    </figure>
  );
}
