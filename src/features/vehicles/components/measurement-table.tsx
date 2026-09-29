import type { ReactNode } from "react";

import { DataTable } from "@/components/ui/data-table";
import type { Measurement, MeasurementUnit } from "@/features/vehicles/types";
import { formatQualifierLabel } from "@/features/vehicles/utils/format-measurement";

import { renderDualMeasurement } from "./measurement-display";

export interface MeasurementRow {
  readonly label: string;
  readonly measurement: Measurement<MeasurementUnit>;
}

interface MeasurementTableProps {
  caption: string;
  /**
   * A note under the table. The first table on a profile carries the
   * page's figures note (`CONVERSION_NOTE`); the others carry none.
   */
  note?: ReactNode;
  rows: readonly MeasurementRow[];
}

/**
 * A spec-sheet table (spec 8): Specification | Figure | Basis. The figure
 * column gives the published value with its ORBIX conversion on a second
 * line; the basis column keeps the source's qualifier ("Approximate",
 * "Published minimum") beside every figure.
 */
export function MeasurementTable({
  caption,
  note,
  rows,
}: MeasurementTableProps) {
  return (
    <DataTable
      caption={caption}
      columns={[
        { cell: (row) => row.label, header: "Specification", key: "label" },
        {
          cell: (row) => renderDualMeasurement(row.measurement),
          header: "Figure",
          key: "value",
          numeric: true,
        },
        {
          cell: (row) => (
            <span className="text-muted">
              {formatQualifierLabel(row.measurement.qualifier)}
            </span>
          ),
          header: "Basis",
          key: "basis",
        },
      ]}
      getRowKey={(row) => row.label}
      note={note}
      rows={rows}
    />
  );
}
