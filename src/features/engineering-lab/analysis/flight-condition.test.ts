import { describe, expect, it } from "vitest";

import {
  calculateDragEquation,
  calculateDynamicPressure,
  calculateLiftEquation,
  calculateStandardAtmosphere,
} from "@/features/engineering-lab/calculators";
import type { FlightConditionInputs } from "@/features/engineering-lab/types";

import { analyzeFlightCondition } from "./flight-condition";

const seaLevelInputs: FlightConditionInputs = {
  altitudeMetres: 0,
  dragCoefficient: 0.03,
  liftCoefficient: 0.8,
  velocityMetresPerSecond: 50,
  wingAreaSquareMetres: 20,
};

describe("analyzeFlightCondition", () => {
  it("composes the expected sea-level flight condition", () => {
    const result = analyzeFlightCondition(seaLevelInputs);

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
    expect(result.aerodynamics.dynamicPressurePascals).toBeCloseTo(
      1_531.26533249,
      8,
    );
    expect(result.aerodynamics.liftForceNewtons).toBeCloseTo(24_500.2453198, 7);
    expect(result.aerodynamics.dragForceNewtons).toBeCloseTo(918.759199494, 8);
    expect(result.flight.machNumber).toBeCloseTo(0.1469325105, 9);
    expect(result.flight.flowRegime).toBe("subsonic");
    expect(result.performance.liftToDragRatio).toBeCloseTo(26.6666666667, 10);
  });

  it("composes the expected high-altitude flight condition", () => {
    const result = analyzeFlightCondition({
      altitudeMetres: 10_000,
      dragCoefficient: 0.04,
      liftCoefficient: 0.6,
      velocityMetresPerSecond: 100,
      wingAreaSquareMetres: 30,
    });

    expect(result.atmosphere.temperatureKelvin).toBeCloseTo(223.15, 8);
    expect(result.atmosphere.pressurePascals).toBeCloseTo(26_435.88746, 5);
    expect(result.atmosphere.densityKilogramsPerCubicMetre).toBeCloseTo(
      0.4127047354,
      9,
    );
    expect(result.atmosphere.speedOfSoundMetersPerSecond).toBeCloseTo(
      299.461667831,
      9,
    );
    expect(result.aerodynamics.dynamicPressurePascals).toBeCloseTo(
      2_063.52367685,
      8,
    );
    expect(result.aerodynamics.liftForceNewtons).toBeCloseTo(37_143.4261832, 7);
    expect(result.aerodynamics.dragForceNewtons).toBeCloseTo(2_476.22841222, 7);
    expect(result.flight.machNumber).toBeCloseTo(0.3339325555, 9);
    expect(result.flight.flowRegime).toBe("subsonic");
    expect(result.performance.liftToDragRatio).toBeCloseTo(15, 10);
  });

  it.each([
    ["negative altitude", { ...seaLevelInputs, altitudeMetres: -1 }],
    ["zero velocity", { ...seaLevelInputs, velocityMetresPerSecond: 0 }],
    ["negative velocity", { ...seaLevelInputs, velocityMetresPerSecond: -1 }],
    [
      "non-finite velocity",
      { ...seaLevelInputs, velocityMetresPerSecond: Number.NaN },
    ],
    ["zero wing area", { ...seaLevelInputs, wingAreaSquareMetres: 0 }],
    ["negative wing area", { ...seaLevelInputs, wingAreaSquareMetres: -1 }],
    ["zero lift coefficient", { ...seaLevelInputs, liftCoefficient: 0 }],
    ["negative lift coefficient", { ...seaLevelInputs, liftCoefficient: -1 }],
    ["zero drag coefficient", { ...seaLevelInputs, dragCoefficient: 0 }],
    [
      "non-finite drag coefficient",
      { ...seaLevelInputs, dragCoefficient: Number.POSITIVE_INFINITY },
    ],
  ])("rejects %s", (_label, inputs) => {
    expect(() => analyzeFlightCondition(inputs)).toThrowError(RangeError);
  });

  it("preserves the outputs of the existing calculator modules", () => {
    const analysis = analyzeFlightCondition(seaLevelInputs);
    const atmosphere = calculateStandardAtmosphere({ altitudeMetres: 0 });
    const aerodynamicState = {
      airDensityKilogramsPerCubicMetre:
        atmosphere.densityKilogramsPerCubicMetre,
      velocityMetresPerSecond: seaLevelInputs.velocityMetresPerSecond,
    };
    const dynamicPressure = calculateDynamicPressure(aerodynamicState);
    const lift = calculateLiftEquation({
      ...aerodynamicState,
      liftCoefficient: seaLevelInputs.liftCoefficient,
      wingAreaSquareMetres: seaLevelInputs.wingAreaSquareMetres,
    });
    const drag = calculateDragEquation({
      ...aerodynamicState,
      dragCoefficient: seaLevelInputs.dragCoefficient,
      referenceAreaSquareMetres: seaLevelInputs.wingAreaSquareMetres,
    });

    expect(analysis.atmosphere).toEqual(atmosphere);
    expect(analysis.aerodynamics).toEqual({
      ...drag,
      ...dynamicPressure,
      ...lift,
    });
  });
});
