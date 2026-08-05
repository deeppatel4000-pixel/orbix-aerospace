import { describe, expect, it } from "vitest";

import type { DynamicPressureInputs } from "@/features/engineering-lab/types";

import { calculateDynamicPressure } from "./aerodynamic";

const validInputs: DynamicPressureInputs = {
  airDensityKilogramsPerCubicMetre: 1.225,
  velocityMetresPerSecond: 50,
};

describe("calculateDynamicPressure", () => {
  it("calculates pressure for a known aerodynamic condition", () => {
    const result = calculateDynamicPressure(validInputs);

    expect(result.dynamicPressurePascals).toBeCloseTo(1_531.25, 8);
  });

  it.each([
    [
      "non-finite air density",
      { ...validInputs, airDensityKilogramsPerCubicMetre: Number.NaN },
    ],
    [
      "non-finite velocity",
      { ...validInputs, velocityMetresPerSecond: Number.POSITIVE_INFINITY },
    ],
    [
      "zero air density",
      { ...validInputs, airDensityKilogramsPerCubicMetre: 0 },
    ],
    ["zero velocity", { ...validInputs, velocityMetresPerSecond: 0 }],
    [
      "negative air density",
      { ...validInputs, airDensityKilogramsPerCubicMetre: -1 },
    ],
    ["negative velocity", { ...validInputs, velocityMetresPerSecond: -1 }],
  ])("rejects %s", (_label, inputs) => {
    expect(() => calculateDynamicPressure(inputs)).toThrowError(RangeError);
  });
});
