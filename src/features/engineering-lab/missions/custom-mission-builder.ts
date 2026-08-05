import type {
  MissionPresetCategory,
  MissionProfileInputs,
  VehicleReentryConfiguration,
} from "@/features/engineering-lab/types";

const missionCategories = new Set<MissionPresetCategory>([
  "deep-space-concept",
  "lunar-transfer",
  "orbital-deployment",
  "orbital-logistics",
  "reentry-demonstration",
]);

export interface CustomMissionConfiguration {
  readonly identity: {
    readonly category: MissionPresetCategory;
    readonly description: string;
    readonly missionName: string;
  };
  readonly orbital: {
    readonly inclinationChangeDegrees: number;
    readonly initialAltitudeMetres: number;
    readonly targetAltitudeMetres: number;
  };
  readonly reentry: {
    readonly initialAltitudeMeters: number;
    readonly initialFlightPathAngleDegrees?: number;
    readonly initialVelocityMetersPerSecond: number;
  };
  readonly systems: {
    readonly enableOrbitalTransfer: boolean;
    readonly enablePlaneChange: boolean;
    readonly enableReentryAnalysis: boolean;
    readonly enableVehicleComparison: boolean;
  };
  readonly tps: {
    readonly heatingCoefficient?: number;
    readonly noseRadiusMetres: number;
    readonly safetyFactor: number;
  };
  readonly vehicle: {
    readonly dragCoefficient: number;
    readonly massKilograms: number;
    readonly referenceAreaSquareMetres: number;
    readonly vehicleName: string;
  };
}

function assertNonEmptyText(value: string, label: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new RangeError(`${label} must not be empty.`);
  }
}

function validateMissionIdentity(configuration: CustomMissionConfiguration) {
  if (
    configuration === null ||
    typeof configuration !== "object" ||
    configuration.identity === null ||
    typeof configuration.identity !== "object"
  ) {
    throw new RangeError("Custom mission configuration must be an object.");
  }

  assertNonEmptyText(configuration.identity.missionName, "Mission name");
  assertNonEmptyText(configuration.identity.description, "Mission description");

  if (!missionCategories.has(configuration.identity.category)) {
    throw new RangeError("Mission category is not supported.");
  }
}

function createVehicleConfiguration(
  configuration: CustomMissionConfiguration,
): VehicleReentryConfiguration {
  return {
    dragCoefficient: configuration.vehicle.dragCoefficient,
    massKilograms: configuration.vehicle.massKilograms,
    noseRadiusMetres: configuration.tps.noseRadiusMetres,
    referenceAreaSquareMetres: configuration.vehicle.referenceAreaSquareMetres,
    vehicleName: configuration.vehicle.vehicleName,
  };
}

/**
 * Maps presentation inputs into the existing mission-analysis contract.
 * Numerical validation and every engineering calculation remain delegated to
 * the calculators and analyses that consume the returned object.
 */
export function createCustomMissionProfile(
  configuration: CustomMissionConfiguration,
): MissionProfileInputs {
  validateMissionIdentity(configuration);

  const { identity, orbital, reentry, systems, tps } = configuration;
  const usesDeltaVBudget =
    systems.enableOrbitalTransfer || systems.enablePlaneChange;
  const usesVehicle =
    systems.enableReentryAnalysis || systems.enableVehicleComparison;
  const vehicle = usesVehicle
    ? createVehicleConfiguration(configuration)
    : undefined;
  const sharedReentryInputs = usesVehicle
    ? {
        ...(tps.heatingCoefficient === undefined
          ? {}
          : { heatingCoefficient: tps.heatingCoefficient }),
        initialAltitudeMeters: reentry.initialAltitudeMeters,
        ...(reentry.initialFlightPathAngleDegrees === undefined
          ? {}
          : {
              initialFlightPathAngleDegrees:
                reentry.initialFlightPathAngleDegrees,
            }),
        initialVelocityMetersPerSecond: reentry.initialVelocityMetersPerSecond,
        safetyFactor: tps.safetyFactor,
      }
    : undefined;

  return {
    ...(usesDeltaVBudget
      ? {
          deltaVBudget: {
            ...(systems.enableOrbitalTransfer
              ? {
                  hohmannTransfer: {
                    finalAltitudeMetres: orbital.targetAltitudeMetres,
                    initialAltitudeMetres: orbital.initialAltitudeMetres,
                  },
                }
              : {}),
            missionName: identity.missionName,
            ...(systems.enablePlaneChange
              ? {
                  orbitalPlaneChange: {
                    inclinationChangeDegrees: orbital.inclinationChangeDegrees,
                    orbitalAltitudeMetres: orbital.targetAltitudeMetres,
                  },
                }
              : {}),
          },
        }
      : {}),
    missionName: identity.missionName,
    ...(systems.enableVehicleComparison && sharedReentryInputs && vehicle
      ? {
          vehicleComparison: {
            ...sharedReentryInputs,
            vehicles: [vehicle],
          },
        }
      : {}),
    ...(systems.enableReentryAnalysis && sharedReentryInputs && vehicle
      ? {
          vehicleReentryEvaluation: {
            ...sharedReentryInputs,
            vehicle,
          },
        }
      : {}),
  };
}
