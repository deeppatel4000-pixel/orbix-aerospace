import { describe, expect, it } from "vitest";

import type { CustomMissionConfiguration } from "./custom-mission-builder";
import { createCustomMissionProfile } from "./custom-mission-builder";

const completeConfiguration: CustomMissionConfiguration = {
  identity: {
    category: "orbital-logistics",
    description: "A custom educational logistics scenario.",
    missionName: "Custom Logistics Mission",
  },
  orbital: {
    inclinationChangeDegrees: 12,
    initialAltitudeMetres: 200_000,
    targetAltitudeMetres: 400_000,
  },
  reentry: {
    initialAltitudeMeters: 10_000,
    initialFlightPathAngleDegrees: -6,
    initialVelocityMetersPerSecond: 1_200,
  },
  systems: {
    enableOrbitalTransfer: true,
    enablePlaneChange: true,
    enableReentryAnalysis: true,
    enableVehicleComparison: true,
  },
  tps: {
    heatingCoefficient: 0.00000183,
    noseRadiusMetres: 1.2,
    safetyFactor: 1.5,
  },
  vehicle: {
    dragCoefficient: 1.1,
    massKilograms: 6_000,
    referenceAreaSquareMetres: 14,
    vehicleName: "Custom Reentry Vehicle",
  },
};

describe("createCustomMissionProfile", () => {
  it("creates the existing mission-profile contract for all enabled systems", () => {
    expect(createCustomMissionProfile(completeConfiguration)).toEqual({
      deltaVBudget: {
        hohmannTransfer: {
          finalAltitudeMetres: 400_000,
          initialAltitudeMetres: 200_000,
        },
        missionName: "Custom Logistics Mission",
        orbitalPlaneChange: {
          inclinationChangeDegrees: 12,
          orbitalAltitudeMetres: 400_000,
        },
      },
      missionName: "Custom Logistics Mission",
      vehicleComparison: {
        heatingCoefficient: 0.00000183,
        initialAltitudeMeters: 10_000,
        initialFlightPathAngleDegrees: -6,
        initialVelocityMetersPerSecond: 1_200,
        safetyFactor: 1.5,
        vehicles: [
          {
            dragCoefficient: 1.1,
            massKilograms: 6_000,
            noseRadiusMetres: 1.2,
            referenceAreaSquareMetres: 14,
            vehicleName: "Custom Reentry Vehicle",
          },
        ],
      },
      vehicleReentryEvaluation: {
        heatingCoefficient: 0.00000183,
        initialAltitudeMeters: 10_000,
        initialFlightPathAngleDegrees: -6,
        initialVelocityMetersPerSecond: 1_200,
        safetyFactor: 1.5,
        vehicle: {
          dragCoefficient: 1.1,
          massKilograms: 6_000,
          noseRadiusMetres: 1.2,
          referenceAreaSquareMetres: 14,
          vehicleName: "Custom Reentry Vehicle",
        },
      },
    });
  });

  it("preserves source values without adding engineering outputs", () => {
    const profile = createCustomMissionProfile(completeConfiguration);

    expect(profile.deltaVBudget?.hohmannTransfer?.initialAltitudeMetres).toBe(
      completeConfiguration.orbital.initialAltitudeMetres,
    );
    expect(
      profile.vehicleReentryEvaluation?.vehicle.referenceAreaSquareMetres,
    ).toBe(completeConfiguration.vehicle.referenceAreaSquareMetres);
    expect(profile).not.toHaveProperty("analysis");
    expect(profile).not.toHaveProperty("totalDeltaVMetresPerSecond");
    expect(profile).not.toHaveProperty("thermalHistory");
    expect(profile).not.toHaveProperty("recommendedMaterial");
  });

  it("omits every optional system when all system toggles are disabled", () => {
    const profile = createCustomMissionProfile({
      ...completeConfiguration,
      systems: {
        enableOrbitalTransfer: false,
        enablePlaneChange: false,
        enableReentryAnalysis: false,
        enableVehicleComparison: false,
      },
    });

    expect(profile).toEqual({ missionName: "Custom Logistics Mission" });
  });

  it("omits blank optional reentry values while preserving required inputs", () => {
    const profile = createCustomMissionProfile({
      ...completeConfiguration,
      reentry: {
        initialAltitudeMeters: 8_000,
        initialVelocityMetersPerSecond: 900,
      },
      systems: {
        enableOrbitalTransfer: false,
        enablePlaneChange: false,
        enableReentryAnalysis: true,
        enableVehicleComparison: false,
      },
      tps: {
        noseRadiusMetres: 0.8,
        safetyFactor: 1.25,
      },
    });

    expect(profile.vehicleReentryEvaluation).toMatchObject({
      initialAltitudeMeters: 8_000,
      initialVelocityMetersPerSecond: 900,
      safetyFactor: 1.25,
    });
    expect(profile.vehicleReentryEvaluation).not.toHaveProperty(
      "heatingCoefficient",
    );
    expect(profile.vehicleReentryEvaluation).not.toHaveProperty(
      "initialFlightPathAngleDegrees",
    );
  });

  it.each([
    ["mission name", { missionName: " " }],
    ["description", { description: "" }],
  ])("rejects an empty %s", (_label, identityUpdate) => {
    expect(() =>
      createCustomMissionProfile({
        ...completeConfiguration,
        identity: {
          ...completeConfiguration.identity,
          ...identityUpdate,
        },
      }),
    ).toThrowError(RangeError);
  });

  it("rejects an unsupported mission category", () => {
    expect(() =>
      createCustomMissionProfile({
        ...completeConfiguration,
        identity: {
          ...completeConfiguration.identity,
          category:
            "unsupported" as CustomMissionConfiguration["identity"]["category"],
        },
      }),
    ).toThrowError(new RangeError("Mission category is not supported."));
  });

  it("delegates numerical validation by preserving invalid numeric input", () => {
    const profile = createCustomMissionProfile({
      ...completeConfiguration,
      orbital: {
        ...completeConfiguration.orbital,
        initialAltitudeMetres: Number.NaN,
      },
    });

    expect(
      profile.deltaVBudget?.hohmannTransfer?.initialAltitudeMetres,
    ).toBeNaN();
  });
});
