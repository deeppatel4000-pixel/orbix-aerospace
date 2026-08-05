import { describe, expect, it } from "vitest";

import type { DragEquationInputs } from "@/features/engineering-lab/types";

import { calculateDragEquation } from "./drag-equation";

const validInputs: DragEquationInputs = {
  airDensityKilogramsPerCubicMetre: 1.225,
  dragCoefficient: 0.03,
  referenceAreaSquareMetres: 20,
  velocityMetresPerSecond: 50,
};

describe("calculateDragEquation", () => {
  it("calculates drag force for a known aerodynamic condition", () => {
    const result = calculateDragEquation(validInputs);

    expect(result.dragForceNewtons).toBeCloseTo(918.75, 8);
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
      "reference area",
      {
        ...validInputs,
        referenceAreaSquareMetres: Number.NEGATIVE_INFINITY,
      },
    ],
    ["drag coefficient", { ...validInputs, dragCoefficient: Number.NaN }],
  ])("rejects a non-finite %s", (_label, inputs) => {
    expect(() => calculateDragEquation(inputs)).toThrowError(/finite number/);
  });

  it.each([
    ["air density", { ...validInputs, airDensityKilogramsPerCubicMetre: 0 }],
    ["velocity", { ...validInputs, velocityMetresPerSecond: 0 }],
    ["reference area", { ...validInputs, referenceAreaSquareMetres: 0 }],
    ["drag coefficient", { ...validInputs, dragCoefficient: 0 }],
  ])("rejects zero %s", (_label, inputs) => {
    expect(() => calculateDragEquation(inputs)).toThrowError(
      /must be greater than zero/,
    );
  });

  it.each([
    ["air density", { ...validInputs, airDensityKilogramsPerCubicMetre: -1 }],
    ["velocity", { ...validInputs, velocityMetresPerSecond: -1 }],
    ["reference area", { ...validInputs, referenceAreaSquareMetres: -1 }],
    ["drag coefficient", { ...validInputs, dragCoefficient: -1 }],
  ])("rejects a negative %s", (_label, inputs) => {
    expect(() => calculateDragEquation(inputs)).toThrowError(RangeError);
  });
});
