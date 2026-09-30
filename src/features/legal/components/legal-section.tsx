import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface LegalSectionProps {
  readonly children: ReactNode;
  readonly id: string;
  /**
   * A major division that holds its own h3 subsections (verification): a
   * stronger rule and more space, so the break between sections reads
   * larger than the break between the subsections inside one.
   */
  readonly major?: boolean;
  readonly title: string;
}

/**
 * One numbered h2 section of a reading page, addressable by `#id`.
 *
 * A hairline rule separates it from the section before. The number above
 * the heading comes from the `orbix-section` counter that `ReadingPage`
 * resets, set in B612 Mono accent like the "On this page" list. It uses the
 * `content: ... / ""` form so assistive technology does not read it into the
 * heading name (the list already conveys the order). Paragraphs and lists
 * share one absolute measure, 38.25rem (60ch of 17px Plex, about 612px),
 * so small notes and table captions end on the same right edge as the
 * running text; tables and figures take the full width of the column.
 *
 * Ordinary sections set the H2 at 2rem so a heading over one or two short
 * paragraphs does not outweigh them. Major sections set the H2 at 2rem to
 * 2.5rem (never below 2rem, so it stays clearly above the h3 cases inside
 * on phones) and a control-weight rule. Above that rule sit the previous section's
 * 1.5rem bottom padding plus a 3.5rem (4rem from 40rem up) top margin, about
 * 80 to 88px. Below it sit 3 to 3.5rem of padding before the number, so the
 * rule sits nearer the section it opens and a break between groups reads larger
 * than a break between the h3 cases inside. The margin is `!important`
 * because `.orbix-prose > * + *` sets `margin-top: 1em` at equal
 * specificity later in the cascade; `not-first:` keeps the first section
 * flush with the top of the column and the "On this page" rail.
 */
export function LegalSection({
  children,
  id,
  major = false,
  title,
}: LegalSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "flex scroll-mt-24 flex-col gap-4 border-t [counter-increment:orbix-section] first:border-t-0 first:pt-0 [&_:is(p,ul,ol)]:max-w-[38.25rem]",
        major
          ? "border-border-control pt-12 pb-6 not-first:mt-14! sm:pt-14 sm:not-first:mt-16!"
          : "border-border-subtle pt-10 pb-6",
      )}
      id={id}
    >
      <h2
        className={cn(
          "mt-0! before:mb-4 before:block before:font-mono before:text-[0.75rem] before:font-normal before:tracking-[0.12em] before:text-accent before:content-[counter(orbix-section,decimal-leading-zero)_/_'']",
          major
            ? "text-[length:clamp(2rem,4vw,2.5rem)]!"
            : "text-[length:clamp(1.75rem,3vw,2rem)]! leading-[1.08]! font-semibold! tracking-[-0.03em]!",
        )}
        id={headingId}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
