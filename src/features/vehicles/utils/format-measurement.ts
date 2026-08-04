import type { Measurement, MeasurementUnit } from "../types";

interface FormatMeasurementOptions {
  readonly locale?: string;
  readonly maximumFractionDigits?: number;
}

export function formatMeasurement<TUnit extends MeasurementUnit>(
  measurement: Measurement<TUnit>,
  options: FormatMeasurementOptions = {},
) {
  const formattedValue = new Intl.NumberFormat(options.locale, {
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  }).format(measurement.value);

  return measurement.unit === "Mach"
    ? measurement.unit + " " + formattedValue
    : formattedValue + " " + measurement.unit;
}
