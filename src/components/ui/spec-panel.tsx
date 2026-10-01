import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { formatFigure, isFigureValue } from "@/components/ui/readout";
import { cn } from "@/lib/cn";

/** One key figure. */
export interface SpecPanelItem {
  /** Sentence-case label, for example "Maximum speed". */
  readonly label: string;
  /** Formatted value, set in B612 Mono. Never fabricated. */
  readonly value: ReactNode;
  /** Unit after the value, a step smaller and muted, for example "ft". */
  readonly unit?: string;
  /** Second unit system or a qualifier, for example "15,240 m". */
  readonly secondary?: ReactNode;
  /**
   * `figure`: B612 Mono, tabular. `text`: Plex Sans 500, for a name or a
   * word ("Saturn V", "Retired"). Omitted, a value that starts with a digit,
   * a sign or "Mach" is a figure and any other string is text.
   */
  readonly kind?: "figure" | "text";
  /**
   * Set this figure larger. Use it for one to three primary figures at
   * most (spec 6).
   */
  readonly primary?: boolean;
}

export type SpecPanelProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "title"
> & {
  /**
   * Figures per row: 2 at every width, or 3 or 4 from 40rem (2 below).
   * Omitted, the list fills the width with 9.5rem columns. Below 24rem it
   * is always one column.
   */
  columns?: 2 | 3 | 4;
  /** One or two sentences under the title. */
  description?: ReactNode;
  /** A note under the figures, for example the source of the values. */
  footnote?: ReactNode;
  items: readonly SpecPanelItem[];
  /** Short plain label above the title, for example "Featured aircraft". */
  kicker?: string;
  /** Vehicle or subject name, in the condensed display cut. */
  title?: ReactNode;
  /** Heading element for `title`. Default `h2`. */
  titleAs?: "h2" | "h3" | "p";
};

/**
 * Key figures as an open definition list (spec 6): label above value,
 * values in B612 Mono, groups separated by space. No enclosure, no
 * compartments, no rules. Values never break from their unit, and values in
 * a row share a baseline when a label wraps.
 *
 * The component keeps its v2 name so existing imports compile; it no
 * longer draws a panel.
 */
export function SpecPanel({
  className,
  columns,
  description,
  footnote,
  items,
  kicker,
  title,
  titleAs: Title = "h2",
  ...props
}: SpecPanelProps) {
  const hasHead = Boolean(kicker || title || description);

  return (
    <section className={cn("orbix-spec", className)} {...props}>
      {hasHead ? (
        <div className="orbix-spec__head">
          {kicker ? <p className="orbix-spec__kicker">{kicker}</p> : null}
          {title ? <Title className="orbix-spec__title">{title}</Title> : null}
          {description ? (
            <p className="orbix-spec__description">{description}</p>
          ) : null}
        </div>
      ) : null}

      <dl className="orbix-spec__list" data-columns={columns}>
        {items.map((item) => (
          <div
            className="orbix-spec__item"
            data-primary={item.primary ? "true" : undefined}
            key={item.label}
          >
            <dt>{item.label}</dt>
            <dd className="orbix-spec__value" data-kind={valueKind(item)}>
              {formatFigure(item.value)}
              {item.unit ? (
                <span className="orbix-spec__unit">{item.unit}</span>
              ) : null}
            </dd>
            {item.secondary ? (
              <dd
                className="orbix-spec__secondary"
                data-kind={isFigureValue(item.secondary) ? undefined : "text"}
              >
                {formatFigure(item.secondary)}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>

      {footnote ? <div className="orbix-spec__note">{footnote}</div> : null}
    </section>
  );
}

function valueKind(item: {
  readonly kind?: "figure" | "text";
  readonly value: ReactNode;
}) {
  const kind = item.kind ?? (isFigureValue(item.value) ? "figure" : "text");
  return kind === "text" ? "text" : undefined;
}
