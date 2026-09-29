import type { ReactNode } from "react";

import { formatIndexNumber } from "@/components/ui/section-index";
import { cn } from "@/lib/cn";

interface VehicleProfileSectionProps {
  children: ReactNode;
  className?: string;
  /** Optional one-sentence note under the heading. */
  description?: string;
  id: string;
  /**
   * Position in the page, shown as a B612 Mono "01" above the heading.
   * Omit for closing sections such as related vehicles.
   */
  index?: number;
  /**
   * `sheet` (default): a spec-sheet row, heading in the left four columns
   * and content in the right eight from 64rem. `wide`: heading above,
   * content across the full width.
   */
  layout?: "sheet" | "wide";
  title: string;
}

/**
 * One section of a vehicle profile (spec 9): `<section aria-labelledby>`
 * with the `.orbix-h2` as a direct child, laid out as a spec sheet with a
 * hairline top rule and generous spacing.
 */
export function VehicleProfileSection({
  children,
  className,
  description,
  id,
  index,
  layout = "sheet",
  title,
}: VehicleProfileSectionProps) {
  const titleId = `${id}-title`;
  const isSheet = layout === "sheet";

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        // `scroll-mt` clears the 64px site header and the section bar.
        // Numbered spec sheets sit 6rem apart (3rem above and below each
        // rule); a closing section such as related vehicles gets more room.
        "scroll-mt-32 border-t border-border",
        index !== undefined ? "py-10 sm:py-12" : "py-12 sm:py-18",
        isSheet &&
          "lg:grid lg:grid-cols-12 lg:grid-rows-[auto_auto_1fr] lg:gap-x-6",
        className,
      )}
      id={id}
    >
      {index !== undefined ? (
        <span
          aria-hidden="true"
          className={cn(
            "orbix-caps block text-accent",
            isSheet && "lg:col-span-4 lg:row-start-1",
          )}
        >
          {formatIndexNumber(index)}
        </span>
      ) : null}
      <h2
        className={cn(
          // A numbered spec sheet's heading is 2 to 2.5rem, set through the
          // h2 size token (`.orbix-h2` is declared after Tailwind's font
          // size utilities, so a `text-[...]` class would lose to it): six
          // or seven sections, some holding a one-row table, should not
          // read as a stack of equal headlines under an 80px hero name.
          // A closing section keeps the full page h2.
          "orbix-h2 text-foreground",
          index !== undefined && "[--text-h2:clamp(2rem,2.8vw,2.5rem)]",
          index !== undefined && "mt-3",
          isSheet && "lg:col-span-4 lg:row-start-2",
        )}
        id={titleId}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-4 max-w-[60ch] text-sm leading-6 text-pretty text-muted",
            isSheet && "lg:col-span-4 lg:row-start-3 lg:self-start lg:pr-6",
          )}
        >
          {description}
        </p>
      ) : null}
      <div
        className={cn(
          "mt-8 min-w-0",
          isSheet &&
            "lg:col-span-8 lg:col-start-5 lg:row-span-3 lg:row-start-1 lg:mt-0",
        )}
      >
        {children}
      </div>
    </section>
  );
}
