import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface VehicleProfileSectionProps {
  children: ReactNode;
  className?: string;
  /** Optional one-sentence note under the heading. */
  description?: string;
  id: string;
  title: string;
}

/**
 * One section of a vehicle profile (spec 14): `<section aria-labelledby>`,
 * an `.orbix-h2` and a subtle top rule. Every section on a profile uses this;
 * there are no layout modes.
 */
export function VehicleProfileSection({
  children,
  className,
  description,
  id,
  title,
}: VehicleProfileSectionProps) {
  const titleId = `${id}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        // The 64px gap between sections comes from the profile's main
        // column. `scroll-mt` clears the 3.5rem site header on anchor jumps.
        "scroll-mt-18 border-t border-border-subtle pt-8 first:border-t-0 first:pt-0",
        className,
      )}
      id={id}
    >
      <h2 className="orbix-h2 text-foreground" id={titleId}>
        {title}
      </h2>
      {description ? (
        <p className="mt-3 max-w-prose text-muted">{description}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}
