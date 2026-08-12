import type {
  MissionPreset,
  MissionPresetCatalog,
  MissionPresetCategory,
} from "@/features/engineering-lab/types";

const missionPresetCategories = new Set<MissionPresetCategory>([
  "deep-space-concept",
  "lunar-transfer",
  "orbital-deployment",
  "orbital-logistics",
  "reentry-demonstration",
]);

function assertNonEmptyString(value: unknown, label: string): void {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new RangeError(`${label} must not be empty.`);
  }
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nestedValue of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nestedValue);
    }

    Object.freeze(value);
  }

  return value;
}

/**
 * Validates catalog structure only. Numerical mission validation remains with
 * the existing analyses that consume each preset's MissionProfileInputs.
 */
export function validateMissionPreset(preset: MissionPreset): void {
  if (typeof preset !== "object" || preset === null) {
    throw new RangeError("Mission preset must be an object.");
  }

  assertNonEmptyString(preset.id, "Mission preset ID");
  assertNonEmptyString(preset.name, "Mission preset name");
  assertNonEmptyString(preset.description, "Mission preset description");

  if (!missionPresetCategories.has(preset.category)) {
    throw new RangeError("Mission preset category is not supported.");
  }

  if (
    typeof preset.missionProfileInputs !== "object" ||
    preset.missionProfileInputs === null ||
    Array.isArray(preset.missionProfileInputs)
  ) {
    throw new RangeError("Mission profile inputs must be an object.");
  }

  assertNonEmptyString(
    preset.missionProfileInputs.missionName,
    "Mission profile name",
  );
}

/**
 * Builds a validated, deeply immutable catalog. Duplicate IDs are rejected so
 * lookup remains deterministic for future preset consumers.
 */
export function createMissionPresetCatalog(
  presets: readonly MissionPreset[],
): MissionPresetCatalog {
  const seenIds = new Set<string>();

  for (const preset of presets) {
    validateMissionPreset(preset);

    if (seenIds.has(preset.id)) {
      throw new RangeError(`Duplicate mission preset ID: ${preset.id}`);
    }

    seenIds.add(preset.id);
  }

  return Object.freeze(presets.map((preset) => deepFreeze(preset)));
}

/**
 * Educational input configurations only. These presets are not certified
 * mission plans and contain no calculated output or mission-feasibility claim.
 */
const presetDefinitions = [
  {
    category: "orbital-deployment",
    description:
      "Two-impulse transfer from parking orbit to circular low Earth orbit.",
    id: "leo-satellite-deployment",
    missionProfileInputs: {
      deltaVBudget: {
        hohmannTransfer: {
          finalAltitudeMetres: 550_000,
          initialAltitudeMetres: 200_000,
        },
        missionName: "LEO Satellite Deployment Budget",
      },
      missionName: "LEO Satellite Deployment",
    },
    name: "LEO Satellite Deployment",
  },
  {
    category: "orbital-logistics",
    description:
      "Low-orbit rendezvous, then a cargo capsule reentry with TPS material evaluation.",
    id: "iss-style-resupply",
    missionProfileInputs: {
      deltaVBudget: {
        hohmannTransfer: {
          finalAltitudeMetres: 408_000,
          initialAltitudeMetres: 200_000,
        },
        missionName: "ISS Style Resupply Budget",
      },
      missionName: "ISS Style Resupply",
      vehicleReentryEvaluation: {
        initialAltitudeMeters: 1_000,
        initialVelocityMetersPerSecond: 150,
        safetyFactor: 1.5,
        vehicle: {
          dragCoefficient: 1.4,
          massKilograms: 6_000,
          noseRadiusMetres: 1.2,
          referenceAreaSquareMetres: 14,
          vehicleName: "Educational Cargo Capsule",
        },
      },
    },
    name: "ISS Style Resupply",
  },
  {
    category: "lunar-transfer",
    description:
      "High-altitude transfer with a separate inclination change, in Earth-to-Moon geometry.",
    id: "lunar-transfer-concept",
    missionProfileInputs: {
      deltaVBudget: {
        hohmannTransfer: {
          finalAltitudeMetres: 384_400_000,
          initialAltitudeMetres: 200_000,
        },
        missionName: "Lunar Transfer Concept Budget",
        orbitalPlaneChange: {
          inclinationChangeDegrees: 5,
          orbitalAltitudeMetres: 384_400_000,
        },
      },
      missionName: "Lunar Transfer Concept",
    },
    name: "Lunar Transfer Concept",
  },
  {
    category: "reentry-demonstration",
    description:
      "Two reentry configurations compared against a primary vehicle evaluation and TPS recommendation.",
    id: "reentry-demonstrator",
    missionProfileInputs: {
      missionName: "Reentry Demonstrator",
      vehicleComparison: {
        initialAltitudeMeters: 10_000,
        initialVelocityMetersPerSecond: 750,
        safetyFactor: 1.5,
        vehicles: [
          {
            dragCoefficient: 1.5,
            massKilograms: 5_000,
            noseRadiusMetres: 1,
            referenceAreaSquareMetres: 12,
            vehicleName: "Baseline Demonstrator",
          },
          {
            dragCoefficient: 1.3,
            massKilograms: 3_600,
            noseRadiusMetres: 0.8,
            referenceAreaSquareMetres: 9,
            vehicleName: "Compact Demonstrator",
          },
        ],
      },
      vehicleReentryEvaluation: {
        initialAltitudeMeters: 10_000,
        initialVelocityMetersPerSecond: 750,
        safetyFactor: 1.5,
        vehicle: {
          dragCoefficient: 1.5,
          massKilograms: 5_000,
          noseRadiusMetres: 1,
          referenceAreaSquareMetres: 12,
          vehicleName: "Baseline Demonstrator",
        },
      },
    },
    name: "Reentry Demonstrator",
  },
  {
    category: "deep-space-concept",
    description:
      "Deep-space delta-v budget from ordered maneuver allowances. No trajectory optimization.",
    id: "mars-transfer-concept",
    missionProfileInputs: {
      deltaVBudget: {
        maneuvers: [
          {
            deltaVMetresPerSecond: 200,
            id: "departure-orbit-setup",
            name: "Departure orbit setup",
          },
          {
            deltaVMetresPerSecond: 3_600,
            id: "trans-mars-injection",
            name: "Trans-Mars injection concept",
          },
          {
            deltaVMetresPerSecond: 100,
            id: "cruise-correction",
            name: "Cruise correction allowance",
          },
          {
            deltaVMetresPerSecond: 1_500,
            id: "arrival-capture",
            name: "Arrival capture concept",
          },
        ],
        missionName: "Mars Transfer Concept Budget",
      },
      missionName: "Mars Transfer Concept",
    },
    name: "Mars Transfer Concept",
  },
] satisfies readonly MissionPreset[];

export const MISSION_PRESETS: MissionPresetCatalog =
  createMissionPresetCatalog(presetDefinitions);

const presetsById = new Map(
  MISSION_PRESETS.map((preset) => [preset.id, preset] as const),
);

export function getMissionPresetById(id: string): MissionPreset | undefined {
  return presetsById.get(id);
}

export function listMissionPresets(): MissionPresetCatalog {
  return MISSION_PRESETS;
}
