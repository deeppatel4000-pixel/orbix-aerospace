import { getMissionPresetById } from "@/features/engineering-lab/missions";
import type {
  MissionPreset,
  MissionPresetCategory,
} from "@/features/engineering-lab/types";

/**
 * One mission's own photograph.
 *
 * Deliberately separate from `OrbixEnvironmentTheme`. That type describes a
 * shared *setting* — four backdrops covering every ORBIX surface — so three of
 * them had to serve five missions and two pairs of cards showed the same
 * picture. `getShowcaseMissionEnvironment` still drives the capture view, where
 * a setting is the right idea; the gallery now names its image directly.
 *
 * `objectPosition` is a Tailwind class and is omitted unless a responsive
 * review shows `object-cover` cropping the subject at some width.
 */
export interface ShowcaseMissionImage {
  readonly alt: string;
  readonly objectPosition?: string;
  readonly src: string;
}

export interface ShowcaseMission {
  readonly analysisAvailability: readonly string[];
  readonly availableVisualizations: readonly string[];
  readonly categoryLabel: string;
  readonly engineeringFocus: readonly string[];
  readonly image: ShowcaseMissionImage;
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

/**
 * Every mission's image, written out by hand.
 *
 * There is no rule deriving a filename from a mission id, and there must not
 * be: a convention would silently hand a mission the wrong photograph the
 * moment an id changed, and nothing would fail. Spelled out, a wrong pairing is
 * visible in this file. `showcase-mission-images.test.ts` holds the set to five
 * unique, existing files.
 */
const showcaseMissionImages = {
  "iss-style-resupply": {
    alt: "Cargo spacecraft approaching an orbital station above Earth.",
    src: "/images/missions/iss-style-resupply.webp",
  },
  "leo-satellite-deployment": {
    alt: "Satellite separating from an upper stage above Earth.",
    src: "/images/missions/leo-satellite-deployment.webp",
  },
  "lunar-transfer-concept": {
    alt: "Spacecraft crossing cislunar space, with the Moon ahead and Earth distant.",
    src: "/images/missions/lunar-transfer-concept.webp",
  },
  "mars-transfer-concept": {
    alt: "Deep-space spacecraft cruising toward distant Mars.",
    src: "/images/missions/mars-transfer-concept.webp",
  },
  "reentry-demonstrator": {
    alt: "Capsule descending through atmospheric plasma above Earth.",
    src: "/images/missions/reentry-demonstrator.webp",
  },
} as const satisfies Record<string, ShowcaseMissionImage>;

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
    image: showcaseMissionImages[id],
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
