import {
  distanceUnits,
  forceUnits,
  massUnits,
  measurementQualifiers,
  speedUnits,
  type Measurement,
  type MeasurementUnit,
} from "../types";

const measurementUnits: readonly MeasurementUnit[] = [
  ...speedUnits,
  ...distanceUnits,
  ...massUnits,
  ...forceUnits,
];

export function isMeasurement(
  value: unknown,
): value is Measurement<MeasurementUnit> {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;
  const hasValidQualifier =
    candidate.qualifier === undefined ||
    (typeof candidate.qualifier === "string" &&
      measurementQualifiers.includes(
        candidate.qualifier as (typeof measurementQualifiers)[number],
      ));

  return (
    typeof candidate.value === "number" &&
    Number.isFinite(candidate.value) &&
    typeof candidate.unit === "string" &&
    measurementUnits.includes(candidate.unit as MeasurementUnit) &&
    hasValidQualifier
  );
}
