import { describe, expect, it } from "vitest";

import { analyzeObliqueShockCondition } from "./oblique-shock-condition";

describe("analyzeObliqueShockCondition", () => {
  it("calculates a sea-level Mach 2 flow over a 10 degree wedge", () => {
    const result = analyzeObliqueShockCondition({
      altitudeMeters: 0,
      deflectionAngleDegrees: 10,
      machNumber: 2,
    });

    expect(result.upstream.temperatureKelvin).toBeCloseTo(288.15, 8);
    expect(result.upstream.pressurePascals).toBeCloseTo(101_325, 8);
    expect(result.upstream.densityKilogramsPerCubicMetre).toBeCloseTo(
      1.22501226599,
      10,
    );
    expect(result.upstream.machNumber).toBe(2);
    expect(result.shock.shockAngleDegrees).toBeCloseTo(39.3139, 4);
    expect(result.shock.deflectionAngleDegrees).toBe(10);
    expect(result.downstream.machNumber).toBeCloseTo(1.6405, 4);
    expect(result.ratios.pressureRatio).toBeGreaterThan(1);
    expect(result.downstream.temperatureKelvin).toBeCloseTo(337.17909257, 8);
    expect(result.downstream.pressurePascals).toBeCloseTo(172_919.0770503, 7);
    expect(result.downstream.temperatureKelvin).toBeGreaterThan(
      result.upstream.temperatureKelvin,
    );
    expect(result.downstream.pressurePascals).toBeGreaterThan(
      result.upstream.pressurePascals,
    );
  });

  it("uses the standard atmosphere for a 10,000 metre Mach 3 flow", () => {
    const result = analyzeObliqueShockCondition({
      altitudeMeters: 10_000,
      deflectionAngleDegrees: 15,
      machNumber: 3,
    });

    expect(result.upstream.temperatureKelvin).toBeCloseTo(223.15, 8);
    expect(result.upstream.pressurePascals).toBeCloseTo(26_435.8874603, 7);
    expect(result.upstream.densityKilogramsPerCubicMetre).toBeCloseTo(
      0.4127047354,
      9,
    );
    expect(result.upstream.machNumber).toBe(3);
    expect(result.shock.shockAngleDegrees).toBeCloseTo(32.2404, 4);
    expect(result.shock.deflectionAngleDegrees).toBe(15);
    expect(result.downstream.machNumber).toBeLessThan(
      result.upstream.machNumber,
    );
    expect(result.downstream.pressurePascals).toBeGreaterThan(
      result.upstream.pressurePascals,
    );
    expect(result.downstream.temperatureKelvin).toBeGreaterThan(
      result.upstream.temperatureKelvin,
    );
    expect(result.downstream.densityKilogramsPerCubicMetre).toBeGreaterThan(
      result.upstream.densityKilogramsPerCubicMetre,
    );
  });

  it("rejects detached-shock configurations", () => {
    expect(() =>
      analyzeObliqueShockCondition({
        altitudeMeters: 0,
        deflectionAngleDegrees: 30,
        machNumber: 2,
      }),
    ).toThrowError("No attached weak-shock solution exists for these inputs.");
  });

  it.each([
    [
      "negative altitude",
      { altitudeMeters: -1, deflectionAngleDegrees: 10, machNumber: 2 },
    ],
    [
      "excessive altitude",
      { altitudeMeters: 11_001, deflectionAngleDegrees: 10, machNumber: 2 },
    ],
    [
      "NaN altitude",
      {
        altitudeMeters: Number.NaN,
        deflectionAngleDegrees: 10,
        machNumber: 2,
      },
    ],
    [
      "infinite altitude",
      {
        altitudeMeters: Number.POSITIVE_INFINITY,
        deflectionAngleDegrees: 10,
        machNumber: 2,
      },
    ],
    [
      "sonic Mach number",
      { altitudeMeters: 0, deflectionAngleDegrees: 10, machNumber: 1 },
    ],
    [
      "subsonic Mach number",
      { altitudeMeters: 0, deflectionAngleDegrees: 10, machNumber: 0.99 },
    ],
    [
      "negative Mach number",
      { altitudeMeters: 0, deflectionAngleDegrees: 10, machNumber: -2 },
    ],
    [
      "NaN Mach number",
      {
        altitudeMeters: 0,
        deflectionAngleDegrees: 10,
        machNumber: Number.NaN,
      },
    ],
    [
      "infinite Mach number",
      {
        altitudeMeters: 0,
        deflectionAngleDegrees: 10,
        machNumber: Number.POSITIVE_INFINITY,
      },
    ],
    [
      "zero deflection",
      { altitudeMeters: 0, deflectionAngleDegrees: 0, machNumber: 2 },
    ],
    [
      "negative deflection",
      { altitudeMeters: 0, deflectionAngleDegrees: -1, machNumber: 2 },
    ],
    [
      "NaN deflection",
      {
        altitudeMeters: 0,
        deflectionAngleDegrees: Number.NaN,
        machNumber: 2,
      },
    ],
    [
      "infinite deflection",
      {
        altitudeMeters: 0,
        deflectionAngleDegrees: Number.POSITIVE_INFINITY,
        machNumber: 2,
      },
    ],
  ])("rejects %s", (_label, inputs) => {
    expect(() => analyzeObliqueShockCondition(inputs)).toThrowError(RangeError);
  });
});
