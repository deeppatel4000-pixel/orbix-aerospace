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

import {
  buildReplayPhases,
  MissionReplay,
  missionReplayReducer,
  type MissionReplayState,
} from "./mission-replay";

const initialReplayState: MissionReplayState = {
  currentPhaseIndex: 0,
  isPlaying: false,
  speed: 1,
};

const reentryInputs: VehicleReentryEvaluationInputs = {
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  safetyFactor: 1.5,
  vehicle: {
    dragCoefficient: 1.5,
    massKilograms: 5_000,
    noseRadiusMetres: 1,
    referenceAreaSquareMetres: 12,
    vehicleName: "Replay Test Vehicle",
  },
};

const missionInputs: MissionProfileInputs = {
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Replay delta-v budget",
    orbitalPlaneChange: {
      inclinationChangeDegrees: 5,
      orbitalAltitudeMetres: 400_000,
    },
  },
  missionName: "Mission Replay Test",
  vehicleReentryEvaluation: reentryInputs,
};

const missionAnalysis = analyzeMissionProfile(missionInputs);
const missionReport = generateMissionReport({
  description: "A completed presentation replay scenario.",
  missionProfileAnalysis: missionAnalysis,
});
const reentryEvaluation = analyzeVehicleReentryEvaluation(reentryInputs);

describe("MissionReplay", () => {
  it("renders replay controls, progress, speed options, and synchronized presentation", () => {
    const markup = renderToStaticMarkup(
      <MissionReplay
        missionProfileAnalysis={missionAnalysis}
        missionReport={missionReport}
        vehicleReentryEvaluation={reentryEvaluation}
      />,
    );

    expect(markup).toContain("Mission Replay");
    expect(markup).toContain("Play mission replay");
    expect(markup).toContain("Pause mission replay");
    expect(markup).toContain("Restart mission replay");
    expect(markup).toContain("Mission replay speed");
    expect(markup).toContain("0.5x");
    expect(markup).toContain("1x");
    expect(markup).toContain("2x");
    expect(markup).toContain("Mission replay progress");
    expect(markup).toContain("Synchronized Telemetry");
    expect(markup).toContain("Interactive 3D Mission Scene");
  });

  it("starts playback through the local replay state reducer", () => {
    const state = missionReplayReducer(initialReplayState, { type: "play" });

    expect(state.isPlaying).toBe(true);
    expect(state.currentPhaseIndex).toBe(0);
  });

  it("pauses playback without changing the current phase", () => {
    const state = missionReplayReducer(
      { ...initialReplayState, currentPhaseIndex: 2, isPlaying: true },
      { type: "pause" },
    );

    expect(state.isPlaying).toBe(false);
    expect(state.currentPhaseIndex).toBe(2);
  });

  it("restarts the mission at its first phase and stops playback", () => {
    const state = missionReplayReducer(
      { ...initialReplayState, currentPhaseIndex: 5, isPlaying: true },
      { type: "restart" },
    );

    expect(state).toEqual(initialReplayState);
  });

  it("builds supported phases and advances or selects presentation phases", () => {
    const phases = buildReplayPhases({
      missionProfileAnalysis: missionAnalysis,
      missionReport,
      vehicleReentryEvaluation: reentryEvaluation,
    });
    const advanced = missionReplayReducer(
      { ...initialReplayState, isPlaying: true },
      { totalPhases: phases.length, type: "advance" },
    );
    const selected = missionReplayReducer(advanced, {
      phaseIndex: phases.length - 1,
      type: "select-phase",
    });

    expect(phases.map((phase) => phase.label)).toEqual([
      "Mission Preparation",
      "Launch / Departure",
      "Orbital Operations",
      "Transfer Maneuver",
      "Arrival / Cruise",
      "Reentry Preparation",
      "Atmospheric Entry",
      "Mission Complete",
    ]);
    expect(advanced.currentPhaseIndex).toBe(1);
    expect(selected.currentPhaseIndex).toBe(phases.length - 1);
    expect(selected.isPlaying).toBe(false);
  });

  it("handles missing mission data with an explicit empty state", () => {
    const phases = buildReplayPhases({});
    const markup = renderToStaticMarkup(<MissionReplay />);

    expect(phases).toEqual([]);
    expect(markup).toContain("Replay sequence unavailable");
    expect(markup).toContain(
      "Supply a completed mission analysis, report, or vehicle reentry evaluation",
    );
  });

  it("provides a non-animated reduced-motion fallback", () => {
    const markup = renderToStaticMarkup(
      <MissionReplay
        missionProfileAnalysis={missionAnalysis}
        missionReport={missionReport}
        reducedMotionOverride
        vehicleReentryEvaluation={reentryEvaluation}
      />,
    );

    expect(markup).toContain('data-reduced-motion="true"');
    expect(markup).toContain("Reduced motion mode is active");
    expect(markup).toContain("decorative motion is suppressed");
  });
});
