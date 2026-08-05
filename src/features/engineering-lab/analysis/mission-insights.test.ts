import { describe, expect, it } from "vitest";

import { generateMissionReport } from "@/features/engineering-lab/reports";
import type {
  MissionProfileInputs,
  VehicleReentryEvaluationInputs,
} from "@/features/engineering-lab/types";

import { generateMissionInsights } from "./mission-insights";
import { analyzeMissionProfile } from "./mission-profile";
import { analyzeVehicleReentryEvaluation } from "./vehicle-reentry-evaluation";

const reentryInputs: VehicleReentryEvaluationInputs = {
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  safetyFactor: 1.5,
  vehicle: {
    dragCoefficient: 1.5,
    massKilograms: 5_000,
    noseRadiusMetres: 1,
    referenceAreaSquareMetres: 12,
    vehicleName: "Insights Test Vehicle",
  },
};

const completeMissionInputs: MissionProfileInputs = {
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Insights delta-v budget",
    orbitalPlaneChange: {
      inclinationChangeDegrees: 5,
      orbitalAltitudeMetres: 400_000,
    },
  },
  missionName: "Aerospace Mission Analyst Test",
  vehicleReentryEvaluation: reentryInputs,
};

const completeAnalysis = analyzeMissionProfile(completeMissionInputs);
const completeReport = generateMissionReport({
  description: "A deterministic mission-insight test scenario.",
  missionProfileAnalysis: completeAnalysis,
});
const completeEvaluation = analyzeVehicleReentryEvaluation(reentryInputs);

describe("generateMissionInsights", () => {
  it("generates a structured mission overview from completed source systems", () => {
    const result = generateMissionInsights(
      completeAnalysis,
      completeReport,
      completeEvaluation,
    );
    const overview = result.insights.find(
      (insight) => insight.category === "mission-overview",
    );

    expect(result.missionName).toBe("Aerospace Mission Analyst Test");
    expect(overview?.title).toBe("Mission Overview");
    expect(overview?.summary).toContain("Delta-v budget");
    expect(overview?.summary).toContain("Vehicle reentry evaluation");
    expect(result.sourceAvailability).toEqual({
      hasOrbitalAnalysis: true,
      hasThermalAnalysis: true,
      hasVehicleAnalysis: true,
      hasVehicleReentryEvaluation: true,
    });
  });

  it("describes resolved orbital outputs without replacing their source values", () => {
    const result = generateMissionInsights(completeAnalysis, completeReport);
    const orbital = result.insights.find(
      (insight) => insight.category === "orbital-analysis",
    );
    const sourceBudget = completeAnalysis.sourceAnalyses.deltaVBudget;

    expect(orbital?.details.join(" ")).toContain("Hohmann transfer");
    expect(orbital?.details.join(" ")).toContain("plane change");
    expect(orbital?.details.join(" ")).toContain(
      new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 3,
        minimumFractionDigits: 2,
      }).format(sourceBudget?.totalDeltaVMetresPerSecond ?? 0),
    );
  });

  it("displays thermal history, existing TPS selection, and source margin classification", () => {
    const result = generateMissionInsights(
      completeAnalysis,
      completeReport,
      completeEvaluation,
    );
    const thermal = result.insights.find(
      (insight) => insight.category === "thermal-analysis",
    );
    const thermalText = thermal?.details.join(" ") ?? "";
    const tps = completeReport.thermalAnalysis?.tpsRecommendation;

    expect(thermalText).toContain("peak heat flux");
    expect(thermalText).toContain(tps?.material.name);
    expect(thermalText).toContain(tps?.thermalMargin.classification);
    expect(thermalText).toContain("estimated mass");
  });

  it("returns deterministic educational tradeoffs without changing recommendations", () => {
    const first = generateMissionInsights(
      completeAnalysis,
      completeReport,
      completeEvaluation,
    );
    const second = generateMissionInsights(
      completeAnalysis,
      completeReport,
      completeEvaluation,
    );
    const tradeoffs = first.insights.find(
      (insight) => insight.category === "engineering-tradeoffs",
    );

    expect(first).toEqual(second);
    expect(tradeoffs?.details).toHaveLength(3);
    expect(tradeoffs?.details.join(" ")).toContain("TPS mass");
    expect(tradeoffs?.details.join(" ")).toContain("Plane-change maneuvers");
    expect(first.insights).toHaveLength(6);
  });

  it("handles a mission profile with no optional engineering systems", () => {
    const analysis = analyzeMissionProfile({ missionName: "Insight shell" });
    const report = generateMissionReport({
      description: "A report with no optional analysis systems.",
      missionProfileAnalysis: analysis,
    });
    const result = generateMissionInsights(analysis, report);

    expect(result.systemsInterpreted).toEqual([]);
    expect(result.sourceAvailability).toEqual({
      hasOrbitalAnalysis: false,
      hasThermalAnalysis: false,
      hasVehicleAnalysis: false,
      hasVehicleReentryEvaluation: false,
    });
    expect(
      result.insights.find((insight) => insight.category === "mission-overview")
        ?.summary,
    ).toContain("without optional engineering systems");
    expect(
      result.insights.find((insight) => insight.category === "thermal-analysis")
        ?.summary,
    ).toContain("not included");
  });

  it("preserves report assumptions and limitations in the structured output", () => {
    const result = generateMissionInsights(completeAnalysis, completeReport);
    const limitations = result.insights.find(
      (insight) => insight.category === "limitations",
    );

    expect(result.assumptions).toBe(
      completeReport.missionAssessment.modelAssumptions,
    );
    expect(result.limitations).toBe(
      completeReport.missionAssessment.limitations,
    );
    expect(limitations?.details).toEqual([
      ...completeReport.missionAssessment.modelAssumptions,
      ...completeReport.missionAssessment.limitations,
    ]);
  });
});
