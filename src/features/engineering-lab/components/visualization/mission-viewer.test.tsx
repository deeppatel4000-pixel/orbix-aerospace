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

import { MissionViewer } from "./mission-viewer";

const reentryInputs: VehicleReentryEvaluationInputs = {
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  safetyFactor: 1.5,
  vehicle: {
    dragCoefficient: 1.5,
    massKilograms: 5_000,
    noseRadiusMetres: 1,
    referenceAreaSquareMetres: 12,
    vehicleName: "Unified Viewer Vehicle",
  },
};

const completeMissionInputs: MissionProfileInputs = {
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Unified viewer delta-v budget",
    orbitalPlaneChange: {
      inclinationChangeDegrees: 5,
      orbitalAltitudeMetres: 400_000,
    },
  },
  missionName: "Unified Mission Viewer Test",
  vehicleReentryEvaluation: reentryInputs,
};

const completeAnalysis = analyzeMissionProfile(completeMissionInputs);
const completeReport = generateMissionReport({
  description: "An integrated visualization test mission.",
  missionProfileAnalysis: completeAnalysis,
});
const completeReentryEvaluation =
  analyzeVehicleReentryEvaluation(reentryInputs);

describe("MissionViewer", () => {
  it("renders the mission name and mission-control hierarchy", () => {
    const markup = renderToStaticMarkup(
      <MissionViewer
        missionProfileAnalysis={completeAnalysis}
        missionReport={completeReport}
        vehicleReentryEvaluation={completeReentryEvaluation}
      />,
    );

    expect(markup).toContain("Mission Control");
    expect(markup).toContain("Unified Mission Viewer Test");
    expect(markup).toContain("Mission Summary");
    expect(markup).toContain("Mission Phases");
    expect(markup).toContain("Visualization Panel");
    expect(markup).toContain("Engineering Telemetry");
  });

  it("displays report-provided engineering telemetry", () => {
    const markup = renderToStaticMarkup(
      <MissionViewer
        missionProfileAnalysis={completeAnalysis}
        missionReport={completeReport}
        vehicleReentryEvaluation={completeReentryEvaluation}
      />,
    );

    expect(markup).toContain("Total delta-v");
    expect(markup).toContain("Transfer time");
    expect(markup).toContain("Peak heating");
    expect(markup).toContain("TPS mass");
    expect(markup).toContain("Thermal margin");
    expect(markup).toContain(
      new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 3,
        minimumFractionDigits: 2,
      }).format(
        completeReport.orbitalAnalysis?.totalDeltaVMetresPerSecond ?? 0,
      ),
    );
  });

  it("renders the existing orbit visualization when orbital output is available", () => {
    const markup = renderToStaticMarkup(
      <MissionViewer
        missionProfileAnalysis={completeAnalysis}
        missionReport={completeReport}
        vehicleReentryEvaluation={completeReentryEvaluation}
      />,
    );

    expect(markup).toContain("Mission Orbit Visualization");
    expect(markup).toContain("TRANSFER PATH");
    expect(markup).toContain("Orbit Transfer");
    expect(markup).toContain("Arrival Orbit");
  });

  it("renders the existing reentry visualization when evaluation output is available", () => {
    const markup = renderToStaticMarkup(
      <MissionViewer
        missionProfileAnalysis={completeAnalysis}
        missionReport={completeReport}
        vehicleReentryEvaluation={completeReentryEvaluation}
      />,
    );

    expect(markup).toContain("Reentry Profile Visualization");
    expect(markup).toContain("Unified Viewer Vehicle");
    expect(markup).toContain("PEAK HEATING");
    expect(markup).toContain("Thermal Protection");
  });

  it("provides keyboard-navigable phase controls", () => {
    const markup = renderToStaticMarkup(
      <MissionViewer
        missionProfileAnalysis={completeAnalysis}
        missionReport={completeReport}
        vehicleReentryEvaluation={completeReentryEvaluation}
      />,
    );

    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('role="tab"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('tabindex="0"');
    expect(markup).toContain("Arrow keys navigate phases");
  });

  it("handles missing optional mission, orbital, thermal, and reentry outputs", () => {
    const analysis = analyzeMissionProfile({ missionName: "Viewer shell" });
    const report = generateMissionReport({
      description: "A mission viewer empty-state scenario.",
      missionProfileAnalysis: analysis,
    });
    const markup = renderToStaticMarkup(
      <MissionViewer
        missionProfileAnalysis={analysis}
        missionReport={report}
        vehicleReentryEvaluation={null}
      />,
    );

    expect(markup).toContain("Viewer shell");
    expect(markup).toContain("No optional mission systems reported");
    expect(markup).toContain("Orbital visualization unavailable");
    expect(markup).toContain("Reentry visualization unavailable");
    expect(markup).toContain("Orbit Transfer");
    expect(markup).toContain("Educational");
    expect(markup).toContain("Not reported");
  });
});
