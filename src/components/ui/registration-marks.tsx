import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";

export interface RegistrationMarksProps {
  className?: string;
  /**
   * Distance from the positioned parent's edges, as a CSS `inset` value
   * (for example `"0.75rem"` or `"1rem 0.5rem"`). Defaults to `0`.
   */
  inset?: string;
}

/**
 * Four 8px corner ticks, 1px in the control colour, like the frame of a
 * technical drawing (spec 6). Purely decorative and hidden from assistive
 * technology. Place it inside a `position: relative` frame: hero photos and
 * showcase diagrams. Never a clip-path chamfer.
 */
export function RegistrationMarks({
  className,
  inset,
}: RegistrationMarksProps) {
  const style = inset ? ({ "--reg-inset": inset } as CSSProperties) : undefined;

  return (
    <span
      aria-hidden="true"
      className={cn("orbix-reg-marks", className)}
      style={style}
    >
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}
