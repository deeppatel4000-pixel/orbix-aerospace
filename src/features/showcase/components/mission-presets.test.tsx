import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MissionPresets } from "@/features/showcase/components/mission-presets";
import { ShowcaseCapture } from "@/features/showcase/components/showcase-capture";
import { ShowcasePage } from "@/features/showcase/showcase-page";
import { SHOWCASE_MISSIONS } from "@/features/showcase/data/mission-showcase";

const EM_DASH = String.fromCharCode(0x2014);

describe("showcase mission presets", () => {
  it("renders every preset with its category and capture link", () => {
    const markup = renderToStaticMarkup(
      <MissionPresets missions={SHOWCASE_MISSIONS} />,
    );

    for (const mission of SHOWCASE_MISSIONS) {
      expect(markup).toContain(mission.preset.name);
      expect(markup).toContain(mission.categoryLabel);
      expect(markup).toContain(`href="/showcase-capture/${mission.preset.id}"`);
    }
  });

  it("uses no raster images at all", () => {
    const markup = renderToStaticMarkup(<ShowcasePage />);

    expect(markup).not.toContain("<img");
    expect(markup).not.toContain("/images/missions/");
    expect(markup).not.toContain("/images/environments/");
  });

  it("draws a scale diagram for each transfer and bars for the allowances", () => {
    const markup = renderToStaticMarkup(
      <MissionPresets missions={SHOWCASE_MISSIONS} />,
    );

    expect(markup).toContain(
      "Scale drawing: transfer from a 200 km circular orbit to a 550 km circular orbit around Earth.",
    );
    expect(markup).toContain("Trans-Mars injection concept");
    expect(markup).toContain("5,400");
  });

  it("shows preset inputs in tables with units", () => {
    const markup = renderToStaticMarkup(
      <MissionPresets missions={SHOWCASE_MISSIONS} />,
    );

    expect(markup).toContain("Target circular orbit altitude");
    expect(markup).toContain("384,400");
    expect(markup).toContain("Compact Demonstrator");
  });

  it("keeps one h1 and banned copy out of the page", () => {
    const markup = renderToStaticMarkup(<ShowcasePage />);

    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(markup).toContain("How ORBIX is built");
    expect(markup).not.toContain(EM_DASH);
    expect(markup).not.toMatch(/premium|advanced|seamless|cutting-edge/i);
  });
});

describe("showcase capture view", () => {
  it("renders an accessible, image-free presentation of one preset", () => {
    for (const mission of SHOWCASE_MISSIONS) {
      const markup = renderToStaticMarkup(
        <ShowcaseCapture mission={mission} />,
      );

      expect(markup).toContain('aria-labelledby="capture-mission-title"');
      expect(markup.match(/<h1/g)).toHaveLength(1);
      expect(markup).toContain(mission.preset.name);
      expect(markup).toContain("this page calculates nothing");
      expect(markup).not.toContain("/images/");
      expect(markup).not.toContain(EM_DASH);
    }
  });
});
