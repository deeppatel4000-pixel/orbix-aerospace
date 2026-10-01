import { useId, type ReactNode } from "react";

import { DataTableScroll } from "@/components/ui/data-table-scroll";
import { formatFigure } from "@/components/ui/readout";
import { cn } from "@/lib/cn";
import { keepDesignations } from "@/lib/designations";

/** One column of a `DataTable`. */
export interface DataTableColumn<Row> {
  /** Stable column key. */
  readonly key: string;
  readonly header: ReactNode;
  /** Cell content for a row. */
  readonly cell: (row: Row) => ReactNode;
  /**
   * Numeric columns are set in B612 Mono with tabular figures and aligned
   * right (spec 6).
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
  /**
   * Below 40rem, hide this column and set its content on a line of its
   * own in the cell of the column with this key, so a phone reads the row
   * without scrolling. For text columns only (a type, a date, a link).
   */
  readonly foldInto?: string;
  /**
   * The folded line's content, when it should read differently from the
   * cell (for example "First flight December 22, 1964"). Default: the cell.
   */
  readonly foldCell?: (row: Row) => ReactNode;
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
   * the first column 8.5rem wide (7.5rem below 22.5rem, so a two-column
   * sheet fits a 320px screen; its text wraps), and let the table
   * scroll sideways, for spec sheets whose figures and short labels should
   * never break mid-phrase. Default false: cells wrap as usual.
   */
  singleLineCells?: boolean;
  /** Keep the first column in view while scrolling. Default true. */
  stickyFirstColumn?: boolean;
}

/**
 * Open data table (spec 6): no frame, no radius, no fill. The header row
 * sits on a 1px strong rule and body rows on 1px hairlines; numbers are
 * right-aligned tabular figures with the unit in the header. The caption
 * sits above the scroll box and names both the table and its scrollable
 * region; the region is focusable so keyboard users can scroll it
 * sideways, and shows a visible scrollbar and a line of text saying how
 * many columns are out of view when the table overflows (no fade). Below
 * 48rem the first column stays in view, on the page ground. Below 40rem a
 * column with `foldInto` is set under another column's cell instead.
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
  // With folded columns, a wrap column takes the room they leave on a
  // phone instead of a fixed 18rem.
  const folded = columns.some((column) => column.foldInto);
  const cellContent = (column: DataTableColumn<Row>, row: Row) =>
    column.numeric
      ? formatFigure(column.cell(row))
      : keepDesignations(column.cell(row));

  return (
    <div
      className={cn("orbix-data-table", className)}
      data-sticky-first={stickyFirstColumn ? "true" : undefined}
    >
      <p className="orbix-data-table__caption" id={captionId}>
        {caption}
      </p>
      <DataTableScroll captionId={captionId}>
        {/* With `singleLineCells`, below 48rem the table fills its frame
            and is at least as wide as its content, so figures and labels
            never wrap mid-phrase, and the box scrolls sideways instead.
            With folded columns, below 40rem it only fills its frame, so a
            wrap column takes the room the folded columns leave. */}
        <table
          aria-labelledby={captionId}
          className={cn(
            "orbix-table",
            singleLineCells &&
              (folded
                ? "max-md:w-full sm:max-md:min-w-max"
                : "max-md:w-full max-md:min-w-max"),
          )}
        >
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  className={
                    cn(
                      column.numeric && "orbix-num",
                      column.foldInto && "max-sm:hidden",
                    ) || undefined
                  }
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
                        (folded
                          ? "sm:max-md:w-[8.5rem] sm:max-md:min-w-[8.5rem] max-sm:min-w-[7rem]"
                          : "max-md:w-[8.5rem] max-md:min-w-[8.5rem] max-[22.5rem]:w-[7.5rem] max-[22.5rem]:min-w-[7.5rem]"),
                      singleLineCells &&
                        columnIndex > 0 &&
                        (column.wrap
                          ? folded
                            ? "sm:max-md:w-[18rem] sm:max-md:min-w-[18rem]"
                            : "max-md:w-[18rem] max-md:min-w-[18rem]"
                          : "max-md:whitespace-nowrap"),
                      column.foldInto && "max-sm:hidden",
                    ) || undefined;
                  const foldedHere = columns.filter(
                    (other) => other.foldInto === column.key,
                  );
                  const content = (
                    <>
                      {cellContent(column, row)}
                      {foldedHere.map((other) => (
                        <span
                          className="mt-1 block text-sm font-normal whitespace-normal text-muted sm:hidden"
                          data-folded={other.key}
                          key={other.key}
                        >
                          {other.foldCell
                            ? keepDesignations(other.foldCell(row))
                            : cellContent(other, row)}
                        </span>
                      ))}
                    </>
                  );
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
      </DataTableScroll>
      {note ? <p className="orbix-data-table__note">{note}</p> : null}
    </div>
  );
}
