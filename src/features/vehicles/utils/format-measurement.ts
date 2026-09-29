import type {
  Measurement,
  MeasurementQualifier,
  MeasurementUnit,
} from "../types";

interface FormatMeasurementOptions {
  readonly locale?: string;
  readonly maximumFractionDigits?: number;
}

/** The number and the unit of a measurement, formatted separately. */
export interface MeasurementParts {
  readonly unit: string;
  readonly value: string;
}

export function formatMeasurementParts<TUnit extends MeasurementUnit>(
  measurement: Measurement<TUnit>,
  options: FormatMeasurementOptions = {},
): MeasurementParts {
  return {
    unit: measurement.unit,
    value: new Intl.NumberFormat(options.locale ?? "en-US", {
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
    }).format(measurement.value),
  };
}

export function formatMeasurement<TUnit extends MeasurementUnit>(
  measurement: Measurement<TUnit>,
  options: FormatMeasurementOptions = {},
) {
  const { unit, value } = formatMeasurementParts(measurement, options);

  return measurement.unit === "Mach" ? unit + " " + value : value + " " + unit;
}

const qualifierLabels: Record<MeasurementQualifier, string> = {
  approximate: "Approximate",
  exact: "Published value",
  maximum: "Published maximum",
  minimum: "Published minimum",
  nominal: "Nominal",
};

/** A sentence-case description of how a value was published. */
export function formatQualifierLabel(
  qualifier: MeasurementQualifier | undefined,
) {
  return qualifier ? qualifierLabels[qualifier] : "Published value";
}

const countWords = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

/** Small counts as words for prose ("two engines"); 10 and up as digits. */
export function formatCountWord(count: number) {
  return countWords[count] ?? String(count);
}
