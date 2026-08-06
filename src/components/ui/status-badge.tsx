import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type StatusTone = "caution" | "critical" | "info" | "neutral" | "positive";

interface StatusBadgeProps extends ComponentPropsWithoutRef<"span"> {
  tone?: StatusTone;
}

export function StatusBadge({
  className,
  tone = "neutral",
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "orbix-status",
        tone !== "neutral" && `orbix-status--${tone}`,
        className,
      )}
      {...props}
    />
  );
}
