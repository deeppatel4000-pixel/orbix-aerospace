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
 * One h2 section of a reading page, addressable by `#id`. No number (spec
 * 3.7): the heading and the space above it carry the break.
 *
 * Ordinary sections are separated by whitespace alone and set the H2 at
 * 1.75rem to 2rem, so a heading over one or two short paragraphs does not
 * outweigh them. Major sections (verification, the manual-like page) open
 * with a 2px, 48px lab-colour rule above the heading (spec 4 and 6), more
 * space and a larger H2 of 2rem to 2.5rem, so the break between groups
 * reads larger than the break between the h3 cases inside. The legal pages
 * stay plain. The
 * margin is `!important` because `.orbix-prose > * + *` sets `margin-top:
 * 1em` at equal specificity later in the cascade; `not-first:` keeps the
 * first section flush with the top of the column and the "On this page"
 * rail. Paragraphs and lists share one absolute measure, 38.25rem (60ch of
 * 17px Plex, about 612px); tables and figures take the full column width.
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
        "flex scroll-mt-24 flex-col gap-4 [&_:is(p,ul,ol)]:max-w-[38.25rem]",
        major
          ? "pb-6 not-first:mt-20! sm:not-first:mt-24!"
          : "pb-6 not-first:mt-10! sm:not-first:mt-12!",
      )}
      id={id}
    >
      {major ? (
        <span aria-hidden="true" className="block h-0.5 w-12 bg-accent-lab" />
      ) : null}
      <h2
        className={cn(
          "mt-0!",
          major
            ? "text-[length:clamp(2rem,4vw,2.5rem)]!"
            : "text-[length:clamp(1.75rem,3vw,2rem)]! leading-[1.08]!",
        )}
        id={headingId}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
