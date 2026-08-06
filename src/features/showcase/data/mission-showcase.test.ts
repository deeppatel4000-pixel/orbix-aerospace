import { describe, expect, it } from "vitest";

import { listMissionPresets } from "@/features/engineering-lab/missions";
import {
  getShowcaseMissionById,
  SHOWCASE_MISSIONS,
} from "@/features/showcase/data/mission-showcase";

describe("showcase mission data", () => {
  it("curates each existing educational mission preset", () => {
    const presetIds = listMissionPresets().map((preset) => preset.id);
    const showcaseIds = SHOWCASE_MISSIONS.map((mission) => mission.preset.id);

    expect(showcaseIds).toEqual(presetIds);
    expect(showcaseIds).toHaveLength(5);
  });

  it("provides portfolio context without changing preset inputs", () => {
    const preset = listMissionPresets()[0];
    const mission = getShowcaseMissionById("leo-satellite-deployment");

    expect(mission?.preset).toBe(preset);
    expect(mission?.includedSystems).toContain("Delta-v budget");
    expect(mission?.availableVisualizations.length).toBeGreaterThan(0);
    expect(mission?.analysisAvailability.length).toBeGreaterThan(0);
    expect(mission?.engineeringFocus.length).toBeGreaterThan(0);
  });

  it("returns undefined for an unknown showcase mission", () => {
    expect(getShowcaseMissionById("unknown-mission")).toBeUndefined();
  });
});
