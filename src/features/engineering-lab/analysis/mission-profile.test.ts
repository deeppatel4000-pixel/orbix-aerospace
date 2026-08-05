import { describe, expect, it } from "vitest";

import type {
  DeltaVBudgetInputs,
  MissionProfileInputs,
  VehicleReentryComparisonInputs,
  VehicleReentryConfiguration,
  VehicleReentryEvaluationInputs,
} from "@/features/engineering-lab/types";

import { analyzeDeltaVBudget } from "./delta-v-budget";
import { analyzeMissionProfile } from "./mission-profile";
import { analyzeVehicleReentryComparison } from "./vehicle-reentry-comparison";
import { analyzeVehicleReentryEvaluation } from "./vehicle-reentry-evaluation";

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

const deltaVBudgetInputs: DeltaVBudgetInputs = {
  maneuvers: [
    {
      deltaVMetresPerSecond: 3_200,
      id: "departure-burn",
      name: "Departure burn",
    },
    {
      deltaVMetresPerSecond: 45,
      id: "course-correction",
      name: "Course correction",
    },
  ],
  missionName: "Reference delta-v budget",
};

const vehicleEvaluationInputs: VehicleReentryEvaluationInputs = {
  heatingCoefficient: 1.75e-4,
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  safetyFactor: 1.5,
  timestepSeconds: 2,
  vehicle: referenceVehicle,
};

const vehicleComparisonInputs: VehicleReentryComparisonInputs = {
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  safetyFactor: 1.5,
  vehicles: [referenceVehicle, compactVehicle],
};

describe("analyzeMissionProfile", () => {
  it.each(["", "   ", "\t\n"])(
    'rejects an empty mission name: "%s"',
    (missionName) => {
      expect(() => analyzeMissionProfile({ missionName })).toThrowError(
        new RangeError("Mission name must not be empty."),
      );
    },
  );

  it("integrates a delta-v budget and exposes its total", () => {
    const result = analyzeMissionProfile({
      deltaVBudget: deltaVBudgetInputs,
      missionName: "Orbital mission",
    });
    const directBudget = analyzeDeltaVBudget(deltaVBudgetInputs);

    expect(result.sourceAnalyses.deltaVBudget).toEqual(directBudget);
    expect(result.totalDeltaVMetresPerSecond).toBe(
      directBudget.totalDeltaVMetresPerSecond,
    );
    expect(result.missionSummaryState).toEqual({
      analysesResolved: 1,
      hasDeltaVBudget: true,
      hasVehicleComparison: false,
      hasVehicleReentryEvaluation: false,
    });
  });

  it("integrates a vehicle evaluation and exposes its TPS recommendation", () => {
    const result = analyzeMissionProfile({
      missionName: "Single-vehicle reentry",
      vehicleReentryEvaluation: vehicleEvaluationInputs,
    });
    const directEvaluation = analyzeVehicleReentryEvaluation(
      vehicleEvaluationInputs,
    );

    expect(result.sourceAnalyses.vehicleReentryEvaluation).toEqual(
      directEvaluation,
    );
    expect(result.tpsRecommendation).toEqual(
      directEvaluation.summary.tps.recommendedMaterial,
    );
    expect(result.selectedVehicleRecommendation).toBeUndefined();
  });

  it("integrates a vehicle comparison and exposes its selected vehicle", () => {
    const result = analyzeMissionProfile({
      missionName: "Vehicle trade study",
      vehicleComparison: vehicleComparisonInputs,
    });
    const directComparison = analyzeVehicleReentryComparison(
      vehicleComparisonInputs,
    );

    expect(result.sourceAnalyses.vehicleComparison).toEqual(directComparison);
    expect(result.selectedVehicleRecommendation).toEqual(
      directComparison.recommendedVehicle,
    );
    expect(result.tpsRecommendation).toEqual(
      directComparison.recommendedVehicle.recommendedTPSMaterial,
    );
  });

  it("combines every optional analysis without transforming source results", () => {
    const inputs: MissionProfileInputs = {
      deltaVBudget: deltaVBudgetInputs,
      missionName: "Integrated mission profile",
      vehicleComparison: vehicleComparisonInputs,
      vehicleReentryEvaluation: vehicleEvaluationInputs,
    };
    const result = analyzeMissionProfile(inputs);
    const directBudget = analyzeDeltaVBudget(deltaVBudgetInputs);
    const directEvaluation = analyzeVehicleReentryEvaluation(
      vehicleEvaluationInputs,
    );
    const directComparison = analyzeVehicleReentryComparison(
      vehicleComparisonInputs,
    );

    expect(result.sourceAnalyses).toEqual({
      deltaVBudget: directBudget,
      vehicleComparison: directComparison,
      vehicleReentryEvaluation: directEvaluation,
    });
    expect(result.totalDeltaVMetresPerSecond).toBe(
      directBudget.totalDeltaVMetresPerSecond,
    );
    expect(result.selectedVehicleRecommendation).toEqual(
      directComparison.recommendedVehicle,
    );
    expect(result.tpsRecommendation).toEqual(
      directComparison.recommendedVehicle.recommendedTPSMaterial,
    );
    expect(result.missionSummaryState).toEqual({
      analysesResolved: 3,
      hasDeltaVBudget: true,
      hasVehicleComparison: true,
      hasVehicleReentryEvaluation: true,
    });
  });

  it("keeps every optional system absent when none is supplied", () => {
    const result = analyzeMissionProfile({ missionName: "Mission shell" });

    expect(result).toEqual({
      missionName: "Mission shell",
      missionSummaryState: {
        analysesResolved: 0,
        hasDeltaVBudget: false,
        hasVehicleComparison: false,
        hasVehicleReentryEvaluation: false,
      },
      sourceAnalyses: {},
    });
  });

  it("delegates delta-v budget validation", () => {
    expect(() =>
      analyzeMissionProfile({
        deltaVBudget: {
          hohmannTransfer: {
            finalAltitudeMetres: 35_786_000,
            initialAltitudeMetres: -1,
          },
          missionName: "Invalid budget source",
        },
        missionName: "Delegated delta-v validation",
      }),
    ).toThrowError(RangeError);
  });

  it("delegates vehicle evaluation validation", () => {
    expect(() =>
      analyzeMissionProfile({
        missionName: "Delegated vehicle validation",
        vehicleReentryEvaluation: {
          ...vehicleEvaluationInputs,
          vehicle: {
            ...referenceVehicle,
            massKilograms: 0,
          },
        },
      }),
    ).toThrowError(RangeError);
  });

  it("delegates vehicle comparison validation", () => {
    expect(() =>
      analyzeMissionProfile({
        missionName: "Delegated comparison validation",
        vehicleComparison: {
          ...vehicleComparisonInputs,
          vehicles: [],
        },
      }),
    ).toThrowError(RangeError);
  });

  it("preserves optional source input propagation", () => {
    const result = analyzeMissionProfile({
      missionName: "Optional propagation",
      vehicleReentryEvaluation: vehicleEvaluationInputs,
    });

    expect(result.sourceAnalyses.vehicleReentryEvaluation).toEqual(
      analyzeVehicleReentryEvaluation(vehicleEvaluationInputs),
    );
  });
});
