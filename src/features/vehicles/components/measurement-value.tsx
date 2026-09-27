import type { Measurement, MeasurementUnit } from "@/features/vehicles/types";
import {
  formatMeasurementParts,
  formatQualifierShort,
} from "@/features/vehicles/utils/format-measurement";

interface MeasurementValueProps {
  measurement: Measurement<MeasurementUnit>;
  /** Append the qualifier ("approximate", "minimum") in muted text. */
  showQualifier?: boolean;
}

/**
 * A measurement set as a machine value: the number in Plex Mono with tabular
 * numerals, the unit in a muted span (spec 10, tables). Mach is written before
 * the number, as it is spoken.
 */
export function MeasurementValue({
  measurement,
  showQualifier = false,
}: MeasurementValueProps) {
  const { unit, value } = formatMeasurementParts(measurement);
  const qualifier = showQualifier
    ? formatQualifierShort(measurement.qualifier)
    : undefined;
  const unitSpan = <span className="orbix-table-unit">{unit}</span>;

  return (
    <span className="whitespace-nowrap">
      {measurement.unit === "Mach" ? (
        <>
          {unitSpan} <span className="orbix-data">{value}</span>
        </>
      ) : (
        <>
          <span className="orbix-data">{value}</span> {unitSpan}
        </>
      )}
      {qualifier ? (
        <span className="text-sm text-muted">, {qualifier}</span>
      ) : null}
    </span>
  );
}
