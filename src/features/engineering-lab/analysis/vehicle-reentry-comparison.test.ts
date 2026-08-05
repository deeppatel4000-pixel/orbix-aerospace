import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  VehicleReentryComparisonInputs,
  VehicleReentryConfiguration,
  VehicleReentryEvaluationAnalysis,
  VehicleReentryEvaluationInputs,
} from "@/features/engineering-lab/types";

import * as vehicleEvaluationModule from "./vehicle-reentry-evaluation";
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

const heavyVehicle: VehicleReentryConfiguration = {
  dragCoefficient: 1.6,
  massKilograms: 7_500,
  noseRadiusMetres: 1.4,
  referenceAreaSquareMetres: 15,
  vehicleName: "Heavy Vehicle",
};

const sharedReentryConditions = {
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  safetyFactor: 1.5,
} as const;

function createComparisonInputs(
  vehicles: readonly VehicleReentryConfiguration[],
): VehicleReentryComparisonInputs {
  return {
    ...sharedReentryConditions,
    vehicles,
  };
}

function toDirectEvaluationInputs(
  inputs: VehicleReentryComparisonInputs,
  vehicle: VehicleReentryConfiguration,
): VehicleReentryEvaluationInputs {
  const { vehicles, ...reentryConditions } = inputs;
  void vehicles;

  return {
    ...reentryConditions,
    vehicle,
  };
}

function withRankingMetrics(
  baseline: VehicleReentryEvaluationAnalysis,
  vehicle: VehicleReentryConfiguration,
  metrics: {
    readonly decelerationMetersPerSecondSquared: number;
    readonly thicknessMetres: number;
    readonly tpsMassKilograms: number;
  },
): VehicleReentryEvaluationAnalysis {
  return {
    ...baseline,
    summary: {
      ...baseline.summary,
      dynamics: {
        ...baseline.summary.dynamics,
        peakDeceleration: {
          ...baseline.summary.dynamics.peakDeceleration,
          decelerationMetersPerSecondSquared:
            metrics.decelerationMetersPerSecondSquared,
        },
      },
      tps: {
        ...baseline.summary.tps,
        estimatedTPSMassKilograms: metrics.tpsMassKilograms,
        requiredThickness: {
          metres: metrics.thicknessMetres,
          millimetres: metrics.thicknessMetres * 1_000,
        },
      },
    },
    vehicle,
  };
}

function getRangeErrorMessage(operation: () => unknown): string {
  try {
    operation();
  } catch (error) {
    if (error instanceof RangeError) return error.message;
    throw error;
  }

  throw new Error("Expected operation to throw a RangeError.");
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("analyzeVehicleReentryComparison", () => {
  it("evaluates two vehicles under shared reentry conditions", () => {
    const inputs = createComparisonInputs([referenceVehicle, compactVehicle]);
    const result = analyzeVehicleReentryComparison(inputs);

    expect(result.evaluatedVehicles).toHaveLength(2);
    expect(result.ranking).toHaveLength(2);
    expect(result.comparisonMetadata).toEqual({
      rankingCriteria: {
        primary: "lowest-tps-mass",
        secondary: "lowest-required-tps-thickness",
        tertiary: "lowest-peak-deceleration",
      },
      sharedReentryConditions,
      vehiclesCompared: 2,
    });
    expect(result.evaluatedVehicles.map((entry) => entry.vehicleName)).toEqual([
      referenceVehicle.vehicleName,
      compactVehicle.vehicleName,
    ]);
  });

  it("evaluates three supplied vehicle configurations", () => {
    const vehicles = [referenceVehicle, compactVehicle, heavyVehicle];
    const result = analyzeVehicleReentryComparison(
      createComparisonInputs(vehicles),
    );

    expect(result.comparisonMetadata.vehiclesCompared).toBe(3);
    expect(result.evaluatedVehicles.map((entry) => entry.vehicle)).toEqual(
      vehicles,
    );
    expect(new Set(result.ranking.map((entry) => entry.vehicleName))).toEqual(
      new Set(vehicles.map((vehicle) => vehicle.vehicleName)),
    );
  });

  it("preserves input order when otherwise identical vehicles tie", () => {
    const firstVehicle = {
      ...referenceVehicle,
      vehicleName: "Identical Vehicle A",
    };
    const secondVehicle = {
      ...referenceVehicle,
      vehicleName: "Identical Vehicle B",
    };
    const result = analyzeVehicleReentryComparison(
      createComparisonInputs([firstVehicle, secondVehicle]),
    );

    expect(result.evaluatedVehicles[0]?.evaluation.summary).toEqual(
      result.evaluatedVehicles[1]?.evaluation.summary,
    );
    expect(result.ranking.map((entry) => entry.vehicleName)).toEqual([
      firstVehicle.vehicleName,
      secondVehicle.vehicleName,
    ]);
    expect(result.recommendedVehicle).toBe(result.ranking[0]);
  });

  it("orders real evaluations by mass, thickness, and deceleration priorities", () => {
    const result = analyzeVehicleReentryComparison(
      createComparisonInputs([referenceVehicle, compactVehicle, heavyVehicle]),
    );

    for (let index = 1; index < result.ranking.length; index += 1) {
      const previous = result.ranking[index - 1];
      const current = result.ranking[index];

      expect(previous).toBeDefined();
      expect(current).toBeDefined();

      if (!previous || !current) continue;

      if (previous.tpsMassKilograms !== current.tpsMassKilograms) {
        expect(previous.tpsMassKilograms).toBeLessThan(
          current.tpsMassKilograms,
        );
      } else if (previous.tpsThickness.metres !== current.tpsThickness.metres) {
        expect(previous.tpsThickness.metres).toBeLessThan(
          current.tpsThickness.metres,
        );
      } else {
        expect(
          previous.peakDeceleration.decelerationMetersPerSecondSquared,
        ).toBeLessThanOrEqual(
          current.peakDeceleration.decelerationMetersPerSecondSquared,
        );
      }
    }

    expect(result.recommendedVehicle).toBe(result.ranking[0]);
  });

  it("uses thickness and peak deceleration as ranking tie-breaks", () => {
    const baseline = analyzeVehicleReentryEvaluation({
      ...sharedReentryConditions,
      vehicle: referenceVehicle,
    });
    const firstVehicle = { ...referenceVehicle, vehicleName: "First Vehicle" };
    const secondaryWinner = {
      ...referenceVehicle,
      vehicleName: "Secondary Winner",
    };
    const tertiaryWinner = {
      ...referenceVehicle,
      vehicleName: "Tertiary Winner",
    };
    const metricsByName: Readonly<
      Record<
        string,
        {
          readonly decelerationMetersPerSecondSquared: number;
          readonly thicknessMetres: number;
          readonly tpsMassKilograms: number;
        }
      >
    > = {
      "First Vehicle": {
        decelerationMetersPerSecondSquared: 5,
        thicknessMetres: 0.05,
        tpsMassKilograms: 100,
      },
      "Secondary Winner": {
        decelerationMetersPerSecondSquared: 10,
        thicknessMetres: 0.04,
        tpsMassKilograms: 100,
      },
      "Tertiary Winner": {
        decelerationMetersPerSecondSquared: 3,
        thicknessMetres: 0.04,
        tpsMassKilograms: 100,
      },
    };

    vi.spyOn(
      vehicleEvaluationModule,
      "analyzeVehicleReentryEvaluation",
    ).mockImplementation(({ vehicle }) => {
      const metrics = metricsByName[vehicle.vehicleName];

      if (!metrics) throw new Error("Missing comparison ranking test fixture.");

      return withRankingMetrics(baseline, vehicle, metrics);
    });

    const result = analyzeVehicleReentryComparison(
      createComparisonInputs([firstVehicle, secondaryWinner, tertiaryWinner]),
    );

    expect(result.ranking.map((entry) => entry.vehicleName)).toEqual([
      tertiaryWinner.vehicleName,
      secondaryWinner.vehicleName,
      firstVehicle.vehicleName,
    ]);
  });

  it("preserves each existing vehicle evaluation and its projected results", () => {
    const inputs: VehicleReentryComparisonInputs = {
      ...sharedReentryConditions,
      heatingCoefficient: 2e-4,
      initialFlightPathAngleDegrees: -60,
      timestepSeconds: 0.5,
      vehicles: [referenceVehicle, compactVehicle],
    };
    const result = analyzeVehicleReentryComparison(inputs);

    for (const entry of result.evaluatedVehicles) {
      const directEvaluation = analyzeVehicleReentryEvaluation(
        toDirectEvaluationInputs(inputs, entry.vehicle),
      );

      expect(entry.evaluation).toEqual(directEvaluation);
      expect(entry.trajectorySummary).toBe(entry.evaluation.summary.flight);
      expect(entry.peakDeceleration).toBe(
        entry.evaluation.summary.dynamics.peakDeceleration,
      );
      expect(entry.recommendedTPSMaterial).toBe(
        entry.evaluation.summary.tps.recommendedMaterial,
      );
      expect(entry.tpsThickness).toBe(
        entry.evaluation.summary.tps.requiredThickness,
      );
      expect(entry.thermalMargin).toBe(
        entry.evaluation.summary.tps.thermalMargin,
      );
      expect(entry.tpsMassKilograms).toBe(
        entry.evaluation.summary.tps.estimatedTPSMassKilograms,
      );
      expect(entry.peakHeating).toEqual({
        altitudeMeters:
          entry.evaluation.summary.thermal.peakHeatingAltitudeMeters,
        heatFluxKilowattsPerSquareMetre:
          entry.evaluation.summary.thermal.peakHeatFluxKilowattsPerSquareMetre,
        heatFluxWattsPerSquareMetre:
          entry.evaluation.summary.thermal.peakHeatFluxWattsPerSquareMetre,
        timeSeconds:
          entry.evaluation.thermalHistory.peakHeatFluxLocation.timeSeconds,
        velocityMetersPerSecond:
          entry.evaluation.thermalHistory.peakHeatFluxLocation
            .velocityMetersPerSecond,
      });
      expect(entry.totalHeatLoad).toEqual({
        heatLoadJoulesPerSquareMetre:
          entry.evaluation.summary.thermal.totalHeatLoadJoulesPerSquareMetre,
        heatLoadMegajoulesPerSquareMetre:
          entry.evaluation.summary.thermal
            .totalHeatLoadMegajoulesPerSquareMetre,
      });
      expect(entry.thermalClassification).toBe(
        entry.evaluation.summary.tps.thermalMargin.classification,
      );
    }
  });

  it("rejects an empty vehicle list locally", () => {
    expect(() =>
      analyzeVehicleReentryComparison(createComparisonInputs([])),
    ).toThrowError(
      new RangeError(
        "Vehicle reentry comparison requires at least one vehicle.",
      ),
    );
  });

  it.each([
    [
      "invalid shared altitude",
      {
        ...createComparisonInputs([referenceVehicle]),
        initialAltitudeMeters: -1,
      },
    ],
    [
      "invalid vehicle mass",
      createComparisonInputs([{ ...referenceVehicle, massKilograms: 0 }]),
    ],
    [
      "non-finite optional timestep",
      {
        ...createComparisonInputs([referenceVehicle]),
        timestepSeconds: Number.NaN,
      },
    ],
  ])("delegates %s validation to vehicle evaluation", (_label, inputs) => {
    const directInputs = toDirectEvaluationInputs(inputs, inputs.vehicles[0]!);
    const directMessage = getRangeErrorMessage(() =>
      analyzeVehicleReentryEvaluation(directInputs),
    );
    const comparisonMessage = getRangeErrorMessage(() =>
      analyzeVehicleReentryComparison(inputs),
    );

    expect(comparisonMessage).toBe(directMessage);
  });
});
