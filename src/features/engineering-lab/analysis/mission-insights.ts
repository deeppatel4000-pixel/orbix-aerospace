import type {
  MissionInsight,
  MissionInsightsAnalysis,
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

const insightFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 2,
});

function formatMeasurement(value: number, unit: string): string {
  return `${insightFormatter.format(value)} ${unit}`;
}

function resolveVehicleEvaluation(
  missionProfileAnalysis: MissionProfileAnalysis,
  vehicleReentryEvaluation: VehicleReentryEvaluationAnalysis | undefined,
): VehicleReentryEvaluationAnalysis | undefined {
  return (
    vehicleReentryEvaluation ??
    missionProfileAnalysis.selectedVehicleRecommendation?.evaluation ??
    missionProfileAnalysis.sourceAnalyses.vehicleReentryEvaluation
  );
}

/**
 * Interprets completed mission outputs as deterministic educational prose.
 * This function performs no physics, sizing, ranking, or optimization.
 */
export function generateMissionInsights(
  missionProfileAnalysis: MissionProfileAnalysis,
  missionReport: MissionReport,
  vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis,
): MissionInsightsAnalysis {
  const deltaVBudget = missionProfileAnalysis.sourceAnalyses.deltaVBudget;
  const transfer = deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const planeChange = deltaVBudget?.sourceAnalyses.orbitalPlaneChange;
  const resolvedVehicleEvaluation = resolveVehicleEvaluation(
    missionProfileAnalysis,
    vehicleReentryEvaluation,
  );
  const vehicleReport = missionReport.vehicleAnalysis;
  const thermalReport = missionReport.thermalAnalysis;
  const tpsRecommendation = thermalReport?.tpsRecommendation;
  const systems = missionReport.missionSummary.systemsUsed;

  const overviewDetails =
    systems.length > 0
      ? systems.map(
          (system) => `${system} is represented by a completed source result.`,
        )
      : [
          "No optional mission systems are present in the completed mission profile.",
        ];
  const overviewSummary =
    systems.length > 0
      ? `This mission integrates ${systems.join(", ")} through completed Orbix outputs.`
      : "This mission profile contains identity and report context without optional engineering systems.";

  const orbitalDetails: string[] = [];

  if (deltaVBudget) {
    orbitalDetails.push(
      `The existing mission budget reports ${formatMeasurement(deltaVBudget.totalDeltaVMetresPerSecond, "m/s")} across ${deltaVBudget.numberOfManeuvers} maneuvers.`,
    );

    if (deltaVBudget.largestDeltaVContributor) {
      orbitalDetails.push(
        `${deltaVBudget.largestDeltaVContributor.name} is the existing budget's largest reported contributor at ${formatMeasurement(deltaVBudget.largestDeltaVContributor.deltaVMetresPerSecond, "m/s")}.`,
      );
    }
  } else {
    orbitalDetails.push(
      "No orbital delta-v budget is present in the supplied mission analysis.",
    );
  }

  if (transfer) {
    orbitalDetails.push(
      `A resolved Hohmann transfer connects the reported ${formatMeasurement(transfer.initialOrbit.altitudeMetres, "m")} and ${formatMeasurement(transfer.finalOrbit.altitudeMetres, "m")} circular-orbit altitudes.`,
      `The source transfer analysis reports a duration of ${formatMeasurement(transfer.transfer.transferTimeHours, "h")}.`,
    );
  }

  if (planeChange) {
    orbitalDetails.push(
      `The resolved plane change is ${formatMeasurement(planeChange.inclinationChangeDegrees, "deg")} and contributes ${formatMeasurement(planeChange.deltaVMetresPerSecond, "m/s")} in its existing source result.`,
    );
  }

  const vehicleDetails: string[] = [];

  if (vehicleReport) {
    vehicleDetails.push(
      `${vehicleReport.selectedVehicle.vehicleName} is the vehicle carried into the structured mission report.`,
    );

    if (vehicleReport.comparisonRecommendation) {
      vehicleDetails.push(
        `${vehicleReport.comparisonRecommendation.vehicleName} is the existing vehicle-comparison recommendation; this insight layer does not rerank candidates.`,
      );
    }
  } else {
    vehicleDetails.push(
      "No selected vehicle is present in the supplied mission report.",
    );
  }

  if (resolvedVehicleEvaluation) {
    vehicleDetails.push(
      `The source evaluation reports peak deceleration of ${formatMeasurement(resolvedVehicleEvaluation.summary.dynamics.peakDeceleration.decelerationMetersPerSecondSquared, "m/s²")} (${formatMeasurement(resolvedVehicleEvaluation.summary.dynamics.peakDeceleration.decelerationGs, "g")}) and reentry duration of ${formatMeasurement(resolvedVehicleEvaluation.summary.flight.reentryDurationSeconds, "s")}.`,
    );
  }

  const thermalDetails: string[] = [];

  if (thermalReport) {
    thermalDetails.push(
      `The existing thermal history reports peak heat flux of ${formatMeasurement(thermalReport.thermalSummary.peakHeatFluxKilowattsPerSquareMetre, "kW/m²")} and total heat load of ${formatMeasurement(thermalReport.thermalSummary.totalHeatLoadMegajoulesPerSquareMetre, "MJ/m²")}.`,
    );
  } else {
    thermalDetails.push(
      "No thermal-history result is present in the supplied mission report.",
    );
  }

  if (tpsRecommendation) {
    thermalDetails.push(
      `${tpsRecommendation.material.name} is the existing TPS recommendation, with reported thickness ${formatMeasurement(tpsRecommendation.requiredThickness.millimetres, "mm")} and estimated mass ${formatMeasurement(tpsRecommendation.estimatedTPSMassKilograms, "kg")}.`,
      `The source TPS result classifies the thermal margin as ${tpsRecommendation.thermalMargin.classification} and reports ${formatMeasurement(tpsRecommendation.thermalMargin.marginPercentage, "%")}.`,
    );
  }

  const insights: readonly MissionInsight[] = [
    {
      category: "mission-overview",
      details: overviewDetails,
      id: "mission-overview",
      summary: overviewSummary,
      title: "Mission Overview",
    },
    {
      category: "orbital-analysis",
      details: orbitalDetails,
      id: "orbital-analysis",
      summary: deltaVBudget
        ? "Resolved orbital maneuvers and their existing delta-v contributions are available for review."
        : "Orbital maneuver outputs are not included in this mission profile.",
      title: "Orbital Analysis",
    },
    {
      category: "vehicle-analysis",
      details: vehicleDetails,
      id: "vehicle-analysis",
      summary: vehicleReport
        ? "Vehicle interpretation preserves the selected configuration and existing comparison outcome."
        : "Vehicle selection and performance outputs are not included in this report.",
      title: "Vehicle Analysis",
    },
    {
      category: "thermal-analysis",
      details: thermalDetails,
      id: "thermal-analysis",
      summary: thermalReport
        ? "Thermal interpretation reports the existing heating history and TPS result without resizing the protection system."
        : "Thermal-history and TPS outputs are not included in this report.",
      title: "Thermal Analysis",
    },
    {
      category: "engineering-tradeoffs",
      details: [
        "Lower TPS mass can reduce vehicle mass, while thermal margin remains a separate constraint represented by the existing TPS result.",
        "Plane-change maneuvers redirect orbital velocity and are commonly delta-v intensive; the mission budget remains authoritative for this scenario.",
        "Vehicle mass, aerodynamic geometry, heating exposure, and protection-system mass describe coupled design concerns rather than a single optimum.",
      ],
      id: "engineering-tradeoffs",
      summary:
        "These tradeoffs provide educational context only and do not change source selections, rankings, or mission outputs.",
      title: "Engineering Tradeoffs",
    },
    {
      category: "limitations",
      details: [
        ...missionReport.missionAssessment.modelAssumptions,
        ...missionReport.missionAssessment.limitations,
      ],
      id: "limitations",
      summary: missionReport.missionAssessment.educationalSummary,
      title: "Limitations",
    },
  ];

  return {
    assumptions: missionReport.missionAssessment.modelAssumptions,
    insights,
    limitations: missionReport.missionAssessment.limitations,
    missionName: missionReport.missionSummary.missionName,
    sourceAvailability: {
      hasOrbitalAnalysis: missionReport.orbitalAnalysis !== undefined,
      hasThermalAnalysis: thermalReport !== undefined,
      hasVehicleAnalysis: vehicleReport !== undefined,
      hasVehicleReentryEvaluation: resolvedVehicleEvaluation !== undefined,
    },
    systemsInterpreted: systems,
  };
}
