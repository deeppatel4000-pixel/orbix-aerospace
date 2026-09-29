import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

/** One numbered row of a section index. */
export interface SectionIndexItem {
  /** Row title, in the condensed display cut. */
  readonly title: string;
  /** Destination. When set, the title link covers the whole row. */
  readonly href?: string;
  /** One or two sentences under the title. */
  readonly description?: ReactNode;
  /** A short fact under the description, for example "33 calculators". */
  readonly meta?: ReactNode;
  /** Stable key; defaults to `href`, then `title`. */
  readonly id?: string;
}

export type SectionIndexProps = ComponentPropsWithoutRef<"ol"> & {
  /** Heading element for each row title. Default `h3`. */
  headingAs?: "h2" | "h3" | "h4";
  items: readonly SectionIndexItem[];
  /** First number shown. Default 1, so rows read 01, 02, 03 and so on. */
  start?: number;
};

/** Zero-padded two-digit row number: 1 becomes "01". */
export function formatIndexNumber(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Numbered rows (01 to 06 in B612 Mono accent) with hairline rules (spec
 * 8), for the home page and Learn. It is an ordered list, so the visible
 * numbers are decorative and hidden from assistive technology. A row with
 * `href` is a single tab stop: the title link stretches over the row.
 */
export function SectionIndex({
  className,
  headingAs: Heading = "h3",
  items,
  start = 1,
  ...props
}: SectionIndexProps) {
  return (
    <ol
      className={cn("orbix-section-index", className)}
      start={start === 1 ? undefined : start}
      {...props}
    >
      {items.map((item, index) => (
        <li
          className="orbix-section-index__row"
          key={item.id ?? item.href ?? item.title}
        >
          <span aria-hidden="true" className="orbix-section-index__number">
            {formatIndexNumber(start + index)}
          </span>
          <div className="min-w-0">
            <Heading className="orbix-section-index__title">
              {item.href ? (
                <Link href={item.href}>{item.title}</Link>
              ) : (
                item.title
              )}
            </Heading>
            {item.description ? (
              <p className="orbix-section-index__description">
                {item.description}
              </p>
            ) : null}
            {item.meta ? (
              <p className="orbix-section-index__meta">{item.meta}</p>
            ) : null}
          </div>
          {item.href ? (
            <ArrowRight
              aria-hidden="true"
              className="orbix-section-index__arrow"
              focusable="false"
              size={20}
              strokeWidth={1.5}
            />
          ) : (
            <span aria-hidden="true" />
          )}
        </li>
      ))}
    </ol>
  );
}
