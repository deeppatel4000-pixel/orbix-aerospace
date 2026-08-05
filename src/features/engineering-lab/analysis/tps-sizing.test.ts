import { describe, expect, it } from "vitest";

import type {
  ReentryThermalHistoryInputs,
  TPSSizingInputs,
} from "@/features/engineering-lab/types";

import { analyzeReentryThermalHistory } from "./reentry-thermal-history";
import {
  analyzeTPSSizing,
  DEFAULT_TPS_MATERIAL_EFFICIENCY_FACTOR,
} from "./tps-sizing";

const referenceInputs: TPSSizingInputs = {
  allowableHeatLoadMegajoulesPerSquareMetre: 10,
  dragCoefficient: 1.5,
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  materialDensityKilogramsPerCubicMetre: 144,
  noseRadiusMetres: 1,
  referenceAreaSquareMetres: 12,
  safetyFactor: 1.5,
  vehicleMassKilograms: 5_000,
};

const referenceThermalInputs: ReentryThermalHistoryInputs = {
  dragCoefficient: referenceInputs.dragCoefficient,
  initialAltitudeMeters: referenceInputs.initialAltitudeMeters,
  initialVelocityMetersPerSecond:
    referenceInputs.initialVelocityMetersPerSecond,
  noseRadiusMetres: referenceInputs.noseRadiusMetres,
  referenceAreaSquareMetres: referenceInputs.referenceAreaSquareMetres,
  vehicleMassKilograms: referenceInputs.vehicleMassKilograms,
};

describe("analyzeTPSSizing", () => {
  it("calculates a reference preliminary TPS sizing result", () => {
    const thermalHistory = analyzeReentryThermalHistory(referenceThermalInputs);
    const result = analyzeTPSSizing(referenceInputs);
    const expectedDesignHeatLoad =
      thermalHistory.totalHeatLoadEstimate.heatLoadMegajoulesPerSquareMetre *
      referenceInputs.safetyFactor;
    const expectedArealDensity =
      expectedDesignHeatLoad /
      referenceInputs.allowableHeatLoadMegajoulesPerSquareMetre;
    const expectedThickness =
      expectedArealDensity /
      referenceInputs.materialDensityKilogramsPerCubicMetre;

    expect(DEFAULT_TPS_MATERIAL_EFFICIENCY_FACTOR).toBe(1);
    expect(result.requiredArealDensity.kilogramsPerSquareMetre).toBeCloseTo(
      expectedArealDensity,
      12,
    );
    expect(result.estimatedThickness.metres).toBeCloseTo(expectedThickness, 12);
    expect(result.estimatedThickness.millimetres).toBeCloseTo(
      expectedThickness * 1_000,
      12,
    );
    expect(result.safetyMargin).toEqual({
      designHeatLoadMegajoulesPerSquareMetre: expectedDesignHeatLoad,
      heatLoadMarginMegajoulesPerSquareMetre:
        expectedDesignHeatLoad -
        thermalHistory.totalHeatLoadEstimate.heatLoadMegajoulesPerSquareMetre,
      marginPercentage: 50,
    });
  });

  it("requires more TPS areal mass for a higher heat load", () => {
    const baseline = analyzeTPSSizing(referenceInputs);
    const higherHeatLoad = analyzeTPSSizing({
      ...referenceInputs,
      heatingCoefficient: 2e-4,
    });

    expect(
      higherHeatLoad.peakHeatLoad.heatLoadMegajoulesPerSquareMetre,
    ).toBeGreaterThan(baseline.peakHeatLoad.heatLoadMegajoulesPerSquareMetre);
    expect(
      higherHeatLoad.requiredArealDensity.kilogramsPerSquareMetre,
    ).toBeGreaterThan(baseline.requiredArealDensity.kilogramsPerSquareMetre);
  });

  it("scales required TPS with the safety factor", () => {
    const unitSafetyFactor = analyzeTPSSizing({
      ...referenceInputs,
      safetyFactor: 1,
    });
    const doubleSafetyFactor = analyzeTPSSizing({
      ...referenceInputs,
      safetyFactor: 2,
    });

    expect(
      doubleSafetyFactor.requiredArealDensity.kilogramsPerSquareMetre,
    ).toBeCloseTo(
      unitSafetyFactor.requiredArealDensity.kilogramsPerSquareMetre * 2,
      12,
    );
    expect(doubleSafetyFactor.safetyMargin.marginPercentage).toBe(100);
  });

  it("reduces thickness with higher material density without changing areal mass", () => {
    const lowerDensity = analyzeTPSSizing({
      ...referenceInputs,
      materialDensityKilogramsPerCubicMetre: 100,
    });
    const higherDensity = analyzeTPSSizing({
      ...referenceInputs,
      materialDensityKilogramsPerCubicMetre: 200,
    });

    expect(higherDensity.requiredArealDensity).toEqual(
      lowerDensity.requiredArealDensity,
    );
    expect(higherDensity.estimatedThickness.metres).toBeCloseTo(
      lowerDensity.estimatedThickness.metres / 2,
      12,
    );
  });

  it("applies an optional material efficiency factor to effective capacity", () => {
    const idealEfficiency = analyzeTPSSizing(referenceInputs);
    const halfEfficiency = analyzeTPSSizing({
      ...referenceInputs,
      materialEfficiencyFactor: 0.5,
    });

    expect(
      halfEfficiency.requiredArealDensity.kilogramsPerSquareMetre,
    ).toBeCloseTo(
      idealEfficiency.requiredArealDensity.kilogramsPerSquareMetre * 2,
      12,
    );
  });

  it("preserves the complete thermal history and its peak outputs", () => {
    const expectedThermalHistory = analyzeReentryThermalHistory({
      ...referenceThermalInputs,
      initialFlightPathAngleDegrees: -60,
      timestepSeconds: 0.5,
    });
    const result = analyzeTPSSizing({
      ...referenceInputs,
      initialFlightPathAngleDegrees: -60,
      timestepSeconds: 0.5,
    });

    expect(result.thermalHistory).toEqual(expectedThermalHistory);
    expect(result.peakHeatFlux).toBe(result.thermalHistory.peakHeatFlux);
    expect(result.peakHeatLoad).toBe(
      result.thermalHistory.totalHeatLoadEstimate,
    );
  });

  it.each([
    [
      "zero material density",
      { ...referenceInputs, materialDensityKilogramsPerCubicMetre: 0 },
    ],
    [
      "negative material density",
      { ...referenceInputs, materialDensityKilogramsPerCubicMetre: -1 },
    ],
    [
      "zero allowable heat load",
      { ...referenceInputs, allowableHeatLoadMegajoulesPerSquareMetre: 0 },
    ],
    [
      "negative allowable heat load",
      { ...referenceInputs, allowableHeatLoadMegajoulesPerSquareMetre: -1 },
    ],
    ["zero safety factor", { ...referenceInputs, safetyFactor: 0 }],
    ["negative safety factor", { ...referenceInputs, safetyFactor: -1 }],
    [
      "zero material efficiency",
      { ...referenceInputs, materialEfficiencyFactor: 0 },
    ],
    [
      "negative material efficiency",
      { ...referenceInputs, materialEfficiencyFactor: -1 },
    ],
  ])("rejects %s", (_label, inputs) => {
    expect(() => analyzeTPSSizing(inputs)).toThrowError(RangeError);
  });

  it.each([
    ["negative altitude", { ...referenceInputs, initialAltitudeMeters: -1 }],
    [
      "zero velocity",
      { ...referenceInputs, initialVelocityMetersPerSecond: 0 },
    ],
    ["zero vehicle mass", { ...referenceInputs, vehicleMassKilograms: 0 }],
    ["zero drag coefficient", { ...referenceInputs, dragCoefficient: 0 }],
    [
      "zero reference area",
      { ...referenceInputs, referenceAreaSquareMetres: 0 },
    ],
    ["zero nose radius", { ...referenceInputs, noseRadiusMetres: 0 }],
    ["zero heating coefficient", { ...referenceInputs, heatingCoefficient: 0 }],
    ["zero timestep", { ...referenceInputs, timestepSeconds: 0 }],
  ])("preserves thermal-history validation for %s", (_label, inputs) => {
    expect(() => analyzeTPSSizing(inputs)).toThrowError(RangeError);
  });

  it.each([
    [
      "material density",
      {
        ...referenceInputs,
        materialDensityKilogramsPerCubicMetre: Number.NaN,
      },
    ],
    [
      "allowable heat load",
      {
        ...referenceInputs,
        allowableHeatLoadMegajoulesPerSquareMetre: Number.POSITIVE_INFINITY,
      },
    ],
    [
      "safety factor",
      { ...referenceInputs, safetyFactor: Number.NEGATIVE_INFINITY },
    ],
    [
      "material efficiency factor",
      { ...referenceInputs, materialEfficiencyFactor: Number.NaN },
    ],
    [
      "heating coefficient",
      { ...referenceInputs, heatingCoefficient: Number.POSITIVE_INFINITY },
    ],
    [
      "trajectory input",
      { ...referenceInputs, initialVelocityMetersPerSecond: Number.NaN },
    ],
  ])("rejects non-finite %s", (_label, inputs) => {
    expect(() => analyzeTPSSizing(inputs)).toThrowError(RangeError);
  });
});
