import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  generateMissionInsights,
  analyzeMissionProfile,
  analyzeVehicleReentryEvaluation,
} from "@/features/engineering-lab/analysis";
import { generateMissionReport } from "@/features/engineering-lab/reports";
import type {
  MissionProfileInputs,
  VehicleReentryEvaluationInputs,
} from "@/features/engineering-lab/types";

import { MissionInsightsPanel } from "./mission-insights-panel";

const reentryInputs: VehicleReentryEvaluationInputs = {
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  safetyFactor: 1.5,
  vehicle: {
    dragCoefficient: 1.5,
    massKilograms: 5_000,
    noseRadiusMetres: 1,
    referenceAreaSquareMetres: 12,
    vehicleName: "Insights Panel Vehicle",
  },
};

const missionInputs: MissionProfileInputs = {
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Insights panel delta-v budget",
    orbitalPlaneChange: {
      inclinationChangeDegrees: 5,
      orbitalAltitudeMetres: 400_000,
    },
  },
  missionName: "Mission Insights Panel Test",
  vehicleReentryEvaluation: reentryInputs,
};

const missionAnalysis = analyzeMissionProfile(missionInputs);
const missionReport = generateMissionReport({
  description: "An aerospace briefing panel test.",
  missionProfileAnalysis: missionAnalysis,
});
const vehicleEvaluation = analyzeVehicleReentryEvaluation(reentryInputs);
const insights = generateMissionInsights(
  missionAnalysis,
  missionReport,
  vehicleEvaluation,
);

describe("MissionInsightsPanel", () => {
  it("renders mission summary cards and all structured insight headings", () => {
    const markup = renderToStaticMarkup(
      <MissionInsightsPanel analysis={insights} />,
    );

    expect(markup).toContain("Aerospace Mission Analyst");
    expect(markup).toContain("Mission Engineering Insights");
    expect(markup).toContain("Mission Insights Panel Test");
    expect(markup).toContain("Insight sections");
    expect(markup).toContain("Systems interpreted");
    expect(markup).toContain("Mission Overview");
    expect(markup).toContain("Orbital Analysis");
    expect(markup).toContain("Vehicle Analysis");
  });

  it("displays existing thermal and TPS insight content", () => {
    const markup = renderToStaticMarkup(
      <MissionInsightsPanel analysis={insights} />,
    );
    const tps = missionReport.thermalAnalysis?.tpsRecommendation;

    expect(markup).toContain("Thermal Analysis");
    expect(markup).toContain("peak heat flux");
    expect(markup).toContain(tps?.material.name ?? "missing TPS material");
    expect(markup).toContain(
      tps?.thermalMargin.classification ?? "missing margin classification",
    );
  });

  it("renders educational tradeoffs and unchanged source assumptions", () => {
    const markup = renderToStaticMarkup(
      <MissionInsightsPanel analysis={insights} />,
    );

    expect(markup).toContain("Engineering Tradeoffs");
    expect(markup).toContain("Lower TPS mass");
    expect(markup).toContain("Plane-change maneuvers");
    expect(markup).toContain("Source assumptions");
    for (const assumption of missionReport.missionAssessment.modelAssumptions) {
      expect(markup).toContain(assumption);
    }
  });

  it("uses native expandable sections and announces generated insights", () => {
    const markup = renderToStaticMarkup(
      <MissionInsightsPanel analysis={insights} />,
    );

    expect(markup).toContain("<details");
    expect(markup).toContain("<summary");
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain("Generated 6 deterministic mission insight");
  });

  it("renders an explicit empty state when no structured analysis is supplied", () => {
    const markup = renderToStaticMarkup(
      <MissionInsightsPanel analysis={null} />,
    );

    expect(markup).toContain("Mission insights unavailable");
    expect(markup).toContain(
      "Completed mission-profile and report objects are required",
    );
  });
});
