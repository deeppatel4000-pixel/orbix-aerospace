import { describe, expect, it } from "vitest";

import {
  calculateObliqueShock,
  DEFAULT_OBLIQUE_SHOCK_GAMMA,
} from "./oblique-shock";

describe("calculateObliqueShock", () => {
  it("calculates the weak shock for a Mach 2, 10 degree wedge", () => {
    const result = calculateObliqueShock({
      deflectionAngleDegrees: 10,
      machNumber: 2,
    });

    expect(DEFAULT_OBLIQUE_SHOCK_GAMMA).toBe(1.4);
    expect(result.upstreamMach).toBe(2);
    expect(result.deflectionAngleDegrees).toBe(10);
    expect(result.shockAngleDegrees).toBeCloseTo(39.3139, 4);
    expect(result.downstreamMach).toBeCloseTo(1.6405, 4);
    expect(result.pressureRatio).toBeGreaterThan(1);
  });

  it("shows stronger turning effects for a Mach 3, 15 degree wedge", () => {
    const tenDegreeResult = calculateObliqueShock({
      deflectionAngleDegrees: 10,
      machNumber: 3,
    });
    const fifteenDegreeResult = calculateObliqueShock({
      deflectionAngleDegrees: 15,
      machNumber: 3,
    });

    expect(fifteenDegreeResult.shockAngleDegrees).toBeCloseTo(32.2404, 4);
    expect(fifteenDegreeResult.downstreamMach).toBeCloseTo(2.2549, 4);
    expect(fifteenDegreeResult.shockAngleDegrees).toBeGreaterThan(
      tenDegreeResult.shockAngleDegrees,
    );
    expect(fifteenDegreeResult.downstreamMach).toBeLessThan(
      tenDegreeResult.downstreamMach,
    );
    expect(fifteenDegreeResult.pressureRatio).toBeGreaterThan(
      tenDegreeResult.pressureRatio,
    );
  });

  it("supports a valid custom ratio of specific heats", () => {
    const result = calculateObliqueShock({
      deflectionAngleDegrees: 10,
      gamma: 1.3,
      machNumber: 2,
    });

    expect(result.shockAngleDegrees).toBeGreaterThan(
      Math.asin(1 / 2) * (180 / Math.PI),
    );
    expect(result.downstreamMach).toBeLessThan(result.upstreamMach);
    expect(result.pressureRatio).toBeGreaterThan(1);
  });

  it("rejects a deflection beyond the attached weak-shock limit", () => {
    expect(() =>
      calculateObliqueShock({
        deflectionAngleDegrees: 30,
        machNumber: 2,
      }),
    ).toThrowError("No attached weak-shock solution exists for these inputs.");
  });

  it.each([
    ["sonic Mach number", { deflectionAngleDegrees: 10, machNumber: 1 }],
    ["zero Mach number", { deflectionAngleDegrees: 10, machNumber: 0 }],
    ["subsonic Mach number", { deflectionAngleDegrees: 10, machNumber: 0.99 }],
    ["negative Mach number", { deflectionAngleDegrees: 10, machNumber: -2 }],
    ["NaN Mach number", { deflectionAngleDegrees: 10, machNumber: Number.NaN }],
    [
      "infinite Mach number",
      { deflectionAngleDegrees: 10, machNumber: Number.POSITIVE_INFINITY },
    ],
    ["zero deflection", { deflectionAngleDegrees: 0, machNumber: 2 }],
    ["negative deflection", { deflectionAngleDegrees: -1, machNumber: 2 }],
    ["NaN deflection", { deflectionAngleDegrees: Number.NaN, machNumber: 2 }],
    [
      "infinite deflection",
      {
        deflectionAngleDegrees: Number.POSITIVE_INFINITY,
        machNumber: 2,
      },
    ],
    [
      "gamma equal to one",
      { deflectionAngleDegrees: 10, gamma: 1, machNumber: 2 },
    ],
    [
      "gamma below one",
      { deflectionAngleDegrees: 10, gamma: 0.9, machNumber: 2 },
    ],
    [
      "NaN gamma",
      { deflectionAngleDegrees: 10, gamma: Number.NaN, machNumber: 2 },
    ],
    [
      "infinite gamma",
      {
        deflectionAngleDegrees: 10,
        gamma: Number.POSITIVE_INFINITY,
        machNumber: 2,
      },
    ],
  ])("rejects %s", (_label, inputs) => {
    expect(() => calculateObliqueShock(inputs)).toThrowError(RangeError);
  });
});
