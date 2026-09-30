import { DataTable } from "@/components/ui/data-table";
import type { Measurement, MeasurementUnit } from "@/features/vehicles/types";

import {
  joinTableNotes,
  minimumNote,
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
 * A spec-sheet table (spec 8): Specification | Figure. The figure cell
 * gives the published value, its ORBIX conversion on a second line and the
 * source's qualifier ("Approximate", "Published minimum") on a third, so
 * the figure is the second column and in view on a phone.
 */
export function MeasurementTable({
  caption,
  note,
  rows,
}: MeasurementTableProps) {
  return (
    <DataTable
      singleLineCells
      caption={caption}
      // Two columns: at full width the figures would sit far from their
      // labels, so the sheet keeps a reading width.
      className="md:max-w-[40rem]"
      columns={[
        { cell: (row) => row.label, header: "Specification", key: "label" },
        {
          cell: (row) => renderDualMeasurement(row.measurement),
          header: "Figure",
          key: "value",
          numeric: true,
        },
      ]}
      getRowKey={(row) => row.label}
      note={joinTableNotes(
        note,
        minimumNote(rows.map((row) => row.measurement)),
      )}
      rows={rows}
    />
  );
}
