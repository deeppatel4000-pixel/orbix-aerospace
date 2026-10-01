import type {
  EngineeringDomain,
  EngineeringNoteStatus,
  IsoDateString,
  LaunchConfiguration,
  Measurement,
  MeasurementQualifier,
  MeasurementUnit,
  OrbitType,
  Rocket,
  RocketEngineCycle,
  RocketPropellant,
  RocketStage,
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
    value: formatMeasurement(measurement, { markMinimum: true }),
  };
}

export function formatRocketPropellant(propellant: RocketPropellant) {
  return propellant.oxidizer
    ? propellant.fuel +
        " with " +
        propellant.oxidizer.toLocaleLowerCase("en-US")
    : propellant.fuel;
}

/**
 * The number of stages in the flight sequence. Parallel boosters share a
 * stage number with the core they fly beside, so Falcon Heavy and SLS count
 * as two stages, not three.
 */
export function countRocketStages(stages: readonly RocketStage[]) {
  return new Set(stages.map((stage) => stage.stageNumber)).size;
}

const stageCountWords = ["", "Single", "Two", "Three", "Four", "Five"];

/**
 * One classification line from the stage records: "Two-stage launch vehicle,
 * partially reusable". Reusability comes from each stage's `reusable` flag.
 */
export function formatRocketClassification(stages: readonly RocketStage[]) {
  const count = countRocketStages(stages);
  const countWord = stageCountWords[count] ?? String(count);
  const reusableCount = stages.filter((stage) => stage.reusable).length;
  const reuse =
    reusableCount === 0
      ? "expendable"
      : reusableCount === stages.length
        ? "fully reusable"
        : "partially reusable";

  return `${countWord}-stage launch vehicle, ${reuse}`;
}

/**
 * A page description built from the record, for `generateMetadata`:
 * "Falcon 9 specifications: two-stage launch vehicle, partially reusable, by
 * SpaceX, first flown June 4, 2010. Height 70 m, liftoff thrust 7,686 kN,
 * up to 22,800 kg to low Earth orbit."
 */
export function formatRocketMetaDescription(rocket: Rocket) {
  const classification = formatRocketClassification(
    rocket.stages,
  ).toLocaleLowerCase("en-US");
  const leo = rocket.performance.payloadCapabilities
    .filter((capability) => capability.orbit === "LEO")
    .sort((a, b) => b.mass.value - a.mass.value)[0];
  const payload = leo
    ? ` Payload to low Earth orbit ${formatMeasurement(leo.mass)} (${formatLaunchConfiguration(leo.configuration).toLocaleLowerCase("en-US")}).`
    : "";

  return (
    `${rocket.name} specifications: ${classification}, by ${rocket.manufacturer}, ` +
    `first flown ${formatRocketFirstFlight(rocket.firstFlight)}. ` +
    `Height ${formatMeasurement(rocket.dimensions.height)}, liftoff thrust ${formatMeasurement(rocket.performance.liftoffThrust)}.` +
    payload
  );
}
