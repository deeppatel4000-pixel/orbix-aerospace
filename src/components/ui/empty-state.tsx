import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { OrbixMark } from "@/components/brand/orbix-mark";
import { cn } from "@/lib/cn";

interface EmptyStateProps extends ComponentPropsWithoutRef<"div"> {
  action?: ReactNode;
  description: string;
  title: string;
}

export function EmptyState({
  action,
  className,
  description,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cn("orbix-empty-state", className)} {...props}>
      <OrbixMark aria-hidden="true" className="h-11 w-11 text-accent/70" />
      <p className="font-display mt-5 text-xl font-semibold tracking-[-0.02em]">
        {title}
      </p>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
