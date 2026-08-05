import { describe, expect, it } from "vitest";

import { analyzeShockPressureLoss } from "./shock-pressure-loss";

describe("analyzeShockPressureLoss", () => {
  it("calculates the Mach 2 normal-shock pressure loss", () => {
    const result = analyzeShockPressureLoss({
      machNumber: 2,
      shockType: "normal",
    });

    expect(result.shockType).toBe("normal");
    expect(result.upstreamMach).toBe(2);
    expect(result.downstreamMach).toBeCloseTo(0.5773502692, 10);
    expect(result.pressureRecoveryRatio).toBeCloseTo(0.7208738615, 10);
    expect(result.pressureLossPercentage).toBeCloseTo(27.9126138515, 10);
  });

  it("calculates the stronger Mach 5 normal-shock pressure loss", () => {
    const machTwo = analyzeShockPressureLoss({
      machNumber: 2,
      shockType: "normal",
    });
    const machFive = analyzeShockPressureLoss({
      machNumber: 5,
      shockType: "normal",
    });

    expect(machFive.pressureRecoveryRatio).toBeCloseTo(0.06171631975, 10);
    expect(machFive.pressureRecoveryRatio).toBeLessThan(
      machTwo.pressureRecoveryRatio,
    );
    expect(machFive.pressureLossPercentage).toBeGreaterThan(
      machTwo.pressureLossPercentage,
    );
  });

  it("uses the normal Mach component for a Mach 2, 10 degree oblique shock", () => {
    const oblique = analyzeShockPressureLoss({
      deflectionAngleDegrees: 10,
      machNumber: 2,
      shockType: "oblique",
    });
    const normal = analyzeShockPressureLoss({
      machNumber: 2,
      shockType: "normal",
    });

    if (oblique.shockType !== "oblique") {
      throw new TypeError("Expected an oblique-shock analysis.");
    }

    expect(oblique.shockAngleDegrees).toBeCloseTo(39.3139318448, 10);
    expect(oblique.normalMachComponent).toBeCloseTo(1.2671380365, 10);
    expect(oblique.downstreamMach).toBeCloseTo(1.640522229, 9);
    expect(oblique.pressureRecoveryRatio).toBeCloseTo(0.9846440225, 10);
    expect(oblique.pressureLossPercentage).toBeCloseTo(1.5355977497, 10);
    expect(oblique.pressureLossPercentage).toBeLessThan(
      normal.pressureLossPercentage,
    );
  });

  it("accepts and validates an optional atmosphere altitude", () => {
    const seaLevel = analyzeShockPressureLoss({
      machNumber: 2,
      shockType: "normal",
    });
    const highAltitude = analyzeShockPressureLoss({
      altitudeMeters: 10_000,
      machNumber: 2,
      shockType: "normal",
    });

    expect(highAltitude).toEqual(seaLevel);
  });

  it("rejects detached oblique shocks", () => {
    expect(() =>
      analyzeShockPressureLoss({
        deflectionAngleDegrees: 30,
        machNumber: 2,
        shockType: "oblique",
      }),
    ).toThrowError("No attached weak-shock solution exists for these inputs.");
  });

  it.each([0.99, -2, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid normal-shock Mach %s",
    (machNumber) => {
      expect(() =>
        analyzeShockPressureLoss({
          machNumber,
          shockType: "normal",
        }),
      ).toThrowError(RangeError);
    },
  );

  it.each([1, 0.99, -2, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid oblique-shock Mach %s",
    (machNumber) => {
      expect(() =>
        analyzeShockPressureLoss({
          deflectionAngleDegrees: 10,
          machNumber,
          shockType: "oblique",
        }),
      ).toThrowError(RangeError);
    },
  );

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid deflection %s",
    (deflectionAngleDegrees) => {
      expect(() =>
        analyzeShockPressureLoss({
          deflectionAngleDegrees,
          machNumber: 2,
          shockType: "oblique",
        }),
      ).toThrowError(RangeError);
    },
  );

  it.each([-1, 11_001, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid optional altitude %s",
    (altitudeMeters) => {
      expect(() =>
        analyzeShockPressureLoss({
          altitudeMeters,
          machNumber: 2,
          shockType: "normal",
        }),
      ).toThrowError(RangeError);
    },
  );
});
