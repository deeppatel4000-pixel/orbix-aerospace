import { describe, expect, it } from "vitest";

import {
  calculateOrbitalElements,
  calculateOrbitalPlaneChange,
  EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED,
} from "@/features/engineering-lab/calculators";
import type { OrbitalPlaneChangeAnalysisInputs } from "@/features/engineering-lab/types";

import { analyzeOrbitalPlaneChange } from "./orbital-plane-change";

const lowEarthOrbitInputs: OrbitalPlaneChangeAnalysisInputs = {
  inclinationChangeDegrees: 28.5,
  orbitalAltitudeMetres: 400_000,
};

describe("analyzeOrbitalPlaneChange", () => {
  it("analyzes an inclination change in low Earth orbit", () => {
    const result = analyzeOrbitalPlaneChange(lowEarthOrbitInputs);

    expect(result.orbitalRadiusMetres).toBe(6_771_000);
    expect(result.orbitalVelocityMetresPerSecond).toBeCloseTo(
      7_672.598648385013,
      9,
    );
    expect(result.inclinationChangeDegrees).toBe(28.5);
    expect(result.inclinationChangeRadians).toBeCloseTo(0.4974188368183839, 12);
    expect(result.deltaVMetresPerSecond).toBeCloseTo(3_777.2708467795437, 9);
  });

  it("analyzes an inclination change at geostationary altitude", () => {
    const result = analyzeOrbitalPlaneChange({
      inclinationChangeDegrees: 10,
      orbitalAltitudeMetres: 35_786_000,
    });

    expect(result.orbitalRadiusMetres).toBe(42_157_000);
    expect(result.orbitalVelocityMetresPerSecond).toBeCloseTo(
      3_074.921541506354,
      9,
    );
    expect(result.deltaVMetresPerSecond).toBeCloseTo(535.9941416815205, 9);
  });

  it("returns zero delta-v for zero inclination change", () => {
    const result = analyzeOrbitalPlaneChange({
      ...lowEarthOrbitInputs,
      inclinationChangeDegrees: 0,
    });

    expect(result.inclinationChangeRadians).toBe(0);
    expect(result.deltaVMetresPerSecond).toBe(0);
    expect(result.planeChange.deltaVMetresPerSecond).toBe(0);
  });

  it("requires more delta-v for a larger inclination change", () => {
    const smallerChange = analyzeOrbitalPlaneChange({
      ...lowEarthOrbitInputs,
      inclinationChangeDegrees: 10,
    });
    const largerChange = analyzeOrbitalPlaneChange({
      ...lowEarthOrbitInputs,
      inclinationChangeDegrees: 45,
    });

    expect(largerChange.deltaVMetresPerSecond).toBeGreaterThan(
      smallerChange.deltaVMetresPerSecond,
    );
  });

  it("requires more delta-v where orbital velocity is higher", () => {
    const lowEarthOrbit = analyzeOrbitalPlaneChange({
      inclinationChangeDegrees: 10,
      orbitalAltitudeMetres: 400_000,
    });
    const geostationaryOrbit = analyzeOrbitalPlaneChange({
      inclinationChangeDegrees: 10,
      orbitalAltitudeMetres: 35_786_000,
    });

    expect(lowEarthOrbit.orbitalVelocityMetresPerSecond).toBeGreaterThan(
      geostationaryOrbit.orbitalVelocityMetresPerSecond,
    );
    expect(lowEarthOrbit.deltaVMetresPerSecond).toBeGreaterThan(
      geostationaryOrbit.deltaVMetresPerSecond,
    );
  });

  it("preserves both source calculator outputs", () => {
    const result = analyzeOrbitalPlaneChange(lowEarthOrbitInputs);
    const directOrbitalElements = calculateOrbitalElements({
      altitudeMetres: lowEarthOrbitInputs.orbitalAltitudeMetres,
    });
    const directPlaneChange = calculateOrbitalPlaneChange({
      inclinationChangeDegrees: lowEarthOrbitInputs.inclinationChangeDegrees,
      orbitalVelocityMetresPerSecond:
        directOrbitalElements.orbitalVelocityMetresPerSecond,
    });

    expect(result.orbitalElements).toEqual(directOrbitalElements);
    expect(result.planeChange).toEqual(directPlaneChange);
    expect(result.orbitalVelocityMetresPerSecond).toBe(
      directOrbitalElements.orbitalVelocityMetresPerSecond,
    );
    expect(result.deltaVMetresPerSecond).toBe(
      directPlaneChange.deltaVMetresPerSecond,
    );
  });

  it("propagates a custom gravitational parameter", () => {
    const gravitationalParameter =
      EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED /
      4;
    const result = analyzeOrbitalPlaneChange({
      ...lowEarthOrbitInputs,
      gravitationalParameter,
    });
    const directOrbitalElements = calculateOrbitalElements({
      altitudeMetres: lowEarthOrbitInputs.orbitalAltitudeMetres,
      gravitationalParameter,
    });

    expect(
      result.orbitalElements.resolvedConstants
        .gravitationalParameterCubicMetresPerSecondSquared,
    ).toBe(gravitationalParameter);
    expect(result.orbitalElements).toEqual(directOrbitalElements);
    expect(result.orbitalVelocityMetresPerSecond).toBe(
      directOrbitalElements.orbitalVelocityMetresPerSecond,
    );
  });

  it("propagates a custom planet radius", () => {
    const planetRadiusMetres = 3_000_000;
    const result = analyzeOrbitalPlaneChange({
      ...lowEarthOrbitInputs,
      planetRadiusMetres,
    });
    const directOrbitalElements = calculateOrbitalElements({
      altitudeMetres: lowEarthOrbitInputs.orbitalAltitudeMetres,
      planetRadiusMetres,
    });

    expect(result.orbitalRadiusMetres).toBe(3_400_000);
    expect(result.orbitalElements.resolvedConstants.planetRadiusMetres).toBe(
      planetRadiusMetres,
    );
    expect(result.orbitalElements).toEqual(directOrbitalElements);
  });

  it("delegates invalid altitude validation to orbital elements", () => {
    expect(() =>
      analyzeOrbitalPlaneChange({
        ...lowEarthOrbitInputs,
        orbitalAltitudeMetres: -1,
      }),
    ).toThrowError(/Altitude must not be negative/);
  });

  it("delegates invalid inclination validation to the plane-change calculator", () => {
    expect(() =>
      analyzeOrbitalPlaneChange({
        ...lowEarthOrbitInputs,
        inclinationChangeDegrees: -1,
      }),
    ).toThrowError(/Inclination change must not be negative/);
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("rejects a %s altitude through delegated validation", (_label, value) => {
    expect(() =>
      analyzeOrbitalPlaneChange({
        ...lowEarthOrbitInputs,
        orbitalAltitudeMetres: value,
      }),
    ).toThrowError(/finite number for altitude/);
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])(
    "rejects a %s inclination change through delegated validation",
    (_label, value) => {
      expect(() =>
        analyzeOrbitalPlaneChange({
          ...lowEarthOrbitInputs,
          inclinationChangeDegrees: value,
        }),
      ).toThrowError(/finite number for inclination change/);
    },
  );

  it.each([
    ["planet radius", "planetRadiusMetres", 0],
    ["gravitational parameter", "gravitationalParameter", 0],
  ] as const)("delegates invalid %s validation", (label, field, value) => {
    expect(() =>
      analyzeOrbitalPlaneChange({
        ...lowEarthOrbitInputs,
        [field]: value,
      }),
    ).toThrowError(
      new RegExp(
        (label === "planet radius"
          ? "Planet radius"
          : "Gravitational parameter") + " must be greater than zero",
      ),
    );
  });
});
