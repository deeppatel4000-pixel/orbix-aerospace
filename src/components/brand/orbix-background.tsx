import { cn } from "@/lib/cn";

interface OrbixBackgroundProps {
  className?: string;
  /** Deprecated and ignored. */
  variant?: "orbital" | "technical";
}

/**
 * Deprecated. The star field, grid, orbit drawing and glow this used to
 * paint are removed (spec 15.2): pages sit on the plain page ground. It
 * renders an empty decorative element so existing imports keep compiling
 * until page tasks remove them; phase C deletes the component.
 */
export function OrbixBackground({ className }: OrbixBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      data-orbix-background="none"
    />
  );
}
