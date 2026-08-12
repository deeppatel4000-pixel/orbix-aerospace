import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MissionGallery } from "@/features/showcase/components/mission-gallery";
import { ShowcaseCapture } from "@/features/showcase/components/showcase-capture";
import { SHOWCASE_MISSIONS } from "@/features/showcase/data/mission-showcase";

describe("portfolio mission showcase", () => {
  it("renders every curated mission and its presentation context", () => {
    const markup = renderToStaticMarkup(
      <MissionGallery missions={SHOWCASE_MISSIONS} />,
    );

    for (const mission of SHOWCASE_MISSIONS) {
      expect(markup).toContain(mission.preset.name);
      expect(markup).toContain(mission.categoryLabel);
    }

    expect(markup).toContain("Visualization coverage");
    expect(markup).toContain("Analysis available");
    expect(markup).toContain("Engineering focus");
  });

  it("overlays nothing on the mission photograph", () => {
    // The card used to stamp an environment label and an "Original ORBIX
    // visual" chip across the bottom of every image. Both were noise, and the
    // scrim they needed was a content fade by another name.
    const markup = renderToStaticMarkup(
      <MissionGallery missions={SHOWCASE_MISSIONS} />,
    );

    expect(markup).not.toContain("Original ORBIX visual");
    expect(markup).not.toContain("orbix-environment-label");
  });

  it("gives every gallery card its own mission photograph", () => {
    // The gallery used to render three shared environment backdrops across
    // five cards, so two pairs of missions showed the same picture. Alt text
    // is asserted rather than `src` because `next/image` rewrites the source
    // into an optimizer URL, and the alt text is what a reader actually gets.
    const markup = renderToStaticMarkup(
      <MissionGallery missions={SHOWCASE_MISSIONS} />,
    );

    for (const mission of SHOWCASE_MISSIONS) {
      expect(markup).toContain(mission.image.alt);
    }

    // The shared backdrops belong to the capture view now, not here.
    expect(markup).not.toContain("launch-complex.webp");
    expect(markup).not.toContain("orbital-command.webp");
    expect(markup).not.toContain("engineering-lab.webp");
  });

  it("still sends every card to its own capture view", () => {
    // Imagery changed; destinations did not. Asserted on rendered markup
    // because an href only exists once the card is rendered.
    const markup = renderToStaticMarkup(
      <MissionGallery missions={SHOWCASE_MISSIONS} />,
    );

    for (const mission of SHOWCASE_MISSIONS) {
      expect(markup).toContain(`href="/showcase-capture/${mission.preset.id}"`);
    }
    expect(markup).toContain(
      'href="/engineering-lab#mission-control-dashboard"',
    );
  });

  it("renders an accessible capture view without computed telemetry", () => {
    const mission = SHOWCASE_MISSIONS[0];
    expect(mission).toBeDefined();

    const markup = renderToStaticMarkup(<ShowcaseCapture mission={mission!} />);

    expect(markup).toContain("Portfolio capture mode");
    expect(markup).toContain("authentic preset data");
    expect(markup).toContain("No synthetic telemetry");
    expect(markup).toContain('aria-labelledby="capture-mission-title"');
  });
});
