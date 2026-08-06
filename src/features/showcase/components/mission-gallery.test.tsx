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
    expect(markup).toContain("Original ORBIX visual");
    expect(markup).toContain("launch-complex.webp");
    expect(markup).toContain("orbital-command.webp");
    expect(markup).toContain("engineering-lab.webp");
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
