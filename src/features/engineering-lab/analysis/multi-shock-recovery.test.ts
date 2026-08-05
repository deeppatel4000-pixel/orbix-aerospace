import { describe, expect, it } from "vitest";

import { analyzeMultiShockRecovery } from "./multi-shock-recovery";

describe("analyzeMultiShockRecovery", () => {
  it("matches the Mach 2 single normal-shock result", () => {
    const result = analyzeMultiShockRecovery({
      shocks: [{ type: "normal" }],
      upstreamMach: 2,
    });

    expect(result.upstreamMach).toBe(2);
    expect(result.finalMach).toBeCloseTo(0.5773502692, 10);
    expect(result.numberOfShocks).toBe(1);
    expect(result.totalPressureRecoveryRatio).toBeCloseTo(0.7208738615, 10);
    expect(result.totalPressureLossPercentage).toBeCloseTo(27.9126138515, 10);
    expect(result.shockResults).toEqual([
      expect.objectContaining({
        shockType: "normal",
        upstreamMach: 2,
      }),
    ]);
    expect(result.shockResults[0]?.pressureRecoveryRatio).toBeCloseTo(
      result.totalPressureRecoveryRatio,
      12,
    );
    expect(result.shockResults[0]?.cumulativeRecoveryRatio).toBeCloseTo(
      result.totalPressureRecoveryRatio,
      12,
    );
  });

  it("matches the Mach 2, 10 degree single oblique-shock result", () => {
    const result = analyzeMultiShockRecovery({
      shocks: [{ deflectionAngleDegrees: 10, type: "oblique" }],
      upstreamMach: 2,
    });
    const shock = result.shockResults[0];

    expect(result.finalMach).toBeCloseTo(1.640522229, 9);
    expect(result.totalPressureRecoveryRatio).toBeCloseTo(0.9846440225, 10);
    expect(result.totalPressureLossPercentage).toBeCloseTo(1.5355977497, 10);
    expect(shock?.shockType).toBe("oblique");

    if (shock?.shockType !== "oblique") {
      throw new TypeError("Expected an oblique shock result.");
    }

    expect(shock.shockAngleDegrees).toBeCloseTo(39.3139318448, 10);
    expect(shock.normalMachComponent).toBeCloseTo(1.2671380365, 10);
  });

  it("accumulates recovery through two sequential oblique shocks", () => {
    const sequence = analyzeMultiShockRecovery({
      shocks: [
        { deflectionAngleDegrees: 10, type: "oblique" },
        { deflectionAngleDegrees: 10, type: "oblique" },
      ],
      upstreamMach: 3,
    });
    const equivalentNormalShock = analyzeMultiShockRecovery({
      shocks: [{ type: "normal" }],
      upstreamMach: 3,
    });
    const firstShock = sequence.shockResults[0];
    const secondShock = sequence.shockResults[1];

    expect(sequence.numberOfShocks).toBe(2);
    expect(sequence.finalMach).toBeLessThan(sequence.upstreamMach);
    expect(secondShock?.upstreamMach).toBeCloseTo(
      firstShock?.downstreamMach ?? Number.NaN,
      12,
    );
    expect(secondShock?.cumulativeRecoveryRatio).toBeLessThan(
      firstShock?.cumulativeRecoveryRatio ?? 0,
    );
    expect(sequence.totalPressureRecoveryRatio).toBeCloseTo(
      secondShock?.cumulativeRecoveryRatio ?? Number.NaN,
      12,
    );
    expect(sequence.totalPressureRecoveryRatio).toBeGreaterThan(
      equivalentNormalShock.totalPressureRecoveryRatio,
    );
  });

  it("validates optional altitude without changing dimensionless recovery", () => {
    const inputs = {
      shocks: [{ deflectionAngleDegrees: 10, type: "oblique" }] as const,
      upstreamMach: 2,
    };
    const noAltitude = analyzeMultiShockRecovery(inputs);
    const highAltitude = analyzeMultiShockRecovery({
      ...inputs,
      altitudeMeters: 10_000,
    });

    expect(highAltitude).toEqual(noAltitude);
  });

  it("rejects an empty shock sequence", () => {
    expect(() =>
      analyzeMultiShockRecovery({ shocks: [], upstreamMach: 2 }),
    ).toThrowError("At least one shock is required.");
  });

  it.each([0.99, 0, -2, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid upstream Mach %s",
    (upstreamMach) => {
      expect(() =>
        analyzeMultiShockRecovery({
          shocks: [{ type: "normal" }],
          upstreamMach,
        }),
      ).toThrowError(RangeError);
    },
  );

  it("rejects a detached oblique shock", () => {
    expect(() =>
      analyzeMultiShockRecovery({
        shocks: [{ deflectionAngleDegrees: 30, type: "oblique" }],
        upstreamMach: 2,
      }),
    ).toThrowError("No attached weak-shock solution exists for these inputs.");
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid deflection angle %s",
    (deflectionAngleDegrees) => {
      expect(() =>
        analyzeMultiShockRecovery({
          shocks: [{ deflectionAngleDegrees, type: "oblique" }],
          upstreamMach: 2,
        }),
      ).toThrowError(RangeError);
    },
  );

  it.each([1, 0.9, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid gamma %s",
    (gamma) => {
      expect(() =>
        analyzeMultiShockRecovery({
          gamma,
          shocks: [{ type: "normal" }],
          upstreamMach: 2,
        }),
      ).toThrowError(RangeError);
    },
  );

  it.each([-1, 11_001, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid optional altitude %s",
    (altitudeMeters) => {
      expect(() =>
        analyzeMultiShockRecovery({
          altitudeMeters,
          shocks: [{ type: "normal" }],
          upstreamMach: 2,
        }),
      ).toThrowError(RangeError);
    },
  );
});
