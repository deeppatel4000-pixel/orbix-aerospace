import type { Measurement, MeasurementUnit } from "@/features/vehicles/types";
import {
  formatMeasurementParts,
  formatQualifierLabel,
} from "@/features/vehicles/utils/format-measurement";

import { DataTable } from "./data-table";

export interface MeasurementRow {
  readonly label: string;
  readonly measurement: Measurement<MeasurementUnit>;
}

interface MeasurementTableProps {
  caption: string;
  rows: readonly MeasurementRow[];
}

/**
 * Specification | Value | Unit | Basis. The basis column keeps the source's
 * qualifier ("Approximate", "Published minimum") beside every figure.
 */
export function MeasurementTable({ caption, rows }: MeasurementTableProps) {
  return (
    <DataTable
      caption={caption}
      columns={[
        { label: "Specification" },
        { label: "Value", numeric: true },
        { label: "Unit" },
        { label: "Basis" },
      ]}
      rows={rows.map(({ label, measurement }) => {
        const { unit, value } = formatMeasurementParts(measurement);

        return {
          cells: [
            value,
            <span className="orbix-table-unit" key="unit">
              {unit}
            </span>,
            <span className="text-muted" key="basis">
              {formatQualifierLabel(measurement.qualifier)}
            </span>,
          ],
          header: label,
          key: label,
        };
      })}
    />
  );
}
