import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { formatIndexNumber } from "@/components/ui/section-index";
import { cn } from "@/lib/cn";

interface ShowcaseSectionProps {
  readonly children: ReactNode;
  /** Extra classes for the section, for example a tighter top padding. */
  readonly className?: string;
  readonly id: string;
  readonly lead?: ReactNode;
  /** Position on the page, shown as a two-digit section number. */
  readonly number: number;
  readonly title: string;
}

/**
 * One section of the showcase (spec 9, editorial pages): a hairline, the
 * section number in B612 Mono beside the H2, and a lead held to the 68ch
 * reading measure. The children decide their own track: running text stays
 * in `ShowcaseText`; figures and tables use the full container width.
 */
export function ShowcaseSection({
  children,
  className,
  id,
  lead,
  number,
  title,
}: ShowcaseSectionProps) {
  const titleId = `${id}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className={cn("scroll-mt-20 pt-16 sm:pt-24", className)}
      id={id}
    >
      <Container>
        <div className="border-t border-border pt-6 sm:pt-8">
          {/* From 40rem the number sits on the heading's first baseline,
              like a drawing reference on the title line. */}
          <div className="grid gap-3 sm:grid-cols-[4rem_minmax(0,1fr)] sm:items-baseline sm:gap-x-4">
            <p aria-hidden="true" className="orbix-data text-accent">
              {formatIndexNumber(number)}
            </p>
            <div className="max-w-[68ch]">
              <h2 className="orbix-h2 text-text-primary" id={titleId}>
                {title}
              </h2>
              {lead ? <p className="orbix-prose mt-5">{lead}</p> : null}
            </div>
          </div>
          <div className="mt-10 sm:mt-12">{children}</div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Running text inside a section: indented to line up with the heading from
 * 40rem, and held to the 68ch measure.
 */
export function ShowcaseText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-[68ch] sm:ml-20", className)}>{children}</div>
  );
}
