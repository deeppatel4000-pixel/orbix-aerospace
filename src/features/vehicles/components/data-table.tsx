import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export interface DataTableColumn {
  /** Right-aligned mono column for numbers (spec 10, tables). */
  readonly numeric?: boolean;
  readonly label: string;
}

export interface DataTableRow {
  /** Remaining cells, one per column after the first. */
  readonly cells: readonly ReactNode[];
  /** First cell, rendered as `<th scope="row">`. */
  readonly header: ReactNode;
  readonly key: string;
}

interface DataTableProps {
  caption: string;
  /** Show the caption visually. Hidden by default; the heading above names the table. */
  captionVisible?: boolean;
  columns: readonly DataTableColumn[];
  rows: readonly DataTableRow[];
}

/**
 * A specification table (spec 10). The wrapper scrolls horizontally on narrow
 * screens so the page body never does, and is focusable so keyboard users
 * can scroll it.
 */
export function DataTable({
  caption,
  captionVisible = false,
  columns,
  rows,
}: DataTableProps) {
  return (
    <div
      aria-label={caption}
      className="orbix-table-wrap"
      role="region"
      tabIndex={0}
    >
      <table className="orbix-table w-full">
        <caption
          className={cn(
            captionVisible
              ? "px-3 py-2 text-left text-sm text-muted"
              : "sr-only",
          )}
        >
          {caption}
        </caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                className={cn(
                  "whitespace-nowrap",
                  column.numeric && "orbix-num",
                )}
                key={column.label}
                scope="col"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row">{row.header}</th>
              {row.cells.map((cell, index) => (
                <td
                  className={cn(columns[index + 1]?.numeric && "orbix-num")}
                  key={columns[index + 1]?.label ?? index}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
