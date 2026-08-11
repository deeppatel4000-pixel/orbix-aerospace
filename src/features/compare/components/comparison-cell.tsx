import type { CSSProperties } from "react";
import { CircleSlash2 } from "lucide-react";

import { StatusBadge } from "@/components/ui/status-badge";
import { TechnicalLabel } from "@/components/ui/technical-label";
import type { ComparisonCellValue } from "@/features/compare/types";

interface ComparisonCellProps {
  cell: ComparisonCellValue;
  /**
   * Track length in `0..1`, or `null` when this cell renders no track — either
   * because its row is not comparable or because it has no value. Computed once
   * per row by `normalizeRowMagnitudes`, never here: a cell cannot know what
   * the rest of its row contains.
   */
  magnitude?: number | null;
}

export function ComparisonCell({ cell, magnitude }: ComparisonCellProps) {
  if (cell.status === "unavailable") {
    return (
      <td className="border-t border-l border-border bg-surface/35 p-4 align-top sm:p-5">
        <StatusBadge tone="neutral">
          <CircleSlash2 aria-hidden="true" size={13} strokeWidth={1.8} />
          {cell.value}
        </StatusBadge>
        {cell.note ? (
          <p className="mt-2 text-xs leading-5 text-muted">{cell.note}</p>
        ) : null}
      </td>
    );
  }

  return (
    <td className="border-t border-l border-border bg-surface/55 p-4 align-top sm:p-5">
      <p className="text-sm leading-6 font-semibold text-foreground">
        {cell.value}
      </p>
      {/* Secondary by construction: a hairline track under the figure, with no
       * colour coding, no ranking and no label. It shows relative scale within
       * the row and nothing else. Hidden from assistive technology because the
       * published number above it is the value — a normalized fraction is an
       * artefact of this layout, not a property of the vehicle. */}
      {typeof magnitude === "number" ? (
        <div aria-hidden="true" className="orbix-magnitude">
          <span
            className="orbix-magnitude__fill"
            style={{ "--orbix-magnitude": magnitude } as CSSProperties}
          />
        </div>
      ) : null}
      {cell.details && cell.details.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {cell.details.map((detail) => (
            <li className="text-sm leading-5 text-foreground" key={detail}>
              {detail}
            </li>
          ))}
        </ul>
      ) : null}
      {cell.note ? (
        <div className="mt-3 flex items-start gap-1.5">
          <TechnicalLabel className="mt-0.5 shrink-0">Note</TechnicalLabel>
          <p className="text-xs leading-5 text-muted">{cell.note}</p>
        </div>
      ) : null}
    </td>
  );
}
