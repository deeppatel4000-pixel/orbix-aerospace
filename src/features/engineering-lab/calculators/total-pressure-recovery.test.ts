import { describe, expect, it } from "vitest";

import {
  calculateTotalPressureRecovery,
  DEFAULT_TOTAL_PRESSURE_RECOVERY_GAMMA,
} from "./total-pressure-recovery";

describe("calculateTotalPressureRecovery", () => {
  it("returns full pressure recovery at Mach 1", () => {
    const result = calculateTotalPressureRecovery({ machNumber: 1 });

    expect(DEFAULT_TOTAL_PRESSURE_RECOVERY_GAMMA).toBe(1.4);
    expect(result).toEqual({
      gamma: 1.4,
      pressureLossPercentage: 0,
      pressureRecoveryRatio: 1,
      upstreamMach: 1,
    });
  });

  it("calculates the Mach 2 normal-shock reference recovery", () => {
    const result = calculateTotalPressureRecovery({ machNumber: 2 });

    expect(result.upstreamMach).toBe(2);
    expect(result.gamma).toBe(1.4);
    expect(result.pressureRecoveryRatio).toBeCloseTo(0.7208738615, 10);
    expect(result.pressureLossPercentage).toBeCloseTo(27.9126138515, 10);
  });

  it("shows stronger total-pressure loss at Mach 5", () => {
    const machTwo = calculateTotalPressureRecovery({ machNumber: 2 });
    const machFive = calculateTotalPressureRecovery({ machNumber: 5 });

    expect(machFive.pressureRecoveryRatio).toBeCloseTo(0.06171631975, 10);
    expect(machFive.pressureRecoveryRatio).toBeLessThan(
      machTwo.pressureRecoveryRatio,
    );
    expect(machFive.pressureLossPercentage).toBeGreaterThan(
      machTwo.pressureLossPercentage,
    );
  });

  it("supports a valid custom ratio of specific heats", () => {
    const result = calculateTotalPressureRecovery({
      gamma: 1.3,
      machNumber: 2,
    });

    expect(result.gamma).toBe(1.3);
    expect(result.pressureRecoveryRatio).toBeCloseTo(0.7005711034, 10);
    expect(result.pressureLossPercentage).toBeCloseTo(29.9428896637, 10);
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
    expect(() => calculateTotalPressureRecovery(inputs)).toThrowError(
      RangeError,
    );
  });
});
