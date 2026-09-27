import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { analyzeMissionProfile } from "@/features/engineering-lab/analysis";

import {
  GroundTrackVisualization,
  INITIAL_GROUND_TRACK_PRESENTATION_STATE,
  groundTrackPresentationReducer,
} from "./ground-track-visualization";

const orbitalMission = analyzeMissionProfile({
  deltaVBudget: {
    hohmannTransfer: {
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 200_000,
    },
    missionName: "Ground-track orbital budget",
    orbitalPlaneChange: {
      inclinationChangeDegrees: 5,
      orbitalAltitudeMetres: 400_000,
    },
  },
  missionName: "ORBIX Ground Track Mission",
});

describe("GroundTrackVisualization", () => {
  it("renders the illustrative planetary ground-track display", () => {
    const markup = renderToStaticMarkup(
      <GroundTrackVisualization analysis={orbitalMission} />,
    );

    expect(markup).toContain("Orbital ground track");
    expect(markup).toContain("Illustrative Earth ground-track view");
    expect(markup).toContain("Illustrative orbital ground track");
    expect(markup).toContain('data-ground-track-mode="ground"');
  });

  it("displays supplied mission and orbit information", () => {
    const markup = renderToStaticMarkup(
      <GroundTrackVisualization analysis={orbitalMission} />,
    );

    expect(markup).toContain("ORBIX Ground Track Mission");
    expect(markup).toContain("200,000 m");
    expect(markup).toContain("400,000 m");
    expect(markup).toContain("Plane change (supplied maneuver)");
    expect(markup).toContain("<output>5°</output>");
  });

  it("handles missing orbital data without generating a replacement path", () => {
    const markup = renderToStaticMarkup(
      <GroundTrackVisualization
        analysis={analyzeMissionProfile({ missionName: "Empty orbit mission" })}
      />,
    );

    expect(markup).toContain("Ground-track visualization unavailable");
    expect(markup).toContain("No replacement trajectory has been generated");
    expect(markup).not.toContain("ground-track-visual-panel");
  });

  it("updates only presentation view, zoom, and reset state", () => {
    const orbitView = groundTrackPresentationReducer(
      INITIAL_GROUND_TRACK_PRESENTATION_STATE,
      { mode: "orbit", type: "set-mode" },
    );
    const zoomed = groundTrackPresentationReducer(orbitView, {
      type: "zoom-in",
    });
    const reset = groundTrackPresentationReducer(zoomed, { type: "reset" });

    expect(orbitView.mode).toBe("orbit");
    expect(zoomed.zoomLevelIndex).toBe(2);
    expect(reset).toEqual(INITIAL_GROUND_TRACK_PRESENTATION_STATE);
  });

  it("renders accessible controls, descriptions, and keyboard guidance", () => {
    const markup = renderToStaticMarkup(
      <GroundTrackVisualization analysis={orbitalMission} />,
    );

    expect(markup).toContain(
      'aria-label="Ground-track visualization controls"',
    );
    expect(markup).toContain('aria-label="Planet visualization mode"');
    expect(markup).toContain('aria-label="Zoom in planetary visualization"');
    expect(markup).toContain("press G for ground view");
    expect(markup).toContain('role="tab"');
    expect(markup).toContain('aria-live="polite"');
  });

  it("is static: no decorative motion or pause control", () => {
    const markup = renderToStaticMarkup(
      <GroundTrackVisualization analysis={orbitalMission} />,
    );

    expect(markup).not.toContain("animate-");
    expect(markup).not.toContain("Pause");
  });

  it("always displays the navigation-data disclaimer", () => {
    const markup = renderToStaticMarkup(
      <GroundTrackVisualization analysis={orbitalMission} />,
    );

    expect(markup).toContain(
      "This visualization illustrates orbital concepts and does not represent real spacecraft navigation data.",
    );
  });
});
