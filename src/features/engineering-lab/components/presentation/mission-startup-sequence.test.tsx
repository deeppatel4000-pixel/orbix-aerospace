import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { analyzeMissionProfile } from "@/features/engineering-lab/analysis";
import { generateMissionReport } from "@/features/engineering-lab/reports";

import {
  INITIAL_MISSION_STARTUP_STATE,
  MissionStartupSequence,
  missionStartupSequenceReducer,
} from "./mission-startup-sequence";
import { MISSION_STARTUP_STEPS, StartupProgress } from "./startup-progress";

const missionProfile = analyzeMissionProfile({
  deltaVBudget: {
    missionName: "Startup delta-v budget",
    maneuvers: [
      {
        deltaVMetresPerSecond: 120,
        id: "startup-maneuver",
        name: "Educational maneuver",
      },
    ],
  },
  missionName: "ORBIX Startup Test Mission",
});

const missionReport = generateMissionReport({
  description: "A supplied mission used to verify the startup presentation.",
  missionProfileAnalysis: missionProfile,
});

describe("MissionStartupSequence", () => {
  it("renders the initialization experience before supplied workspace content", () => {
    const markup = renderToStaticMarkup(
      <MissionStartupSequence
        missionCategory="orbital-deployment"
        missionProfileAnalysis={missionProfile}
        missionReport={missionReport}
      >
        <p>Existing Mission Control workspace</p>
      </MissionStartupSequence>,
    );

    expect(markup).toContain("ORBIX");
    expect(markup).toContain("Mission Control Initialization");
    expect(markup).toContain("System Initialization");
    expect(markup).toContain("Mission profile loaded");
    expect(markup).toContain("Existing Mission Control workspace");
    expect(markup).toContain('data-startup-status="active"');
  });

  it("progresses through all three fixed presentation steps", () => {
    const synchronized = missionStartupSequenceReducer(
      INITIAL_MISSION_STARTUP_STATE,
      { type: "advance" },
    );
    const ready = missionStartupSequenceReducer(synchronized, {
      type: "advance",
    });
    const complete = missionStartupSequenceReducer(ready, {
      type: "advance",
    });

    expect(synchronized).toEqual({ currentStepIndex: 1, status: "active" });
    expect(ready).toEqual({ currentStepIndex: 2, status: "active" });
    expect(complete).toEqual({ currentStepIndex: 2, status: "complete" });
  });

  it("skips the sequence and replays it from the first step", () => {
    const skipped = missionStartupSequenceReducer(
      INITIAL_MISSION_STARTUP_STATE,
      { type: "skip" },
    );
    const replayed = missionStartupSequenceReducer(skipped, {
      type: "replay",
    });

    expect(skipped.status).toBe("complete");
    expect(replayed).toEqual(INITIAL_MISSION_STARTUP_STATE);
  });

  it("displays mission information supplied through completed objects", () => {
    const markup = renderToStaticMarkup(
      <MissionStartupSequence
        missionCategory="orbital-deployment"
        missionProfileAnalysis={missionProfile}
        missionReport={missionReport}
      >
        <p>Workspace</p>
      </MissionStartupSequence>,
    );

    expect(markup).toContain("ORBIX Startup Test Mission");
    expect(markup).toContain("Educational simulation");
    expect(markup).toContain('data-check-availability="available"');
  });

  it("provides semantic progress and accessible keyboard instructions", () => {
    const markup = renderToStaticMarkup(
      <MissionStartupSequence missionProfileAnalysis={missionProfile}>
        <p>Workspace</p>
      </MissionStartupSequence>,
    );

    expect(markup).toContain(
      'aria-label="ORBIX Mission Control initialization"',
    );
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain("Press Enter to continue");
    expect(markup).toContain('aria-label="Skip Mission Control startup"');
    expect(markup).toContain('aria-label="Continue Mission Control startup"');
  });

  it("exposes the current startup progress state", () => {
    const markup = renderToStaticMarkup(
      <StartupProgress currentStepIndex={1} />,
    );

    expect(MISSION_STARTUP_STEPS).toHaveLength(3);
    expect(markup).toContain('aria-current="step"');
    expect(markup).toContain('data-step-status="complete"');
    expect(markup).toContain('data-step-status="active"');
    expect(markup).toContain('data-step-status="pending"');
  });

  it("supports reduced motion without removing mission information", () => {
    const markup = renderToStaticMarkup(
      <MissionStartupSequence
        missionProfileAnalysis={missionProfile}
        reducedMotionOverride
      >
        <p>Workspace</p>
      </MissionStartupSequence>,
    );

    expect(markup).toContain('data-reduced-motion="true"');
    expect(markup).toContain("motion-reduce:animate-none");
    expect(markup).toContain("motion-reduce:transition-none");
    expect(markup).toContain("ORBIX Startup Test Mission");
  });

  it("reports unavailable mission systems without inventing replacement data", () => {
    const markup = renderToStaticMarkup(
      <MissionStartupSequence>
        <p>Empty workspace</p>
      </MissionStartupSequence>,
    );

    expect(markup).toContain("Not Reported");
    expect(markup).toContain('data-check-availability="not-supplied"');
    expect(markup).toContain("Empty workspace");
  });
});
