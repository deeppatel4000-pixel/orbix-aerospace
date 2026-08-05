import { describe, expect, it } from "vitest";

import type { StagnationHeatingInputs } from "@/features/engineering-lab/types";

import {
  calculateStagnationHeating,
  DEFAULT_STAGNATION_HEATING_COEFFICIENT,
} from "./stagnation-heating";

const referenceInputs: StagnationHeatingInputs = {
  atmosphericDensityKilogramsPerCubicMetre: 0.02,
  noseRadiusMetres: 1,
  velocityMetresPerSecond: 7_500,
};

describe("calculateStagnationHeating", () => {
  it("calculates a known SI stagnation-heating reference condition", () => {
    const result = calculateStagnationHeating(referenceInputs);

    expect(DEFAULT_STAGNATION_HEATING_COEFFICIENT).toBe(1.83e-4);
    expect(result.heatFluxWattsPerSquareMetre).toBeCloseTo(
      10_918_170.6432585,
      6,
    );
    expect(result.heatFluxKilowattsPerSquareMetre).toBeCloseTo(
      10_918.1706432585,
      9,
    );
    expect(result.resolvedHeatingCoefficient).toBe(1.83e-4);
    expect(result.inputs).toEqual({
      ...referenceInputs,
      heatingCoefficient: 1.83e-4,
    });
  });

  it("produces higher heating at higher velocity", () => {
    const lowerVelocity = calculateStagnationHeating({
      ...referenceInputs,
      velocityMetresPerSecond: 7_000,
    });
    const higherVelocity = calculateStagnationHeating({
      ...referenceInputs,
      velocityMetresPerSecond: 8_000,
    });

    expect(higherVelocity.heatFluxWattsPerSquareMetre).toBeGreaterThan(
      lowerVelocity.heatFluxWattsPerSquareMetre,
    );
  });

  it("produces lower heating for a larger nose radius", () => {
    const oneMetreRadius = calculateStagnationHeating(referenceInputs);
    const fourMetreRadius = calculateStagnationHeating({
      ...referenceInputs,
      noseRadiusMetres: 4,
    });

    expect(fourMetreRadius.heatFluxWattsPerSquareMetre).toBeLessThan(
      oneMetreRadius.heatFluxWattsPerSquareMetre,
    );
    expect(fourMetreRadius.heatFluxWattsPerSquareMetre).toBeCloseTo(
      oneMetreRadius.heatFluxWattsPerSquareMetre / 2,
      8,
    );
  });

  it("uses and reports a valid custom heating coefficient", () => {
    const result = calculateStagnationHeating({
      ...referenceInputs,
      heatingCoefficient: 2e-4,
    });

    expect(result.resolvedHeatingCoefficient).toBe(2e-4);
    expect(result.inputs.heatingCoefficient).toBe(2e-4);
    expect(result.heatFluxWattsPerSquareMetre).toBeCloseTo(
      11_932_426.932523,
      6,
    );
  });

  it.each([
    [
      "atmospheric density",
      { ...referenceInputs, atmosphericDensityKilogramsPerCubicMetre: 0 },
    ],
    ["velocity", { ...referenceInputs, velocityMetresPerSecond: 0 }],
    ["nose radius", { ...referenceInputs, noseRadiusMetres: 0 }],
    ["heating coefficient", { ...referenceInputs, heatingCoefficient: 0 }],
  ])("rejects zero %s", (_label, inputs) => {
    expect(() => calculateStagnationHeating(inputs)).toThrowError(
      /must be greater than zero/,
    );
  });

  it.each([
    [
      "atmospheric density",
      { ...referenceInputs, atmosphericDensityKilogramsPerCubicMetre: -0.01 },
    ],
    ["velocity", { ...referenceInputs, velocityMetresPerSecond: -1 }],
    ["nose radius", { ...referenceInputs, noseRadiusMetres: -1 }],
    ["heating coefficient", { ...referenceInputs, heatingCoefficient: -1 }],
  ])("rejects negative %s", (_label, inputs) => {
    expect(() => calculateStagnationHeating(inputs)).toThrowError(RangeError);
  });

  it.each([
    [
      "atmospheric density",
      {
        ...referenceInputs,
        atmosphericDensityKilogramsPerCubicMetre: Number.NaN,
      },
    ],
    [
      "velocity",
      {
        ...referenceInputs,
        velocityMetresPerSecond: Number.POSITIVE_INFINITY,
      },
    ],
    [
      "nose radius",
      {
        ...referenceInputs,
        noseRadiusMetres: Number.NEGATIVE_INFINITY,
      },
    ],
    [
      "heating coefficient",
      {
        ...referenceInputs,
        heatingCoefficient: Number.NaN,
      },
    ],
    [
      "infinite heating coefficient",
      {
        ...referenceInputs,
        heatingCoefficient: Number.POSITIVE_INFINITY,
      },
    ],
  ])("rejects non-finite %s", (_label, inputs) => {
    expect(() => calculateStagnationHeating(inputs)).toThrowError(
      /finite number/,
    );
  });
});
