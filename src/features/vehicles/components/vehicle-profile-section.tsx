import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface VehicleProfileSectionProps {
  children: ReactNode;
  className?: string;
  /** Optional one-sentence note under the heading. */
  description?: ReactNode;
  id: string;
  title: string;
}

/**
 * One section of a vehicle profile (spec 6, 11): `<section
 * aria-labelledby>` with an unnumbered H2, an optional note, then the
 * content on the ground. Sections are separated by one 1px rule and space;
 * nothing is boxed.
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
        // `scroll-mt` clears the 64px site header.
        "scroll-mt-24 border-t border-border py-12 sm:py-14",
        className,
      )}
      id={id}
    >
      <h2
        className="orbix-h2 text-foreground [--text-h2:clamp(1.875rem,2.6vw,2.375rem)]"
        id={titleId}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-[62ch] text-pretty text-muted">
          {description}
        </p>
      ) : null}
      <div className="mt-8 min-w-0">{children}</div>
    </section>
  );
}
