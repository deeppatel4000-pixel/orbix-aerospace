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
 * Basis column at 35/25/40 across the full content column, so the figures
 * end on the 60 percent line and the table ends where the profile's other
 * tables end. Below 48rem the Basis column is
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
      // The full content column, like every other profile table, so the
      // tables on a profile end on one edge. From 48rem a fixed layout:
      // Parameter 35 percent and Figure 25 percent, with Basis taking the
      // rest; without a Basis column, Parameter 40 percent.
      className={
        "md:[&_table]:table-fixed" +
        (hasBasis
          ? " max-md:[&_td:nth-child(3)]:hidden md:[&_td:nth-child(3)]:pl-8 max-md:[&_th:nth-child(3)]:hidden md:[&_th:nth-child(3)]:pl-8 md:[&_thead_th:first-child]:w-[35%] md:[&_thead_th:nth-child(2)]:w-1/4"
          : " md:[&_thead_th:first-child]:w-2/5")
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
