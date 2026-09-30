import { useId, type ReactNode } from "react";

import { formatFigure } from "@/components/ui/readout";
import { cn } from "@/lib/cn";

/** One column of a `DataTable`. */
export interface DataTableColumn<Row> {
  /** Stable column key. */
  readonly key: string;
  readonly header: ReactNode;
  /** Cell content for a row. */
  readonly cell: (row: Row) => ReactNode;
  /**
   * Numeric columns are set in B612 Mono with tabular figures and aligned
   * right (spec 8).
   */
  readonly numeric?: boolean;
  /** Unit shown in the header after the label, for example "km/s". */
  readonly unit?: string;
  /**
   * Running text, such as notes, that may wrap below 48rem in a table with
   * `singleLineCells`, where every other column stays on one line. A wrap
   * column is set 18rem wide there so it reads as a short paragraph.
   */
  readonly wrap?: boolean;
}

export interface DataTableProps<Row> {
  /** Visible caption above the table, in sans 500. Also names the table. */
  caption: ReactNode;
  className?: string;
  /**
   * Columns in order. The first column is the row header (`th scope=row`)
   * and stays in view when the table scrolls sideways below 48rem.
   */
  columns: readonly DataTableColumn<Row>[];
  /** Stable key for each row. */
  getRowKey: (row: Row, index: number) => string;
  /** A note under the table, for example the source of the figures. */
  note?: ReactNode;
  rows: readonly Row[];
  /**
   * Below 48rem, keep every cell on one line (except `wrap` columns) with
   * the first column 8.5rem wide (its text wraps), and let the table
   * scroll sideways, for spec sheets whose figures and short labels should
   * never break mid-phrase. Default false: cells wrap as usual.
   */
  singleLineCells?: boolean;
  /** Keep the first column in view while scrolling. Default true. */
  stickyFirstColumn?: boolean;
}

/**
 * Hairline data table (spec 8). The caption sits above the scroll box and
 * names both the table and its scrollable region; the region is focusable
 * so keyboard users can scroll it sideways.
 */
export function DataTable<Row>({
  caption,
  className,
  columns,
  getRowKey,
  note,
  rows,
  singleLineCells = false,
  stickyFirstColumn = true,
}: DataTableProps<Row>) {
  const captionId = useId();

  return (
    <div
      className={cn("orbix-data-table", className)}
      data-sticky-first={stickyFirstColumn ? "true" : undefined}
    >
      <p className="orbix-data-table__caption" id={captionId}>
        {caption}
      </p>
      {/* The frame draws a fade on the right edge while the table can
          still scroll sideways (a scroll-driven animation; no script). */}
      <div className="orbix-data-table__frame">
        <div
          aria-labelledby={captionId}
          className="orbix-data-table__scroll"
          role="region"
          tabIndex={0}
        >
          {/* With `singleLineCells`, below 48rem the table is at least as
              wide as its content, so figures and labels never wrap
              mid-phrase, and the box scrolls sideways instead. */}
          <table
            aria-labelledby={captionId}
            className={cn("orbix-table", singleLineCells && "max-md:min-w-max")}
          >
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    className={column.numeric ? "orbix-num" : undefined}
                    key={column.key}
                    scope="col"
                  >
                    {column.header}
                    {column.unit ? (
                      <span className="orbix-table-unit">{` (${column.unit})`}</span>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={getRowKey(row, rowIndex)}>
                  {columns.map((column, columnIndex) => {
                    const cellClass =
                      cn(
                        column.numeric && "orbix-num",
                        singleLineCells &&
                          columnIndex === 0 &&
                          "max-md:w-[8.5rem] max-md:min-w-[8.5rem]",
                        singleLineCells &&
                          columnIndex > 0 &&
                          (column.wrap
                            ? "max-md:w-[18rem] max-md:min-w-[18rem]"
                            : "max-md:whitespace-nowrap"),
                      ) || undefined;
                    const content = column.numeric
                      ? formatFigure(column.cell(row))
                      : column.cell(row);
                    return columnIndex === 0 ? (
                      <th className={cellClass} key={column.key} scope="row">
                        {content}
                      </th>
                    ) : (
                      <td className={cellClass} key={column.key}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {note ? <p className="orbix-data-table__note">{note}</p> : null}
    </div>
  );
}
