import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { analyzeMissionProfile } from "@/features/engineering-lab/analysis";
import {
  getMissionPresetById,
  listMissionPresets,
} from "@/features/engineering-lab/missions";
import { generateMissionReport } from "@/features/engineering-lab/reports";

import { MissionGallery } from "./mission-gallery";

const presets = listMissionPresets();
const resupplyPreset = getMissionPresetById("iss-style-resupply");

if (!resupplyPreset) {
  throw new Error("Mission gallery test preset is unavailable.");
}

const resupplyAnalysis = analyzeMissionProfile(
  resupplyPreset.missionProfileInputs,
);
const resupplyReport = generateMissionReport({
  description: resupplyPreset.description,
  missionProfileAnalysis: resupplyAnalysis,
});

describe("MissionGallery", () => {
  it("renders all supplied mission presets", () => {
    const markup = renderToStaticMarkup(<MissionGallery presets={presets} />);

    expect(markup).toContain("ORBIX MISSION ARCHIVE");
    expect(markup).toContain(
      "Explore engineered aerospace concepts through simulation, analysis, and visualization.",
    );
    for (const preset of presets) {
      expect(markup).toContain(preset.name);
    }
  });

  it("displays mission category, description, and system metadata", () => {
    const markup = renderToStaticMarkup(
      <MissionGallery
        analyses={[resupplyAnalysis]}
        presets={[resupplyPreset]}
        reports={[resupplyReport]}
      />,
    );

    expect(markup).toContain("Orbital logistics");
    expect(markup).toContain(resupplyPreset.description);
    expect(markup).toContain("Available systems");
    expect(markup).toContain("Orbital");
    expect(markup).toContain("Vehicle");
    expect(markup).toContain("Thermal");
    expect(markup).toContain("Visualization");
    expect(markup).toContain('data-system-availability="available"');
  });

  it("marks unavailable optional outputs without generating replacements", () => {
    const deploymentPreset = getMissionPresetById("leo-satellite-deployment");

    if (!deploymentPreset) {
      throw new Error("Deployment gallery test preset is unavailable.");
    }

    const markup = renderToStaticMarkup(
      <MissionGallery presets={[deploymentPreset]} />,
    );

    expect(markup).toContain('data-system-availability="not-included"');
    expect(markup).toContain("not included");
    expect(markup).toContain("Enter Mission Control");
  });

  it("renders an explicit empty archive state", () => {
    const markup = renderToStaticMarkup(<MissionGallery presets={[]} />);

    expect(markup).toContain("No mission concepts available");
    expect(markup).toContain("No replacement concepts were generated");
    expect(markup).toContain("0</output> educational concepts");
  });

  it("provides semantic mission cards and keyboard-accessible navigation", () => {
    const markup = renderToStaticMarkup(
      <MissionGallery
        missionControlHref="#mission-control-dashboard"
        presets={[resupplyPreset]}
      />,
    );

    expect(markup).toContain('aria-labelledby="mission-gallery-title"');
    expect(markup).toContain(
      'aria-labelledby="mission-card-iss-style-resupply-title"',
    );
    expect(markup).toContain(
      'aria-label="Enter Mission Control from ISS Style Resupply"',
    );
    expect(markup).toContain('href="#mission-control-dashboard"');
    expect(markup).toContain("focus-visible:ring-2");
    expect(markup).toContain("motion-reduce:transition-none");
  });

  it("does not add rankings or recommendations to mission cards", () => {
    const markup = renderToStaticMarkup(
      <MissionGallery presets={[resupplyPreset]} />,
    ).toLowerCase();

    expect(markup).not.toContain("ranking score");
    expect(markup).not.toContain("recommended mission");
    expect(markup).not.toContain("best mission");
  });
});
