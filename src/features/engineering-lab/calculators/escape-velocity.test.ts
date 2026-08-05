import { describe, expect, it } from "vitest";

import type { EscapeVelocityInputs } from "@/features/engineering-lab/types";

import {
  EARTH_MEAN_RADIUS_METRES,
  EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED,
} from "./orbital-elements";
import { calculateEscapeVelocity } from "./escape-velocity";

const earthSurfaceInputs: EscapeVelocityInputs = {
  orbitalRadiusMetres: EARTH_MEAN_RADIUS_METRES,
};

describe("calculateEscapeVelocity", () => {
  it("calculates escape velocity at Earth's mean surface radius", () => {
    const result = calculateEscapeVelocity(earthSurfaceInputs);

    expect(result.escapeVelocityMetresPerSecond).toBeCloseTo(
      11_186.135691389076,
      9,
    );
    expect(result.orbitalRadiusMetres).toBe(EARTH_MEAN_RADIUS_METRES);
    expect(result.resolvedGravitationalParameter).toBe(
      EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED,
    );
  });

  it("calculates escape velocity at a 400 kilometre LEO radius", () => {
    const result = calculateEscapeVelocity({
      orbitalRadiusMetres: EARTH_MEAN_RADIUS_METRES + 400_000,
    });

    expect(result.escapeVelocityMetresPerSecond).toBeCloseTo(
      10_850.693067191563,
      9,
    );
    expect(result.orbitalRadiusMetres).toBe(6_771_000);
  });

  it("calculates escape velocity at geostationary altitude", () => {
    const result = calculateEscapeVelocity({
      orbitalRadiusMetres: EARTH_MEAN_RADIUS_METRES + 35_786_000,
    });

    expect(result.escapeVelocityMetresPerSecond).toBeCloseTo(
      4_348.595747231469,
      9,
    );
    expect(result.orbitalRadiusMetres).toBe(42_157_000);
  });

  it("produces lower escape velocity as orbital radius increases", () => {
    const lowerRadius = calculateEscapeVelocity({
      orbitalRadiusMetres: EARTH_MEAN_RADIUS_METRES + 200_000,
    });
    const higherRadius = calculateEscapeVelocity({
      orbitalRadiusMetres: EARTH_MEAN_RADIUS_METRES + 2_000_000,
    });

    expect(higherRadius.escapeVelocityMetresPerSecond).toBeLessThan(
      lowerRadius.escapeVelocityMetresPerSecond,
    );
  });

  it("uses and reports a custom gravitational parameter", () => {
    const baseline = calculateEscapeVelocity(earthSurfaceInputs);
    const customGravitationalParameter =
      EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED /
      4;
    const custom = calculateEscapeVelocity({
      ...earthSurfaceInputs,
      gravitationalParameter: customGravitationalParameter,
    });

    expect(custom.resolvedGravitationalParameter).toBe(
      customGravitationalParameter,
    );
    expect(custom.escapeVelocityMetresPerSecond).toBeCloseTo(
      baseline.escapeVelocityMetresPerSecond / 2,
      10,
    );
  });

  it.each([
    ["zero", 0],
    ["negative", -1],
  ])("rejects a %s orbital radius", (_label, orbitalRadiusMetres) => {
    expect(() => calculateEscapeVelocity({ orbitalRadiusMetres })).toThrowError(
      /Orbital radius must be greater than zero/,
    );
  });

  it.each([
    ["zero", 0],
    ["negative", -1],
  ])("rejects a %s gravitational parameter", (_label, value) => {
    expect(() =>
      calculateEscapeVelocity({
        ...earthSurfaceInputs,
        gravitationalParameter: value,
      }),
    ).toThrowError(/Gravitational parameter must be greater than zero/);
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("rejects a %s orbital radius", (_label, orbitalRadiusMetres) => {
    expect(() => calculateEscapeVelocity({ orbitalRadiusMetres })).toThrowError(
      /finite number for orbital radius/,
    );
  });

  it.each([
    ["NaN", Number.NaN],
    ["positive infinity", Number.POSITIVE_INFINITY],
    ["negative infinity", Number.NEGATIVE_INFINITY],
  ])("rejects a %s gravitational parameter", (_label, value) => {
    expect(() =>
      calculateEscapeVelocity({
        ...earthSurfaceInputs,
        gravitationalParameter: value,
      }),
    ).toThrowError(/finite number for gravitational parameter/);
  });
});
