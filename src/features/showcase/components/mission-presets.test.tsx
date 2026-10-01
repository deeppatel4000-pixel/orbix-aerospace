import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MissionPresets } from "@/features/showcase/components/mission-presets";
import {
  CAPTURE_DETAIL_MAX_ITEMS,
  ShowcaseCapture,
} from "@/features/showcase/components/showcase-capture";
import { ShowcasePage } from "@/features/showcase/showcase-page";
import { SHOWCASE_MISSIONS } from "@/features/showcase/data/mission-showcase";

const EM_DASH = String.fromCharCode(0x2014);

/**
 * The text of the markup without tags. Figures are set through
 * `formatFigure`, which wraps each separator in a span, so "5,400" only
 * reads as one string once the tags are gone.
 */
function textOf(markup: string): string {
  return markup.replace(/<[^>]+>/g, "");
}

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
    expect(textOf(markup)).toContain("5,400");
  });

  it("numbers every figure and sets none in a frame", () => {
    const markup = renderToStaticMarkup(<ShowcasePage />);
    const drawn = SHOWCASE_MISSIONS.filter(
      (mission) => mission.diagram.kind !== "none",
    );

    // One figure for the architecture diagram plus one per preset with a
    // drawing, numbered in page order. A reentry-only preset has no
    // figure: its entry conditions and vehicle table are open lists.
    expect(drawn.length).toBeLessThan(SHOWCASE_MISSIONS.length);
    expect(markup.match(/<figure/g)).toHaveLength(drawn.length + 1);
    for (let n = 1; n <= drawn.length + 1; n += 1) {
      expect(textOf(markup)).toContain(`Fig. ${n}`);
    }
    expect(markup).not.toMatch(/orbix-reg-marks|orbix-surface|rounded-/);
    expect(markup).not.toContain("no transfer drawing");
    expect(markup).toContain("Entry conditions");
  });

  it("enlarges the second burn of each full-scale transfer only", () => {
    const markup = renderToStaticMarkup(
      <MissionPresets missions={SHOWCASE_MISSIONS} />,
    );
    const details = markup.match(/Enlarged scale drawing of the second burn/g);

    // LEO and ISS; the lunar transfer is at point scale and has none.
    expect(details).toHaveLength(2);
    expect(textOf(markup)).toContain(
      "smaller than the first burn marker beside the center, so they are not drawn",
    );
  });

  it("shows preset inputs in captioned tables with units", () => {
    const markup = renderToStaticMarkup(
      <MissionPresets missions={SHOWCASE_MISSIONS} />,
    );
    const text = textOf(markup);

    expect(text).toContain("Target circular orbit altitude");
    expect(text).toContain("384,400");
    expect(text).toContain("Compact Demonstrator");
    expect(text).toContain("Two-impulse transfer, LEO Satellite Deployment");
  });

  it("keeps one h1 and banned copy out of the page", () => {
    const markup = renderToStaticMarkup(<ShowcasePage />);

    expect(markup.match(/<h1/g)).toHaveLength(1);
    expect(textOf(markup)).toContain("Inside ORBIX");
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
      expect(textOf(markup)).toContain(
        "Preset inputs in display units, unless a caption says otherwise.",
      );
      expect(markup).not.toContain("/images/");
      expect(markup).not.toContain(EM_DASH);
    }
  });

  it("says the transfer scale uses the calculators' Earth radius, not a preset input", () => {
    for (const mission of SHOWCASE_MISSIONS) {
      const markup = renderToStaticMarkup(
        <ShowcaseCapture mission={mission} />,
      );
      const disclosesRadius = markup.includes(
        "standard value, not a preset input",
      );

      expect(disclosesRadius).toBe(
        mission.diagram.kind === "transfer" &&
          mission.diagram.planetRadiusSource === "calculator-default",
      );
    }
  });

  it("keeps every detail list to at most CAPTURE_DETAIL_MAX_ITEMS items", () => {
    for (const mission of SHOWCASE_MISSIONS) {
      for (const list of [
        mission.availableVisualizations,
        mission.analysisAvailability,
        mission.engineeringFocus,
      ]) {
        expect(list.length).toBeLessThanOrEqual(CAPTURE_DETAIL_MAX_ITEMS);
      }
    }
  });
});
