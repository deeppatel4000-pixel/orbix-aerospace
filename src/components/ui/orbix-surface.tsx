import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type OrbixSurfaceElement = "article" | "aside" | "div" | "section";
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

export function OrbixSurface({
  as: Component = "div",
  className,
  interactive = false,
  variant = "telemetry",
  ...props
}: OrbixSurfaceProps) {
  return (
    <Component
      className={cn(
        "orbix-surface",
        `orbix-surface--${variant}`,
        interactive && "orbix-surface--interactive",
        className,
      )}
      data-orbix-surface={variant}
      {...props}
    />
  );
}
