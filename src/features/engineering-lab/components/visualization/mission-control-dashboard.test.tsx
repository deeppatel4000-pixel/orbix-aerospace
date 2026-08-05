import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  analyzeMissionProfile,
  analyzeVehicleReentryEvaluation,
} from "@/features/engineering-lab/analysis";
import { generateMissionReport } from "@/features/engineering-lab/reports";
import type {
  MissionProfileInputs,
  VehicleReentryEvaluationInputs,
} from "@/features/engineering-lab/types";

import { MissionControlDashboard } from "./mission-control-dashboard";
import { MissionStatusPanel } from "./mission-status-panel";

const reentryInputs: VehicleReentryEvaluationInputs = {
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  safetyFactor: 1.5,
  vehicle: {
    dragCoefficient: 1.5,
    massKilograms: 5_000,
    noseRadiusMetres: 1,
    referenceAreaSquareMetres: 12,
    vehicleName: "Mission Control Test Vehicle",
  },
};

const missionInputs: MissionProfileInputs = {
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Mission control delta-v budget",
    orbitalPlaneChange: {
      inclinationChangeDegrees: 5,
      orbitalAltitudeMetres: 400_000,
    },
  },
  missionName: "Mission Control Integration Test",
  vehicleReentryEvaluation: reentryInputs,
};

const missionAnalysis = analyzeMissionProfile(missionInputs);
const missionReport = generateMissionReport({
  description: "A completed educational mission-control scenario.",
  missionProfileAnalysis: missionAnalysis,
});
const reentryEvaluation = analyzeVehicleReentryEvaluation(reentryInputs);

describe("MissionControlDashboard", () => {
  it("renders the mission header and supplied mission metadata", () => {
    const markup = renderToStaticMarkup(
      <MissionControlDashboard
        missionCategory="orbital-logistics"
        missionProfileAnalysis={missionAnalysis}
        missionReport={missionReport}
        vehicleReentryEvaluation={reentryEvaluation}
      />,
    );

    expect(markup).toContain("ORBIX // Mission Control");
    expect(markup).toContain("Mission Control Integration Test");
    expect(markup).toContain("Orbital logistics");
    expect(markup).toContain("Systems resolved");
    expect(markup).toContain("Educational mission");
  });

  it("displays orbital, vehicle, and thermal metrics from supplied outputs", () => {
    const markup = renderToStaticMarkup(
      <MissionControlDashboard
        missionCategory="orbital-logistics"
        missionProfileAnalysis={missionAnalysis}
        missionReport={missionReport}
        vehicleReentryEvaluation={reentryEvaluation}
      />,
    );

    expect(markup).toContain("Mission Metrics");
    expect(markup).toContain("Initial altitude");
    expect(markup).toContain("Final altitude");
    expect(markup).toContain("Total delta-v");
    expect(markup).toContain("Mission Control Test Vehicle");
    expect(markup).toContain("Peak deceleration");
    expect(markup).toContain("Peak heat flux");
    expect(markup).toContain("TPS material");
    expect(markup).toContain("TPS thickness");
  });

  it("renders explicit empty states when completed mission objects are absent", () => {
    const markup = renderToStaticMarkup(
      <MissionControlDashboard
        missionProfileAnalysis={null}
        missionReport={null}
        vehicleReentryEvaluation={null}
      />,
    );

    expect(markup).toContain("Mission profile unavailable");
    expect(markup).toContain("Not reported");
    expect(markup).toContain('data-current-status="ready"');
    expect(markup).toContain("Unified mission visualization unavailable");
    expect(markup).toContain("Engineering review unavailable");
  });

  it("advances presentation status only when supplied objects exist", () => {
    const readyMarkup = renderToStaticMarkup(
      <MissionStatusPanel
        analysisAvailable={false}
        reportAvailable={false}
        visualizationAvailable={false}
      />,
    );
    const analysisMarkup = renderToStaticMarkup(
      <MissionStatusPanel
        analysisAvailable
        reportAvailable={false}
        visualizationAvailable={false}
      />,
    );
    const reportMarkup = renderToStaticMarkup(
      <MissionStatusPanel
        analysisAvailable
        reportAvailable
        visualizationAvailable={false}
      />,
    );
    const visualizationMarkup = renderToStaticMarkup(
      <MissionStatusPanel
        analysisAvailable
        reportAvailable
        visualizationAvailable
      />,
    );

    expect(readyMarkup).toContain('data-current-status="ready"');
    expect(analysisMarkup).toContain('data-current-status="analysis-complete"');
    expect(reportMarkup).toContain('data-current-status="report-generated"');
    expect(visualizationMarkup).toContain(
      'data-current-status="visualization-active"',
    );
  });

  it("provides keyboard-navigable visualization views", () => {
    const markup = renderToStaticMarkup(
      <MissionControlDashboard
        missionCategory="orbital-logistics"
        missionProfileAnalysis={missionAnalysis}
        missionReport={missionReport}
        vehicleReentryEvaluation={reentryEvaluation}
      />,
    );

    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('role="tab"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain("Unified Mission");
    expect(markup).toContain("Orbital View");
    expect(markup).toContain("Reentry View");
    expect(markup).toContain("Mission Timeline");
  });

  it("handles completed missions without optional orbital, vehicle, or thermal systems", () => {
    const analysis = analyzeMissionProfile({
      missionName: "Mission control shell",
    });
    const report = generateMissionReport({
      description: "A presentation-only mission shell.",
      missionProfileAnalysis: analysis,
    });
    const markup = renderToStaticMarkup(
      <MissionControlDashboard
        missionProfileAnalysis={analysis}
        missionReport={report}
      />,
    );

    expect(markup).toContain("Mission control shell");
    expect(markup).toContain("Mission Summary");
    expect(markup).toContain("Orbital visualization unavailable");
    expect(markup).toContain("Reentry visualization unavailable");
    expect(markup).toContain("Not reported");
    expect(markup).toContain("Engineering Review");
  });
});
