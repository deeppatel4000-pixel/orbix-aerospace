import { describe, expect, it } from "vitest";

import {
  calculateHohmannTransfer,
  calculateOrbitalElements,
  EARTH_MEAN_RADIUS_METRES,
  EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED,
} from "@/features/engineering-lab/calculators";
import type { HohmannTransferAnalysisInputs } from "@/features/engineering-lab/types";

import { analyzeHohmannTransfer } from "./hohmann-transfer";

const lowEarthToGeostationaryInputs: HohmannTransferAnalysisInputs = {
  finalAltitudeMetres: 35_786_000,
  initialAltitudeMetres: 400_000,
};

describe("analyzeHohmannTransfer", () => {
  it("analyzes a LEO-to-GEO transfer", () => {
    const result = analyzeHohmannTransfer(lowEarthToGeostationaryInputs);

    expect(result.initialOrbit).toEqual({
      altitudeMetres: 400_000,
      circularVelocityMetresPerSecond: expect.closeTo(7_672.598648385013, 9),
      orbitalRadiusMetres: 6_771_000,
    });
    expect(result.finalOrbit).toEqual({
      altitudeMetres: 35_786_000,
      circularVelocityMetresPerSecond: expect.closeTo(3_074.921541506354, 9),
      orbitalRadiusMetres: 42_157_000,
    });
    expect(result.transfer.totalDeltaVMetresPerSecond).toBeCloseTo(
      3_856.5784417632376,
      9,
    );
  });

  it("analyzes a GEO-to-LEO transfer", () => {
    const result = analyzeHohmannTransfer({
      finalAltitudeMetres: 400_000,
      initialAltitudeMetres: 35_786_000,
    });

    expect(result.initialOrbit.orbitalRadiusMetres).toBe(42_157_000);
    expect(result.finalOrbit.orbitalRadiusMetres).toBe(6_771_000);
    expect(result.transfer.firstBurnDeltaVMetresPerSecond).toBeCloseTo(
      1_457.2262857596104,
      9,
    );
    expect(result.transfer.secondBurnDeltaVMetresPerSecond).toBeCloseTo(
      2_399.352156003627,
      9,
    );
    expect(result.transfer.totalDeltaVMetresPerSecond).toBeCloseTo(
      3_856.5784417632376,
      9,
    );
  });

  it("converts both altitudes to orbital radii through orbital elements", () => {
    const result = analyzeHohmannTransfer({
      finalAltitudeMetres: 2_000_000,
      initialAltitudeMetres: 200_000,
    });

    expect(result.initialOrbit.orbitalRadiusMetres).toBe(
      EARTH_MEAN_RADIUS_METRES + 200_000,
    );
    expect(result.finalOrbit.orbitalRadiusMetres).toBe(
      EARTH_MEAN_RADIUS_METRES + 2_000_000,
    );
  });

  it("preserves delta-v outputs from the Hohmann transfer calculator", () => {
    const result = analyzeHohmannTransfer(lowEarthToGeostationaryInputs);
    const directTransfer = calculateHohmannTransfer({
      finalOrbitRadiusMetres: result.finalOrbit.orbitalRadiusMetres,
      initialOrbitRadiusMetres: result.initialOrbit.orbitalRadiusMetres,
    });

    expect(result.transfer.firstBurnDeltaVMetresPerSecond).toBe(
      directTransfer.firstBurnDeltaVMetresPerSecond,
    );
    expect(result.transfer.secondBurnDeltaVMetresPerSecond).toBe(
      directTransfer.secondBurnDeltaVMetresPerSecond,
    );
    expect(result.transfer.totalDeltaVMetresPerSecond).toBe(
      directTransfer.totalDeltaVMetresPerSecond,
    );
    expect(result.transfer.transferSemiMajorAxisMetres).toBe(
      directTransfer.transferSemiMajorAxisMetres,
    );
  });

  it("preserves transfer time outputs from the Hohmann calculator", () => {
    const result = analyzeHohmannTransfer(lowEarthToGeostationaryInputs);
    const directTransfer = calculateHohmannTransfer({
      finalOrbitRadiusMetres: result.finalOrbit.orbitalRadiusMetres,
      initialOrbitRadiusMetres: result.initialOrbit.orbitalRadiusMetres,
    });

    expect(result.transfer.transferTimeSeconds).toBe(
      directTransfer.transferTimeSeconds,
    );
    expect(result.transfer.transferTimeHours).toBe(
      directTransfer.transferTimeHours,
    );
  });

  it("uses and reports a custom planet radius", () => {
    const planetRadiusMetres = 3_000_000;
    const result = analyzeHohmannTransfer({
      finalAltitudeMetres: 500_000,
      initialAltitudeMetres: 100_000,
      planetRadiusMetres,
    });

    expect(result.initialOrbit.orbitalRadiusMetres).toBe(3_100_000);
    expect(result.finalOrbit.orbitalRadiusMetres).toBe(3_500_000);
    expect(result.resolved.planetRadiusMetres).toBe(planetRadiusMetres);
  });

  it("propagates and reports a custom gravitational parameter", () => {
    const gravitationalParameter =
      EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED /
      4;
    const result = analyzeHohmannTransfer({
      ...lowEarthToGeostationaryInputs,
      gravitationalParameter,
    });
    const directInitialOrbit = calculateOrbitalElements({
      altitudeMetres: lowEarthToGeostationaryInputs.initialAltitudeMetres,
      gravitationalParameter,
    });
    const directTransfer = calculateHohmannTransfer({
      finalOrbitRadiusMetres: result.finalOrbit.orbitalRadiusMetres,
      gravitationalParameter,
      initialOrbitRadiusMetres: result.initialOrbit.orbitalRadiusMetres,
    });

    expect(result.resolved.gravitationalParameter).toBe(gravitationalParameter);
    expect(result.initialOrbit.circularVelocityMetresPerSecond).toBe(
      directInitialOrbit.orbitalVelocityMetresPerSecond,
    );
    expect(result.transfer.totalDeltaVMetresPerSecond).toBe(
      directTransfer.totalDeltaVMetresPerSecond,
    );
    expect(result.transfer.transferTimeSeconds).toBe(
      directTransfer.transferTimeSeconds,
    );
  });

  it.each([
    ["initial", "initialAltitudeMetres"],
    ["final", "finalAltitudeMetres"],
  ] as const)("rejects a negative %s altitude", (_label, field) => {
    expect(() =>
      analyzeHohmannTransfer({
        ...lowEarthToGeostationaryInputs,
        [field]: -1,
      }),
    ).toThrowError(/Altitude must not be negative/);
  });

  it.each([
    ["planet radius", "planetRadiusMetres", 0],
    ["planet radius", "planetRadiusMetres", -1],
    ["gravitational parameter", "gravitationalParameter", 0],
    ["gravitational parameter", "gravitationalParameter", -1],
  ] as const)("rejects a non-positive %s", (label, field, value) => {
    expect(() =>
      analyzeHohmannTransfer({
        ...lowEarthToGeostationaryInputs,
        [field]: value,
      }),
    ).toThrowError(
      new RegExp(
        `${label === "planet radius" ? "Planet radius" : "Gravitational parameter"} must be greater than zero`,
      ),
    );
  });

  it("delegates equal-altitude rejection to the Hohmann calculator", () => {
    expect(() =>
      analyzeHohmannTransfer({
        finalAltitudeMetres: 400_000,
        initialAltitudeMetres: 400_000,
      }),
    ).toThrowError(/Initial and final orbit radii must differ/);
  });

  it.each([
    ["initial altitude", "initialAltitudeMetres"],
    ["final altitude", "finalAltitudeMetres"],
    ["planet radius", "planetRadiusMetres"],
    ["gravitational parameter", "gravitationalParameter"],
  ] as const)("rejects non-finite %s values", (label, field) => {
    for (const value of [
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ]) {
      expect(() =>
        analyzeHohmannTransfer({
          ...lowEarthToGeostationaryInputs,
          [field]: value,
        }),
      ).toThrowError(
        new RegExp(
          `finite number for ${label.includes("altitude") ? "altitude" : label}`,
        ),
      );
    }
  });
});
