import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  analyzeMissionProfile,
  generateMissionInsights,
} from "@/features/engineering-lab/analysis";
import type { MissionScenario } from "@/features/engineering-lab/missions";
import { generateMissionReport } from "@/features/engineering-lab/reports";
import type { MissionProfileInputs } from "@/features/engineering-lab/types";

import {
  DemoMode,
  INITIAL_DEMO_MODE_STATE,
  demoModeReducer,
} from "./demo-mode";
import { DEMO_STEPS } from "./demo-step";

const missionInputs: MissionProfileInputs = {
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Demo Mode Delta-v Budget",
    orbitalPlaneChange: {
      inclinationChangeDegrees: 5,
      orbitalAltitudeMetres: 400_000,
    },
  },
  missionName: "Guided Orbix Mission",
  vehicleReentryEvaluation: {
    initialAltitudeMeters: 1_000,
    initialVelocityMetersPerSecond: 150,
    safetyFactor: 1.5,
    vehicle: {
      dragCoefficient: 1.5,
      massKilograms: 5_000,
      noseRadiusMetres: 1,
      referenceAreaSquareMetres: 12,
      vehicleName: "Demo Review Vehicle",
    },
  },
};

const missionProfile = analyzeMissionProfile(missionInputs);
const report = generateMissionReport({
  description: "A guided educational mission for the Orbix demo experience.",
  missionProfileAnalysis: missionProfile,
});
const insights = generateMissionInsights(missionProfile, report);
const missionScenario: MissionScenario = {
  category: "orbital-logistics",
  createdAt: "2026-08-04T00:00:00.000Z",
  description: "Demonstrates the complete educational mission workflow.",
  id: "guided-demo-mission",
  name: "Guided Orbix Mission",
  profile: missionInputs,
  updatedAt: "2026-08-04T00:00:00.000Z",
};

describe("DemoMode", () => {
  it("renders the first guided step", () => {
    const markup = renderToStaticMarkup(
      <DemoMode
        insights={insights}
        missionProfile={missionProfile}
        missionScenario={missionScenario}
        report={report}
      />,
    );

    expect(markup).toContain("Welcome to Orbix");
    expect(markup).toContain("Mission Concept");
    expect(markup).toContain('data-demo-step="mission-concept"');
    expect(markup).toContain("Mission objective");
  });

  it("moves forward and backward through presentation steps", () => {
    const nextState = demoModeReducer(INITIAL_DEMO_MODE_STATE, {
      type: "next",
    });
    const backState = demoModeReducer(nextState, { type: "back" });

    expect(nextState).toEqual({ currentStepIndex: 1, status: "active" });
    expect(backState).toEqual(INITIAL_DEMO_MODE_STATE);
  });

  it("skips and restarts the guided tour", () => {
    const skippedState = demoModeReducer(INITIAL_DEMO_MODE_STATE, {
      type: "skip",
    });
    const restartedState = demoModeReducer(skippedState, { type: "restart" });

    expect(skippedState.status).toBe("skipped");
    expect(restartedState).toEqual(INITIAL_DEMO_MODE_STATE);
  });

  it("completes after advancing from the final presentation step", () => {
    const finalStepState = {
      currentStepIndex: DEMO_STEPS.length - 1,
      status: "active" as const,
    };

    expect(demoModeReducer(finalStepState, { type: "next" })).toEqual({
      currentStepIndex: DEMO_STEPS.length - 1,
      status: "complete",
    });
  });

  it("renders supplied mission identity and scenario information", () => {
    const markup = renderToStaticMarkup(
      <DemoMode
        missionProfile={missionProfile}
        missionScenario={missionScenario}
        report={report}
      />,
    );

    expect(markup).toContain("Guided Orbix Mission");
    expect(markup).toContain("Orbital logistics");
    expect(markup).toContain(
      "Demonstrates the complete educational mission workflow.",
    );
  });

  it("provides accessible navigation and live step announcements", () => {
    const markup = renderToStaticMarkup(
      <DemoMode missionProfile={missionProfile} />,
    );

    expect(markup).toContain('aria-label="Orbix demo tour navigation"');
    expect(markup).toContain('aria-label="Previous demo step"');
    expect(markup).toContain('aria-label="Next demo step"');
    expect(markup).toContain('aria-label="Restart demo tour"');
    expect(markup).toContain('aria-label="Skip Orbix demo tour"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain("use left or right arrow keys");
  });

  it("exposes a reduced-motion presentation state", () => {
    const markup = renderToStaticMarkup(
      <DemoMode missionProfile={missionProfile} reducedMotionOverride />,
    );

    expect(markup).toContain('data-reduced-motion="true"');
    expect(markup).toContain("Reduced motion mode is active");
    expect(markup).toContain("motion-reduce:animate-none");
    expect(markup).toContain("motion-reduce:transition-none");
  });

  it("handles a demo shell without completed optional mission objects", () => {
    const markup = renderToStaticMarkup(<DemoMode />);

    expect(markup).toContain("Orbix Guided Mission");
    expect(markup).toContain("Educational mission");
    expect(markup).toContain("has not been supplied");
  });
});
