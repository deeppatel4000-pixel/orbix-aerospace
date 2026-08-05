import { CircleSlash2 } from "lucide-react";

import type { ComparisonCellValue } from "@/features/compare/types";

interface ComparisonCellProps {
  cell: ComparisonCellValue;
}

export function ComparisonCell({ cell }: ComparisonCellProps) {
  if (cell.status === "unavailable") {
    return (
      <td className="border-t border-l border-border bg-surface/35 p-4 align-top sm:p-5">
        <div className="flex items-center gap-2 text-muted">
          <CircleSlash2 aria-hidden="true" size={16} strokeWidth={1.6} />
          <span className="text-sm font-medium">{cell.value}</span>
        </div>
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
        <p className="mt-3 text-xs leading-5 text-muted">{cell.note}</p>
      ) : null}
    </td>
  );
}
