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

describe("showcase mission diagrams", () => {
  it("reads transfer altitudes straight from the preset", () => {
    const mission = getShowcaseMissionById("lunar-transfer-concept");

    expect(mission?.diagram).toEqual({
      finalAltitudeKilometres: 384_400,
      initialAltitudeKilometres: 200,
      kind: "transfer",
      planetRadiusKilometres: 6_371,
      planetRadiusSource: "calculator-default",
    });
  });

  it("sums the allowances exactly as entered", () => {
    const mission = getShowcaseMissionById("mars-transfer-concept");

    expect(mission?.diagram.kind).toBe("allowances");
    if (mission?.diagram.kind === "allowances") {
      expect(mission.diagram.maneuvers).toHaveLength(4);
      expect(mission.diagram.sumMetresPerSecond).toBe(5_400);
    }
  });

  it("draws nothing for a reentry-only preset and lists both vehicles once", () => {
    const mission = getShowcaseMissionById("reentry-demonstrator");

    expect(mission?.diagram).toEqual({ kind: "none" });
    expect(mission?.vehicles.map((vehicle) => vehicle.vehicleName)).toEqual([
      "Baseline Demonstrator",
      "Compact Demonstrator",
    ]);
  });

  it("carries no image references", () => {
    for (const mission of SHOWCASE_MISSIONS) {
      expect(JSON.stringify(mission)).not.toMatch(/\/images\//);
    }
  });
});
