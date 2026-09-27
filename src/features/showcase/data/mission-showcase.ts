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
 * Altitudes, allowances and vehicle inputs are the preset's own input values,
 * converted to display units only; text is read from the preset or is fixed
 * descriptive copy. Two values are not preset inputs: the sum of the maneuver allowances, and the
 * planet radius of a transfer diagram when the preset leaves it unset, which
 * falls back to the calculators' EARTH_MEAN_RADIUS_METRES (the default the
 * orbital elements calculator applies). `planetRadiusSource` records which
 * case applies. The showcase uses no photographs; the diagrams are drawn from
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
      /**
       * `preset`: the preset sets the planet radius. `calculator-default`: it
       * does not, so the calculators' mean Earth radius constant is used.
       */
      readonly planetRadiusSource: "calculator-default" | "preset";
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

/**
 * Where each preset appears in the Engineering Lab, checked against
 * `engineering-dashboard.tsx`: every preset loads through the Mission presets
 * tool into the mission profile analyzer; the trade study uses the LEO, ISS
 * and lunar presets; the example modules (diagrams, viewer, Mission Control,
 * briefing, report viewer) all use the ISS-style preset. Analysis names match
 * the functions `analyzeMissionProfile` runs for the preset's inputs.
 */
const LOADED_BY_PRESET_TOOL =
  "Mission presets, loaded into the mission profile analyzer";
const TRADE_STUDY = "Mission trade study, beside two other presets";

const showcaseMissionDetails = {
  "iss-style-resupply": {
    analysisAvailability: [
      "Hohmann transfer",
      "Delta-v budget",
      "Vehicle reentry evaluation, including a TPS material comparison",
    ],
    availableVisualizations: [
      LOADED_BY_PRESET_TOOL,
      TRADE_STUDY,
      "Example mission in the Mission diagrams, Mission viewer, Mission control dashboard, Mission briefing and Mission report viewer tools",
    ],
    engineeringFocus: [
      "Orbital logistics",
      "Atmospheric entry",
      "Thermal protection",
    ],
  },
  "leo-satellite-deployment": {
    analysisAvailability: ["Hohmann transfer", "Delta-v budget"],
    availableVisualizations: [LOADED_BY_PRESET_TOOL, TRADE_STUDY],
    engineeringFocus: ["Low Earth orbit", "Orbit raising", "Mission budgeting"],
  },
  "lunar-transfer-concept": {
    analysisAvailability: [
      "Hohmann transfer",
      "Orbital plane change",
      "Delta-v budget",
    ],
    availableVisualizations: [LOADED_BY_PRESET_TOOL, TRADE_STUDY],
    engineeringFocus: [
      "Transfer architecture",
      "Plane-change cost",
      "Delta-v budgeting",
    ],
  },
  "mars-transfer-concept": {
    analysisAvailability: [
      "Delta-v budget from the preset maneuver allowances, with its largest contributor",
    ],
    availableVisualizations: [LOADED_BY_PRESET_TOOL],
    engineeringFocus: [
      "Deep-space architecture",
      "Maneuver allocation",
      "Model limitations",
    ],
  },
  "reentry-demonstrator": {
    analysisAvailability: [
      "Vehicle reentry evaluation",
      "Vehicle reentry comparison",
      "TPS material comparison",
    ],
    availableVisualizations: [LOADED_BY_PRESET_TOOL],
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
    const presetRadiusMetres = budget.hohmannTransfer.planetRadiusMetres;

    return {
      finalAltitudeKilometres: metresToKilometres(
        budget.hohmannTransfer.finalAltitudeMetres,
      ),
      initialAltitudeKilometres: metresToKilometres(
        budget.hohmannTransfer.initialAltitudeMetres,
      ),
      kind: "transfer",
      planetRadiusKilometres: metresToKilometres(
        presetRadiusMetres ?? EARTH_MEAN_RADIUS_METRES,
      ),
      planetRadiusSource:
        presetRadiusMetres === undefined ? "calculator-default" : "preset",
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
