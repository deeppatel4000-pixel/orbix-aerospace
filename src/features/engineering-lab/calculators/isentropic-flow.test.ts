import { describe, expect, it } from "vitest";

import {
  calculateIsentropicFlow,
  DEFAULT_ISENTROPIC_FLOW_GAMMA,
} from "./isentropic-flow";

describe("calculateIsentropicFlow", () => {
  it("returns unity static-to-stagnation ratios at Mach 0", () => {
    const result = calculateIsentropicFlow({ machNumber: 0 });

    expect(result).toEqual({
      densityRatio: 1,
      pressureRatio: 1,
      temperatureRatio: 1,
    });
  });

  it("calculates the known air ratios at Mach 1", () => {
    const result = calculateIsentropicFlow({ machNumber: 1 });

    expect(DEFAULT_ISENTROPIC_FLOW_GAMMA).toBe(1.4);
    expect(result.temperatureRatio).toBeCloseTo(1.2, 10);
    expect(result.pressureRatio).toBeCloseTo(1.8929, 4);
    expect(result.densityRatio).toBeCloseTo(1.5774, 4);
  });

  it("produces significantly elevated ratios at Mach 5", () => {
    const result = calculateIsentropicFlow({ machNumber: 5 });

    expect(result.temperatureRatio).toBeGreaterThan(5);
    expect(result.pressureRatio).toBeGreaterThan(500);
    expect(result.densityRatio).toBeGreaterThan(80);
  });

  it("uses a valid custom ratio of specific heats", () => {
    const result = calculateIsentropicFlow({ gamma: 1.3, machNumber: 1 });

    expect(result.temperatureRatio).toBeCloseTo(1.15, 10);
    expect(result.pressureRatio).toBeCloseTo(Math.pow(1.15, 1.3 / 0.3), 10);
    expect(result.densityRatio).toBeCloseTo(Math.pow(1.15, 1 / 0.3), 10);
  });

  it.each([
    ["negative Mach number", { machNumber: -1 }],
    ["NaN Mach number", { machNumber: Number.NaN }],
    ["infinite Mach number", { machNumber: Number.POSITIVE_INFINITY }],
    ["gamma equal to one", { gamma: 1, machNumber: 1 }],
    ["gamma below one", { gamma: 0.9, machNumber: 1 }],
    ["NaN gamma", { gamma: Number.NaN, machNumber: 1 }],
    ["infinite gamma", { gamma: Number.POSITIVE_INFINITY, machNumber: 1 }],
  ])("rejects %s", (_label, inputs) => {
    expect(() => calculateIsentropicFlow(inputs)).toThrowError(RangeError);
  });
});
