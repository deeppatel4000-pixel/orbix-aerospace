import { describe, expect, it } from "vitest";

import { listTPSMaterials } from "@/features/engineering-lab/materials";
import type {
  MaterialTPSSizingInputs,
  TPSMaterialComparisonInputs,
} from "@/features/engineering-lab/types";

import { analyzeMaterialTPSSizing } from "./material-tps-sizing";
import { analyzeTPSMaterialComparison } from "./tps-material-comparison";

const referenceInputs: TPSMaterialComparisonInputs = {
  dragCoefficient: 1.5,
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  noseRadiusMetres: 1,
  referenceAreaSquareMetres: 12,
  safetyFactor: 1.5,
  vehicleMassKilograms: 5_000,
};

function toDirectMaterialInputs(
  inputs: TPSMaterialComparisonInputs,
  materialId: string,
): MaterialTPSSizingInputs {
  const { materialIds, ...scenarioInputs } = inputs;
  void materialIds;

  return {
    ...scenarioInputs,
    materialId,
  };
}

describe("analyzeTPSMaterialComparison", () => {
  it("compares every catalog material by default", () => {
    const catalog = listTPSMaterials();
    const result = analyzeTPSMaterialComparison(referenceInputs);

    expect(result.materialsCompared).toBe(catalog.length);
    expect(result.results).toHaveLength(catalog.length);
    expect(new Set(result.results.map((entry) => entry.material.id))).toEqual(
      new Set(catalog.map((material) => material.id)),
    );

    for (const entry of result.results) {
      expect(
        entry.tpsSizing.requiredArealDensity.kilogramsPerSquareMetre,
      ).toBeGreaterThan(0);
      expect(entry.estimatedTPSMass.totalTPSMassKilograms).toBeGreaterThan(0);
      expect(entry.thickness.metres).toBeGreaterThan(0);
    }
  });

  it("sorts results from highest to lowest ranking score", () => {
    const result = analyzeTPSMaterialComparison(referenceInputs);

    for (let index = 1; index < result.results.length; index += 1) {
      const previous = result.results[index - 1];
      const current = result.results[index];

      expect(previous?.rankingScore).toBeGreaterThanOrEqual(
        current?.rankingScore ?? Number.POSITIVE_INFINITY,
      );
    }

    for (const entry of result.results) {
      expect(entry.rankingScore).toBe(
        entry.rankingLogic.thermalMarginContribution -
          entry.rankingLogic.massPenalty -
          entry.rankingLogic.thicknessPenalty,
      );
      expect(entry.rankingLogic.description).toContain(
        "thermal-margin rank has first priority",
      );
    }
  });

  it("returns the highest-scoring result as the recommendation", () => {
    const result = analyzeTPSMaterialComparison(referenceInputs);
    const maximumScore = Math.max(
      ...result.results.map((entry) => entry.rankingScore),
    );

    expect(result.recommendedMaterial).toBe(result.results[0]);
    expect(result.recommendedMaterial.rankingScore).toBe(maximumScore);
    expect(result.recommendedMaterial.material.id).toBe("ablative-heat-shield");
  });

  it("preserves each direct material-aware TPS sizing result", () => {
    const inputs: TPSMaterialComparisonInputs = {
      ...referenceInputs,
      heatingCoefficient: 2e-4,
      initialFlightPathAngleDegrees: -60,
      timestepSeconds: 0.5,
    };
    const result = analyzeTPSMaterialComparison(inputs);

    for (const entry of result.results) {
      const directResult = analyzeMaterialTPSSizing(
        toDirectMaterialInputs(inputs, entry.material.id),
      );

      expect(entry.material).toBe(directResult.material);
      expect(entry.tpsSizing).toEqual(directResult.tpsSizing);
      expect(entry.estimatedTPSMass).toEqual(
        directResult.estimatedTPSMassForArea,
      );
      expect(entry.thickness).toEqual(
        directResult.tpsSizing.estimatedThickness,
      );
      expect(entry.heatLoadMargin).toEqual(directResult.tpsSizing.safetyMargin);
      expect(entry.marginClassification).toBe(directResult.suitabilitySummary);
    }
  });

  it("compares only a requested material subset", () => {
    const materialIds = [
      "ceramic-thermal-tile",
      "reinforced-carbon-carbon",
    ] as const;
    const result = analyzeTPSMaterialComparison({
      ...referenceInputs,
      materialIds,
    });

    expect(result.materialsCompared).toBe(2);
    expect(new Set(result.results.map((entry) => entry.material.id))).toEqual(
      new Set(materialIds),
    );
  });

  it("uses only margin, mass, and thickness in ranking components", () => {
    const result = analyzeTPSMaterialComparison(referenceInputs);

    for (const entry of result.results) {
      expect(entry.rankingLogic).toEqual({
        description: expect.any(String),
        massPenalty: expect.any(Number),
        massRank: expect.any(Number),
        thermalMarginContribution: expect.any(Number),
        thermalMarginRank: expect.any(Number),
        thicknessPenalty: expect.any(Number),
        thicknessRank: expect.any(Number),
      });
      expect(entry.material.maximumTemperatureKelvin).toBeDefined();
      expect(typeof entry.material.reusable).toBe("boolean");
    }
  });

  it("rejects an empty comparison subset", () => {
    expect(() =>
      analyzeTPSMaterialComparison({
        ...referenceInputs,
        materialIds: [],
      }),
    ).toThrowError(RangeError);
  });

  it("preserves catalog lookup validation for unknown subset IDs", () => {
    expect(() =>
      analyzeTPSMaterialComparison({
        ...referenceInputs,
        materialIds: ["unknown-material"],
      }),
    ).toThrowError(RangeError);
  });

  it.each([
    ["negative altitude", { ...referenceInputs, initialAltitudeMeters: -1 }],
    [
      "zero velocity",
      { ...referenceInputs, initialVelocityMetersPerSecond: 0 },
    ],
    ["zero vehicle mass", { ...referenceInputs, vehicleMassKilograms: 0 }],
    ["zero drag coefficient", { ...referenceInputs, dragCoefficient: 0 }],
    [
      "zero reference area",
      { ...referenceInputs, referenceAreaSquareMetres: 0 },
    ],
    ["zero nose radius", { ...referenceInputs, noseRadiusMetres: 0 }],
    ["zero safety factor", { ...referenceInputs, safetyFactor: 0 }],
    ["zero heating coefficient", { ...referenceInputs, heatingCoefficient: 0 }],
    ["zero timestep", { ...referenceInputs, timestepSeconds: 0 }],
  ])("preserves existing validation for %s", (_label, inputs) => {
    expect(() => analyzeTPSMaterialComparison(inputs)).toThrowError(RangeError);
  });

  it.each([
    ["altitude", { ...referenceInputs, initialAltitudeMeters: Number.NaN }],
    [
      "velocity",
      {
        ...referenceInputs,
        initialVelocityMetersPerSecond: Number.POSITIVE_INFINITY,
      },
    ],
    [
      "reference area",
      {
        ...referenceInputs,
        referenceAreaSquareMetres: Number.NEGATIVE_INFINITY,
      },
    ],
    ["safety factor", { ...referenceInputs, safetyFactor: Number.NaN }],
    [
      "heating coefficient",
      {
        ...referenceInputs,
        heatingCoefficient: Number.POSITIVE_INFINITY,
      },
    ],
  ])("rejects non-finite %s", (_label, inputs) => {
    expect(() => analyzeTPSMaterialComparison(inputs)).toThrowError(RangeError);
  });
});
