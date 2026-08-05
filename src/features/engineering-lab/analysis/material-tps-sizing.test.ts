import { describe, expect, it } from "vitest";

import {
  getTPSMaterialById,
  listTPSMaterials,
} from "@/features/engineering-lab/materials";
import type {
  MaterialTPSSizingInputs,
  TPSMaterial,
  TPSSizingInputs,
} from "@/features/engineering-lab/types";

import { analyzeMaterialTPSSizing } from "./material-tps-sizing";
import { analyzeTPSSizing } from "./tps-sizing";

const referenceInputs: MaterialTPSSizingInputs = {
  dragCoefficient: 1.5,
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  materialId: "ceramic-thermal-tile",
  noseRadiusMetres: 1,
  referenceAreaSquareMetres: 12,
  safetyFactor: 1.5,
  vehicleMassKilograms: 5_000,
};

function buildDirectSizingInputs(
  inputs: MaterialTPSSizingInputs,
  material: TPSMaterial,
): TPSSizingInputs {
  const optionalFlightPathAngle =
    inputs.initialFlightPathAngleDegrees === undefined
      ? {}
      : {
          initialFlightPathAngleDegrees: inputs.initialFlightPathAngleDegrees,
        };
  const optionalHeatingCoefficient =
    inputs.heatingCoefficient === undefined
      ? {}
      : { heatingCoefficient: inputs.heatingCoefficient };
  const optionalTimeStep =
    inputs.timestepSeconds === undefined
      ? {}
      : { timestepSeconds: inputs.timestepSeconds };

  return {
    ...optionalFlightPathAngle,
    ...optionalHeatingCoefficient,
    ...optionalTimeStep,
    allowableHeatLoadMegajoulesPerSquareMetre:
      material.allowableHeatLoadMegajoulesPerSquareMetre,
    dragCoefficient: inputs.dragCoefficient,
    initialAltitudeMeters: inputs.initialAltitudeMeters,
    initialVelocityMetersPerSecond: inputs.initialVelocityMetersPerSecond,
    materialDensityKilogramsPerCubicMetre:
      material.densityKilogramsPerCubicMetre,
    noseRadiusMetres: inputs.noseRadiusMetres,
    referenceAreaSquareMetres: inputs.referenceAreaSquareMetres,
    safetyFactor: inputs.safetyFactor,
    vehicleMassKilograms: inputs.vehicleMassKilograms,
  };
}

describe("analyzeMaterialTPSSizing", () => {
  it("integrates material lookup with existing TPS sizing", () => {
    const material = getTPSMaterialById(referenceInputs.materialId);
    const result = analyzeMaterialTPSSizing(referenceInputs);

    expect(material).toBeDefined();
    expect(result.material).toBe(material);
    expect(result.tpsSizing.requiredArealDensity.kilogramsPerSquareMetre).toBe(
      result.estimatedTPSMassForArea.arealDensityKilogramsPerSquareMetre,
    );
  });

  it("supports every material in the catalog", () => {
    for (const material of listTPSMaterials()) {
      const result = analyzeMaterialTPSSizing({
        ...referenceInputs,
        materialId: material.id,
      });

      expect(result.material).toBe(material);
      expect(
        result.tpsSizing.requiredArealDensity.kilogramsPerSquareMetre,
      ).toBeGreaterThan(0);
      expect(result.tpsSizing.estimatedThickness.metres).toBeGreaterThan(0);
    }
  });

  it("calculates total TPS mass from areal density and reference area", () => {
    const result = analyzeMaterialTPSSizing(referenceInputs);
    const expectedMass =
      result.tpsSizing.requiredArealDensity.kilogramsPerSquareMetre *
      referenceInputs.referenceAreaSquareMetres;

    expect(
      result.estimatedTPSMassForArea.arealDensityKilogramsPerSquareMetre,
    ).toBe(result.tpsSizing.requiredArealDensity.kilogramsPerSquareMetre);
    expect(result.estimatedTPSMassForArea.totalTPSMassKilograms).toBeCloseTo(
      expectedMass,
      12,
    );
  });

  it("reflects catalog capacity differences when comparing materials", () => {
    const ablative = analyzeMaterialTPSSizing({
      ...referenceInputs,
      materialId: "ablative-heat-shield",
    });
    const carbonCarbon = analyzeMaterialTPSSizing({
      ...referenceInputs,
      materialId: "reinforced-carbon-carbon",
    });
    const ceramicTile = analyzeMaterialTPSSizing(referenceInputs);

    expect(
      ablative.estimatedTPSMassForArea.arealDensityKilogramsPerSquareMetre,
    ).toBeLessThan(
      carbonCarbon.estimatedTPSMassForArea.arealDensityKilogramsPerSquareMetre,
    );
    expect(
      carbonCarbon.estimatedTPSMassForArea.arealDensityKilogramsPerSquareMetre,
    ).toBeLessThan(
      ceramicTile.estimatedTPSMassForArea.arealDensityKilogramsPerSquareMetre,
    );
  });

  it.each([
    [1.1, "Low thermal margin"],
    [1.25, "Moderate thermal margin"],
    [1.75, "High thermal margin"],
  ] as const)(
    "classifies a %s safety factor as %s",
    (safetyFactor, expectedSummary) => {
      const result = analyzeMaterialTPSSizing({
        ...referenceInputs,
        safetyFactor,
      });

      expect(result.suitabilitySummary).toBe(expectedSummary);
    },
  );

  it("preserves the complete existing TPS sizing output", () => {
    const inputs: MaterialTPSSizingInputs = {
      ...referenceInputs,
      heatingCoefficient: 2e-4,
      initialFlightPathAngleDegrees: -60,
      timestepSeconds: 0.5,
    };
    const material = getTPSMaterialById(inputs.materialId);

    expect(material).toBeDefined();

    if (!material) return;

    const expectedSizing = analyzeTPSSizing(
      buildDirectSizingInputs(inputs, material),
    );
    const result = analyzeMaterialTPSSizing(inputs);

    expect(result.tpsSizing).toEqual(expectedSizing);
    expect(result.thermalHistory).toBe(result.tpsSizing.thermalHistory);
    expect(result.thermalHistory).toEqual(expectedSizing.thermalHistory);
  });

  it.each(["", "   ", "unknown-material"])(
    "rejects unknown material ID %j",
    (materialId) => {
      expect(() =>
        analyzeMaterialTPSSizing({ ...referenceInputs, materialId }),
      ).toThrowError(RangeError);
    },
  );

  it.each([
    ["zero safety factor", { ...referenceInputs, safetyFactor: 0 }],
    ["negative safety factor", { ...referenceInputs, safetyFactor: -1 }],
    [
      "zero reference area",
      { ...referenceInputs, referenceAreaSquareMetres: 0 },
    ],
    [
      "negative reference area",
      { ...referenceInputs, referenceAreaSquareMetres: -1 },
    ],
    ["negative altitude", { ...referenceInputs, initialAltitudeMeters: -1 }],
    [
      "zero velocity",
      { ...referenceInputs, initialVelocityMetersPerSecond: 0 },
    ],
    ["zero vehicle mass", { ...referenceInputs, vehicleMassKilograms: 0 }],
    ["zero drag coefficient", { ...referenceInputs, dragCoefficient: 0 }],
    ["zero nose radius", { ...referenceInputs, noseRadiusMetres: 0 }],
    ["zero heating coefficient", { ...referenceInputs, heatingCoefficient: 0 }],
    ["zero timestep", { ...referenceInputs, timestepSeconds: 0 }],
  ])("preserves existing validation for %s", (_label, inputs) => {
    expect(() => analyzeMaterialTPSSizing(inputs)).toThrowError(RangeError);
  });

  it.each([
    [
      "safety factor",
      { ...referenceInputs, safetyFactor: Number.POSITIVE_INFINITY },
    ],
    [
      "reference area",
      { ...referenceInputs, referenceAreaSquareMetres: Number.NaN },
    ],
    [
      "vehicle input",
      {
        ...referenceInputs,
        initialVelocityMetersPerSecond: Number.NEGATIVE_INFINITY,
      },
    ],
  ])("rejects non-finite %s", (_label, inputs) => {
    expect(() => analyzeMaterialTPSSizing(inputs)).toThrowError(RangeError);
  });
});
