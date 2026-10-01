import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { formatFigure, isFigureValue } from "@/components/ui/readout";
import { cn } from "@/lib/cn";

/** One key figure in a record row. */
export interface RecordRowItem {
  /** Sans label, for example "Service ceiling". */
  readonly label: string;
  /** Formatted value, set in B612 Mono. */
  readonly value: ReactNode;
  /** Unit after the value in muted text. */
  readonly unit?: string;
  /** Second unit system or a qualifier, muted, under the value. */
  readonly secondary?: ReactNode;
  /**
   * `figure`: B612 Mono, tabular. `text`: Plex Sans 500, for a name or a
   * word ("Saturn V", "Retired"). Omitted, a value that starts with a digit,
   * a sign or "Mach" is a figure and any other string is text.
   */
  readonly kind?: "figure" | "text";
}

export type RecordRowProps = ComponentPropsWithoutRef<"div"> & {
  /**
   * `2`: two columns at every width. `4`: two columns below 64rem, four
   * from 64rem. Omitted: as many 8.5rem columns as fit.
   */
  columns?: 2 | 4;
  /** Three or four figures read best. */
  items: readonly RecordRowItem[];
};

/**
 * Key figures in open columns (spec 6): a definition list, label above
 * value, separated by whitespace only. No rules, no compartments. A value
 * never breaks from its unit.
 */
export function RecordRow({
  className,
  columns,
  items,
  ...props
}: RecordRowProps) {
  return (
    <div className={cn("orbix-record-row", className)} {...props}>
      <dl className="orbix-record-row__list" data-columns={columns}>
        {items.map((item) => (
          <div className="orbix-record-row__item" key={item.label}>
            <dt>{item.label}</dt>
            <dd data-kind={valueKind(item)}>
              {formatFigure(item.value)}
              {item.unit ? (
                <span className="orbix-record-row__unit">{item.unit}</span>
              ) : null}
            </dd>
            {item.secondary ? (
              <dd
                className="orbix-record-row__secondary"
                data-kind={isFigureValue(item.secondary) ? undefined : "text"}
              >
                {formatFigure(item.secondary)}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>
    </div>
  );
}

function valueKind(item: {
  readonly kind?: "figure" | "text";
  readonly value: ReactNode;
}) {
  const kind = item.kind ?? (isFigureValue(item.value) ? "figure" : "text");
  return kind === "text" ? "text" : undefined;
}
