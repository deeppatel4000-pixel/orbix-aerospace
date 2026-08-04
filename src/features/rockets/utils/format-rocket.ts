import type {
  EngineeringDomain,
  EngineeringNoteStatus,
  IsoDateString,
  LaunchConfiguration,
  Measurement,
  MeasurementQualifier,
  MeasurementUnit,
  OrbitType,
  RocketEngineCycle,
  RocketPropellant,
} from "@/features/vehicles/types";
import { formatMeasurement } from "@/features/vehicles/utils";

const engineCycleLabels: Record<RocketEngineCycle, string> = {
  expander: "Expander cycle",
  "full-flow-staged-combustion": "Full-flow staged combustion",
  "gas-generator": "Gas generator",
  "pressure-fed": "Pressure fed",
  solid: "Solid motor",
  "staged-combustion": "Staged combustion",
};

const orbitLabels: Record<OrbitType, string> = {
  escape: "Earth escape",
  GEO: "Geostationary Earth orbit",
  GTO: "Geostationary transfer orbit",
  HEO: "Highly elliptical orbit",
  LEO: "Low Earth orbit",
  MEO: "Medium Earth orbit",
  SSO: "Sun-synchronous orbit",
  TLI: "Trans-lunar injection",
};

const configurationLabels: Record<LaunchConfiguration, string> = {
  expendable: "Expendable",
  reusable: "Reusable",
};

const engineeringDomainLabels: Record<EngineeringDomain, string> = {
  aerodynamics: "Aerodynamics",
  "flight-controls": "Flight controls",
  "mission-design": "Mission design",
  "orbital-mechanics": "Orbital mechanics",
  propulsion: "Propulsion",
  reusability: "Reusability",
  staging: "Staging",
  structures: "Structures",
  "systems-engineering": "Systems engineering",
};

const engineeringNoteStatusLabels: Record<EngineeringNoteStatus, string> = {
  draft: "Draft",
  placeholder: "Placeholder",
  reviewed: "Reviewed",
};

const qualifierLabels: Record<MeasurementQualifier, string> = {
  approximate: "Approximate public value",
  exact: "Published value",
  maximum: "Published maximum",
  minimum: "Published minimum",
  nominal: "Nominal value",
};

export function formatRocketEngineCycle(cycle: RocketEngineCycle) {
  return engineCycleLabels[cycle];
}

export function formatOrbitType(orbit: OrbitType) {
  return orbitLabels[orbit];
}

export function formatLaunchConfiguration(configuration: LaunchConfiguration) {
  return configurationLabels[configuration];
}

export function formatRocketEngineeringDomain(domain: EngineeringDomain) {
  return engineeringDomainLabels[domain];
}

export function formatRocketEngineeringNoteStatus(
  status: EngineeringNoteStatus,
) {
  return engineeringNoteStatusLabels[status];
}

export function formatRocketFirstFlight(date: IsoDateString) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z"));
}

export function formatRocketMeasurement<TUnit extends MeasurementUnit>(
  measurement: Measurement<TUnit>,
) {
  return {
    note: measurement.qualifier
      ? qualifierLabels[measurement.qualifier]
      : "Published value",
    value: formatMeasurement(measurement),
  };
}

export function formatRocketPropellant(propellant: RocketPropellant) {
  return propellant.oxidizer
    ? propellant.fuel + " / " + propellant.oxidizer
    : propellant.fuel;
}
