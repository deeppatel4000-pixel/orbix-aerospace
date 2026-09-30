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
  MISSION_CONTROL_WORKSPACES,
  resolveWorkspaceNavigationIndex,
} from "./mission-control-sidebar";
import { MissionControlShell } from "./mission-control-shell";

const reentryInputs: VehicleReentryEvaluationInputs = {
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  safetyFactor: 1.5,
  vehicle: {
    dragCoefficient: 1.5,
    massKilograms: 5_000,
    noseRadiusMetres: 1,
    referenceAreaSquareMetres: 12,
    vehicleName: "Command Shell Vehicle",
  },
};

const missionInputs: MissionProfileInputs = {
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Command shell delta-v budget",
  },
  missionName: "ORBIX Command Shell Mission",
  vehicleReentryEvaluation: reentryInputs,
};

const missionProfile = analyzeMissionProfile(missionInputs);
const missionReport = generateMissionReport({
  description: "A completed educational command-shell scenario.",
  missionProfileAnalysis: missionProfile,
});
const vehicleEvaluation = analyzeVehicleReentryEvaluation(reentryInputs);

describe("MissionControlShell", () => {
  it("renders the cohesive command-center shell and child workspace", () => {
    const markup = renderToStaticMarkup(
      <MissionControlShell
        activeWorkspace="overview"
        missionCategory="orbital-logistics"
        missionProfileAnalysis={missionProfile}
        missionReport={missionReport}
        onWorkspaceChange={() => undefined}
        vehicleReentryEvaluation={vehicleEvaluation}
      >
        <p>Existing workspace output</p>
      </MissionControlShell>,
    );

    expect(markup).toContain("Mission control");
    expect(markup).toContain("Mission workspaces");
    expect(markup).toContain("Existing workspace output");
    // The old footer summary row repeated the header and metrics; gone.
    expect(markup).not.toContain("Mission summary: computed values");
    expect(markup).toContain('data-active-workspace="overview"');
  });

  it("displays supplied mission identity, category, workspace, and telemetry", () => {
    const markup = renderToStaticMarkup(
      <MissionControlShell
        activeWorkspace="orbit"
        missionCategory="orbital-logistics"
        missionProfileAnalysis={missionProfile}
        missionReport={missionReport}
        onWorkspaceChange={() => undefined}
        vehicleReentryEvaluation={vehicleEvaluation}
      >
        <p>Orbit workspace</p>
      </MissionControlShell>,
    );

    expect(markup).toContain("ORBIX Command Shell Mission");
    expect(markup).toContain("Orbital logistics");
    // No preset was supplied, so no preset cell reads as a missing value.
    expect(markup).not.toContain("Mission preset");
    expect(markup).toContain("Systems used");
  });

  it("renders all twelve workspace navigation entries with selected state", () => {
    const markup = renderToStaticMarkup(
      <MissionControlShell
        activeWorkspace="showcase"
        missionProfileAnalysis={missionProfile}
        onWorkspaceChange={() => undefined}
      >
        <p>Showcase workspace</p>
      </MissionControlShell>,
    );

    expect(MISSION_CONTROL_WORKSPACES).toHaveLength(12);
    for (const workspace of MISSION_CONTROL_WORKSPACES) {
      expect(markup).toContain(workspace.label);
    }
    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('role="tab"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain('tabindex="0"');
  });

  it("supports wrapped arrow navigation and Home/End focus targets", () => {
    const total = MISSION_CONTROL_WORKSPACES.length;

    expect(resolveWorkspaceNavigationIndex(0, "ArrowRight", total)).toBe(1);
    expect(resolveWorkspaceNavigationIndex(0, "ArrowLeft", total)).toBe(
      total - 1,
    );
    expect(resolveWorkspaceNavigationIndex(4, "ArrowDown", total)).toBe(5);
    expect(resolveWorkspaceNavigationIndex(4, "ArrowUp", total)).toBe(3);
    expect(resolveWorkspaceNavigationIndex(5, "Home", total)).toBe(0);
    expect(resolveWorkspaceNavigationIndex(5, "End", total)).toBe(total - 1);
  });

  it("uses explicit missing-data states without deriving replacement values", () => {
    const markup = renderToStaticMarkup(
      <MissionControlShell
        activeWorkspace="overview"
        missionProfileAnalysis={null}
        missionReport={null}
        onWorkspaceChange={() => undefined}
        vehicleReentryEvaluation={null}
      >
        <p>Empty workspace</p>
      </MissionControlShell>,
    );

    expect(markup).toContain("Mission profile unavailable");
    expect(markup).toContain("Not reported");
    expect(markup).toContain("Empty workspace");
  });

  it("provides semantic landmarks, controls, and live workspace status", () => {
    const markup = renderToStaticMarkup(
      <MissionControlShell
        activeWorkspace="overview"
        missionProfileAnalysis={missionProfile}
        onWorkspaceChange={() => undefined}
      >
        <p>Accessible workspace</p>
      </MissionControlShell>,
    );

    expect(markup).toContain('aria-label="Mission control sections"');
    expect(markup).toContain('aria-label="Mission control workspace content"');
    expect(markup).not.toContain('aria-label="Mission summary"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).not.toContain("animate-");
  });
});
