import { describe, expect, it } from "vitest";

import { calculateStandardAtmosphere } from "./atmosphere";

describe("calculateStandardAtmosphere", () => {
  it("returns the standard sea-level state", () => {
    const result = calculateStandardAtmosphere({ altitudeMetres: 0 });

    expect(result.temperatureKelvin).toBeCloseTo(288.15, 8);
    expect(result.pressurePascals).toBeCloseTo(101_325, 8);
    expect(result.densityKilogramsPerCubicMetre).toBeCloseTo(1.22501226599, 10);
  });

  it("calculates sea-level speed of sound", () => {
    const result = calculateStandardAtmosphere({ altitudeMetres: 0 });

    expect(result.speedOfSoundMetersPerSecond).toBeCloseTo(340.292286865, 9);
  });

  it("returns the reference state at 5,000 metres", () => {
    const result = calculateStandardAtmosphere({ altitudeMetres: 5_000 });

    expect(result.temperatureKelvin).toBeCloseTo(255.65, 8);
    expect(result.pressurePascals).toBeCloseTo(54_019.5485, 4);
    expect(result.densityKilogramsPerCubicMetre).toBeCloseTo(0.736118278, 9);
  });

  it.each([
    ["negative altitude", -1],
    ["NaN altitude", Number.NaN],
    ["infinite altitude", Number.POSITIVE_INFINITY],
  ])("rejects %s", (_label, altitudeMetres) => {
    expect(() => calculateStandardAtmosphere({ altitudeMetres })).toThrowError(
      RangeError,
    );
  });

  it("rejects altitude above the model range", () => {
    expect(() =>
      calculateStandardAtmosphere({ altitudeMetres: 11_000.01 }),
    ).toThrowError(/must not exceed 11,000 metres/);
  });

  it("accepts the 11,000 metre upper boundary", () => {
    const result = calculateStandardAtmosphere({ altitudeMetres: 11_000 });

    expect(result.temperatureKelvin).toBeCloseTo(216.65, 8);
    expect(result.pressurePascals).toBeGreaterThan(0);
    expect(result.densityKilogramsPerCubicMetre).toBeGreaterThan(0);
  });
});
