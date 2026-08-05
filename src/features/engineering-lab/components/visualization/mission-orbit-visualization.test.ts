import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { analyzeMissionProfile } from "@/features/engineering-lab/analysis";

import { MissionOrbitVisualization } from "./mission-orbit-visualization";

describe("MissionOrbitVisualization", () => {
  it("renders a labeled orbit-raising transfer without calling physics", () => {
    const analysis = analyzeMissionProfile({
      deltaVBudget: {
        hohmannTransfer: {
          finalAltitudeMetres: 400_000,
          initialAltitudeMetres: 200_000,
        },
        missionName: "Orbit raising budget",
      },
      missionName: "Orbit raising mission",
    });
    const markup = renderToStaticMarkup(
      createElement(MissionOrbitVisualization, { analysis }),
    );

    expect(markup).toContain("Mission Orbit Visualization");
    expect(markup).toContain("Orbit raising");
    expect(markup).toContain("INITIAL ORBIT");
    expect(markup).toContain("TARGET ORBIT");
    expect(markup).toContain("TRANSFER PATH");
    expect(markup).toContain("<svg");
  });

  it("supports an orbit-lowering transfer", () => {
    const analysis = analyzeMissionProfile({
      deltaVBudget: {
        hohmannTransfer: {
          finalAltitudeMetres: 200_000,
          initialAltitudeMetres: 400_000,
        },
        missionName: "Orbit lowering budget",
      },
      missionName: "Orbit lowering mission",
    });
    const markup = renderToStaticMarkup(
      createElement(MissionOrbitVisualization, { analysis }),
    );

    expect(markup).toContain("Orbit lowering");
    expect(markup).toContain("200,000 m altitude");
  });

  it("supports a circular plane-change orbit without a transfer", () => {
    const analysis = analyzeMissionProfile({
      deltaVBudget: {
        missionName: "Plane-change budget",
        orbitalPlaneChange: {
          inclinationChangeDegrees: 5,
          orbitalAltitudeMetres: 400_000,
        },
      },
      missionName: "Circular orbit mission",
    });
    const markup = renderToStaticMarkup(
      createElement(MissionOrbitVisualization, { analysis }),
    );

    expect(markup).toContain("Circular orbit");
    expect(markup).toContain("MANEUVER ORBIT");
    expect(markup).toContain("5 deg plane change");
  });

  it("renders an accessible empty state when orbital analyses are absent", () => {
    const analysis = analyzeMissionProfile({ missionName: "Mission shell" });
    const markup = renderToStaticMarkup(
      createElement(MissionOrbitVisualization, { analysis }),
    );

    expect(markup).toContain("Orbital visualization unavailable");
    expect(markup).toContain(
      "does not include a resolved Hohmann transfer or orbital plane-change analysis",
    );
    expect(markup).not.toContain("Orbital mission geometry");
  });
});
