import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

interface EmptyStateProps extends ComponentPropsWithoutRef<"div"> {
  /** Optional, at most one secondary button. */
  action?: ReactNode;
  description: string;
  title: string;
}

/**
 * Empty state as plain text on the ground (spec 11): a heading, one
 * sentence, an optional action. No box.
 */
export function EmptyState({
  action,
  className,
  description,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cn("orbix-empty-state", className)} {...props}>
      <h3 className="orbix-h3 text-foreground">{title}</h3>
      <p className="mt-2 max-w-prose text-[length:var(--text-body-sm)] leading-6 text-muted">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
