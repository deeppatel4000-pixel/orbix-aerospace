import { describe, expect, it } from "vitest";

import {
  calculateMachNumber,
  calculateStagnationHeating,
  calculateStandardAtmosphere,
} from "@/features/engineering-lab/calculators";
import type { HypersonicHeatingInputs } from "@/features/engineering-lab/types";

import { analyzeHypersonicHeating } from "./hypersonic-heating";

const seaLevelHypersonicInputs: HypersonicHeatingInputs = {
  altitudeMetres: 0,
  noseRadiusMetres: 1,
  velocityMetresPerSecond: 2_000,
};

describe("analyzeHypersonicHeating", () => {
  it("composes a sea-level hypersonic heating reference condition", () => {
    const result = analyzeHypersonicHeating(seaLevelHypersonicInputs);

    expect(result.atmosphere.temperatureKelvin).toBeCloseTo(288.15, 8);
    expect(result.atmosphere.pressurePascals).toBeCloseTo(101_325, 8);
    expect(result.atmosphere.densityKilogramsPerCubicMetre).toBeCloseTo(
      1.22501226599,
      10,
    );
    expect(result.atmosphere.speedOfSoundMetersPerSecond).toBeCloseTo(
      340.292286865,
      9,
    );
    expect(result.flow.velocityMetresPerSecond).toBe(2_000);
    expect(result.flow.machNumber).toBeCloseTo(5.87730041849, 10);
    expect(result.flow.flowRegime).toBe("hypersonic");
    expect(result.thermal.heatFluxWattsPerSquareMetre).toBeCloseTo(
      1_620_359.18538061,
      6,
    );
    expect(result.thermal.heatFluxKilowattsPerSquareMetre).toBeCloseTo(
      1_620.35918538061,
      9,
    );
    expect(result.thermal.heatingCoefficient).toBe(1.83e-4);
  });

  it("shows increased heating as velocity increases", () => {
    const lowerVelocity = analyzeHypersonicHeating({
      ...seaLevelHypersonicInputs,
      velocityMetresPerSecond: 2_000,
    });
    const higherVelocity = analyzeHypersonicHeating({
      ...seaLevelHypersonicInputs,
      velocityMetresPerSecond: 2_500,
    });

    expect(higherVelocity.flow.machNumber).toBeGreaterThan(
      lowerVelocity.flow.machNumber,
    );
    expect(higherVelocity.thermal.heatFluxWattsPerSquareMetre).toBeGreaterThan(
      lowerVelocity.thermal.heatFluxWattsPerSquareMetre,
    );
  });

  it("shows reduced density and heating at increased altitude", () => {
    const seaLevel = analyzeHypersonicHeating(seaLevelHypersonicInputs);
    const highAltitude = analyzeHypersonicHeating({
      ...seaLevelHypersonicInputs,
      altitudeMetres: 10_000,
    });

    expect(highAltitude.atmosphere.densityKilogramsPerCubicMetre).toBeLessThan(
      seaLevel.atmosphere.densityKilogramsPerCubicMetre,
    );
    expect(highAltitude.thermal.heatFluxWattsPerSquareMetre).toBeLessThan(
      seaLevel.thermal.heatFluxWattsPerSquareMetre,
    );
    expect(highAltitude.thermal.heatFluxWattsPerSquareMetre).toBeCloseTo(
      940_504.3373095173,
      6,
    );
  });

  it("preserves Mach flow-regime classification", () => {
    const supersonic = analyzeHypersonicHeating({
      ...seaLevelHypersonicInputs,
      velocityMetresPerSecond: 1_700,
    });
    const hypersonic = analyzeHypersonicHeating({
      ...seaLevelHypersonicInputs,
      velocityMetresPerSecond: 2_000,
    });

    expect(supersonic.flow.flowRegime).toBe("supersonic");
    expect(hypersonic.flow.flowRegime).toBe("hypersonic");
  });

  it("propagates a custom heating coefficient unchanged", () => {
    const result = analyzeHypersonicHeating({
      ...seaLevelHypersonicInputs,
      heatingCoefficient: 2e-4,
    });

    expect(result.thermal.heatingCoefficient).toBe(2e-4);
    expect(result.thermal.heatFluxWattsPerSquareMetre).toBeCloseTo(
      1_770_884.3556077224,
      6,
    );
  });

  it("preserves the outputs of all composed calculators", () => {
    const inputs: HypersonicHeatingInputs = {
      altitudeMetres: 5_000,
      heatingCoefficient: 2e-4,
      noseRadiusMetres: 1.5,
      velocityMetresPerSecond: 2_200,
    };
    const analysis = analyzeHypersonicHeating(inputs);
    const atmosphere = calculateStandardAtmosphere({
      altitudeMetres: inputs.altitudeMetres,
    });
    const mach = calculateMachNumber({
      speedOfSoundMetersPerSecond: atmosphere.speedOfSoundMetersPerSecond,
      velocityMetresPerSecond: inputs.velocityMetresPerSecond,
    });
    const heating = calculateStagnationHeating({
      atmosphericDensityKilogramsPerCubicMetre:
        atmosphere.densityKilogramsPerCubicMetre,
      heatingCoefficient: inputs.heatingCoefficient,
      noseRadiusMetres: inputs.noseRadiusMetres,
      velocityMetresPerSecond: inputs.velocityMetresPerSecond,
    });

    expect(analysis.atmosphere).toEqual(atmosphere);
    expect(analysis.flow).toEqual({
      ...mach,
      velocityMetresPerSecond: inputs.velocityMetresPerSecond,
    });
    expect(analysis.thermal).toEqual({
      heatFluxKilowattsPerSquareMetre: heating.heatFluxKilowattsPerSquareMetre,
      heatFluxWattsPerSquareMetre: heating.heatFluxWattsPerSquareMetre,
      heatingCoefficient: heating.resolvedHeatingCoefficient,
    });
  });

  it.each([
    ["negative altitude", { ...seaLevelHypersonicInputs, altitudeMetres: -1 }],
    [
      "altitude above the atmosphere range",
      { ...seaLevelHypersonicInputs, altitudeMetres: 11_001 },
    ],
    [
      "zero velocity",
      { ...seaLevelHypersonicInputs, velocityMetresPerSecond: 0 },
    ],
    [
      "negative velocity",
      { ...seaLevelHypersonicInputs, velocityMetresPerSecond: -1 },
    ],
    ["zero nose radius", { ...seaLevelHypersonicInputs, noseRadiusMetres: 0 }],
    [
      "negative nose radius",
      { ...seaLevelHypersonicInputs, noseRadiusMetres: -1 },
    ],
    [
      "zero heating coefficient",
      { ...seaLevelHypersonicInputs, heatingCoefficient: 0 },
    ],
    [
      "negative heating coefficient",
      { ...seaLevelHypersonicInputs, heatingCoefficient: -1 },
    ],
  ])("rejects %s", (_label, inputs) => {
    expect(() => analyzeHypersonicHeating(inputs)).toThrowError(RangeError);
  });

  it.each([
    ["altitude", { ...seaLevelHypersonicInputs, altitudeMetres: Number.NaN }],
    [
      "velocity",
      {
        ...seaLevelHypersonicInputs,
        velocityMetresPerSecond: Number.POSITIVE_INFINITY,
      },
    ],
    [
      "nose radius",
      {
        ...seaLevelHypersonicInputs,
        noseRadiusMetres: Number.NEGATIVE_INFINITY,
      },
    ],
    [
      "heating coefficient",
      {
        ...seaLevelHypersonicInputs,
        heatingCoefficient: Number.POSITIVE_INFINITY,
      },
    ],
  ])("rejects non-finite %s", (_label, inputs) => {
    expect(() => analyzeHypersonicHeating(inputs)).toThrowError(RangeError);
  });
});
