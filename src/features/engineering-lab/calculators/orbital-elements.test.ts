import { describe, expect, it } from "vitest";

import type { OrbitalElementsInputs } from "@/features/engineering-lab/types";

import {
  calculateOrbitalElements,
  EARTH_MEAN_RADIUS_METRES,
  EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED,
} from "./orbital-elements";

const lowEarthOrbitInputs: OrbitalElementsInputs = {
  altitudeMetres: 400_000,
};

describe("calculateOrbitalElements", () => {
  it("calculates a 400 kilometre circular low Earth orbit reference", () => {
    const result = calculateOrbitalElements(lowEarthOrbitInputs);

    expect(result.orbitalRadiusMetres).toBe(6_771_000);
    expect(result.orbitalVelocityMetresPerSecond).toBeCloseTo(
      7_672.598648385013,
      9,
    );
    expect(result.orbitalPeriodSeconds).toBeCloseTo(5_544.855095980792, 9);
    expect(result.orbitalPeriodMinutes).toBeCloseTo(92.41425159967986, 10);
    expect(result.specificOrbitalEnergyJoulesPerKilogram).toBeCloseTo(
      -29_434_385.009599764,
      6,
    );
    expect(result.resolvedConstants).toEqual({
      gravitationalParameterCubicMetresPerSecondSquared:
        EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED,
      planetRadiusMetres: EARTH_MEAN_RADIUS_METRES,
    });
  });

  it("calculates the geostationary-altitude circular-orbit reference", () => {
    const result = calculateOrbitalElements({
      altitudeMetres: 35_786_000,
    });

    expect(result.orbitalRadiusMetres).toBe(42_157_000);
    expect(result.orbitalVelocityMetresPerSecond).toBeCloseTo(
      3_074.921541506354,
      9,
    );
    expect(result.orbitalPeriodSeconds).toBeCloseTo(86_142.11433343086, 8);
    expect(result.orbitalPeriodMinutes).toBeCloseTo(1_435.701905557181, 9);
    expect(result.specificOrbitalEnergyJoulesPerKilogram).toBeCloseTo(
      -4_727_571.243209906,
      6,
    );
  });

  it("captures circular-orbit changes as altitude increases", () => {
    const lowerOrbit = calculateOrbitalElements({
      altitudeMetres: 200_000,
    });
    const higherOrbit = calculateOrbitalElements({
      altitudeMetres: 2_000_000,
    });

    expect(higherOrbit.orbitalRadiusMetres).toBeGreaterThan(
      lowerOrbit.orbitalRadiusMetres,
    );
    expect(higherOrbit.orbitalVelocityMetresPerSecond).toBeLessThan(
      lowerOrbit.orbitalVelocityMetresPerSecond,
    );
    expect(higherOrbit.orbitalPeriodSeconds).toBeGreaterThan(
      lowerOrbit.orbitalPeriodSeconds,
    );
    expect(higherOrbit.specificOrbitalEnergyJoulesPerKilogram).toBeGreaterThan(
      lowerOrbit.specificOrbitalEnergyJoulesPerKilogram,
    );
  });

  it("uses and reports a custom gravitational parameter", () => {
    const baseline = calculateOrbitalElements(lowEarthOrbitInputs);
    const customGravitationalParameter =
      EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED /
      4;
    const custom = calculateOrbitalElements({
      ...lowEarthOrbitInputs,
      gravitationalParameter: customGravitationalParameter,
    });

    expect(
      custom.resolvedConstants
        .gravitationalParameterCubicMetresPerSecondSquared,
    ).toBe(customGravitationalParameter);
    expect(custom.orbitalVelocityMetresPerSecond).toBeCloseTo(
      baseline.orbitalVelocityMetresPerSecond / 2,
      10,
    );
    expect(custom.orbitalPeriodSeconds).toBeCloseTo(
      baseline.orbitalPeriodSeconds * 2,
      10,
    );
    expect(custom.specificOrbitalEnergyJoulesPerKilogram).toBeCloseTo(
      baseline.specificOrbitalEnergyJoulesPerKilogram / 4,
      8,
    );
  });

  it("uses and reports a custom planet radius", () => {
    const baseline = calculateOrbitalElements(lowEarthOrbitInputs);
    const customPlanetRadiusMetres = 7_000_000;
    const custom = calculateOrbitalElements({
      ...lowEarthOrbitInputs,
      planetRadiusMetres: customPlanetRadiusMetres,
    });

    expect(custom.resolvedConstants.planetRadiusMetres).toBe(
      customPlanetRadiusMetres,
    );
    expect(custom.orbitalRadiusMetres).toBe(7_400_000);
    expect(custom.orbitalVelocityMetresPerSecond).toBeLessThan(
      baseline.orbitalVelocityMetresPerSecond,
    );
    expect(custom.orbitalPeriodSeconds).toBeGreaterThan(
      baseline.orbitalPeriodSeconds,
    );
  });

  it("accepts zero altitude as the non-negative boundary", () => {
    const result = calculateOrbitalElements({ altitudeMetres: 0 });

    expect(result.orbitalRadiusMetres).toBe(EARTH_MEAN_RADIUS_METRES);
    expect(result.orbitalVelocityMetresPerSecond).toBeGreaterThan(0);
    expect(result.orbitalPeriodSeconds).toBeGreaterThan(0);
  });

  it("rejects negative altitude", () => {
    expect(() => calculateOrbitalElements({ altitudeMetres: -1 })).toThrowError(
      new RangeError("Altitude must not be negative."),
    );
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("rejects %s altitude", (_label, altitudeMetres) => {
    expect(() => calculateOrbitalElements({ altitudeMetres })).toThrowError(
      /finite number for altitude/,
    );
  });

  it.each([
    ["zero", 0],
    ["negative", -1],
  ])("rejects a %s gravitational parameter", (_label, value) => {
    expect(() =>
      calculateOrbitalElements({
        ...lowEarthOrbitInputs,
        gravitationalParameter: value,
      }),
    ).toThrowError(/Gravitational parameter must be greater than zero/);
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("rejects a %s gravitational parameter", (_label, value) => {
    expect(() =>
      calculateOrbitalElements({
        ...lowEarthOrbitInputs,
        gravitationalParameter: value,
      }),
    ).toThrowError(/finite number for gravitational parameter/);
  });

  it.each([
    ["zero", 0],
    ["negative", -1],
  ])("rejects a %s planet radius", (_label, value) => {
    expect(() =>
      calculateOrbitalElements({
        ...lowEarthOrbitInputs,
        planetRadiusMetres: value,
      }),
    ).toThrowError(/Planet radius must be greater than zero/);
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("rejects a %s planet radius", (_label, value) => {
    expect(() =>
      calculateOrbitalElements({
        ...lowEarthOrbitInputs,
        planetRadiusMetres: value,
      }),
    ).toThrowError(/finite number for planet radius/);
  });
});
