import { describe, expect, it } from "vitest";

import type { BallisticCoefficientInputs } from "@/features/engineering-lab/types";

import { calculateBallisticCoefficient } from "./ballistic-coefficient";

const referenceInputs: BallisticCoefficientInputs = {
  dragCoefficient: 1.5,
  referenceAreaSquareMetres: 10,
  vehicleMassKilograms: 2_000,
};

describe("calculateBallisticCoefficient", () => {
  it("calculates a known SI ballistic-coefficient reference condition", () => {
    const result = calculateBallisticCoefficient(referenceInputs);

    expect(result.ballisticCoefficientKilogramsPerSquareMetre).toBeCloseTo(
      133.33333333333334,
      12,
    );
    expect(result.inputs).toEqual(referenceInputs);
  });

  it("increases when vehicle mass increases", () => {
    const baseline = calculateBallisticCoefficient(referenceInputs);
    const heavierVehicle = calculateBallisticCoefficient({
      ...referenceInputs,
      vehicleMassKilograms: referenceInputs.vehicleMassKilograms * 2,
    });

    expect(
      heavierVehicle.ballisticCoefficientKilogramsPerSquareMetre,
    ).toBeCloseTo(baseline.ballisticCoefficientKilogramsPerSquareMetre * 2, 12);
  });

  it("decreases when drag coefficient increases", () => {
    const baseline = calculateBallisticCoefficient(referenceInputs);
    const higherDragCoefficient = calculateBallisticCoefficient({
      ...referenceInputs,
      dragCoefficient: referenceInputs.dragCoefficient * 2,
    });

    expect(
      higherDragCoefficient.ballisticCoefficientKilogramsPerSquareMetre,
    ).toBeCloseTo(baseline.ballisticCoefficientKilogramsPerSquareMetre / 2, 12);
  });

  it("decreases when reference area increases", () => {
    const baseline = calculateBallisticCoefficient(referenceInputs);
    const largerReferenceArea = calculateBallisticCoefficient({
      ...referenceInputs,
      referenceAreaSquareMetres: referenceInputs.referenceAreaSquareMetres * 2,
    });

    expect(
      largerReferenceArea.ballisticCoefficientKilogramsPerSquareMetre,
    ).toBeCloseTo(baseline.ballisticCoefficientKilogramsPerSquareMetre / 2, 12);
  });

  it.each([
    ["vehicle mass", { ...referenceInputs, vehicleMassKilograms: 0 }],
    ["drag coefficient", { ...referenceInputs, dragCoefficient: 0 }],
    ["reference area", { ...referenceInputs, referenceAreaSquareMetres: 0 }],
  ])("rejects zero %s", (_label, inputs) => {
    expect(() => calculateBallisticCoefficient(inputs)).toThrowError(
      /must be greater than zero/,
    );
  });

  it.each([
    ["vehicle mass", { ...referenceInputs, vehicleMassKilograms: -1 }],
    ["drag coefficient", { ...referenceInputs, dragCoefficient: -1 }],
    ["reference area", { ...referenceInputs, referenceAreaSquareMetres: -1 }],
  ])("rejects negative %s", (_label, inputs) => {
    expect(() => calculateBallisticCoefficient(inputs)).toThrowError(
      RangeError,
    );
  });

  it.each([
    ["vehicle mass", { ...referenceInputs, vehicleMassKilograms: Number.NaN }],
    [
      "drag coefficient",
      { ...referenceInputs, dragCoefficient: Number.POSITIVE_INFINITY },
    ],
    [
      "reference area",
      {
        ...referenceInputs,
        referenceAreaSquareMetres: Number.NEGATIVE_INFINITY,
      },
    ],
  ])("rejects non-finite %s", (_label, inputs) => {
    expect(() => calculateBallisticCoefficient(inputs)).toThrowError(
      /finite number/,
    );
  });
});
