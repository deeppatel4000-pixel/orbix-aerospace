import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { analyzeMissionProfile } from "@/features/engineering-lab/analysis";
import { generateMissionReport } from "@/features/engineering-lab/reports";

import { MissionStartupSequence } from "./mission-startup-sequence";

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
  description: "A supplied mission used to verify the checks panel.",
  missionProfileAnalysis: missionProfile,
});

describe("MissionStartupSequence", () => {
  it("renders the checks performed statically before the workspace", () => {
    const markup = renderToStaticMarkup(
      <MissionStartupSequence
        missionCategory="orbital-deployment"
        missionProfileAnalysis={missionProfile}
        missionReport={missionReport}
      >
        <p>Existing Mission Control workspace</p>
      </MissionStartupSequence>,
    );

    expect(markup).toContain("Checks performed");
    // Name and category belong to the Mission control header above it.
    expect(markup).not.toContain("ORBIX Startup Test Mission");
    expect(markup).toContain('data-check-availability="available"');
    expect(markup).toContain("Existing Mission Control workspace");
    expect(markup.indexOf("Checks performed")).toBeLessThan(
      markup.indexOf("Existing Mission Control workspace"),
    );
  });

  it("has no timed overlay, skip control or decorative motion", () => {
    const markup = renderToStaticMarkup(
      <MissionStartupSequence missionProfileAnalysis={missionProfile}>
        <p>Workspace</p>
      </MissionStartupSequence>,
    );

    expect(markup).not.toContain("Skip");
    expect(markup).not.toContain("Initialization");
    expect(markup).not.toContain("animate-");
  });

  it("reports unavailable mission systems without inventing replacement data", () => {
    const markup = renderToStaticMarkup(
      <MissionStartupSequence>
        <p>Empty workspace</p>
      </MissionStartupSequence>,
    );

    expect(markup).toContain("Not supplied");
    expect(markup).toContain('data-check-availability="not-supplied"');
    expect(markup).toContain("Empty workspace");
  });
});
