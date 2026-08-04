export const speedUnits = ["Mach", "m/s", "km/h", "mph", "kn"] as const;
export const distanceUnits = ["m", "km", "ft", "mi", "nmi"] as const;
export const massUnits = ["kg", "t", "lb"] as const;
export const forceUnits = ["N", "kN", "MN", "lbf"] as const;
export const measurementQualifiers = [
  "exact",
  "approximate",
  "minimum",
  "maximum",
  "nominal",
] as const;

export type SpeedUnit = (typeof speedUnits)[number];
export type DistanceUnit = (typeof distanceUnits)[number];
export type MassUnit = (typeof massUnits)[number];
export type ForceUnit = (typeof forceUnits)[number];
export type MeasurementUnit = SpeedUnit | DistanceUnit | MassUnit | ForceUnit;
export type MeasurementQualifier = (typeof measurementQualifiers)[number];

export interface Measurement<TUnit extends MeasurementUnit> {
  readonly qualifier?: MeasurementQualifier;
  readonly unit: TUnit;
  readonly value: number;
}

export type SpeedMeasurement = Measurement<SpeedUnit>;
export type DistanceMeasurement = Measurement<DistanceUnit>;
export type MassMeasurement = Measurement<MassUnit>;
export type ForceMeasurement = Measurement<ForceUnit>;
