import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  analyzeMissionProfile,
  generateMissionInsights,
} from "@/features/engineering-lab/analysis";
import { generateMissionReport } from "@/features/engineering-lab/reports";
import type {
  MissionPreset,
  MissionProfileInputs,
} from "@/features/engineering-lab/types";

import { MissionBriefing } from "./mission-briefing";

const missionInputs: MissionProfileInputs = {
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Mission Briefing Delta-v Budget",
    orbitalPlaneChange: {
      inclinationChangeDegrees: 5,
      orbitalAltitudeMetres: 400_000,
    },
  },
  missionName: "Mission Briefing Integration Test",
  vehicleReentryEvaluation: {
    initialAltitudeMeters: 1_000,
    initialVelocityMetersPerSecond: 150,
    safetyFactor: 1.5,
    vehicle: {
      dragCoefficient: 1.5,
      massKilograms: 5_000,
      noseRadiusMetres: 1,
      referenceAreaSquareMetres: 12,
      vehicleName: "Briefing Test Vehicle",
    },
  },
};

const missionProfile = analyzeMissionProfile(missionInputs);
const report = generateMissionReport({
  description: "A completed educational aerospace briefing scenario.",
  missionProfileAnalysis: missionProfile,
});
const insights = generateMissionInsights(missionProfile, report);
const preset: MissionPreset = {
  category: "orbital-logistics",
  description: "Demonstrates an educational orbital logistics briefing.",
  id: "mission-briefing-test",
  missionProfileInputs: missionInputs,
  name: "Mission Briefing Integration Test",
};

describe("MissionBriefing", () => {
  it("renders the mission title and premium briefing structure", () => {
    const markup = renderToStaticMarkup(
      <MissionBriefing
        insights={insights}
        missionProfile={missionProfile}
        preset={preset}
        report={report}
      />,
    );

    expect(markup).toContain("Mission profile // Executive briefing");
    expect(markup).toContain("Mission Briefing Integration Test");
    expect(markup).toContain("Mission Overview");
    expect(markup).toContain("Mission Objectives");
    expect(markup).toContain("Engineering Summary");
    expect(markup).toContain("Mission Architecture Timeline");
  });

  it("displays category and presentation-only mission status", () => {
    const markup = renderToStaticMarkup(
      <MissionBriefing missionProfile={missionProfile} preset={preset} />,
    );

    expect(markup).toContain("Orbital logistics");
    expect(markup).toContain("Simulation review");
    expect(markup).toContain("Educational mission");
    expect(markup).toContain("does not assess mission feasibility");
  });

  it("renders orbital summary values from supplied mission outputs", () => {
    const markup = renderToStaticMarkup(
      <MissionBriefing missionProfile={missionProfile} report={report} />,
    );

    expect(markup).toContain("Hohmann transfer");
    expect(markup).toContain("Total delta-v");
    expect(markup).toContain("Transfer duration");
    expect(markup).toContain("m/s");
  });

  it("renders vehicle and thermal summaries from supplied report data", () => {
    const markup = renderToStaticMarkup(
      <MissionBriefing missionProfile={missionProfile} report={report} />,
    );

    expect(markup).toContain("Briefing Test Vehicle");
    expect(markup).toContain("Peak deceleration");
    expect(markup).toContain("Reentry duration");
    expect(markup).toContain("Peak heating");
    expect(markup).toContain(
      report.thermalAnalysis?.tpsRecommendation?.material.name ??
        "missing TPS material",
    );
    expect(markup).toContain("Margin classification");
  });

  it("presents explanatory objectives and the educational timeline", () => {
    const markup = renderToStaticMarkup(
      <MissionBriefing missionProfile={missionProfile} report={report} />,
    );

    expect(markup).toContain(
      "Establish and review the supplied transfer-orbit",
    );
    expect(markup).toContain("Evaluate the completed vehicle reentry profile");
    expect(markup).toContain(
      "Review thermal loading and TPS selection outputs",
    );
    expect(markup).toContain("Launch");
    expect(markup).toContain("Orbit insertion");
    expect(markup).toContain("Recovery review");
    expect(markup).toContain("Not simulated");
  });

  it("handles missions without optional report, preset, or insight data", () => {
    const shell = analyzeMissionProfile({ missionName: "Briefing Shell" });
    const markup = renderToStaticMarkup(
      <MissionBriefing missionProfile={shell} />,
    );

    expect(markup).toContain("Briefing Shell");
    expect(markup).toContain("Custom educational mission");
    expect(markup).toContain("no optional analysis systems reported");
    expect(markup).toContain("Not reported");
    expect(markup).not.toContain("Engineering Briefing Notes");
  });

  it("provides semantic labels, live status, and reduced-motion fallbacks", () => {
    const markup = renderToStaticMarkup(
      <MissionBriefing missionProfile={missionProfile} report={report} />,
    );

    expect(markup).toContain(
      'aria-label="Mission briefing for Mission Briefing Integration Test"',
    );
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('role="status"');
    expect(markup).toContain("<ol");
    expect(markup).toContain("motion-reduce:animate-none");
    expect(markup).toContain("motion-reduce:transition-none");
  });
});
