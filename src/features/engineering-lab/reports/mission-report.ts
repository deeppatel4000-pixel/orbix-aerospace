import type {
  MissionProfileAnalysis,
  MissionReport,
  MissionReportInputs,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

const REPORT_ASSUMPTIONS = [
  "All source-analysis assumptions remain unchanged.",
  "Reported values use the units and conventions of their source analyses.",
  "Optional sections appear only when the corresponding source result is available.",
] as const;

const REPORT_LIMITATIONS = [
  "This report is not a mission-feasibility or flight-certification assessment.",
  "No additional optimization, vehicle ranking, or TPS material selection is performed.",
  "The report does not replace detailed engineering review or qualification testing.",
] as const;

function listSystemsUsed(analysis: MissionProfileAnalysis): readonly string[] {
  const systems: string[] = [];

  if (analysis.missionSummaryState.hasDeltaVBudget) {
    systems.push("Delta-v budget");
  }

  if (analysis.missionSummaryState.hasVehicleReentryEvaluation) {
    systems.push("Vehicle reentry evaluation");
  }

  if (analysis.missionSummaryState.hasVehicleComparison) {
    systems.push("Vehicle comparison");
  }

  return systems;
}

function resolveSelectedEvaluation(
  analysis: MissionProfileAnalysis,
): VehicleReentryEvaluationAnalysis | undefined {
  return (
    analysis.selectedVehicleRecommendation?.evaluation ??
    analysis.sourceAnalyses.vehicleReentryEvaluation
  );
}

/**
 * Organizes an existing mission-profile result into report-ready sections.
 * This domain performs no engineering calculations, ranking, or selection.
 */
export function generateMissionReport(
  inputs: MissionReportInputs,
): MissionReport {
  const { description, missionProfileAnalysis } = inputs;

  if (missionProfileAnalysis.missionName.trim().length === 0) {
    throw new RangeError("Mission report mission name must not be empty.");
  }

  if (description.trim().length === 0) {
    throw new RangeError("Mission report description must not be empty.");
  }

  const deltaVBudget = missionProfileAnalysis.sourceAnalyses.deltaVBudget;
  const selectedEvaluation = resolveSelectedEvaluation(missionProfileAnalysis);
  const selectedRecommendation =
    missionProfileAnalysis.selectedVehicleRecommendation;

  return {
    missionAssessment: {
      educationalSummary:
        "This educational report organizes existing Orbix mission-profile outputs without adding analysis or determining mission feasibility.",
      limitations: REPORT_LIMITATIONS,
      modelAssumptions: REPORT_ASSUMPTIONS,
    },
    missionSummary: {
      description,
      missionName: missionProfileAnalysis.missionName,
      systemsUsed: listSystemsUsed(missionProfileAnalysis),
    },
    ...(deltaVBudget === undefined
      ? {}
      : {
          orbitalAnalysis: {
            ...deltaVBudget.sourceAnalyses,
            maneuvers: deltaVBudget.maneuvers,
            totalDeltaVMetresPerSecond: deltaVBudget.totalDeltaVMetresPerSecond,
          },
        }),
    sourceAnalysis: missionProfileAnalysis,
    ...(selectedEvaluation === undefined
      ? {}
      : {
          thermalAnalysis: {
            thermalSummary: selectedEvaluation.summary.thermal,
            ...(missionProfileAnalysis.tpsRecommendation === undefined
              ? {}
              : {
                  tpsRecommendation: {
                    estimatedTPSMassKilograms:
                      selectedEvaluation.summary.tps.estimatedTPSMassKilograms,
                    material: missionProfileAnalysis.tpsRecommendation,
                    requiredThickness:
                      selectedEvaluation.summary.tps.requiredThickness,
                    thermalMargin: selectedEvaluation.summary.tps.thermalMargin,
                  },
                }),
          },
          vehicleAnalysis: {
            ...(selectedRecommendation === undefined
              ? {}
              : { comparisonRecommendation: selectedRecommendation }),
            performanceSummary: {
              dynamics: selectedEvaluation.summary.dynamics,
              flight: selectedEvaluation.summary.flight,
            },
            selectedVehicle: selectedEvaluation.vehicle,
          },
        }),
  };
}
