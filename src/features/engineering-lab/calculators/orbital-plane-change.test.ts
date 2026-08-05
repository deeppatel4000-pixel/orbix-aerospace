import { describe, expect, it } from "vitest";

import type { OrbitalPlaneChangeInputs } from "@/features/engineering-lab/types";

import { calculateOrbitalPlaneChange } from "./orbital-plane-change";

const referenceInputs: OrbitalPlaneChangeInputs = {
  inclinationChangeDegrees: 30,
  orbitalVelocityMetresPerSecond: 7_500,
};

describe("calculateOrbitalPlaneChange", () => {
  it("returns zero delta-v for zero inclination change", () => {
    const result = calculateOrbitalPlaneChange({
      inclinationChangeDegrees: 0,
      orbitalVelocityMetresPerSecond: 7_500,
    });

    expect(result.deltaVMetresPerSecond).toBe(0);
    expect(result.inclinationChangeDegrees).toBe(0);
    expect(result.inclinationChangeRadians).toBe(0);
    expect(result.orbitalVelocityMetresPerSecond).toBe(7_500);
  });

  it("calculates a 90-degree plane change", () => {
    const result = calculateOrbitalPlaneChange({
      inclinationChangeDegrees: 90,
      orbitalVelocityMetresPerSecond: 7_500,
    });

    expect(result.inclinationChangeRadians).toBeCloseTo(Math.PI / 2, 12);
    expect(result.deltaVMetresPerSecond).toBeCloseTo(10_606.601717798213, 9);
  });

  it("calculates a 180-degree plane change", () => {
    const result = calculateOrbitalPlaneChange({
      inclinationChangeDegrees: 180,
      orbitalVelocityMetresPerSecond: 7_500,
    });

    expect(result.inclinationChangeRadians).toBeCloseTo(Math.PI, 12);
    expect(result.deltaVMetresPerSecond).toBeCloseTo(15_000, 10);
  });

  it("requires more delta-v at higher orbital velocity", () => {
    const slowerManeuver = calculateOrbitalPlaneChange(referenceInputs);
    const fasterManeuver = calculateOrbitalPlaneChange({
      ...referenceInputs,
      orbitalVelocityMetresPerSecond: 9_000,
    });

    expect(fasterManeuver.deltaVMetresPerSecond).toBeGreaterThan(
      slowerManeuver.deltaVMetresPerSecond,
    );
  });

  it("requires more delta-v for a larger inclination change", () => {
    const smallerChange = calculateOrbitalPlaneChange({
      ...referenceInputs,
      inclinationChangeDegrees: 10,
    });
    const largerChange = calculateOrbitalPlaneChange({
      ...referenceInputs,
      inclinationChangeDegrees: 45,
    });

    expect(largerChange.deltaVMetresPerSecond).toBeGreaterThan(
      smallerChange.deltaVMetresPerSecond,
    );
  });

  it.each([
    ["zero", 0],
    ["negative", -1],
  ])("rejects a %s orbital velocity", (_label, value) => {
    expect(() =>
      calculateOrbitalPlaneChange({
        ...referenceInputs,
        orbitalVelocityMetresPerSecond: value,
      }),
    ).toThrowError(/Orbital velocity must be greater than zero/);
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("rejects a %s orbital velocity", (_label, value) => {
    expect(() =>
      calculateOrbitalPlaneChange({
        ...referenceInputs,
        orbitalVelocityMetresPerSecond: value,
      }),
    ).toThrowError(/finite number for orbital velocity/);
  });

  it("rejects a negative inclination change", () => {
    expect(() =>
      calculateOrbitalPlaneChange({
        ...referenceInputs,
        inclinationChangeDegrees: -1,
      }),
    ).toThrowError(/Inclination change must not be negative/);
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("rejects a %s inclination change", (_label, value) => {
    expect(() =>
      calculateOrbitalPlaneChange({
        ...referenceInputs,
        inclinationChangeDegrees: value,
      }),
    ).toThrowError(/finite number for inclination change/);
  });
});
