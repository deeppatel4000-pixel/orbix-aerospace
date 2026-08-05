import { describe, expect, it } from "vitest";

import type { TPSMaterial } from "@/features/engineering-lab/types";

import {
  getTPSMaterialById,
  listTPSMaterials,
  TPS_MATERIALS,
  validateTPSMaterial,
} from "./index";

const validMaterial: TPSMaterial = {
  allowableHeatLoadMegajoulesPerSquareMetre: 12,
  densityKilogramsPerCubicMetre: 300,
  description: "Illustrative validation fixture.",
  id: "test-material",
  maximumTemperatureKelvin: 1_200,
  name: "Test Material",
  reusable: true,
};

describe("TPS material catalog", () => {
  it("lists the three educational material definitions", () => {
    const materials = listTPSMaterials();

    expect(materials).toHaveLength(3);
    expect(materials.map((material) => material.name)).toEqual([
      "Ablative Heat Shield",
      "Reinforced Carbon-Carbon",
      "Ceramic Thermal Tile",
    ]);
    expect(materials.map((material) => material.reusable)).toEqual([
      false,
      true,
      true,
    ]);
  });

  it("retrieves a material by its stable ID", () => {
    const material = getTPSMaterialById("reinforced-carbon-carbon");

    expect(material).toMatchObject({
      id: "reinforced-carbon-carbon",
      name: "Reinforced Carbon-Carbon",
      reusable: true,
    });
    expect(getTPSMaterialById("missing-material")).toBeUndefined();
  });

  it("uses unique material IDs", () => {
    const ids = listTPSMaterials().map((material) => material.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("validates every exported catalog record", () => {
    for (const material of TPS_MATERIALS) {
      expect(() => validateTPSMaterial(material)).not.toThrow();
    }
  });

  it("keeps list, lookup, and catalog exports consistent", () => {
    const listedMaterials = listTPSMaterials();

    expect(listedMaterials).toBe(TPS_MATERIALS);
    expect(Object.isFrozen(TPS_MATERIALS)).toBe(true);

    for (const material of listedMaterials) {
      expect(Object.isFrozen(material)).toBe(true);
      expect(getTPSMaterialById(material.id)).toBe(material);
    }
  });

  it("allows maximum temperature to be omitted", () => {
    const materialWithoutTemperature: TPSMaterial = {
      ...validMaterial,
      maximumTemperatureKelvin: undefined,
    };

    expect(() => validateTPSMaterial(materialWithoutTemperature)).not.toThrow();
  });

  it.each([
    ["empty ID", { ...validMaterial, id: "" }],
    ["whitespace-only ID", { ...validMaterial, id: "   " }],
    ["empty name", { ...validMaterial, name: "" }],
    ["whitespace-only name", { ...validMaterial, name: "\t" }],
    ["zero density", { ...validMaterial, densityKilogramsPerCubicMetre: 0 }],
    [
      "negative density",
      { ...validMaterial, densityKilogramsPerCubicMetre: -1 },
    ],
    [
      "zero allowable heat load",
      { ...validMaterial, allowableHeatLoadMegajoulesPerSquareMetre: 0 },
    ],
    [
      "negative allowable heat load",
      { ...validMaterial, allowableHeatLoadMegajoulesPerSquareMetre: -1 },
    ],
    [
      "zero maximum temperature",
      { ...validMaterial, maximumTemperatureKelvin: 0 },
    ],
    [
      "negative maximum temperature",
      { ...validMaterial, maximumTemperatureKelvin: -1 },
    ],
  ])("rejects %s", (_label, material) => {
    expect(() => validateTPSMaterial(material)).toThrowError(RangeError);
  });

  it.each([
    [
      "density",
      { ...validMaterial, densityKilogramsPerCubicMetre: Number.NaN },
    ],
    [
      "allowable heat load",
      {
        ...validMaterial,
        allowableHeatLoadMegajoulesPerSquareMetre: Number.POSITIVE_INFINITY,
      },
    ],
    [
      "maximum temperature",
      {
        ...validMaterial,
        maximumTemperatureKelvin: Number.NEGATIVE_INFINITY,
      },
    ],
  ])("rejects non-finite %s", (_label, material) => {
    expect(() => validateTPSMaterial(material)).toThrowError(RangeError);
  });
});
