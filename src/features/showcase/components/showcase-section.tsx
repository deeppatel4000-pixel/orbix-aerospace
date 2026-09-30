import type { ReactNode } from "react";

import { LegalSection } from "@/features/legal/components/legal-section";
import { cn } from "@/lib/cn";

interface ShowcaseSectionProps {
  readonly children: ReactNode;
  readonly id: string;
  readonly lead?: ReactNode;
  readonly title: string;
}

/**
 * One numbered section of the showcase, set as a major section of the
 * shared editorial reading layout (`LegalSection` inside `ReadingPage`, as
 * on /verification): the number comes from the page's section counter, so
 * it always matches the "On this page" list. The lead keeps the reading
 * measure; figures and tables in `children` take the full reading track.
 */
export function ShowcaseSection({
  children,
  id,
  lead,
  title,
}: ShowcaseSectionProps) {
  return (
    <LegalSection id={id} major title={title}>
      {lead ? <p>{lead}</p> : null}
      {/* Figures, keys and tables set their own lists: the reading
          layout's prose list markers, indents and measure stop here. */}
      <div className="mt-6 min-w-0 sm:mt-8 [&_:is(ul,ol)]:max-w-none! [&_:is(ul,ol)]:list-none! [&_:is(ul,ol)]:pl-0! [&_li+li]:mt-0!">
        {children}
      </div>
    </LegalSection>
  );
}

/**
 * Running text inside a section, held to the 68ch measure.
 */
export function ShowcaseText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("max-w-[68ch]", className)}>{children}</div>;
}
