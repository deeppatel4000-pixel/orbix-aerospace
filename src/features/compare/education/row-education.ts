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
    label: "Heritage and program",
    summary: "Who built the vehicle and when it first flew.",
  },
  geometry: {
    id: "geometry",
    label: "Geometry",
    summary: "Overall size: length and wingspan, or height.",
  },
  "mass-structures": {
    id: "mass-structures",
    label: "Mass and structures",
    summary: "Empty and maximum takeoff weight, or mass at liftoff.",
  },
  propulsion: {
    id: "propulsion",
    label: "Propulsion",
    summary: "Engines, thrust and stages.",
  },
  performance: {
    id: "performance",
    label: "Performance",
    summary: "Speed, range and ceiling.",
  },
  capability: {
    id: "capability",
    label: "Capability",
    summary: "The job the vehicle was built for, and what it can carry where.",
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
    explanation: "The organization that designed and built the airframe.",
  },
  role: {
    categoryId: "capability",
    explanation:
      "The primary operational role shapes airframe design trade-offs: a role built around maneuverability favors low wing loading and high thrust-to-weight, while a role built around range or payload favors internal volume and fuel fraction.",
  },
  "first-flight": {
    categoryId: "heritage",
    explanation:
      "Marks when the design first flew, which places the airframe in the development timeline of the type.",
  },
  speed: {
    categoryId: "performance",
    explanation:
      "At maximum speed the engines' thrust just balances drag, at a given altitude and Mach number.",
    labLinks: [
      { anchor: "drag-equation", label: "Drag equation" },
      {
        anchor: "flight-condition-analyzer",
        label: "Flight condition",
      },
    ],
  },
  range: {
    categoryId: "performance",
    explanation:
      "Range results from usable fuel mass, propulsive efficiency, and aerodynamic lift-to-drag ratio carried across the mission profile.",
    labLinks: [{ anchor: "lift-equation", label: "Lift equation" }],
  },
  ceiling: {
    categoryId: "performance",
    explanation:
      "Service ceiling is limited by how thin the atmosphere becomes with altitude, reducing the air density available to generate lift.",
    labLinks: [
      { anchor: "standard-atmosphere", label: "Standard atmosphere" },
      { anchor: "lift-equation", label: "Lift equation" },
    ],
  },
  propulsion: {
    categoryId: "propulsion",
    explanation:
      "The engines set the thrust available against drag and weight, and with it the speed, climb rate and range the aircraft can reach.",
    labLinks: [{ anchor: "thrust-to-weight", label: "Thrust-to-weight ratio" }],
  },
  dimensions: {
    categoryId: "geometry",
    explanation:
      "Length and wingspan define the reference wing area and aspect ratio that govern lift generation and aerodynamic efficiency.",
    labLinks: [{ anchor: "lift-equation", label: "Lift equation" }],
  },
  weight: {
    categoryId: "mass-structures",
    explanation:
      "The difference between maximum takeoff weight and empty weight is roughly the fuel and payload the aircraft can carry.",
    labLinks: [{ anchor: "thrust-to-weight", label: "Thrust-to-weight ratio" }],
  },
};

const rocketRowEducation: Readonly<Record<string, RowEducationEntry>> = {
  manufacturer: {
    categoryId: "heritage",
    explanation: "The organization that designed and built the vehicle.",
  },
  "first-flight": {
    categoryId: "heritage",
    explanation:
      "Marks when the vehicle first flew, which places it in the development timeline of the program.",
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
      { anchor: "thrust-to-weight", label: "Thrust-to-weight ratio" },
      { anchor: "rocket-equation", label: "Tsiolkovsky rocket equation" },
    ],
  },
  thrust: {
    categoryId: "propulsion",
    explanation:
      "Liftoff thrust must exceed the vehicle's total weight to generate positive acceleration off the pad; the ratio of the two defines the thrust-to-weight ratio.",
    labLinks: [{ anchor: "thrust-to-weight", label: "Thrust-to-weight ratio" }],
  },
  stages: {
    categoryId: "propulsion",
    explanation:
      "Staging sheds spent structural mass during ascent, letting each stage apply the rocket equation to only its own remaining mass, reaching orbital velocity more efficiently than a single continuous burn could.",
    labLinks: [
      { anchor: "rocket-equation", label: "Tsiolkovsky rocket equation" },
    ],
  },
  "payload-capability": {
    categoryId: "capability",
    explanation:
      "How much mass the vehicle can deliver to a given orbit in a given configuration. It follows from applying the rocket equation over the whole ascent.",
    labLinks: [
      { anchor: "rocket-equation", label: "Tsiolkovsky rocket equation" },
      {
        anchor: "mission-planner",
        label: "Mission planner",
      },
    ],
  },
  "orbit-capability": {
    categoryId: "capability",
    explanation:
      "Which orbits the vehicle can reach depends on the delta-v it can deliver and on the trajectory flown.",
    labLinks: [
      {
        anchor: "hohmann-transfer-analyzer",
        label: "Hohmann transfer",
      },
      {
        anchor: "mission-planner",
        label: "Mission planner",
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
