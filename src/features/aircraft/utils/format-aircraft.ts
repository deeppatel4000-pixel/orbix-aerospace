import type {
  AircraftEngineType,
  AircraftRole,
  AircraftVariantStatus,
  EngineeringDomain,
  EngineeringNoteStatus,
  IsoDateString,
  Measurement,
  MeasurementQualifier,
  MeasurementUnit,
} from "@/features/vehicles/types";
import { formatMeasurement } from "@/features/vehicles/utils";

const roleLabels: Record<AircraftRole, string> = {
  "air-superiority": "Air superiority",
  bomber: "Bomber",
  "electronic-warfare": "Electronic warfare",
  interceptor: "Interceptor",
  multirole: "Multirole",
  reconnaissance: "Reconnaissance",
  tanker: "Tanker",
  trainer: "Trainer",
  transport: "Transport",
  "uncrewed-combat-aircraft": "Uncrewed combat aircraft",
};

const engineTypeLabels: Record<AircraftEngineType, string> = {
  electric: "Electric",
  "high-bypass-turbofan": "High-bypass turbofan",
  "low-bypass-turbofan": "Low-bypass turbofan",
  piston: "Piston",
  turbojet: "Turbojet",
  turboprop: "Turboprop",
  turboshaft: "Turboshaft",
};

const variantStatusLabels: Record<AircraftVariantStatus, string> = {
  cancelled: "Cancelled",
  concept: "Concept",
  "in-service": "In service",
  prototype: "Prototype",
  retired: "Retired",
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

export function formatAircraftRole(role: AircraftRole) {
  return roleLabels[role];
}

export function formatAircraftRoles(roles: readonly AircraftRole[]) {
  return roles.map(formatAircraftRole).join(" · ");
}

export function formatAircraftEngineType(type: AircraftEngineType) {
  return engineTypeLabels[type];
}

export function formatAircraftVariantStatus(status: AircraftVariantStatus) {
  return variantStatusLabels[status];
}

export function formatEngineeringDomain(domain: EngineeringDomain) {
  return engineeringDomainLabels[domain];
}

export function formatEngineeringNoteStatus(status: EngineeringNoteStatus) {
  return engineeringNoteStatusLabels[status];
}

export function formatFirstFlight(date: IsoDateString) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z"));
}

export function formatMeasurementQualifier(
  qualifier: MeasurementQualifier | undefined,
) {
  return qualifier ? qualifierLabels[qualifier] : "Published value";
}

export function formatAircraftMeasurement<TUnit extends MeasurementUnit>(
  measurement: Measurement<TUnit>,
) {
  return {
    note: formatMeasurementQualifier(measurement.qualifier),
    value: formatMeasurement(measurement),
  };
}
