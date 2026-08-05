import { describe, expect, it } from "vitest";

import { analyzeStagnationCondition } from "./stagnation-condition";

describe("analyzeStagnationCondition", () => {
  it("returns matching static and stagnation conditions at sea-level Mach 0", () => {
    const result = analyzeStagnationCondition({
      altitudeMeters: 0,
      machNumber: 0,
    });

    expect(result.ratios).toEqual({
      densityRatio: 1,
      pressureRatio: 1,
      temperatureRatio: 1,
    });
    expect(result.staticConditions.temperatureKelvin).toBeCloseTo(288.15, 8);
    expect(result.staticConditions.pressurePascals).toBeCloseTo(101_325, 8);
    expect(result.staticConditions.densityKilogramsPerCubicMetre).toBeCloseTo(
      1.22501226599,
      10,
    );
    expect(result.stagnationConditions).toEqual(result.staticConditions);
  });

  it("increases all stagnation conditions at sea-level Mach 1", () => {
    const result = analyzeStagnationCondition({
      altitudeMeters: 0,
      machNumber: 1,
    });

    expect(result.ratios.temperatureRatio).toBeCloseTo(1.2, 10);
    expect(result.ratios.pressureRatio).toBeCloseTo(1.8929, 4);
    expect(result.ratios.densityRatio).toBeCloseTo(1.5774, 4);
    expect(result.stagnationConditions.temperatureKelvin).toBeGreaterThan(
      result.staticConditions.temperatureKelvin,
    );
    expect(result.stagnationConditions.pressurePascals).toBeGreaterThan(
      result.staticConditions.pressurePascals,
    );
    expect(
      result.stagnationConditions.densityKilogramsPerCubicMetre,
    ).toBeGreaterThan(result.staticConditions.densityKilogramsPerCubicMetre);
  });

  it("calculates a high-altitude Mach 2 stagnation condition", () => {
    const result = analyzeStagnationCondition({
      altitudeMeters: 10_000,
      machNumber: 2,
    });

    expect(result.staticConditions.temperatureKelvin).toBeCloseTo(223.15, 8);
    expect(result.staticConditions.pressurePascals).toBeCloseTo(
      26_435.88746,
      5,
    );
    expect(result.staticConditions.densityKilogramsPerCubicMetre).toBeCloseTo(
      0.4127047354,
      9,
    );
    expect(result.ratios.temperatureRatio).toBeCloseTo(1.8, 10);
    expect(result.ratios.pressureRatio).toBeCloseTo(7.8244490669, 9);
    expect(result.ratios.densityRatio).toBeCloseTo(4.3469161483, 9);
    expect(result.stagnationConditions.temperatureKelvin).toBeCloseTo(
      401.67,
      8,
    );
    expect(result.stagnationConditions.pressurePascals).toBeCloseTo(
      206_846.2549706,
      5,
    );
    expect(
      result.stagnationConditions.densityKilogramsPerCubicMetre,
    ).toBeCloseTo(1.7939928786, 9);
  });

  it.each([
    ["negative altitude", { altitudeMeters: -1, machNumber: 1 }],
    ["excessive altitude", { altitudeMeters: 11_001, machNumber: 1 }],
    ["NaN altitude", { altitudeMeters: Number.NaN, machNumber: 1 }],
    [
      "infinite altitude",
      { altitudeMeters: Number.POSITIVE_INFINITY, machNumber: 1 },
    ],
    ["negative Mach number", { altitudeMeters: 0, machNumber: -1 }],
    ["NaN Mach number", { altitudeMeters: 0, machNumber: Number.NaN }],
    [
      "infinite Mach number",
      { altitudeMeters: 0, machNumber: Number.POSITIVE_INFINITY },
    ],
  ])("rejects %s", (_label, inputs) => {
    expect(() => analyzeStagnationCondition(inputs)).toThrowError(RangeError);
  });
});
