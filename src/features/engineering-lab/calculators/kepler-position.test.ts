import { describe, expect, it } from "vitest";

import {
  calculateKeplerPosition,
  KEPLER_EQUATION_TOLERANCE_RADIANS,
  solveKeplerEquation,
} from "./kepler-position";
import { EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED } from "./orbital-elements";

/** GM used by Braeunig's worked problems. */
const BRAEUNIG_GM = 3.986005e14;

describe("solveKeplerEquation", () => {
  it("satisfies E - e sin E = M across the orbit and eccentricities", () => {
    for (const eccentricity of [0, 0.1, 0.5, 0.9, 0.99]) {
      for (let step = 0; step < 24; step++) {
        const meanAnomaly = (step / 24) * 2 * Math.PI;
        const { eccentricAnomalyRadians: E, iterations } = solveKeplerEquation(
          meanAnomaly,
          eccentricity,
        );
        const residual = E - eccentricity * Math.sin(E) - meanAnomaly;
        // Compare on the circle so 2π and 0 count as the same angle.
        expect(Math.abs(Math.sin(residual))).toBeLessThan(
          10 * KEPLER_EQUATION_TOLERANCE_RADIANS,
        );
        expect(iterations).toBeLessThanOrEqual(50);
      }
    }
  });

  it("returns M itself for a circle", () => {
    expect(solveKeplerEquation(1.2, 0).eccentricAnomalyRadians).toBeCloseTo(
      1.2,
      14,
    );
  });

  it("returns π at apoapsis and 0 at periapsis", () => {
    expect(
      solveKeplerEquation(Math.PI, 0.7).eccentricAnomalyRadians,
    ).toBeCloseTo(Math.PI, 12);
    expect(solveKeplerEquation(0, 0.7).eccentricAnomalyRadians).toBe(0);
  });

  it("reduces the mean anomaly to one revolution", () => {
    const once = solveKeplerEquation(1, 0.3).eccentricAnomalyRadians;
    const thrice = solveKeplerEquation(
      1 + 4 * Math.PI,
      0.3,
    ).eccentricAnomalyRadians;
    expect(thrice).toBeCloseTo(once, 10);
  });

  it("rejects eccentricities outside 0 <= e < 1", () => {
    expect(() => solveKeplerEquation(1, 1)).toThrow(RangeError);
    expect(() => solveKeplerEquation(1, -0.1)).toThrow(RangeError);
    expect(() => solveKeplerEquation(Number.NaN, 0.1)).toThrow(RangeError);
  });
});

describe("calculateKeplerPosition", () => {
  it("reproduces Braeunig problem 4.14 (true anomaly 20 minutes after 90 degrees)", () => {
    const result = calculateKeplerPosition({
      eccentricity: 0.1,
      elapsedTimeSeconds: 1_200,
      gravitationalParameter: BRAEUNIG_GM,
      initialTrueAnomalyRadians: Math.PI / 2,
      semiMajorAxisMetres: 7_500_000,
    });

    // Printed: n = 0.00097202 rad/s, Mo = 1.37113, E = 2.58996, ν = 2.64034.
    expect(result.meanMotionRadiansPerSecond).toBeCloseTo(0.00097202, 8);
    expect(result.initialMeanAnomalyRadians).toBeCloseTo(1.37113, 5);
    expect(result.eccentricAnomalyRadians).toBeCloseTo(2.58996, 4);
    expect(result.trueAnomalyRadians).toBeCloseTo(2.64034, 5);
    expect((result.trueAnomalyRadians * 180) / Math.PI).toBeCloseTo(151.3, 1);
  });

  it("matches the source's E when given the source's rounded mean anomaly", () => {
    // Braeunig adds rounded Mo and n: M = 1.37113 + 0.00097202 × 1,200.
    const { eccentricAnomalyRadians } = solveKeplerEquation(
      1.37113 + 0.00097202 * 1_200,
      0.1,
    );
    expect(Number(eccentricAnomalyRadians.toFixed(5))).toBe(2.58996);
  });

  it("reaches apoapsis after half a period from periapsis", () => {
    const semiMajorAxisMetres = 24_371_155;
    const halfPeriod =
      Math.PI *
      Math.sqrt(
        semiMajorAxisMetres ** 3 /
          EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED,
      );
    const result = calculateKeplerPosition({
      eccentricity: 0.73,
      elapsedTimeSeconds: halfPeriod,
      semiMajorAxisMetres,
    });

    expect(result.trueAnomalyRadians).toBeCloseTo(Math.PI, 9);
    expect(result.orbitalRadiusMetres).toBeCloseTo(
      semiMajorAxisMetres * 1.73,
      0,
    );
    expect(result.resolvedGravitationalParameter).toBe(
      EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED,
    );
  });

  it("moves faster near periapsis than near apoapsis (equal times, unequal angles)", () => {
    const base = { eccentricity: 0.5, semiMajorAxisMetres: 10_000_000 };
    const quarter =
      (Math.PI / 2) *
      Math.sqrt(
        base.semiMajorAxisMetres ** 3 /
          EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED,
      );
    const fromPeriapsis = calculateKeplerPosition({
      ...base,
      elapsedTimeSeconds: quarter,
    });
    const fromApoapsis = calculateKeplerPosition({
      ...base,
      elapsedTimeSeconds: quarter,
      initialTrueAnomalyRadians: Math.PI,
    });

    expect(fromPeriapsis.trueAnomalyRadians).toBeGreaterThan(Math.PI / 2);
    expect(fromApoapsis.trueAnomalyRadians - Math.PI).toBeLessThan(Math.PI / 2);
  });

  it("starts where it was told to at zero elapsed time", () => {
    const result = calculateKeplerPosition({
      eccentricity: 0.2,
      elapsedTimeSeconds: 0,
      initialTrueAnomalyRadians: 1,
      semiMajorAxisMetres: 8_000_000,
    });
    expect(result.trueAnomalyRadians).toBeCloseTo(1, 12);
    expect(result.orbitalRadiusMetres).toBeCloseTo(
      (8_000_000 * (1 - 0.04)) / (1 + 0.2 * Math.cos(1)),
      4,
    );
  });

  it("rejects invalid inputs", () => {
    const valid = {
      eccentricity: 0.1,
      elapsedTimeSeconds: 10,
      semiMajorAxisMetres: 7_000_000,
    };
    expect(() =>
      calculateKeplerPosition({ ...valid, semiMajorAxisMetres: 0 }),
    ).toThrow(RangeError);
    expect(() =>
      calculateKeplerPosition({ ...valid, elapsedTimeSeconds: -1 }),
    ).toThrow(RangeError);
    expect(() =>
      calculateKeplerPosition({ ...valid, eccentricity: 1 }),
    ).toThrow(RangeError);
    expect(() =>
      calculateKeplerPosition({ ...valid, gravitationalParameter: 0 }),
    ).toThrow(RangeError);
    expect(() =>
      calculateKeplerPosition({
        ...valid,
        initialTrueAnomalyRadians: Number.POSITIVE_INFINITY,
      }),
    ).toThrow(RangeError);
  });
});
