import { describe, expect, it } from "vitest";

import {
  calculateBallisticCoefficient,
  calculateStandardAtmosphere,
  STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED,
} from "@/features/engineering-lab/calculators";
import type { ReentryDecelerationInputs } from "@/features/engineering-lab/types";

import { analyzeReentryDeceleration } from "./reentry-deceleration";

const lowAltitudeReferenceInputs: ReentryDecelerationInputs = {
  altitudeMetres: 1_000,
  dragCoefficient: 1.5,
  referenceAreaSquareMetres: 12,
  vehicleMassKilograms: 5_000,
  velocityMetresPerSecond: 7_500,
};

describe("analyzeReentryDeceleration", () => {
  it("composes a low-altitude reentry reference condition", () => {
    const result = analyzeReentryDeceleration(lowAltitudeReferenceInputs);

    expect(result.atmosphere.temperatureKelvin).toBeCloseTo(281.65, 8);
    expect(result.atmosphere.pressurePascals).toBeCloseTo(89_874.4551590813, 7);
    expect(result.atmosphere.densityKilogramsPerCubicMetre).toBeCloseTo(
      1.11165228195249,
      12,
    );
    expect(
      result.vehicle.ballisticCoefficientKilogramsPerSquareMetre,
    ).toBeCloseTo(277.777777777778, 12);
    expect(result.flight.velocityMetresPerSecond).toBe(7_500);
    expect(result.flight.decelerationMetresPerSecondSquared).toBeCloseTo(
      112_554.79354769,
      7,
    );
    expect(result.flight.decelerationStandardGravities).toBeCloseTo(
      11_477.3947828963,
      8,
    );
  });

  it("shows reduced deceleration for a higher ballistic coefficient", () => {
    const baseline = analyzeReentryDeceleration(lowAltitudeReferenceInputs);
    const higherBallisticCoefficient = analyzeReentryDeceleration({
      ...lowAltitudeReferenceInputs,
      vehicleMassKilograms: lowAltitudeReferenceInputs.vehicleMassKilograms * 2,
    });

    expect(
      higherBallisticCoefficient.vehicle
        .ballisticCoefficientKilogramsPerSquareMetre,
    ).toBeCloseTo(
      baseline.vehicle.ballisticCoefficientKilogramsPerSquareMetre * 2,
      12,
    );
    expect(
      higherBallisticCoefficient.flight.decelerationMetresPerSecondSquared,
    ).toBeCloseTo(baseline.flight.decelerationMetresPerSecondSquared / 2, 10);
  });

  it("shows increased deceleration at higher velocity", () => {
    const slower = analyzeReentryDeceleration({
      ...lowAltitudeReferenceInputs,
      velocityMetresPerSecond: 6_000,
    });
    const faster = analyzeReentryDeceleration({
      ...lowAltitudeReferenceInputs,
      velocityMetresPerSecond: 7_500,
    });

    expect(faster.flight.decelerationMetresPerSecondSquared).toBeGreaterThan(
      slower.flight.decelerationMetresPerSecondSquared,
    );
  });

  it("shows reduced density and deceleration at higher altitude", () => {
    const lowAltitude = analyzeReentryDeceleration(lowAltitudeReferenceInputs);
    const highAltitude = analyzeReentryDeceleration({
      ...lowAltitudeReferenceInputs,
      altitudeMetres: 10_000,
    });

    expect(highAltitude.atmosphere.densityKilogramsPerCubicMetre).toBeLessThan(
      lowAltitude.atmosphere.densityKilogramsPerCubicMetre,
    );
    expect(highAltitude.flight.decelerationMetresPerSecondSquared).toBeLessThan(
      lowAltitude.flight.decelerationMetresPerSecondSquared,
    );
  });

  it("converts deceleration to standard-gravity units", () => {
    const result = analyzeReentryDeceleration(lowAltitudeReferenceInputs);

    expect(
      result.flight.decelerationStandardGravities *
        STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED,
    ).toBeCloseTo(result.flight.decelerationMetresPerSecondSquared, 10);
  });

  it("preserves atmosphere and ballistic-coefficient calculator outputs", () => {
    const result = analyzeReentryDeceleration(lowAltitudeReferenceInputs);
    const atmosphere = calculateStandardAtmosphere({
      altitudeMetres: lowAltitudeReferenceInputs.altitudeMetres,
    });
    const ballisticCoefficient = calculateBallisticCoefficient({
      dragCoefficient: lowAltitudeReferenceInputs.dragCoefficient,
      referenceAreaSquareMetres:
        lowAltitudeReferenceInputs.referenceAreaSquareMetres,
      vehicleMassKilograms: lowAltitudeReferenceInputs.vehicleMassKilograms,
    });

    expect(result.atmosphere).toEqual({
      densityKilogramsPerCubicMetre: atmosphere.densityKilogramsPerCubicMetre,
      pressurePascals: atmosphere.pressurePascals,
      temperatureKelvin: atmosphere.temperatureKelvin,
    });
    expect(result.vehicle).toEqual({
      ...ballisticCoefficient.inputs,
      ballisticCoefficientKilogramsPerSquareMetre:
        ballisticCoefficient.ballisticCoefficientKilogramsPerSquareMetre,
    });
  });

  it.each([
    [
      "negative altitude",
      { ...lowAltitudeReferenceInputs, altitudeMetres: -1 },
    ],
    [
      "altitude above the atmosphere range",
      { ...lowAltitudeReferenceInputs, altitudeMetres: 11_001 },
    ],
    [
      "zero velocity",
      { ...lowAltitudeReferenceInputs, velocityMetresPerSecond: 0 },
    ],
    [
      "negative velocity",
      { ...lowAltitudeReferenceInputs, velocityMetresPerSecond: -1 },
    ],
    [
      "zero vehicle mass",
      { ...lowAltitudeReferenceInputs, vehicleMassKilograms: 0 },
    ],
    [
      "negative vehicle mass",
      { ...lowAltitudeReferenceInputs, vehicleMassKilograms: -1 },
    ],
    [
      "zero drag coefficient",
      { ...lowAltitudeReferenceInputs, dragCoefficient: 0 },
    ],
    [
      "negative drag coefficient",
      { ...lowAltitudeReferenceInputs, dragCoefficient: -1 },
    ],
    [
      "zero reference area",
      { ...lowAltitudeReferenceInputs, referenceAreaSquareMetres: 0 },
    ],
    [
      "negative reference area",
      { ...lowAltitudeReferenceInputs, referenceAreaSquareMetres: -1 },
    ],
  ])("rejects %s", (_label, inputs) => {
    expect(() => analyzeReentryDeceleration(inputs)).toThrowError(RangeError);
  });

  it.each([
    ["altitude", { ...lowAltitudeReferenceInputs, altitudeMetres: Number.NaN }],
    [
      "velocity",
      {
        ...lowAltitudeReferenceInputs,
        velocityMetresPerSecond: Number.POSITIVE_INFINITY,
      },
    ],
    [
      "vehicle mass",
      {
        ...lowAltitudeReferenceInputs,
        vehicleMassKilograms: Number.NEGATIVE_INFINITY,
      },
    ],
    [
      "drag coefficient",
      {
        ...lowAltitudeReferenceInputs,
        dragCoefficient: Number.NaN,
      },
    ],
    [
      "reference area",
      {
        ...lowAltitudeReferenceInputs,
        referenceAreaSquareMetres: Number.POSITIVE_INFINITY,
      },
    ],
  ])("rejects non-finite %s", (_label, inputs) => {
    expect(() => analyzeReentryDeceleration(inputs)).toThrowError(RangeError);
  });
});
