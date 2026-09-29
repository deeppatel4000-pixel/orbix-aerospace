import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { formatFigure } from "@/components/ui/readout";
import { cn } from "@/lib/cn";

/** One key figure in a record row. */
export interface RecordRowItem {
  /** Sans label, for example "Service ceiling". */
  readonly label: string;
  /** Formatted value, set in B612 Mono. */
  readonly value: ReactNode;
  /** Unit after the value in muted text. */
  readonly unit?: string;
}

export type RecordRowProps = ComponentPropsWithoutRef<"div"> & {
  /** Three or four figures read best (spec 8). */
  items: readonly RecordRowItem[];
};

/**
 * The vehicle-profile record row (spec 8, the v1
 * `.orbix-profile-hero__record` pattern): three or four key figures
 * separated by vertical hairlines under a top rule. It wraps into rows on
 * narrow screens without leaving a stray rule at the start of a line.
 */
export function RecordRow({ className, items, ...props }: RecordRowProps) {
  return (
    <div className={cn("orbix-record-row", className)} {...props}>
      <dl className="orbix-record-row__list">
        {items.map((item) => (
          <div className="orbix-record-row__item" key={item.label}>
            <dt>{item.label}</dt>
            <dd>
              {formatFigure(item.value)}
              {item.unit ? (
                <span className="orbix-record-row__unit">{item.unit}</span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
