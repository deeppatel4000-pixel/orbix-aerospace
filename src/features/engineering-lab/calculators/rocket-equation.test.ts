import { describe, expect, it } from "vitest";

import type { RocketEquationInputs } from "@/features/engineering-lab/types";

import { calculateRocketEquation } from "./rocket-equation";

const validInputs: RocketEquationInputs = {
  finalMassKg: 100_000,
  initialMassKg: 500_000,
  specificImpulseSeconds: 350,
};

describe("calculateRocketEquation", () => {
  it("calculates ideal delta-v from a valid mass ratio and specific impulse", () => {
    const result = calculateRocketEquation(validInputs);

    expect(result.massRatio).toBe(5);
    expect(result.effectiveExhaustVelocityMetresPerSecond).toBeCloseTo(
      3_432.3275,
      8,
    );
    expect(result.deltaVMetresPerSecond).toBeCloseTo(5_524.118, 3);
  });

  it("rejects equal initial and final masses", () => {
    expect(() =>
      calculateRocketEquation({
        ...validInputs,
        initialMassKg: validInputs.finalMassKg,
      }),
    ).toThrowError(/Initial mass must exceed final mass/);
  });

  it.each([
    ["initial mass", { ...validInputs, initialMassKg: -1 }],
    ["final mass", { ...validInputs, finalMassKg: -1 }],
    ["specific impulse", { ...validInputs, specificImpulseSeconds: -1 }],
  ])("rejects a negative %s", (_label, inputs) => {
    expect(() => calculateRocketEquation(inputs)).toThrowError(RangeError);
  });

  it.each([
    ["initial mass", { ...validInputs, initialMassKg: Number.NaN }],
    ["final mass", { ...validInputs, finalMassKg: Number.POSITIVE_INFINITY }],
    [
      "specific impulse",
      { ...validInputs, specificImpulseSeconds: Number.NEGATIVE_INFINITY },
    ],
  ])("rejects a non-finite %s", (_label, inputs) => {
    expect(() => calculateRocketEquation(inputs)).toThrowError(/finite number/);
  });
});
