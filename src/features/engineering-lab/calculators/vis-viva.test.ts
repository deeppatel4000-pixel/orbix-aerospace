import { describe, expect, it } from "vitest";

import type { VisVivaInputs } from "@/features/engineering-lab/types";

import { EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED } from "./orbital-elements";
import { calculateVisViva } from "./vis-viva";

const circularOrbitInputs: VisVivaInputs = {
  orbitalRadiusMetres: 6_771_000,
  semiMajorAxisMetres: 6_771_000,
};

const ellipticalSemiMajorAxisMetres = 10_500_000;

describe("calculateVisViva", () => {
  it("calculates circular-orbit velocity when radius equals semi-major axis", () => {
    const result = calculateVisViva(circularOrbitInputs);

    expect(result.orbitalVelocityMetresPerSecond).toBeCloseTo(
      7_672.598648385013,
      9,
    );
    expect(result.orbitalRadiusMetres).toBe(
      circularOrbitInputs.orbitalRadiusMetres,
    );
    expect(result.semiMajorAxisMetres).toBe(
      circularOrbitInputs.semiMajorAxisMetres,
    );
    expect(result.resolvedGravitationalParameter).toBe(
      EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED,
    );
  });

  it("calculates velocity at elliptical-orbit periapsis", () => {
    const result = calculateVisViva({
      orbitalRadiusMetres: 7_000_000,
      semiMajorAxisMetres: ellipticalSemiMajorAxisMetres,
    });

    expect(result.orbitalVelocityMetresPerSecond).toBeCloseTo(
      8_713.431796725701,
      9,
    );
  });

  it("calculates velocity at elliptical-orbit apoapsis", () => {
    const result = calculateVisViva({
      orbitalRadiusMetres: 14_000_000,
      semiMajorAxisMetres: ellipticalSemiMajorAxisMetres,
    });

    expect(result.orbitalVelocityMetresPerSecond).toBeCloseTo(
      4_356.71589836285,
      9,
    );
  });

  it("produces higher velocity at lower radius on the same orbit", () => {
    const periapsis = calculateVisViva({
      orbitalRadiusMetres: 7_000_000,
      semiMajorAxisMetres: ellipticalSemiMajorAxisMetres,
    });
    const apoapsis = calculateVisViva({
      orbitalRadiusMetres: 14_000_000,
      semiMajorAxisMetres: ellipticalSemiMajorAxisMetres,
    });

    expect(periapsis.orbitalVelocityMetresPerSecond).toBeGreaterThan(
      apoapsis.orbitalVelocityMetresPerSecond,
    );
  });

  it("uses and reports a custom gravitational parameter", () => {
    const baseline = calculateVisViva(circularOrbitInputs);
    const customGravitationalParameter =
      EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED /
      4;
    const custom = calculateVisViva({
      ...circularOrbitInputs,
      gravitationalParameter: customGravitationalParameter,
    });

    expect(custom.resolvedGravitationalParameter).toBe(
      customGravitationalParameter,
    );
    expect(custom.orbitalVelocityMetresPerSecond).toBeCloseTo(
      baseline.orbitalVelocityMetresPerSecond / 2,
      10,
    );
  });

  it.each([
    ["zero", 0],
    ["negative", -1],
  ])("rejects a %s orbital radius", (_label, orbitalRadiusMetres) => {
    expect(() =>
      calculateVisViva({
        ...circularOrbitInputs,
        orbitalRadiusMetres,
      }),
    ).toThrowError(/Orbital radius must be greater than zero/);
  });

  it.each([
    ["zero", 0],
    ["negative", -1],
  ])("rejects a %s semi-major axis", (_label, semiMajorAxisMetres) => {
    expect(() =>
      calculateVisViva({
        ...circularOrbitInputs,
        semiMajorAxisMetres,
      }),
    ).toThrowError(/Semi-major axis must be greater than zero/);
  });

  it.each([
    ["zero", 0],
    ["negative", -1],
  ])("rejects a %s gravitational parameter", (_label, value) => {
    expect(() =>
      calculateVisViva({
        ...circularOrbitInputs,
        gravitationalParameter: value,
      }),
    ).toThrowError(/Gravitational parameter must be greater than zero/);
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("rejects a %s orbital radius", (_label, orbitalRadiusMetres) => {
    expect(() =>
      calculateVisViva({
        ...circularOrbitInputs,
        orbitalRadiusMetres,
      }),
    ).toThrowError(/finite number for orbital radius/);
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("rejects a %s semi-major axis", (_label, semiMajorAxisMetres) => {
    expect(() =>
      calculateVisViva({
        ...circularOrbitInputs,
        semiMajorAxisMetres,
      }),
    ).toThrowError(/finite number for semi-major axis/);
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("rejects a %s gravitational parameter", (_label, value) => {
    expect(() =>
      calculateVisViva({
        ...circularOrbitInputs,
        gravitationalParameter: value,
      }),
    ).toThrowError(/finite number for gravitational parameter/);
  });
});
