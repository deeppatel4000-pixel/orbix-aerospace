import { describe, expect, it } from "vitest";

import { analyzeShockCondition } from "./shock-condition";

describe("analyzeShockCondition", () => {
  it("calculates the sea-level Mach 2 shock condition", () => {
    const result = analyzeShockCondition({
      altitudeMeters: 0,
      machNumber: 2,
    });

    expect(result.upstream.temperatureKelvin).toBeCloseTo(288.15, 8);
    expect(result.upstream.pressurePascals).toBeCloseTo(101_325, 8);
    expect(result.upstream.densityKilogramsPerCubicMetre).toBeCloseTo(
      1.22501226599,
      10,
    );
    expect(result.upstream.machNumber).toBe(2);
    expect(result.ratios.densityRatio).toBeCloseTo(2.6666666667, 10);
    expect(result.ratios.pressureRatio).toBeCloseTo(4.5, 10);
    expect(result.ratios.temperatureRatio).toBeCloseTo(1.6875, 10);
    expect(result.downstream.machNumber).toBeCloseTo(0.5773502692, 10);
    expect(result.downstream.pressurePascals).toBeCloseTo(455_962.5, 8);
    expect(result.downstream.densityKilogramsPerCubicMetre).toBeCloseTo(
      3.266699376,
      9,
    );
    expect(result.downstream.temperatureKelvin).toBeCloseTo(486.253125, 8);
  });

  it("uses the standard atmosphere for a 10,000 metre Mach 3 shock", () => {
    const result = analyzeShockCondition({
      altitudeMeters: 10_000,
      machNumber: 3,
    });

    expect(result.upstream.temperatureKelvin).toBeCloseTo(223.15, 8);
    expect(result.upstream.pressurePascals).toBeCloseTo(26_435.8874603, 7);
    expect(result.upstream.densityKilogramsPerCubicMetre).toBeCloseTo(
      0.4127047354,
      9,
    );
    expect(result.upstream.machNumber).toBe(3);
    expect(result.downstream.machNumber).toBeLessThan(1);
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

  it.each([
    ["negative altitude", { altitudeMeters: -1, machNumber: 2 }],
    ["excessive altitude", { altitudeMeters: 11_001, machNumber: 2 }],
    ["NaN altitude", { altitudeMeters: Number.NaN, machNumber: 2 }],
    [
      "infinite altitude",
      { altitudeMeters: Number.POSITIVE_INFINITY, machNumber: 2 },
    ],
    ["zero Mach number", { altitudeMeters: 0, machNumber: 0 }],
    ["subsonic Mach number", { altitudeMeters: 0, machNumber: 0.99 }],
    ["negative Mach number", { altitudeMeters: 0, machNumber: -2 }],
    ["NaN Mach number", { altitudeMeters: 0, machNumber: Number.NaN }],
    [
      "infinite Mach number",
      { altitudeMeters: 0, machNumber: Number.POSITIVE_INFINITY },
    ],
  ])("rejects %s", (_label, inputs) => {
    expect(() => analyzeShockCondition(inputs)).toThrowError(RangeError);
  });
});
