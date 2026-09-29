import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { formatFigure } from "@/components/ui/readout";
import { cn } from "@/lib/cn";

/** One compartment of a spec panel. */
export interface SpecPanelItem {
  /** Uppercase B612 Mono label, for example "Maximum speed". */
  readonly label: string;
  /** Formatted value, set as the large readout. Never fabricated. */
  readonly value: ReactNode;
  /** Unit shown after the value in muted text, for example "ft". */
  readonly unit?: string;
  /** Second unit system or a qualifier, for example "15,240 m". */
  readonly secondary?: ReactNode;
}

export type SpecPanelProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "title"
> & {
  /** Two or three compartments per row from 40rem. Default 2. */
  columns?: 2 | 3;
  /** One or two sentences under the title. */
  description?: ReactNode;
  /** A note under the grid, for example the source of the figures. */
  footnote?: ReactNode;
  items: readonly SpecPanelItem[];
  /** Short accent label above the title, for example "Featured aircraft". */
  kicker?: string;
  /** Vehicle or subject name, in the condensed display cut. */
  title?: ReactNode;
  /** Heading element for `title`. Default `h2`. */
  titleAs?: "h2" | "h3" | "p";
};

/**
 * Hairline compartment grid (spec 6, 8): cells separated by 1px rules, each
 * with a B612 Mono uppercase label over a large readout. Anchored at the
 * bottom right of a `PhotoHero` on desktop through its `aside` slot.
 *
 * Values are a definition list, so each label is announced with its value.
 */
export function SpecPanel({
  className,
  columns = 2,
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
    <section className={cn("orbix-spec-panel", className)} {...props}>
      {hasHead ? (
        <div className="orbix-spec-panel__head">
          {kicker ? <p className="orbix-spec-panel__kicker">{kicker}</p> : null}
          {title ? (
            <Title className="orbix-spec-panel__title">{title}</Title>
          ) : null}
          {description ? (
            <p className="orbix-spec-panel__description">{description}</p>
          ) : null}
        </div>
      ) : null}

      <dl className="orbix-spec-grid" data-columns={columns}>
        {items.map((item) => (
          <div className="orbix-spec-cell" key={item.label}>
            <dt>{item.label}</dt>
            <dd className="orbix-spec-cell__value">
              {formatFigure(item.value)}
              {item.unit ? (
                <span className="orbix-spec-cell__unit">{item.unit}</span>
              ) : null}
            </dd>
            {item.secondary ? (
              <dd className="orbix-spec-cell__secondary">
                {formatFigure(item.secondary)}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>

      {footnote ? (
        <div className="orbix-spec-panel__foot">{footnote}</div>
      ) : null}
    </section>
  );
}
