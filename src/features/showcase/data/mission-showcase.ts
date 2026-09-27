import { EARTH_MEAN_RADIUS_METRES } from "@/features/engineering-lab/calculators/orbital-elements";
import { getMissionPresetById } from "@/features/engineering-lab/missions";
import type {
  MissionPreset,
  MissionPresetCategory,
  VehicleReentryConfiguration,
} from "@/features/engineering-lab/types";

/**
 * Showcase mission data.
 *
 * Everything here is read from the typed mission presets or is fixed
 * descriptive copy. Nothing is calculated for display: altitudes, allowances
 * and vehicle inputs are the preset's own input values, converted to display
 * units only. The showcase uses no photographs; the diagrams are drawn from
 * these numbers.
 */

/** One preset input value, already converted to its display unit. */
export interface PresetInputRow {
  readonly label: string;
  readonly unit: string;
  readonly value: number;
}

export interface PresetInputGroup {
  readonly rows: readonly PresetInputRow[];
  readonly title: string;
}

/**
 * The diagram a mission's own inputs support.
 *
 * `transfer`: two circular orbits and the half ellipse between them, drawn to
 * scale around Earth. `allowances`: the ordered maneuver allowances as bars.
 * `none`: the preset has no orbital geometry (reentry only).
 */
export type MissionDiagram =
  | {
      readonly finalAltitudeKilometres: number;
      readonly initialAltitudeKilometres: number;
      readonly kind: "transfer";
      readonly planetRadiusKilometres: number;
    }
  | {
      readonly kind: "allowances";
      readonly maneuvers: readonly {
        readonly deltaVMetresPerSecond: number;
        readonly id: string;
        readonly name: string;
      }[];
      /** Sum of the preset's own allowances, as entered. */
      readonly sumMetresPerSecond: number;
    }
  | { readonly kind: "none" };

export interface ShowcaseMission {
  readonly analysisAvailability: readonly string[];
  readonly availableVisualizations: readonly string[];
  readonly categoryLabel: string;
  readonly diagram: MissionDiagram;
  readonly engineeringFocus: readonly string[];
  readonly includedSystems: readonly string[];
  readonly inputGroups: readonly PresetInputGroup[];
  readonly preset: MissionPreset;
  readonly vehicles: readonly VehicleReentryConfiguration[];
}

interface ShowcaseMissionDetails {
  readonly analysisAvailability: readonly string[];
  readonly availableVisualizations: readonly string[];
  readonly engineeringFocus: readonly string[];
}

const categoryLabels: Record<MissionPresetCategory, string> = {
  "deep-space-concept": "Deep-space concept",
  "lunar-transfer": "Lunar transfer",
  "orbital-deployment": "Orbital deployment",
  "orbital-logistics": "Orbital logistics",
  "reentry-demonstration": "Reentry demonstration",
};

const showcaseMissionDetails = {
  "iss-style-resupply": {
    analysisAvailability: [
      "Circular-orbit transfer",
      "Reentry vehicle evaluation",
      "Thermal protection comparison",
    ],
    availableVisualizations: [
      "Mission Control overview",
      "Orbit workspace",
      "Reentry profile",
    ],
    engineeringFocus: [
      "Orbital logistics",
      "Atmospheric entry",
      "Thermal protection",
    ],
  },
  "leo-satellite-deployment": {
    analysisAvailability: [
      "Circular-orbit transfer",
      "Two-impulse delta-v budget",
      "Mission profile summary",
    ],
    availableVisualizations: [
      "Mission Control overview",
      "Orbit workspace",
      "Mission timeline",
    ],
    engineeringFocus: ["Low Earth orbit", "Orbit raising", "Mission budgeting"],
  },
  "lunar-transfer-concept": {
    analysisAvailability: [
      "High-altitude transfer",
      "Inclination change",
      "Combined delta-v budget",
    ],
    availableVisualizations: [
      "Mission Control overview",
      "Transfer-orbit workspace",
      "Mission briefing",
    ],
    engineeringFocus: [
      "Transfer architecture",
      "Plane-change cost",
      "Mission communication",
    ],
  },
  "mars-transfer-concept": {
    analysisAvailability: [
      "Ordered maneuver budget",
      "Largest maneuver review",
      "Mission profile summary",
    ],
    availableVisualizations: [
      "Mission Control overview",
      "Mission replay",
      "Mission briefing",
    ],
    engineeringFocus: [
      "Deep-space architecture",
      "Maneuver allocation",
      "Model limitations",
    ],
  },
  "reentry-demonstrator": {
    analysisAvailability: [
      "Vehicle reentry evaluation",
      "Vehicle comparison",
      "TPS material comparison",
    ],
    availableVisualizations: [
      "Mission Control overview",
      "Reentry profile",
      "Trade-study workspace",
    ],
    engineeringFocus: [
      "Ballistic deceleration",
      "Stagnation heating",
      "TPS tradeoffs",
    ],
  },
} as const satisfies Record<string, ShowcaseMissionDetails>;

const showcaseMissionIds = [
  "leo-satellite-deployment",
  "iss-style-resupply",
  "lunar-transfer-concept",
  "reentry-demonstrator",
  "mars-transfer-concept",
] as const;

function getIncludedSystems(preset: MissionPreset): readonly string[] {
  const systems: string[] = [];
  const { missionProfileInputs } = preset;

  if (missionProfileInputs.deltaVBudget) {
    systems.push("Delta-v budget");
  }

  if (missionProfileInputs.vehicleReentryEvaluation) {
    systems.push("Vehicle evaluation", "Thermal protection");
  }

  if (missionProfileInputs.vehicleComparison) {
    systems.push("Vehicle comparison");
  }

  return systems;
}

function metresToKilometres(metres: number): number {
  return metres / 1_000;
}

function getInputGroups(preset: MissionPreset): readonly PresetInputGroup[] {
  const groups: PresetInputGroup[] = [];
  const { deltaVBudget, vehicleComparison, vehicleReentryEvaluation } =
    preset.missionProfileInputs;

  if (deltaVBudget?.hohmannTransfer) {
    const transfer = deltaVBudget.hohmannTransfer;
    groups.push({
      rows: [
        {
          label: "Initial circular orbit altitude",
          unit: "km",
          value: metresToKilometres(transfer.initialAltitudeMetres),
        },
        {
          label: "Target circular orbit altitude",
          unit: "km",
          value: metresToKilometres(transfer.finalAltitudeMetres),
        },
      ],
      title: "Two-impulse transfer",
    });
  }

  if (deltaVBudget?.orbitalPlaneChange) {
    const planeChange = deltaVBudget.orbitalPlaneChange;
    groups.push({
      rows: [
        {
          label: "Inclination change",
          unit: "deg",
          value: planeChange.inclinationChangeDegrees,
        },
        {
          label: "Altitude of the plane change",
          unit: "km",
          value: metresToKilometres(planeChange.orbitalAltitudeMetres),
        },
      ],
      title: "Plane change",
    });
  }

  // Maneuver allowances are not repeated here: the allowance diagram lists
  // each one with its value as text.

  const entry = vehicleReentryEvaluation ?? vehicleComparison;

  if (entry) {
    groups.push({
      rows: [
        {
          label: "Initial altitude",
          unit: "km",
          value: metresToKilometres(entry.initialAltitudeMeters),
        },
        {
          label: "Initial velocity",
          unit: "m/s",
          value: entry.initialVelocityMetersPerSecond,
        },
        {
          label: "Thermal protection safety factor",
          unit: "ratio",
          value: entry.safetyFactor,
        },
      ],
      title: "Entry conditions",
    });
  }

  return groups;
}

function getVehicles(
  preset: MissionPreset,
): readonly VehicleReentryConfiguration[] {
  const { vehicleComparison, vehicleReentryEvaluation } =
    preset.missionProfileInputs;
  const vehicles: VehicleReentryConfiguration[] = [];
  const candidates = [
    ...(vehicleReentryEvaluation ? [vehicleReentryEvaluation.vehicle] : []),
    ...(vehicleComparison?.vehicles ?? []),
  ];

  for (const vehicle of candidates) {
    if (!vehicles.some((known) => known.vehicleName === vehicle.vehicleName)) {
      vehicles.push(vehicle);
    }
  }

  return vehicles;
}

function getDiagram(preset: MissionPreset): MissionDiagram {
  const budget = preset.missionProfileInputs.deltaVBudget;

  if (budget?.hohmannTransfer) {
    return {
      finalAltitudeKilometres: metresToKilometres(
        budget.hohmannTransfer.finalAltitudeMetres,
      ),
      initialAltitudeKilometres: metresToKilometres(
        budget.hohmannTransfer.initialAltitudeMetres,
      ),
      kind: "transfer",
      planetRadiusKilometres: metresToKilometres(
        budget.hohmannTransfer.planetRadiusMetres ?? EARTH_MEAN_RADIUS_METRES,
      ),
    };
  }

  if (budget?.maneuvers && budget.maneuvers.length > 0) {
    return {
      kind: "allowances",
      maneuvers: budget.maneuvers,
      sumMetresPerSecond: budget.maneuvers.reduce(
        (sum, maneuver) => sum + maneuver.deltaVMetresPerSecond,
        0,
      ),
    };
  }

  return { kind: "none" };
}

function createShowcaseMission(
  id: (typeof showcaseMissionIds)[number],
): ShowcaseMission {
  const preset = getMissionPresetById(id);

  if (!preset) {
    throw new RangeError(`Showcase mission preset "${id}" is unavailable.`);
  }

  return {
    ...showcaseMissionDetails[id],
    categoryLabel: categoryLabels[preset.category],
    diagram: getDiagram(preset),
    includedSystems: getIncludedSystems(preset),
    inputGroups: getInputGroups(preset),
    preset,
    vehicles: getVehicles(preset),
  };
}

export const SHOWCASE_MISSIONS: readonly ShowcaseMission[] =
  showcaseMissionIds.map(createShowcaseMission);

export function getShowcaseMissionById(
  id: string,
): ShowcaseMission | undefined {
  return SHOWCASE_MISSIONS.find((mission) => mission.preset.id === id);
}
