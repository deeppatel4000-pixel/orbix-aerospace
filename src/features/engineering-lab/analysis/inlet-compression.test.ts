import { describe, expect, it } from "vitest";

import {
  calculateNormalShock,
  calculateTotalPressureRecovery,
} from "@/features/engineering-lab/calculators";

import { analyzeInletCompression } from "./inlet-compression";
import { analyzeMultiShockRecovery } from "./multi-shock-recovery";

const externalCompressionSequence = [
  { deflectionAngleDegrees: 8, type: "oblique" },
  { deflectionAngleDegrees: 6, type: "oblique" },
] as const;

describe("analyzeInletCompression", () => {
  it("models a Mach 3 inlet with staged external compression and a terminal shock", () => {
    const result = analyzeInletCompression({
      externalShocks: externalCompressionSequence,
      initialMach: 3,
    });
    const firstExternalShock = result.externalShockStages[0];
    const secondExternalShock = result.externalShockStages[1];

    expect(result.initialMach).toBe(3);
    expect(result.externalShockStages).toHaveLength(2);
    expect(firstExternalShock?.shockType).toBe("oblique");
    expect(secondExternalShock?.shockType).toBe("oblique");
    expect(secondExternalShock?.upstreamMach).toBeCloseTo(
      firstExternalShock?.downstreamMach ?? Number.NaN,
      12,
    );
    expect(result.machBeforeTerminalShock).toBeCloseTo(
      secondExternalShock?.downstreamMach ?? Number.NaN,
      12,
    );
    expect(result.terminalShock.upstreamMach).toBeCloseTo(
      result.machBeforeTerminalShock,
      12,
    );
    expect(result.finalExitMach).toBeCloseTo(
      result.terminalShock.downstreamMach,
      12,
    );
    expect(result.finalExitMach).toBeLessThan(1);
  });

  it("reduces Mach through the complete inlet", () => {
    const result = analyzeInletCompression({
      externalShocks: externalCompressionSequence,
      initialMach: 3,
    });

    expect(result.machBeforeTerminalShock).toBeLessThan(result.initialMach);
    expect(result.machBeforeTerminalShock).toBeGreaterThan(1);
    expect(result.finalExitMach).toBeLessThan(result.machBeforeTerminalShock);
  });

  it("multiplies external and terminal pressure recovery", () => {
    const result = analyzeInletCompression({
      externalShocks: externalCompressionSequence,
      initialMach: 3,
    });

    expect(result.overallPressureRecoveryRatio).toBeCloseTo(
      result.externalPressureRecoveryRatio *
        result.terminalShockPressureRecoveryRatio,
      12,
    );
    expect(result.overallPressureRecoveryRatio).toBeLessThan(
      result.externalPressureRecoveryRatio,
    );
    expect(result.overallPressureRecoveryRatio).toBeLessThan(
      result.terminalShockPressureRecoveryRatio,
    );
  });

  it.each([0.99, 0, -2, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid initial Mach %s",
    (initialMach) => {
      expect(() =>
        analyzeInletCompression({
          externalShocks: externalCompressionSequence,
          initialMach,
        }),
      ).toThrowError(RangeError);
    },
  );

  it("rejects an empty external compression sequence", () => {
    expect(() =>
      analyzeInletCompression({ externalShocks: [], initialMach: 3 }),
    ).toThrowError("At least one shock is required.");
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid external deflection %s",
    (deflectionAngleDegrees) => {
      expect(() =>
        analyzeInletCompression({
          externalShocks: [{ deflectionAngleDegrees, type: "oblique" }],
          initialMach: 3,
        }),
      ).toThrowError(RangeError);
    },
  );

  it("preserves detached-shock errors from external compression", () => {
    expect(() =>
      analyzeInletCompression({
        externalShocks: [{ deflectionAngleDegrees: 30, type: "oblique" }],
        initialMach: 2,
      }),
    ).toThrowError("No attached weak-shock solution exists for these inputs.");
  });

  it("rejects an external sequence that is subsonic before the terminal shock", () => {
    expect(() =>
      analyzeInletCompression({
        externalShocks: [{ type: "normal" }],
        initialMach: 3,
      }),
    ).toThrowError(
      "Terminal normal shock requires a supersonic pre-shock Mach number greater than 1.",
    );
  });

  it("validates optional altitude without changing dimensionless inlet recovery", () => {
    const noAltitude = analyzeInletCompression({
      externalShocks: externalCompressionSequence,
      initialMach: 3,
    });
    const highAltitude = analyzeInletCompression({
      altitudeMeters: 10_000,
      externalShocks: externalCompressionSequence,
      initialMach: 3,
    });

    expect(highAltitude).toEqual(noAltitude);
  });

  it.each([-1, 11_001, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid optional altitude %s",
    (altitudeMeters) => {
      expect(() =>
        analyzeInletCompression({
          altitudeMeters,
          externalShocks: externalCompressionSequence,
          initialMach: 3,
        }),
      ).toThrowError(RangeError);
    },
  );

  it("propagates a custom gamma through external and terminal compression", () => {
    const gamma = 1.3;
    const result = analyzeInletCompression({
      externalShocks: externalCompressionSequence,
      gamma,
      initialMach: 3,
    });
    const expectedExternalCompression = analyzeMultiShockRecovery({
      gamma,
      shocks: externalCompressionSequence,
      upstreamMach: 3,
    });
    const expectedTerminalShock = calculateNormalShock({
      gamma,
      machNumber: expectedExternalCompression.finalMach,
    });
    const expectedTerminalRecovery = calculateTotalPressureRecovery({
      gamma,
      machNumber: expectedTerminalShock.upstreamMach,
    });

    expect(result.externalPressureRecoveryRatio).toBeCloseTo(
      expectedExternalCompression.totalPressureRecoveryRatio,
      12,
    );
    expect(result.terminalShock).toEqual(expectedTerminalShock);
    expect(result.terminalShockPressureRecoveryRatio).toBeCloseTo(
      expectedTerminalRecovery.pressureRecoveryRatio,
      12,
    );
    expect(result.overallPressureRecoveryRatio).toBeCloseTo(
      expectedExternalCompression.totalPressureRecoveryRatio *
        expectedTerminalRecovery.pressureRecoveryRatio,
      12,
    );
  });

  it.each([1, 0.9, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid gamma %s",
    (gamma) => {
      expect(() =>
        analyzeInletCompression({
          externalShocks: externalCompressionSequence,
          gamma,
          initialMach: 3,
        }),
      ).toThrowError(RangeError);
    },
  );
});
