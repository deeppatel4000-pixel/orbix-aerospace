import { DataTable } from "@/components/ui/data-table";
import type { Measurement, MeasurementUnit } from "@/features/vehicles/types";

import {
  basisNote,
  joinTableNotes,
  measurementBasis,
  renderDualMeasurement,
} from "./measurement-display";

export interface MeasurementRow {
  readonly label: string;
  readonly measurement: Measurement<MeasurementUnit>;
}

interface MeasurementTableProps {
  caption: string;
  /**
   * A note under the table. The first table on a profile carries the
   * page's conversion note (`CONVERSION_NOTE`); the others carry none.
   * The table adds `MINIMUM_NOTE` itself when a row is a published minimum.
   */
  note?: string;
  rows: readonly MeasurementRow[];
}

/**
 * A spec-sheet table (spec 8): Parameter | Figure | Basis. The figure cell
 * gives the published value and its ORBIX conversion on a second line.
 * From 48rem the source's qualifier ("Approximate", "Published minimum",
 * never "Nominal", which the note under the table defines) sits in a muted
 * Basis column at 40/30/30, so the figures end on the 70 percent line
 * instead of the far edge of the track. Below 48rem the Basis column is
 * hidden and the qualifier is a third line under the figure, so the figure
 * stays the second column and in view on a phone. When no row has a
 * qualifier the Basis column is left out: Parameter | Figure at 40/60.
 */
export function MeasurementTable({
  caption,
  note,
  rows,
}: MeasurementTableProps) {
  const hasBasis = rows.some((row) => measurementBasis(row.measurement));
  const valueColumn = {
    cell: (row: MeasurementRow) =>
      renderDualMeasurement(row.measurement, {
        qualifierClassName: "md:hidden",
      }),
    header: "Figure",
    key: "value",
    numeric: true,
  };

  return (
    <DataTable
      singleLineCells
      // Fills the section track like every other profile table (one right
      // edge per page); from 48rem a fixed layout with the label column at
      // 40 percent, matching the facts sheets.
      className={
        "md:[&_table]:table-fixed md:[&_tbody_th]:w-2/5 md:[&_thead_th:first-child]:w-2/5" +
        (hasBasis
          ? " max-md:[&_td:nth-child(3)]:hidden max-md:[&_th:nth-child(3)]:hidden md:[&_thead_th:nth-child(n+2)]:w-[30%]"
          : "")
      }
      caption={caption}
      columns={[
        {
          cell: (row: MeasurementRow) => row.label,
          header: "Parameter",
          key: "label",
        },
        valueColumn,
        ...(hasBasis
          ? [
              {
                cell: (row: MeasurementRow) => (
                  <span className="text-sm text-muted">
                    {measurementBasis(row.measurement)}
                  </span>
                ),
                header: "Basis",
                key: "basis",
              },
            ]
          : []),
      ]}
      getRowKey={(row) => row.label}
      note={joinTableNotes(note, basisNote(rows.map((row) => row.measurement)))}
      rows={rows}
    />
  );
}
