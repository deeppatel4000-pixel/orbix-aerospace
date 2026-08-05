import { describe, expect, it } from "vitest";

import {
  calculateNormalShock,
  DEFAULT_NORMAL_SHOCK_GAMMA,
} from "./normal-shock";

describe("calculateNormalShock", () => {
  it("returns a sonic downstream state and unity ratios at Mach 1", () => {
    const result = calculateNormalShock({ machNumber: 1 });

    expect(DEFAULT_NORMAL_SHOCK_GAMMA).toBe(1.4);
    expect(result).toEqual({
      densityRatio: 1,
      downstreamMach: 1,
      pressureRatio: 1,
      temperatureRatio: 1,
      upstreamMach: 1,
    });
  });

  it("calculates the known air relations at Mach 2", () => {
    const result = calculateNormalShock({ machNumber: 2 });

    expect(result.upstreamMach).toBe(2);
    expect(result.downstreamMach).toBeCloseTo(0.57735, 5);
    expect(result.pressureRatio).toBeCloseTo(4.5, 10);
    expect(result.densityRatio).toBeCloseTo(2.6667, 4);
    expect(result.temperatureRatio).toBeCloseTo(1.6875, 10);
  });

  it("shows stronger shock effects at Mach 5", () => {
    const machTwo = calculateNormalShock({ machNumber: 2 });
    const machFive = calculateNormalShock({ machNumber: 5 });

    expect(machFive.downstreamMach).toBeLessThan(machTwo.downstreamMach);
    expect(machFive.downstreamMach).toBeLessThan(machFive.upstreamMach);
    expect(machFive.pressureRatio).toBeGreaterThan(machTwo.pressureRatio);
    expect(machFive.densityRatio).toBeGreaterThan(machTwo.densityRatio);
    expect(machFive.temperatureRatio).toBeGreaterThan(machTwo.temperatureRatio);
  });

  it("uses a valid custom ratio of specific heats", () => {
    const result = calculateNormalShock({ gamma: 1.3, machNumber: 2 });

    expect(result.downstreamMach).toBeCloseTo(0.5628780358, 10);
    expect(result.pressureRatio).toBeCloseTo(4.3913043478, 10);
    expect(result.densityRatio).toBeCloseTo(2.875, 10);
    expect(result.temperatureRatio).toBeCloseTo(1.5274102079, 10);
  });

  it.each([
    ["zero Mach number", { machNumber: 0 }],
    ["subsonic Mach number", { machNumber: 0.99 }],
    ["negative Mach number", { machNumber: -2 }],
    ["NaN Mach number", { machNumber: Number.NaN }],
    ["infinite Mach number", { machNumber: Number.POSITIVE_INFINITY }],
    ["gamma equal to one", { gamma: 1, machNumber: 2 }],
    ["gamma below one", { gamma: 0.9, machNumber: 2 }],
    ["NaN gamma", { gamma: Number.NaN, machNumber: 2 }],
    ["infinite gamma", { gamma: Number.POSITIVE_INFINITY, machNumber: 2 }],
  ])("rejects %s", (_label, inputs) => {
    expect(() => calculateNormalShock(inputs)).toThrowError(RangeError);
  });
});
