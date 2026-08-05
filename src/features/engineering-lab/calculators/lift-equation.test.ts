import { describe, expect, it } from "vitest";

import type { LiftEquationInputs } from "@/features/engineering-lab/types";

import { calculateLiftEquation } from "./lift-equation";

const validInputs: LiftEquationInputs = {
  airDensityKilogramsPerCubicMetre: 1.225,
  liftCoefficient: 0.8,
  velocityMetresPerSecond: 50,
  wingAreaSquareMetres: 20,
};

describe("calculateLiftEquation", () => {
  it("calculates lift force for a known aerodynamic condition", () => {
    const result = calculateLiftEquation(validInputs);

    expect(result.liftForceNewtons).toBeCloseTo(24_500, 8);
  });

  it.each([
    [
      "air density",
      {
        ...validInputs,
        airDensityKilogramsPerCubicMetre: Number.NaN,
      },
    ],
    [
      "velocity",
      {
        ...validInputs,
        velocityMetresPerSecond: Number.POSITIVE_INFINITY,
      },
    ],
    [
      "wing area",
      {
        ...validInputs,
        wingAreaSquareMetres: Number.NEGATIVE_INFINITY,
      },
    ],
    ["lift coefficient", { ...validInputs, liftCoefficient: Number.NaN }],
  ])("rejects a non-finite %s", (_label, inputs) => {
    expect(() => calculateLiftEquation(inputs)).toThrowError(/finite number/);
  });

  it.each([
    ["air density", { ...validInputs, airDensityKilogramsPerCubicMetre: 0 }],
    ["velocity", { ...validInputs, velocityMetresPerSecond: 0 }],
    ["wing area", { ...validInputs, wingAreaSquareMetres: 0 }],
    ["lift coefficient", { ...validInputs, liftCoefficient: 0 }],
  ])("rejects zero %s", (_label, inputs) => {
    expect(() => calculateLiftEquation(inputs)).toThrowError(
      /must be greater than zero/,
    );
  });

  it.each([
    ["air density", { ...validInputs, airDensityKilogramsPerCubicMetre: -1 }],
    ["velocity", { ...validInputs, velocityMetresPerSecond: -1 }],
    ["wing area", { ...validInputs, wingAreaSquareMetres: -1 }],
    ["lift coefficient", { ...validInputs, liftCoefficient: -1 }],
  ])("rejects a negative %s", (_label, inputs) => {
    expect(() => calculateLiftEquation(inputs)).toThrowError(RangeError);
  });
});
