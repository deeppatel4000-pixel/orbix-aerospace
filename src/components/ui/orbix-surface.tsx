import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type OrbixSurfaceElement = "article" | "aside" | "div" | "section";

/**
 * Deprecated. Every variant now renders the same flat panel (spec 10); the
 * prop is accepted and ignored until phase C removes it.
 */
type OrbixSurfaceVariant =
  | "engineering"
  | "gallery"
  | "hero"
  | "mission"
  | "report"
  | "telemetry"
  | "vehicle";

interface OrbixSurfaceProps extends ComponentPropsWithoutRef<"div"> {
  as?: OrbixSurfaceElement;
  interactive?: boolean;
  variant?: OrbixSurfaceVariant;
}

/** The flat panel: surface fill, 1px border, 6px radius, no shadow. */
export function OrbixSurface({
  as: Component = "div",
  className,
  interactive = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant,
  ...props
}: OrbixSurfaceProps) {
  return (
    <Component
      className={cn(
        "orbix-surface",
        interactive && "orbix-surface--interactive",
        className,
      )}
      {...props}
    />
  );
}
