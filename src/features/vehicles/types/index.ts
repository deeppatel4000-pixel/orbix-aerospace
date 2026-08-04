export type {
  Aircraft,
  AircraftDimensions,
  AircraftEngine,
  AircraftEngineThrust,
  AircraftEngineType,
  AircraftPerformance,
  AircraftPropulsion,
  AircraftRole,
  AircraftVariant,
  AircraftVariantOverrides,
  AircraftVariantStatus,
  AircraftWeights,
} from "./aircraft";
export {
  aircraftEngineTypes,
  aircraftRoles,
  aircraftVariantStatuses,
} from "./aircraft";

export type {
  BaseVehicle,
  CountryReference,
  IsoDateString,
  VehicleCategory,
} from "./base-vehicle";
export { vehicleCategories } from "./base-vehicle";

export type {
  EngineeringDomain,
  EngineeringNote,
  EngineeringNoteStatus,
} from "./engineering";
export { engineeringDomains, engineeringNoteStatuses } from "./engineering";

export type {
  DistanceMeasurement,
  DistanceUnit,
  ForceMeasurement,
  ForceUnit,
  MassMeasurement,
  MassUnit,
  Measurement,
  MeasurementQualifier,
  MeasurementUnit,
  SpeedMeasurement,
  SpeedUnit,
} from "./measurement";
export {
  distanceUnits,
  forceUnits,
  massUnits,
  measurementQualifiers,
  speedUnits,
} from "./measurement";

export type {
  LaunchConfiguration,
  OrbitType,
  PayloadCapability,
  Rocket,
  RocketDimensions,
  RocketEngine,
  RocketEngineCycle,
  RocketEngineThrust,
  RocketMass,
  RocketPerformance,
  RocketPropellant,
  RocketStage,
} from "./rocket";
export { launchConfigurations, orbitTypes, rocketEngineCycles } from "./rocket";

import type { Aircraft } from "./aircraft";
import type { Rocket } from "./rocket";

export type Vehicle = Aircraft | Rocket;
