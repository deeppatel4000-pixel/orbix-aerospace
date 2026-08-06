import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

interface ProgressIndicatorProps extends Omit<
  ComponentPropsWithoutRef<"progress">,
  "children"
> {
  label: string;
  valueLabel?: string;
}

export function ProgressIndicator({
  className,
  label,
  valueLabel,
  ...props
}: ProgressIndicatorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-4 font-mono text-[0.65rem] tracking-[0.1em] text-muted uppercase">
        <span>{label}</span>
        {valueLabel ? (
          <span className="text-foreground">{valueLabel}</span>
        ) : null}
      </div>
      <progress aria-label={label} className="orbix-progress" {...props} />
    </div>
  );
}
