import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  analyzeMissionProfile,
  generateMissionInsights,
} from "@/features/engineering-lab/analysis";
import { generateMissionReport } from "@/features/engineering-lab/reports";
import type { MissionProfileInputs } from "@/features/engineering-lab/types";

import {
  INITIAL_SHOWCASE_STATE,
  MissionShowcase,
  missionShowcaseReducer,
} from "./mission-showcase";
import { SHOWCASE_PHASES } from "./showcase-phase";

const missionInputs: MissionProfileInputs = {
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Showcase Delta-v Budget",
    orbitalPlaneChange: {
      inclinationChangeDegrees: 5,
      orbitalAltitudeMetres: 400_000,
    },
  },
  missionName: "Cinematic Showcase Mission",
  vehicleReentryEvaluation: {
    initialAltitudeMeters: 1_000,
    initialVelocityMetersPerSecond: 150,
    safetyFactor: 1.5,
    vehicle: {
      dragCoefficient: 1.5,
      massKilograms: 5_000,
      noseRadiusMetres: 1,
      referenceAreaSquareMetres: 12,
      vehicleName: "Showcase Test Vehicle",
    },
  },
};

const missionProfile = analyzeMissionProfile(missionInputs);
const report = generateMissionReport({
  description: "A completed educational mission showcase scenario.",
  missionProfileAnalysis: missionProfile,
});
const insights = generateMissionInsights(missionProfile, report);

describe("MissionShowcase", () => {
  it("renders the mission title and walkthrough shell", () => {
    const markup = renderToStaticMarkup(
      <MissionShowcase
        insights={insights}
        missionProfile={missionProfile}
        report={report}
      />,
    );

    expect(markup).toContain("Mission walkthrough");
    expect(markup).toContain("Cinematic Showcase Mission");
    expect(markup).toContain("not a flight simulation");
  });

  it("renders all six storytelling phases", () => {
    const markup = renderToStaticMarkup(
      <MissionShowcase missionProfile={missionProfile} />,
    );

    expect(SHOWCASE_PHASES).toHaveLength(6);
    expect(markup).toContain("Launch preparation");
    expect(markup).toContain("Orbit insertion");
    expect(markup).toContain("Orbital transfer");
    expect(markup).toContain("Arrival and mission phase");
    expect(markup).toContain("Atmospheric entry");
    expect(markup).toContain("Mission review");
  });

  it("supports phase navigation through presentation state", () => {
    const next = missionShowcaseReducer(INITIAL_SHOWCASE_STATE, {
      type: "next",
    });
    const selected = missionShowcaseReducer(next, {
      phaseIndex: 4,
      type: "select",
    });
    const previous = missionShowcaseReducer(selected, { type: "previous" });

    expect(next.currentPhaseIndex).toBe(1);
    expect(selected).toEqual({ currentPhaseIndex: 4, isPlaying: false });
    expect(previous.currentPhaseIndex).toBe(3);
  });

  it("supports play, pause, and restart controls", () => {
    const playing = missionShowcaseReducer(INITIAL_SHOWCASE_STATE, {
      type: "play",
    });
    const paused = missionShowcaseReducer(playing, { type: "pause" });
    const restarted = missionShowcaseReducer(
      { currentPhaseIndex: 3, isPlaying: true },
      { type: "restart" },
    );

    expect(playing.isPlaying).toBe(true);
    expect(paused.isPlaying).toBe(false);
    expect(restarted).toEqual(INITIAL_SHOWCASE_STATE);
  });

  it("renders supplied orbital, vehicle, and thermal telemetry", () => {
    const markup = renderToStaticMarkup(
      <MissionShowcase missionProfile={missionProfile} report={report} />,
    );

    expect(markup).toContain("Mission values");
    expect(markup).toContain("Delta-v");
    expect(markup).toContain("Transfer time");
    expect(markup).toContain("Peak deceleration");
    expect(markup).toContain("Peak heat flux");
    expect(markup).toContain("TPS material");
    expect(markup).toContain("TPS mass");
    expect(markup).toContain(
      report.thermalAnalysis?.tpsRecommendation?.material.name ??
        "missing TPS material",
    );
  });

  it("exposes accessible controls, phase announcements, and keyboard help", () => {
    const markup = renderToStaticMarkup(
      <MissionShowcase missionProfile={missionProfile} />,
    );

    expect(markup).toContain('aria-label="Play mission showcase"');
    // Starts paused: Play is offered, Pause appears only while playing.
    expect(markup).not.toContain('aria-label="Pause mission showcase"');
    expect(markup).toContain('aria-label="Previous showcase phase"');
    expect(markup).toContain('aria-label="Next showcase phase"');
    expect(markup).toContain('aria-label="Restart mission showcase"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain("the left and right arrow");
  });

  it("starts paused and uses no decorative motion", () => {
    const markup = renderToStaticMarkup(
      <MissionShowcase missionProfile={missionProfile} />,
    );

    expect(markup).toContain("Showcase paused.");
    expect(markup).not.toContain("animate-");
    expect(markup).not.toContain("blur");
  });

  it("handles missing optional report and insight sections", () => {
    const shell = analyzeMissionProfile({ missionName: "Showcase Shell" });
    const markup = renderToStaticMarkup(
      <MissionShowcase missionProfile={shell} />,
    );

    expect(markup).toContain("Showcase Shell");
    expect(markup).toContain("Not reported");
    expect(markup).toContain("No values recalculated");
  });
});
