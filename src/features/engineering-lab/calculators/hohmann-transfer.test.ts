import { describe, expect, it } from "vitest";

import type { HohmannTransferInputs } from "@/features/engineering-lab/types";

import {
  EARTH_MEAN_RADIUS_METRES,
  EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED,
} from "./orbital-elements";
import { calculateHohmannTransfer } from "./hohmann-transfer";

const lowEarthOrbitRadiusMetres = EARTH_MEAN_RADIUS_METRES + 400_000;
const geostationaryOrbitRadiusMetres = EARTH_MEAN_RADIUS_METRES + 35_786_000;
const lowEarthToGeostationaryInputs: HohmannTransferInputs = {
  finalOrbitRadiusMetres: geostationaryOrbitRadiusMetres,
  initialOrbitRadiusMetres: lowEarthOrbitRadiusMetres,
};

describe("calculateHohmannTransfer", () => {
  it("calculates a LEO-to-GEO Hohmann transfer", () => {
    const result = calculateHohmannTransfer(lowEarthToGeostationaryInputs);

    expect(result.initialOrbitRadiusMetres).toBe(6_771_000);
    expect(result.finalOrbitRadiusMetres).toBe(42_157_000);
    expect(result.transferSemiMajorAxisMetres).toBe(24_464_000);
    expect(result.firstBurnDeltaVMetresPerSecond).toBeCloseTo(
      2_399.352156003627,
      9,
    );
    expect(result.secondBurnDeltaVMetresPerSecond).toBeCloseTo(
      1_457.2262857596104,
      9,
    );
    expect(result.totalDeltaVMetresPerSecond).toBeCloseTo(
      3_856.5784417632376,
      9,
    );
    expect(result.resolvedGravitationalParameter).toBe(
      EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED,
    );
  });

  it("calculates a GEO-to-LEO Hohmann transfer", () => {
    const result = calculateHohmannTransfer({
      finalOrbitRadiusMetres: lowEarthOrbitRadiusMetres,
      initialOrbitRadiusMetres: geostationaryOrbitRadiusMetres,
    });

    expect(result.firstBurnDeltaVMetresPerSecond).toBeCloseTo(
      1_457.2262857596104,
      9,
    );
    expect(result.secondBurnDeltaVMetresPerSecond).toBeCloseTo(
      2_399.352156003627,
      9,
    );
    expect(result.totalDeltaVMetresPerSecond).toBeCloseTo(
      3_856.5784417632376,
      9,
    );
  });

  it("requires more total delta-v for a higher destination orbit", () => {
    const lowerDestination = calculateHohmannTransfer({
      finalOrbitRadiusMetres: 10_000_000,
      initialOrbitRadiusMetres: lowEarthOrbitRadiusMetres,
    });
    const higherDestination = calculateHohmannTransfer({
      finalOrbitRadiusMetres: 20_000_000,
      initialOrbitRadiusMetres: lowEarthOrbitRadiusMetres,
    });

    expect(higherDestination.totalDeltaVMetresPerSecond).toBeGreaterThan(
      lowerDestination.totalDeltaVMetresPerSecond,
    );
  });

  it("returns positive burn magnitudes whose sum is the total delta-v", () => {
    const result = calculateHohmannTransfer(lowEarthToGeostationaryInputs);

    expect(result.firstBurnDeltaVMetresPerSecond).toBeGreaterThan(0);
    expect(result.secondBurnDeltaVMetresPerSecond).toBeGreaterThan(0);
    expect(result.totalDeltaVMetresPerSecond).toBeCloseTo(
      result.firstBurnDeltaVMetresPerSecond +
        result.secondBurnDeltaVMetresPerSecond,
      12,
    );
  });

  it("calculates transfer time for half of the transfer ellipse", () => {
    const result = calculateHohmannTransfer(lowEarthToGeostationaryInputs);

    expect(result.transferTimeSeconds).toBeCloseTo(19_040.229855838126, 9);
    expect(result.transferTimeHours).toBeCloseTo(5.288952737732813, 12);
  });

  it("uses and reports a custom gravitational parameter", () => {
    const baseline = calculateHohmannTransfer(lowEarthToGeostationaryInputs);
    const customGravitationalParameter =
      EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED /
      4;
    const custom = calculateHohmannTransfer({
      ...lowEarthToGeostationaryInputs,
      gravitationalParameter: customGravitationalParameter,
    });

    expect(custom.resolvedGravitationalParameter).toBe(
      customGravitationalParameter,
    );
    expect(custom.totalDeltaVMetresPerSecond).toBeCloseTo(
      baseline.totalDeltaVMetresPerSecond / 2,
      10,
    );
    expect(custom.transferTimeSeconds).toBeCloseTo(
      baseline.transferTimeSeconds * 2,
      10,
    );
  });

  it("rejects equal initial and final orbit radii", () => {
    expect(() =>
      calculateHohmannTransfer({
        finalOrbitRadiusMetres: lowEarthOrbitRadiusMetres,
        initialOrbitRadiusMetres: lowEarthOrbitRadiusMetres,
      }),
    ).toThrowError(/Initial and final orbit radii must differ/);
  });

  it.each([
    ["initial", "initialOrbitRadiusMetres", 0],
    ["initial", "initialOrbitRadiusMetres", -1],
    ["final", "finalOrbitRadiusMetres", 0],
    ["final", "finalOrbitRadiusMetres", -1],
  ] as const)(
    "rejects a non-positive %s orbit radius",
    (_label, field, value) => {
      expect(() =>
        calculateHohmannTransfer({
          ...lowEarthToGeostationaryInputs,
          [field]: value,
        }),
      ).toThrowError(
        new RegExp(
          `${_label === "initial" ? "Initial" : "Final"} orbit radius must be greater than zero`,
        ),
      );
    },
  );

  it.each([
    ["zero", 0],
    ["negative", -1],
  ])("rejects a %s gravitational parameter", (_label, value) => {
    expect(() =>
      calculateHohmannTransfer({
        ...lowEarthToGeostationaryInputs,
        gravitationalParameter: value,
      }),
    ).toThrowError(/Gravitational parameter must be greater than zero/);
  });

  it.each([
    ["initial orbit radius", "initialOrbitRadiusMetres"],
    ["final orbit radius", "finalOrbitRadiusMetres"],
    ["gravitational parameter", "gravitationalParameter"],
  ] as const)("rejects non-finite %s values", (label, field) => {
    for (const value of [
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ]) {
      expect(() =>
        calculateHohmannTransfer({
          ...lowEarthToGeostationaryInputs,
          [field]: value,
        }),
      ).toThrowError(new RegExp(`finite number for ${label}`));
    }
  });
});
