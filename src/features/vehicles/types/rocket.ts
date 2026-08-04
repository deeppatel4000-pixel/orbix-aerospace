import type { BaseVehicle } from "./base-vehicle";
import type { EngineeringNote } from "./engineering";
import type {
  DistanceMeasurement,
  ForceMeasurement,
  MassMeasurement,
} from "./measurement";

export const rocketEngineCycles = [
  "gas-generator",
  "staged-combustion",
  "full-flow-staged-combustion",
  "expander",
  "pressure-fed",
  "solid",
] as const;

export const orbitTypes = [
  "LEO",
  "SSO",
  "MEO",
  "GTO",
  "GEO",
  "HEO",
  "TLI",
  "escape",
] as const;

export const launchConfigurations = ["reusable", "expendable"] as const;

export type RocketEngineCycle = (typeof rocketEngineCycles)[number];
export type OrbitType = (typeof orbitTypes)[number];
export type LaunchConfiguration = (typeof launchConfigurations)[number];

export interface RocketPropellant {
  readonly fuel: string;
  readonly oxidizer?: string;
}

export interface RocketEngineThrust {
  readonly seaLevel?: ForceMeasurement;
  readonly vacuum?: ForceMeasurement;
}

export interface RocketEngine {
  readonly cycle: RocketEngineCycle;
  readonly id: string;
  readonly manufacturer: string;
  readonly name: string;
  readonly quantity: number;
  readonly thrust: RocketEngineThrust;
}

export interface RocketStage {
  readonly dryMass?: MassMeasurement;
  readonly engines: readonly RocketEngine[];
  readonly id: string;
  readonly name: string;
  readonly propellant: RocketPropellant;
  readonly propellantMass?: MassMeasurement;
  readonly reusable: boolean;
  readonly stageNumber: number;
}

export interface PayloadCapability {
  readonly configuration: LaunchConfiguration;
  readonly mass: MassMeasurement;
  readonly orbit: OrbitType;
}

export interface RocketDimensions {
  readonly height: DistanceMeasurement;
}

export interface RocketMass {
  readonly liftoff: MassMeasurement;
}

export interface RocketPerformance {
  readonly liftoffThrust: ForceMeasurement;
  readonly payloadCapabilities: readonly PayloadCapability[];
  readonly supportedOrbits: readonly OrbitType[];
}

export interface Rocket extends BaseVehicle<"launch-vehicle"> {
  readonly dimensions: RocketDimensions;
  readonly engineeringAnalysis: readonly EngineeringNote[];
  readonly mass: RocketMass;
  readonly performance: RocketPerformance;
  readonly stages: readonly RocketStage[];
}
