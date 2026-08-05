import type {
  DeltaVBudgetAnalysis,
  MissionProfileAnalysis,
  MissionProfileInputs,
  TPSMaterial,
  VehicleReentryComparisonAnalysis,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

import { analyzeDeltaVBudget } from "./delta-v-budget";
import { analyzeVehicleReentryComparison } from "./vehicle-reentry-comparison";
import { analyzeVehicleReentryEvaluation } from "./vehicle-reentry-evaluation";

/**
 * Resolves the optional mission systems supplied by the caller and exposes
 * their existing results through a single mission profile. This layer reports
 * analysis availability only and makes no mission-feasibility determination.
 */
export function analyzeMissionProfile(
  inputs: MissionProfileInputs,
): MissionProfileAnalysis {
  if (inputs.missionName.trim().length === 0) {
    throw new RangeError("Mission name must not be empty.");
  }

  let deltaVBudget: DeltaVBudgetAnalysis | undefined;
  let vehicleReentryEvaluation: VehicleReentryEvaluationAnalysis | undefined;
  let vehicleComparison: VehicleReentryComparisonAnalysis | undefined;

  if (inputs.deltaVBudget !== undefined) {
    deltaVBudget = analyzeDeltaVBudget(inputs.deltaVBudget);
  }

  if (inputs.vehicleReentryEvaluation !== undefined) {
    vehicleReentryEvaluation = analyzeVehicleReentryEvaluation(
      inputs.vehicleReentryEvaluation,
    );
  }

  if (inputs.vehicleComparison !== undefined) {
    vehicleComparison = analyzeVehicleReentryComparison(
      inputs.vehicleComparison,
    );
  }

  const selectedVehicleRecommendation = vehicleComparison?.recommendedVehicle;
  const tpsRecommendation: TPSMaterial | undefined =
    selectedVehicleRecommendation?.recommendedTPSMaterial ??
    vehicleReentryEvaluation?.summary.tps.recommendedMaterial;
  const analysesResolved = [
    deltaVBudget,
    vehicleReentryEvaluation,
    vehicleComparison,
  ].filter((analysis) => analysis !== undefined).length;

  return {
    missionName: inputs.missionName,
    missionSummaryState: {
      analysesResolved,
      hasDeltaVBudget: deltaVBudget !== undefined,
      hasVehicleComparison: vehicleComparison !== undefined,
      hasVehicleReentryEvaluation: vehicleReentryEvaluation !== undefined,
    },
    ...(selectedVehicleRecommendation === undefined
      ? {}
      : { selectedVehicleRecommendation }),
    sourceAnalyses: {
      ...(deltaVBudget === undefined ? {} : { deltaVBudget }),
      ...(vehicleComparison === undefined ? {} : { vehicleComparison }),
      ...(vehicleReentryEvaluation === undefined
        ? {}
        : { vehicleReentryEvaluation }),
    },
    ...(deltaVBudget === undefined
      ? {}
      : {
          totalDeltaVMetresPerSecond: deltaVBudget.totalDeltaVMetresPerSecond,
        }),
    ...(tpsRecommendation === undefined ? {} : { tpsRecommendation }),
  };
}
