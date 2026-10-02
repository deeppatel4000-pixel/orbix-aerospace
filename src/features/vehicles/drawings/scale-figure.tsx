import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface ScaleFigureProps {
  caption: ReactNode;
  /** The drawing, one SVG per layout, each shown at its own widths. */
  children: ReactNode;
  className?: string;
  figureNumber?: string;
}

/**
 * A scale drawing on the page ground (spec 6, 8): no frame, no plate, the
 * catalog caption under it. Each drawing is laid out again for a narrow
 * screen at the same kind of scale, so nothing scrolls sideways and the
 * figures never set below 11px.
 */
export function ScaleFigure({
  caption,
  children,
  className,
  figureNumber,
}: ScaleFigureProps) {
  return (
    <figure className={cn("orbix-figure min-w-0", className)}>
      {children}
      <figcaption className="orbix-caption">
        {figureNumber ? (
          <span className="orbix-caption__number">Fig. {figureNumber}</span>
        ) : null}
        {caption}
      </figcaption>
    </figure>
  );
}
