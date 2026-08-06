import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  getOrbixEnvironmentLabel,
  OrbixBackground,
  OrbixEnvironmentBackdrop,
  OrbixMark,
  OrbixMissionArray,
} from ".";

describe("ORBIX brand system", () => {
  it("renders an accessible primary mark when a title is supplied", () => {
    const markup = renderToStaticMarkup(
      <OrbixMark title="ORBIX orbital mark" />,
    );

    expect(markup).toContain('role="img"');
    expect(markup).toContain("ORBIX orbital mark");
    expect(markup).toContain("--plasma-violet");
  });

  it("keeps decorative backgrounds outside the accessibility tree", () => {
    const markup = renderToStaticMarkup(<OrbixBackground />);

    expect(markup).toContain('aria-hidden="true"');
    expect(markup).toContain("orbix-starfield");
    expect(markup).toContain("orbix-grid");
  });

  it("communicates the engineering domains in the mission array", () => {
    const markup = renderToStaticMarkup(<OrbixMissionArray />);

    expect(markup).toContain("Orbital mechanics");
    expect(markup).toContain("Atmospheric entry");
    expect(markup).toContain("Thermal systems");
    expect(markup).toContain("Mission architecture");
  });

  it("renders optimized adaptive environment backdrops as decorative imagery", () => {
    const markup = renderToStaticMarkup(
      <OrbixEnvironmentBackdrop theme="tactical" />,
    );

    expect(markup).toContain('data-orbix-environment="tactical"');
    expect(markup).toContain("tactical-aircraft.webp");
    expect(markup).toContain('aria-hidden="true"');
    expect(getOrbixEnvironmentLabel("laboratory")).toBe(
      "Aerospace research laboratory",
    );
  });
});
