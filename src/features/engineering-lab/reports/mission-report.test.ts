import { describe, expect, it } from "vitest";

import type {
  MissionProfileAnalysis,
  MissionProfileInputs,
  VehicleReentryConfiguration,
} from "@/features/engineering-lab/types";

import { analyzeMissionProfile } from "../analysis";
import { generateMissionReport } from "./mission-report";

const referenceVehicle: VehicleReentryConfiguration = {
  dragCoefficient: 1.5,
  massKilograms: 5_000,
  noseRadiusMetres: 1,
  referenceAreaSquareMetres: 12,
  vehicleName: "Reference Vehicle",
};

const compactVehicle: VehicleReentryConfiguration = {
  dragCoefficient: 1.3,
  massKilograms: 3_600,
  noseRadiusMetres: 0.8,
  referenceAreaSquareMetres: 9,
  vehicleName: "Compact Vehicle",
};

const completeMissionInputs: MissionProfileInputs = {
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Integrated mission delta-v budget",
    orbitalPlaneChange: {
      inclinationChangeDegrees: 5,
      orbitalAltitudeMetres: 400_000,
    },
  },
  missionName: "Integrated educational mission",
  vehicleComparison: {
    initialAltitudeMeters: 1_000,
    initialVelocityMetersPerSecond: 150,
    safetyFactor: 1.5,
    vehicles: [referenceVehicle, compactVehicle],
  },
  vehicleReentryEvaluation: {
    initialAltitudeMeters: 1_000,
    initialVelocityMetersPerSecond: 150,
    safetyFactor: 1.5,
    vehicle: referenceVehicle,
  },
};

const completeAnalysis = analyzeMissionProfile(completeMissionInputs);

describe("generateMissionReport", () => {
  it("creates every report section for a complete mission profile", () => {
    const report = generateMissionReport({
      description: "An integrated orbital and reentry learning scenario.",
      missionProfileAnalysis: completeAnalysis,
    });

    expect(report.missionSummary).toEqual({
      description: "An integrated orbital and reentry learning scenario.",
      missionName: completeAnalysis.missionName,
      systemsUsed: [
        "Delta-v budget",
        "Vehicle reentry evaluation",
        "Vehicle comparison",
      ],
    });
    expect(report.orbitalAnalysis).toBeDefined();
    expect(report.vehicleAnalysis).toBeDefined();
    expect(report.thermalAnalysis).toBeDefined();
    expect(report.missionAssessment.modelAssumptions.length).toBeGreaterThan(0);
    expect(report.missionAssessment.limitations.length).toBeGreaterThan(0);
  });

  it("creates a partial report from an orbital-only mission profile", () => {
    const analysis = analyzeMissionProfile({
      deltaVBudget: completeMissionInputs.deltaVBudget,
      missionName: "Orbital-only mission",
    });
    const report = generateMissionReport({
      description: "An orbital maneuver report.",
      missionProfileAnalysis: analysis,
    });

    expect(report.missionSummary.systemsUsed).toEqual(["Delta-v budget"]);
    expect(report.orbitalAnalysis).toBeDefined();
    expect(report.vehicleAnalysis).toBeUndefined();
    expect(report.thermalAnalysis).toBeUndefined();
  });

  it("omits every optional engineering section when no system was resolved", () => {
    const analysis = analyzeMissionProfile({ missionName: "Mission shell" });
    const report = generateMissionReport({
      description: "A report shell awaiting engineering analyses.",
      missionProfileAnalysis: analysis,
    });

    expect(report.missionSummary.systemsUsed).toEqual([]);
    expect(report.orbitalAnalysis).toBeUndefined();
    expect(report.vehicleAnalysis).toBeUndefined();
    expect(report.thermalAnalysis).toBeUndefined();
    expect(report.sourceAnalysis).toBe(analysis);
  });

  it("preserves source analyses and their engineering values", () => {
    const report = generateMissionReport({
      description: "A value-preservation report.",
      missionProfileAnalysis: completeAnalysis,
    });
    const deltaVBudget = completeAnalysis.sourceAnalyses.deltaVBudget;
    const selectedVehicle = completeAnalysis.selectedVehicleRecommendation;

    expect(report.sourceAnalysis).toBe(completeAnalysis);
    expect(report.orbitalAnalysis?.hohmannTransfer).toBe(
      deltaVBudget?.sourceAnalyses.hohmannTransfer,
    );
    expect(report.orbitalAnalysis?.orbitalPlaneChange).toBe(
      deltaVBudget?.sourceAnalyses.orbitalPlaneChange,
    );
    expect(report.orbitalAnalysis?.maneuvers).toBe(deltaVBudget?.maneuvers);
    expect(report.orbitalAnalysis?.totalDeltaVMetresPerSecond).toBe(
      completeAnalysis.totalDeltaVMetresPerSecond,
    );
    expect(report.vehicleAnalysis?.comparisonRecommendation).toBe(
      selectedVehicle,
    );
    expect(report.vehicleAnalysis?.selectedVehicle).toBe(
      selectedVehicle?.evaluation.vehicle,
    );
    expect(report.thermalAnalysis?.thermalSummary).toBe(
      selectedVehicle?.evaluation.summary.thermal,
    );
    expect(report.thermalAnalysis?.tpsRecommendation?.material).toBe(
      completeAnalysis.tpsRecommendation,
    );
    expect(
      report.thermalAnalysis?.tpsRecommendation?.estimatedTPSMassKilograms,
    ).toBe(selectedVehicle?.evaluation.summary.tps.estimatedTPSMassKilograms);
  });

  it.each(["", "   ", "\t\n"])(
    "rejects an empty report mission name %j",
    (missionName) => {
      const invalidAnalysis: MissionProfileAnalysis = {
        ...completeAnalysis,
        missionName,
      };

      expect(() =>
        generateMissionReport({
          description: "A report with invalid identity data.",
          missionProfileAnalysis: invalidAnalysis,
        }),
      ).toThrowError(
        new RangeError("Mission report mission name must not be empty."),
      );
    },
  );

  it.each(["", "   ", "\t\n"])(
    "rejects an empty report description %j",
    (description) => {
      expect(() =>
        generateMissionReport({
          description,
          missionProfileAnalysis: completeAnalysis,
        }),
      ).toThrowError(
        new RangeError("Mission report description must not be empty."),
      );
    },
  );
});
