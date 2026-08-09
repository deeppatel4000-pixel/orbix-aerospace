import type { ComparisonCategory } from "@/features/compare/types";

/**
 * Presentation-only educational annotation layer for the Compare experience.
 *
 * This module never touches the validated comparison value pipeline
 * (adapters/repository/query parsing). It only maps existing, immutable
 * `ComparisonRow.id` values to conceptual, standard-aerospace context for
 * display purposes. Nothing here changes what value is shown for a vehicle.
 */

export const educationCategoryOrder = [
  "heritage",
  "geometry",
  "mass-structures",
  "propulsion",
  "performance",
  "capability",
] as const;

export type EducationCategoryId = (typeof educationCategoryOrder)[number];

export interface EducationCategoryMeta {
  readonly id: EducationCategoryId;
  readonly label: string;
  readonly summary: string;
}

export const educationCategoryMeta: Readonly<
  Record<EducationCategoryId, EducationCategoryMeta>
> = {
  heritage: {
    id: "heritage",
    label: "Heritage & Programme",
    summary: "Who built the vehicle, and when its design was first flown.",
  },
  geometry: {
    id: "geometry",
    label: "Geometry",
    summary:
      "Physical scale that sets the reference dimensions used in aerodynamic and structural analysis.",
  },
  "mass-structures": {
    id: "mass-structures",
    label: "Mass & Structures",
    summary:
      "The structural mass budget available for propellant, fuel, and payload.",
  },
  propulsion: {
    id: "propulsion",
    label: "Propulsion",
    summary:
      "Installed thrust and how it is delivered across the flight or ascent profile.",
  },
  performance: {
    id: "performance",
    label: "Performance",
    summary:
      "Achieved flight capability resulting from the interaction of thrust, aerodynamics, and mass.",
  },
  capability: {
    id: "capability",
    label: "Capability",
    summary: "The mission-level role or reach the vehicle is designed for.",
  },
};

export interface LabAnchorLink {
  readonly anchor: string;
  readonly label: string;
}

export interface RowEducationEntry {
  readonly categoryId: EducationCategoryId;
  readonly explanation: string;
  readonly labLinks?: readonly LabAnchorLink[];
}

const aircraftRowEducation: Readonly<Record<string, RowEducationEntry>> = {
  manufacturer: {
    categoryId: "heritage",
    explanation:
      "Identifies the organization responsible for the airframe's design and production, providing engineering lineage and manufacturing context.",
  },
  role: {
    categoryId: "capability",
    explanation:
      "The primary operational role shapes airframe design trade-offs: a role built around maneuverability favors low wing loading and high thrust-to-weight, while a role built around range or payload favors internal volume and fuel fraction.",
  },
  "first-flight": {
    categoryId: "heritage",
    explanation:
      "Marks when the design was first validated in flight, anchoring the airframe in the historical development timeline of the type.",
  },
  speed: {
    categoryId: "performance",
    explanation:
      "Maximum speed reflects the point where available thrust and aerodynamic drag reach equilibrium at a given altitude and Mach number.",
    labLinks: [
      { anchor: "drag-equation", label: "Drag Equation" },
      {
        anchor: "flight-condition-analyzer",
        label: "Flight Condition Analyzer",
      },
    ],
  },
  range: {
    categoryId: "performance",
    explanation:
      "Range results from usable fuel mass, propulsive efficiency, and aerodynamic lift-to-drag ratio carried across the mission profile.",
    labLinks: [{ anchor: "lift-equation", label: "Lift Equation" }],
  },
  ceiling: {
    categoryId: "performance",
    explanation:
      "Service ceiling is limited by how thin the atmosphere becomes with altitude, reducing the air density available to generate lift.",
    labLinks: [
      { anchor: "standard-atmosphere", label: "Standard Atmosphere" },
      { anchor: "lift-equation", label: "Lift Equation" },
    ],
  },
  propulsion: {
    categoryId: "propulsion",
    explanation:
      "The installed engine configuration sets the thrust available to overcome drag and weight, directly shaping achievable speed, climb rate, and range.",
    labLinks: [{ anchor: "thrust-to-weight", label: "Thrust-to-Weight Ratio" }],
  },
  dimensions: {
    categoryId: "geometry",
    explanation:
      "Length and wingspan define the reference wing area and aspect ratio that govern lift generation and aerodynamic efficiency.",
    labLinks: [{ anchor: "lift-equation", label: "Lift Equation" }],
  },
  weight: {
    categoryId: "mass-structures",
    explanation:
      "Empty and maximum takeoff weight define the structural mass budget and the fuel and payload margin available within performance limits.",
    labLinks: [{ anchor: "thrust-to-weight", label: "Thrust-to-Weight Ratio" }],
  },
};

const rocketRowEducation: Readonly<Record<string, RowEducationEntry>> = {
  manufacturer: {
    categoryId: "heritage",
    explanation:
      "Identifies the organization responsible for the vehicle's design and production, providing engineering lineage and programme context.",
  },
  "first-flight": {
    categoryId: "heritage",
    explanation:
      "Marks when the vehicle was first validated in flight, anchoring it in the historical development timeline of the programme.",
  },
  height: {
    categoryId: "geometry",
    explanation:
      "Vehicle height is largely set by propellant tank volume and stage count, and it constrains ground handling, transport, and aerodynamic stability during ascent.",
  },
  mass: {
    categoryId: "mass-structures",
    explanation:
      "Liftoff mass combines structure, propellant, and payload. It is the mass term that installed thrust must exceed for the vehicle to lift off and accelerate.",
    labLinks: [
      { anchor: "thrust-to-weight", label: "Thrust-to-Weight Ratio" },
      { anchor: "rocket-equation", label: "Tsiolkovsky Rocket Equation" },
    ],
  },
  thrust: {
    categoryId: "propulsion",
    explanation:
      "Liftoff thrust must exceed the vehicle's total weight to generate positive acceleration off the pad; the ratio of the two defines the thrust-to-weight ratio.",
    labLinks: [{ anchor: "thrust-to-weight", label: "Thrust-to-Weight Ratio" }],
  },
  stages: {
    categoryId: "propulsion",
    explanation:
      "Staging sheds spent structural mass during ascent, letting each stage apply the rocket equation to only its own remaining mass, reaching orbital velocity more efficiently than a single continuous burn could.",
    labLinks: [
      { anchor: "rocket-equation", label: "Tsiolkovsky Rocket Equation" },
    ],
  },
  "payload-capability": {
    categoryId: "capability",
    explanation:
      "Payload capability quantifies how much mass a vehicle can deliver to a specific orbit and configuration, the mission-value metric produced by applying the rocket equation across the full ascent profile.",
    labLinks: [
      { anchor: "rocket-equation", label: "Tsiolkovsky Rocket Equation" },
      {
        anchor: "mission-profile-analyzer",
        label: "Mission Profile Analyzer",
      },
    ],
  },
  "orbit-capability": {
    categoryId: "capability",
    explanation:
      "Supported orbital regimes reflect the vehicle's achievable delta-v budget and trajectory design, connecting propulsion performance to actual mission reach.",
    labLinks: [
      {
        anchor: "hohmann-transfer-analyzer",
        label: "Hohmann Transfer Analyzer",
      },
      {
        anchor: "mission-profile-analyzer",
        label: "Mission Profile Analyzer",
      },
    ],
  },
};

export function getRowEducation(
  category: ComparisonCategory,
  rowId: string,
): RowEducationEntry | undefined {
  return category === "aircraft"
    ? aircraftRowEducation[rowId]
    : rocketRowEducation[rowId];
}
