import type { CSSProperties } from "react";

import type { ComparisonCellValue } from "@/features/compare/types";

interface ComparisonCellProps {
  cell: ComparisonCellValue;
  /**
   * Track length in `0..1`, or `null` when this cell renders no track, either
   * because its row is not comparable or because it has no value. Computed
   * once per row by `normalizeRowMagnitudes`, never here: a cell cannot know
   * what the rest of its row contains.
   */
  magnitude?: number | null;
}

/** Spec 13.4 wording for a vehicle value the dataset does not carry. */
export const MISSING_VALUE_TEXT = "Not published";

const cellClass =
  "min-w-48 border-t border-l border-border-subtle p-3 align-top sm:min-w-56";

export function ComparisonCell({ cell, magnitude }: ComparisonCellProps) {
  if (cell.status === "unavailable") {
    // Real text, never a dash or an empty cell, so a screen reader announces
    // a value instead of "blank". The adapter's note says why it is missing.
    return (
      <td className={cellClass}>
        <p className="text-sm text-muted">{MISSING_VALUE_TEXT}</p>
        {cell.note ? (
          <p className="mt-1 text-[length:var(--text-label)] leading-5 text-muted">
            {cell.note}.
          </p>
        ) : null}
      </td>
    );
  }

  return (
    <td className={cellClass}>
      {/* Plex Mono only for machine values (spec 5): a single measurement. */}
      <p
        className={
          cell.magnitude
            ? "orbix-data text-foreground"
            : "text-sm leading-6 font-medium text-foreground"
        }
      >
        {cell.value}
      </p>
      {/* A flat 4px track under the figure: relative scale within the row
       * only, no colour coding, no ranking. Hidden from assistive technology
       * because the published number above it is the value; a normalized
       * fraction is an artefact of this layout, not a property of the
       * vehicle. */}
      {typeof magnitude === "number" ? (
        <span aria-hidden="true" className="orbix-magnitude">
          <span
            className="orbix-magnitude__fill"
            style={{ "--orbix-magnitude": magnitude } as CSSProperties}
          />
        </span>
      ) : null}
      {cell.details && cell.details.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {cell.details.map((detail) => (
            <li className="text-sm leading-5 text-text-secondary" key={detail}>
              {detail}
            </li>
          ))}
        </ul>
      ) : null}
      {cell.note ? (
        <p className="mt-2 text-[length:var(--text-label)] leading-5 text-muted">
          Note: {cell.note}
        </p>
      ) : null}
    </td>
  );
}
