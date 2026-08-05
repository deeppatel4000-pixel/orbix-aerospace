import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { analyzeVehicleReentryEvaluation } from "@/features/engineering-lab/analysis";
import type { VehicleReentryEvaluationAnalysis } from "@/features/engineering-lab/types";

import { ReentryProfileVisualization } from "./reentry-profile-visualization";

const referenceAnalysis = analyzeVehicleReentryEvaluation({
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  safetyFactor: 1.5,
  vehicle: {
    dragCoefficient: 1.5,
    massKilograms: 5_000,
    noseRadiusMetres: 1,
    referenceAreaSquareMetres: 12,
    vehicleName: "Visualization Reference Vehicle",
  },
});

describe("ReentryProfileVisualization", () => {
  it("renders a completed reentry profile with engineering labels", () => {
    const markup = renderToStaticMarkup(
      createElement(ReentryProfileVisualization, {
        analysis: referenceAnalysis,
      }),
    );

    expect(markup).toContain("Reentry Profile Visualization");
    expect(markup).toContain("Visualization Reference Vehicle");
    expect(markup).toContain("ALTITUDE PROFILE");
    expect(markup).toContain("VELOCITY");
    expect(markup).toContain("PEAK HEATING");
    expect(markup).toContain("PEAK DECELERATION");
    expect(markup).toContain("<svg");
  });

  it("retains the trajectory when thermal points are unavailable", () => {
    const analysisWithoutThermalPoints: VehicleReentryEvaluationAnalysis = {
      ...referenceAnalysis,
      thermalHistory: {
        ...referenceAnalysis.thermalHistory,
        thermalPoints: [],
      },
    };
    const markup = renderToStaticMarkup(
      createElement(ReentryProfileVisualization, {
        analysis: analysisWithoutThermalPoints,
      }),
    );

    expect(markup).toContain("ALTITUDE PROFILE");
    expect(markup).toContain("Thermal profile unavailable");
    expect(markup).not.toContain("PEAK HEATING");
  });

  it("renders an accessible empty state for a missing analysis", () => {
    const markup = renderToStaticMarkup(
      createElement(ReentryProfileVisualization, { analysis: null }),
    );

    expect(markup).toContain("Reentry visualization unavailable");
    expect(markup).toContain(
      "completed vehicle reentry evaluation with trajectory points",
    );
    expect(markup).not.toContain("Vehicle reentry time history");
  });

  it("renders an empty state when trajectory data is empty", () => {
    const analysisWithoutTrajectory: VehicleReentryEvaluationAnalysis = {
      ...referenceAnalysis,
      trajectory: {
        ...referenceAnalysis.trajectory,
        trajectoryPoints: [],
      },
    };
    const markup = renderToStaticMarkup(
      createElement(ReentryProfileVisualization, {
        analysis: analysisWithoutTrajectory,
      }),
    );

    expect(markup).toContain("Reentry visualization unavailable");
  });
});
