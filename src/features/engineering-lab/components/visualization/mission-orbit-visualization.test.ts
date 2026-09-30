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

    expect(markup).toContain("Mission orbit diagram");
    expect(markup).toContain("Orbit raising");
    expect(markup).toContain("Initial orbit");
    expect(markup).toContain("Target orbit");
    expect(markup).toContain("Transfer path");
    expect(markup).toContain("<svg");
    expect(markup).not.toContain("animateMotion");
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
    expect(markup).toContain("200 km altitude");
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
    expect(markup).toContain("Maneuver orbit");
    expect(markup).toContain("<dt>Plane change</dt><dd>5°</dd>");
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
