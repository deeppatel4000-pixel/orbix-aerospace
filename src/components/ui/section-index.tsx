import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

/** One row of a section index. */
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

export type SectionIndexProps = ComponentPropsWithoutRef<"ul"> & {
  /** Heading element for each row title. Default `h3`. */
  headingAs?: "h2" | "h3" | "h4";
  items: readonly SectionIndexItem[];
  /**
   * @deprecated v3 drops the decorative row numbers (spec 3.7). Accepted
   * and ignored so existing calls compile.
   */
  start?: number;
};

/**
 * Zero-padded two-digit number: 1 becomes "01". Only for real reference
 * numbers such as Engineering Lab tool IDs (spec 3.7), never to decorate a
 * list or a section heading.
 */
export function formatIndexNumber(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * A plain ruled list (spec 6, 11): each row a title in the condensed
 * display cut, an optional description and fact, and an arrow when the row
 * links somewhere. Rows are separated by 1px rules; there are no numbers.
 * A row with `href` is a single tab stop: the title link stretches over the
 * row, and hover underlines the title.
 */
export function SectionIndex({
  className,
  headingAs: Heading = "h3",
  items,
  start,
  ...props
}: SectionIndexProps) {
  void start; // retired prop, accepted for compatibility
  return (
    <ul className={cn("orbix-section-index", className)} {...props}>
      {items.map((item) => (
        <li
          className="orbix-section-index__row"
          key={item.id ?? item.href ?? item.title}
        >
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
    </ul>
  );
}
