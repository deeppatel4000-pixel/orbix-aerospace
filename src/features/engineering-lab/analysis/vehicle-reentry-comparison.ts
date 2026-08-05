import type {
  VehicleReentryComparisonAnalysis,
  VehicleReentryComparisonInputs,
  VehicleReentryComparisonResult,
  VehicleReentryEvaluationAnalysis,
  VehicleReentryEvaluationInputs,
} from "@/features/engineering-lab/types";

import { analyzeVehicleReentryEvaluation } from "./vehicle-reentry-evaluation";

const RANKING_CRITERIA = {
  primary: "lowest-tps-mass",
  secondary: "lowest-required-tps-thickness",
  tertiary: "lowest-peak-deceleration",
} as const;

function toComparisonResult(
  evaluation: VehicleReentryEvaluationAnalysis,
): VehicleReentryComparisonResult {
  return {
    evaluation,
    peakDeceleration: evaluation.summary.dynamics.peakDeceleration,
    peakHeating: {
      altitudeMeters: evaluation.summary.thermal.peakHeatingAltitudeMeters,
      heatFluxKilowattsPerSquareMetre:
        evaluation.summary.thermal.peakHeatFluxKilowattsPerSquareMetre,
      heatFluxWattsPerSquareMetre:
        evaluation.summary.thermal.peakHeatFluxWattsPerSquareMetre,
      timeSeconds: evaluation.thermalHistory.peakHeatFluxLocation.timeSeconds,
      velocityMetersPerSecond:
        evaluation.thermalHistory.peakHeatFluxLocation.velocityMetersPerSecond,
    },
    recommendedTPSMaterial: evaluation.summary.tps.recommendedMaterial,
    thermalClassification: evaluation.summary.tps.thermalMargin.classification,
    thermalMargin: evaluation.summary.tps.thermalMargin,
    totalHeatLoad: {
      heatLoadJoulesPerSquareMetre:
        evaluation.summary.thermal.totalHeatLoadJoulesPerSquareMetre,
      heatLoadMegajoulesPerSquareMetre:
        evaluation.summary.thermal.totalHeatLoadMegajoulesPerSquareMetre,
    },
    tpsMassKilograms: evaluation.summary.tps.estimatedTPSMassKilograms,
    tpsThickness: evaluation.summary.tps.requiredThickness,
    trajectorySummary: evaluation.summary.flight,
    vehicle: evaluation.vehicle,
    vehicleName: evaluation.vehicle.vehicleName,
  };
}

function compareRankedVehicles(
  first: VehicleReentryComparisonResult,
  second: VehicleReentryComparisonResult,
): number {
  const massDifference = first.tpsMassKilograms - second.tpsMassKilograms;

  if (massDifference !== 0) return massDifference;

  const thicknessDifference =
    first.tpsThickness.metres - second.tpsThickness.metres;

  if (thicknessDifference !== 0) return thicknessDifference;

  return (
    first.peakDeceleration.decelerationMetersPerSecondSquared -
    second.peakDeceleration.decelerationMetersPerSecondSquared
  );
}

/**
 * Evaluates caller-supplied vehicle configurations under identical reentry
 * conditions, then ranks their existing evaluation outputs. Ranking is an
 * educational ordering of analysis results, not a new engineering model or a
 * flight-vehicle design recommendation.
 */
export function analyzeVehicleReentryComparison(
  inputs: VehicleReentryComparisonInputs,
): VehicleReentryComparisonAnalysis {
  if (inputs.vehicles.length === 0) {
    throw new RangeError(
      "Vehicle reentry comparison requires at least one vehicle.",
    );
  }

  const { vehicles, ...sharedReentryConditions } = inputs;
  const evaluatedVehicles = vehicles.map((vehicle) => {
    const evaluationInputs: VehicleReentryEvaluationInputs = {
      ...sharedReentryConditions,
      vehicle,
    };

    return toComparisonResult(
      analyzeVehicleReentryEvaluation(evaluationInputs),
    );
  });
  const ranking = evaluatedVehicles
    .map((result, inputIndex) => ({ inputIndex, result }))
    .sort(
      (first, second) =>
        compareRankedVehicles(first.result, second.result) ||
        first.inputIndex - second.inputIndex,
    )
    .map(({ result }) => result);
  const recommendedVehicle = ranking[0];

  if (!recommendedVehicle) {
    throw new Error("Vehicle reentry comparison did not produce a result.");
  }

  return {
    comparisonMetadata: {
      rankingCriteria: RANKING_CRITERIA,
      sharedReentryConditions,
      vehiclesCompared: evaluatedVehicles.length,
    },
    evaluatedVehicles,
    ranking,
    recommendedVehicle,
  };
}
