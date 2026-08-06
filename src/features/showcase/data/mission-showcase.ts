import { getMissionPresetById } from "@/features/engineering-lab/missions";
import type {
  MissionPreset,
  MissionPresetCategory,
} from "@/features/engineering-lab/types";

export interface ShowcaseMission {
  readonly analysisAvailability: readonly string[];
  readonly availableVisualizations: readonly string[];
  readonly categoryLabel: string;
  readonly engineeringFocus: readonly string[];
  readonly includedSystems: readonly string[];
  readonly preset: MissionPreset;
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

function createShowcaseMission(
  id: (typeof showcaseMissionIds)[number],
): ShowcaseMission {
  const preset = getMissionPresetById(id);

  if (!preset) {
    throw new RangeError(`Showcase mission preset \"${id}\" is unavailable.`);
  }

  const details = showcaseMissionDetails[id];

  return {
    ...details,
    categoryLabel: categoryLabels[preset.category],
    includedSystems: getIncludedSystems(preset),
    preset,
  };
}

export const SHOWCASE_MISSIONS: readonly ShowcaseMission[] =
  showcaseMissionIds.map(createShowcaseMission);

export function getShowcaseMissionById(
  id: string,
): ShowcaseMission | undefined {
  return SHOWCASE_MISSIONS.find((mission) => mission.preset.id === id);
}
