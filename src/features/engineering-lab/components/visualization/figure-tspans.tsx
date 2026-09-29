import type { ReactNode } from "react";

/** A decimal point or thousands separator between two digits. */
const FIGURE_SEPARATOR = /(?<=\d)([.,])(?=\d)/;

/**
 * The SVG counterpart of `formatFigure` (`@/components/ui/readout`).
 *
 * B612 Mono draws `.` and `,` at the far left of their cell, so in a chart
 * label "42,157" reads as "42, 157" and "0.15" as "0. 15". HTML text moves
 * the mark with `.orbix-num-sep` (`left: 0.17em`); SVG `<text>` cannot
 * position a span that way, so each separator gets `dx="0.17em"` and the
 * run after it `dx="-0.17em"`. The mark sits centred in its cell and the
 * total advance is unchanged, so `text-anchor` alignment still holds. The
 * text content is unchanged for screen readers and copy.
 */
export function figureTspans(value: string | number): ReactNode {
  const parts = String(value).split(FIGURE_SEPARATOR);
  if (parts.length === 1) return String(value);

  return parts.map((part, index) => {
    if (index === 0) return part;
    return (
      <tspan dx={index % 2 === 1 ? "0.17em" : "-0.17em"} key={index}>
        {part}
      </tspan>
    );
  });
}
