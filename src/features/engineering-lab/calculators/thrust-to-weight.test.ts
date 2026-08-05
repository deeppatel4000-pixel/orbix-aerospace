import { describe, expect, it } from "vitest";

import {
  calculateThrustToWeightRatio,
  classifyThrustToWeightRatio,
} from "./thrust-to-weight";

describe("calculateThrustToWeightRatio", () => {
  it("calculates a dimensionless ratio using standard gravity", () => {
    const result = calculateThrustToWeightRatio({
      massKg: 10_000,
      thrustNewtons: 196_133,
    });

    expect(result.weightNewtons).toBeCloseTo(98_066.5, 8);
    expect(result.thrustToWeightRatio).toBeCloseTo(2, 8);
    expect(result.regime).toBe("above-one");
  });

  it.each([
    ["zero thrust", { massKg: 1, thrustNewtons: 0 }],
    ["negative thrust", { massKg: 1, thrustNewtons: -1 }],
    ["zero mass", { massKg: 0, thrustNewtons: 1 }],
    ["negative mass", { massKg: -1, thrustNewtons: 1 }],
    ["non-finite thrust", { massKg: 1, thrustNewtons: Number.NaN }],
    ["non-finite mass", { massKg: Number.POSITIVE_INFINITY, thrustNewtons: 1 }],
  ])("rejects %s", (_label, inputs) => {
    expect(() => calculateThrustToWeightRatio(inputs)).toThrowError(RangeError);
  });
});

describe("classifyThrustToWeightRatio", () => {
  it("classifies values below, within, and above the around-one tolerance", () => {
    expect(classifyThrustToWeightRatio(0.949)).toBe("below-one");
    expect(classifyThrustToWeightRatio(0.95)).toBe("around-one");
    expect(classifyThrustToWeightRatio(1)).toBe("around-one");
    expect(classifyThrustToWeightRatio(1.05)).toBe("around-one");
    expect(classifyThrustToWeightRatio(1.051)).toBe("above-one");
  });
});
