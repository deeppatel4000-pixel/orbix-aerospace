import type { BaseVehicle, IsoDateString } from "./base-vehicle";
import type { EngineeringNote } from "./engineering";
import type {
  DistanceMeasurement,
  ForceMeasurement,
  MassMeasurement,
  SpeedMeasurement,
} from "./measurement";

export const aircraftRoles = [
  "air-superiority",
  "multirole",
  "interceptor",
  "bomber",
  "reconnaissance",
  "transport",
  "trainer",
  "tanker",
  "electronic-warfare",
  "uncrewed-combat-aircraft",
] as const;

export const aircraftEngineTypes = [
  "turbojet",
  "low-bypass-turbofan",
  "high-bypass-turbofan",
  "turboprop",
  "turboshaft",
  "piston",
  "electric",
] as const;

export const aircraftVariantStatuses = [
  "concept",
  "prototype",
  "in-service",
  "retired",
  "cancelled",
] as const;

export type AircraftRole = (typeof aircraftRoles)[number];
export type AircraftEngineType = (typeof aircraftEngineTypes)[number];
export type AircraftVariantStatus = (typeof aircraftVariantStatuses)[number];

export interface AircraftEngineThrust {
  readonly afterburner?: ForceMeasurement;
  readonly dry?: ForceMeasurement;
  readonly maximum?: ForceMeasurement;
}

export interface AircraftEngine {
  readonly id: string;
  readonly manufacturer: string;
  readonly name: string;
  readonly quantity: number;
  readonly thrust: AircraftEngineThrust;
  readonly type: AircraftEngineType;
}

export interface AircraftPropulsion {
  readonly engines: readonly AircraftEngine[];
}

export interface AircraftPerformance {
  readonly maxSpeed: SpeedMeasurement;
  readonly range: DistanceMeasurement;
  readonly serviceCeiling: DistanceMeasurement;
}

export interface AircraftDimensions {
  readonly length: DistanceMeasurement;
  readonly wingspan: DistanceMeasurement;
}

export interface AircraftWeights {
  readonly empty: MassMeasurement;
  readonly maximumTakeoff: MassMeasurement;
}

export interface AircraftVariantOverrides {
  readonly dimensions?: Partial<AircraftDimensions>;
  readonly performance?: Partial<AircraftPerformance>;
  readonly propulsion?: AircraftPropulsion;
  readonly weights?: Partial<AircraftWeights>;
}

export interface AircraftVariant {
  readonly designation: string;
  readonly firstFlight?: IsoDateString;
  readonly id: string;
  readonly name: string;
  readonly notes?: string;
  readonly overrides?: AircraftVariantOverrides;
  readonly status: AircraftVariantStatus;
}

export interface Aircraft extends BaseVehicle<"military-aircraft"> {
  readonly dimensions: AircraftDimensions;
  readonly engineeringAnalysis: readonly EngineeringNote[];
  readonly performance: AircraftPerformance;
  readonly propulsion: AircraftPropulsion;
  readonly roles: readonly AircraftRole[];
  readonly variants: readonly AircraftVariant[];
  readonly weights: AircraftWeights;
}
