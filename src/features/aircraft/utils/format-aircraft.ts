import type {
  Aircraft,
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

/**
 * Roles as one sentence-case phrase: "Air superiority, multirole". Used as
 * the classification line on cards and the eyebrow on profiles.
 */
export function formatAircraftRoles(roles: readonly AircraftRole[]) {
  const phrase = roles
    .map((role) => formatAircraftRole(role).toLocaleLowerCase("en-US"))
    .join(", ");

  return phrase.charAt(0).toLocaleUpperCase("en-US") + phrase.slice(1);
}

/**
 * The fleet status the variant records support: "In service" when any
 * variant is in service, "Retired" when every variant is retired, and
 * undefined otherwise, so no status is shown that the data does not state.
 */
export function formatAircraftFleetStatus(
  variants: readonly { readonly status: AircraftVariantStatus }[],
) {
  if (variants.some((variant) => variant.status === "in-service")) {
    return "In service";
  }
  if (
    variants.length > 0 &&
    variants.every((variant) => variant.status === "retired")
  ) {
    return "Retired";
  }
  return undefined;
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
    value: formatMeasurement(measurement, { markMinimum: true }),
  };
}

/**
 * A page description built from the record, for `generateMetadata`:
 * "F-22 Raptor specifications: air superiority, multirole aircraft by
 * Lockheed Martin and Boeing, first flown September 7, 1997. Maximum speed
 * Mach 2, service ceiling 50,000 ft, range 1,850 mi."
 */
export function formatAircraftMetaDescription(aircraft: Aircraft) {
  const roles = formatAircraftRoles(aircraft.roles).toLocaleLowerCase("en-US");
  const { maxSpeed, range, serviceCeiling } = aircraft.performance;

  return (
    `${aircraft.name} specifications: ${roles} aircraft by ${aircraft.manufacturer}, ` +
    `first flown ${formatFirstFlight(aircraft.firstFlight)}. ` +
    `Maximum speed ${formatMeasurement(maxSpeed)}, service ceiling ${formatMeasurement(serviceCeiling)}, range ${formatMeasurement(range)}.`
  );
}
