import { describe, expect, it } from "vitest";

import { analyzeMissionProfile } from "@/features/engineering-lab/analysis";
import type { MissionPreset } from "@/features/engineering-lab/types";

import {
  createMissionPresetCatalog,
  getMissionPresetById,
  listMissionPresets,
  MISSION_PRESETS,
  validateMissionPreset,
} from "./index";

const validPreset: MissionPreset = {
  category: "orbital-deployment",
  description: "Educational validation fixture.",
  id: "validation-fixture",
  missionProfileInputs: {
    missionName: "Validation Fixture Mission",
  },
  name: "Validation Fixture",
};

describe("mission preset catalog", () => {
  it("loads all five educational presets", () => {
    const presets = listMissionPresets();

    expect(presets).toHaveLength(5);
    expect(presets.map(({ id }) => id)).toEqual([
      "leo-satellite-deployment",
      "iss-style-resupply",
      "lunar-transfer-concept",
      "reentry-demonstrator",
      "mars-transfer-concept",
    ]);
  });

  it("maps every preset directly into a valid mission profile input", () => {
    for (const preset of listMissionPresets()) {
      const result = analyzeMissionProfile(preset.missionProfileInputs);

      expect(result.missionName).toBe(preset.missionProfileInputs.missionName);
    }
  });

  it("retrieves a preset by stable ID", () => {
    const preset = getMissionPresetById("iss-style-resupply");

    expect(preset).toMatchObject({
      category: "orbital-logistics",
      id: "iss-style-resupply",
      name: "ISS Style Resupply",
    });
  });

  it("returns undefined for a missing preset ID", () => {
    expect(getMissionPresetById("missing-preset")).toBeUndefined();
  });

  it("rejects duplicate IDs when constructing a catalog", () => {
    expect(() =>
      createMissionPresetCatalog([
        validPreset,
        { ...validPreset, name: "Duplicate Fixture" },
      ]),
    ).toThrowError(
      new RangeError("Duplicate mission preset ID: validation-fixture"),
    );
  });

  it.each([
    ["empty ID", { ...validPreset, id: "" }],
    ["whitespace ID", { ...validPreset, id: "   " }],
    ["empty name", { ...validPreset, name: "" }],
    ["whitespace name", { ...validPreset, name: "\t" }],
    ["empty description", { ...validPreset, description: "" }],
    ["unsupported category", { ...validPreset, category: "unknown" }],
    [
      "missing mission profile inputs",
      { ...validPreset, missionProfileInputs: undefined },
    ],
    [
      "array mission profile inputs",
      { ...validPreset, missionProfileInputs: [] },
    ],
    [
      "empty mission profile name",
      { ...validPreset, missionProfileInputs: { missionName: " " } },
    ],
  ])("rejects invalid preset data: %s", (_label, preset) => {
    expect(() =>
      validateMissionPreset(preset as unknown as MissionPreset),
    ).toThrowError(RangeError);
  });

  it("rejects a non-object preset structure", () => {
    expect(() =>
      validateMissionPreset(null as unknown as MissionPreset),
    ).toThrowError(new RangeError("Mission preset must be an object."));
  });

  it("validates every exported preset record", () => {
    for (const preset of MISSION_PRESETS) {
      expect(() => validateMissionPreset(preset)).not.toThrow();
    }
  });

  it("returns one deeply immutable catalog instance", () => {
    const presets = listMissionPresets();
    const reentryPreset = getMissionPresetById("reentry-demonstrator");
    const marsPreset = getMissionPresetById("mars-transfer-concept");

    expect(presets).toBe(MISSION_PRESETS);
    expect(Object.isFrozen(presets)).toBe(true);

    for (const preset of presets) {
      expect(Object.isFrozen(preset)).toBe(true);
      expect(Object.isFrozen(preset.missionProfileInputs)).toBe(true);
      expect(getMissionPresetById(preset.id)).toBe(preset);
      expect(Reflect.set(preset, "name", "Changed")).toBe(false);
    }

    expect(
      Object.isFrozen(
        reentryPreset?.missionProfileInputs.vehicleComparison?.vehicles,
      ),
    ).toBe(true);
    expect(
      Object.isFrozen(marsPreset?.missionProfileInputs.deltaVBudget?.maneuvers),
    ).toBe(true);
  });
});
