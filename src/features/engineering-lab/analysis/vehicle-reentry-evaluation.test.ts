import { describe, expect, it } from "vitest";

import type {
  ReentryThermalHistoryInputs,
  ReentryTrajectoryInputs,
  TPSMaterialComparisonInputs,
  VehicleReentryEvaluationInputs,
} from "@/features/engineering-lab/types";

import { analyzeReentryThermalHistory } from "./reentry-thermal-history";
import { analyzeReentryTrajectory } from "./reentry-trajectory";
import { analyzeTPSMaterialComparison } from "./tps-material-comparison";
import { analyzeVehicleReentryEvaluation } from "./vehicle-reentry-evaluation";

const referenceInputs: VehicleReentryEvaluationInputs = {
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  safetyFactor: 1.5,
  vehicle: {
    dragCoefficient: 1.5,
    massKilograms: 5_000,
    noseRadiusMetres: 1,
    referenceAreaSquareMetres: 12,
    vehicleName: "Reference Reentry Vehicle",
  },
};

function buildDirectTrajectoryInputs(
  inputs: VehicleReentryEvaluationInputs,
): ReentryTrajectoryInputs {
  const optionalFlightPathAngle =
    inputs.initialFlightPathAngleDegrees === undefined
      ? {}
      : {
          initialFlightPathAngleDegrees: inputs.initialFlightPathAngleDegrees,
        };
  const optionalTimeStep =
    inputs.timestepSeconds === undefined
      ? {}
      : { timeStepSeconds: inputs.timestepSeconds };

  return {
    ...optionalFlightPathAngle,
    ...optionalTimeStep,
    dragCoefficient: inputs.vehicle.dragCoefficient,
    initialAltitudeMeters: inputs.initialAltitudeMeters,
    initialVelocityMetersPerSecond: inputs.initialVelocityMetersPerSecond,
    referenceAreaSquareMetres: inputs.vehicle.referenceAreaSquareMetres,
    vehicleMassKilograms: inputs.vehicle.massKilograms,
  };
}

function buildDirectThermalInputs(
  inputs: VehicleReentryEvaluationInputs,
): ReentryThermalHistoryInputs {
  const optionalFlightPathAngle =
    inputs.initialFlightPathAngleDegrees === undefined
      ? {}
      : {
          initialFlightPathAngleDegrees: inputs.initialFlightPathAngleDegrees,
        };
  const optionalHeatingCoefficient =
    inputs.heatingCoefficient === undefined
      ? {}
      : { heatingCoefficient: inputs.heatingCoefficient };
  const optionalTimeStep =
    inputs.timestepSeconds === undefined
      ? {}
      : { timestepSeconds: inputs.timestepSeconds };

  return {
    ...optionalFlightPathAngle,
    ...optionalHeatingCoefficient,
    ...optionalTimeStep,
    dragCoefficient: inputs.vehicle.dragCoefficient,
    initialAltitudeMeters: inputs.initialAltitudeMeters,
    initialVelocityMetersPerSecond: inputs.initialVelocityMetersPerSecond,
    noseRadiusMetres: inputs.vehicle.noseRadiusMetres,
    referenceAreaSquareMetres: inputs.vehicle.referenceAreaSquareMetres,
    vehicleMassKilograms: inputs.vehicle.massKilograms,
  };
}

function buildDirectTPSComparisonInputs(
  inputs: VehicleReentryEvaluationInputs,
): TPSMaterialComparisonInputs {
  return {
    ...buildDirectThermalInputs(inputs),
    safetyFactor: inputs.safetyFactor,
  };
}

describe("analyzeVehicleReentryEvaluation", () => {
  it("produces a complete vehicle-level evaluation", () => {
    const result = analyzeVehicleReentryEvaluation(referenceInputs);

    expect(result.vehicle).toBe(referenceInputs.vehicle);
    expect(result.trajectory.trajectoryPoints.length).toBeGreaterThan(1);
    expect(result.thermalHistory.thermalPoints).toHaveLength(
      result.trajectory.trajectoryPoints.length,
    );
    expect(result.tpsComparison.materialsCompared).toBeGreaterThan(0);
    expect(result.summary.flight).toMatchObject({
      initialAltitudeMeters: referenceInputs.initialAltitudeMeters,
      initialVelocityMetersPerSecond:
        referenceInputs.initialVelocityMetersPerSecond,
      reentryDurationSeconds: result.trajectory.durationSeconds,
    });
    expect(result.summary.flight.finalState).toBe(result.trajectory.finalState);
    expect(result.summary.dynamics.peakVelocityState).toBe(
      result.trajectory.peakHeatingVelocityState,
    );
    expect(result.summary.thermal.peakHeatFluxWattsPerSquareMetre).toBe(
      result.thermalHistory.peakHeatFlux.heatFluxWattsPerSquareMetre,
    );
    expect(result.summary.tps.recommendedMaterial).toBe(
      result.tpsComparison.recommendedMaterial.material,
    );
  });

  it("matches a direct reentry trajectory analysis", () => {
    const inputs: VehicleReentryEvaluationInputs = {
      ...referenceInputs,
      initialFlightPathAngleDegrees: -60,
      timestepSeconds: 0.5,
    };
    const result = analyzeVehicleReentryEvaluation(inputs);
    const directTrajectory = analyzeReentryTrajectory(
      buildDirectTrajectoryInputs(inputs),
    );

    expect(result.trajectory).toEqual(directTrajectory);
  });

  it("matches a direct reentry thermal-history analysis", () => {
    const inputs: VehicleReentryEvaluationInputs = {
      ...referenceInputs,
      heatingCoefficient: 2e-4,
      initialFlightPathAngleDegrees: -60,
      timestepSeconds: 0.5,
    };
    const result = analyzeVehicleReentryEvaluation(inputs);
    const directThermalHistory = analyzeReentryThermalHistory(
      buildDirectThermalInputs(inputs),
    );

    expect(result.thermalHistory).toEqual(directThermalHistory);
  });

  it("matches a direct TPS material comparison", () => {
    const inputs: VehicleReentryEvaluationInputs = {
      ...referenceInputs,
      heatingCoefficient: 2e-4,
      timestepSeconds: 0.5,
    };
    const result = analyzeVehicleReentryEvaluation(inputs);
    const directComparison = analyzeTPSMaterialComparison(
      buildDirectTPSComparisonInputs(inputs),
    );

    expect(result.tpsComparison).toEqual(directComparison);
    expect(result.summary.tps.requiredThickness).toBe(
      result.tpsComparison.recommendedMaterial.thickness,
    );
    expect(result.summary.tps.estimatedTPSMassKilograms).toBe(
      result.tpsComparison.recommendedMaterial.estimatedTPSMass
        .totalTPSMassKilograms,
    );
  });

  it("captures the ballistic-coefficient effect of increased vehicle mass", () => {
    const baseline = analyzeVehicleReentryEvaluation(referenceInputs);
    const heavierVehicle = analyzeVehicleReentryEvaluation({
      ...referenceInputs,
      vehicle: {
        ...referenceInputs.vehicle,
        massKilograms: referenceInputs.vehicle.massKilograms * 2,
      },
    });

    expect(
      heavierVehicle.trajectory.initialState.decelerationMetersPerSecondSquared,
    ).toBeLessThan(
      baseline.trajectory.initialState.decelerationMetersPerSecondSquared,
    );
    expect(heavierVehicle.trajectory).not.toEqual(baseline.trajectory);
  });

  it("captures the aerodynamic effect of increased reference area", () => {
    const baseline = analyzeVehicleReentryEvaluation(referenceInputs);
    const largerAreaVehicle = analyzeVehicleReentryEvaluation({
      ...referenceInputs,
      vehicle: {
        ...referenceInputs.vehicle,
        referenceAreaSquareMetres:
          referenceInputs.vehicle.referenceAreaSquareMetres * 2,
      },
    });

    expect(
      largerAreaVehicle.trajectory.initialState
        .decelerationMetersPerSecondSquared,
    ).toBeGreaterThan(
      baseline.trajectory.initialState.decelerationMetersPerSecondSquared,
    );
    expect(largerAreaVehicle.trajectory).not.toEqual(baseline.trajectory);
  });

  it.each(["", "   ", "\t"])("rejects empty vehicle name %j", (vehicleName) => {
    expect(() =>
      analyzeVehicleReentryEvaluation({
        ...referenceInputs,
        vehicle: { ...referenceInputs.vehicle, vehicleName },
      }),
    ).toThrowError(RangeError);
  });

  it.each([
    [
      "zero mass",
      {
        ...referenceInputs.vehicle,
        massKilograms: 0,
      },
    ],
    [
      "negative mass",
      {
        ...referenceInputs.vehicle,
        massKilograms: -1,
      },
    ],
    [
      "zero drag coefficient",
      {
        ...referenceInputs.vehicle,
        dragCoefficient: 0,
      },
    ],
    [
      "negative drag coefficient",
      {
        ...referenceInputs.vehicle,
        dragCoefficient: -1,
      },
    ],
    [
      "zero reference area",
      {
        ...referenceInputs.vehicle,
        referenceAreaSquareMetres: 0,
      },
    ],
    [
      "negative reference area",
      {
        ...referenceInputs.vehicle,
        referenceAreaSquareMetres: -1,
      },
    ],
    [
      "zero nose radius",
      {
        ...referenceInputs.vehicle,
        noseRadiusMetres: 0,
      },
    ],
    [
      "negative nose radius",
      {
        ...referenceInputs.vehicle,
        noseRadiusMetres: -1,
      },
    ],
  ])("preserves existing validation for %s", (_label, vehicle) => {
    expect(() =>
      analyzeVehicleReentryEvaluation({ ...referenceInputs, vehicle }),
    ).toThrowError(RangeError);
  });

  it.each([
    [
      "mass",
      {
        ...referenceInputs.vehicle,
        massKilograms: Number.NaN,
      },
    ],
    [
      "drag coefficient",
      {
        ...referenceInputs.vehicle,
        dragCoefficient: Number.POSITIVE_INFINITY,
      },
    ],
    [
      "reference area",
      {
        ...referenceInputs.vehicle,
        referenceAreaSquareMetres: Number.NEGATIVE_INFINITY,
      },
    ],
    [
      "nose radius",
      {
        ...referenceInputs.vehicle,
        noseRadiusMetres: Number.NaN,
      },
    ],
  ])("rejects non-finite vehicle %s", (_label, vehicle) => {
    expect(() =>
      analyzeVehicleReentryEvaluation({ ...referenceInputs, vehicle }),
    ).toThrowError(RangeError);
  });

  it.each([
    ["initial altitude", { ...referenceInputs, initialAltitudeMeters: -1 }],
    [
      "initial velocity",
      { ...referenceInputs, initialVelocityMetersPerSecond: 0 },
    ],
    ["safety factor", { ...referenceInputs, safetyFactor: 0 }],
    ["heating coefficient", { ...referenceInputs, heatingCoefficient: 0 }],
    ["timestep", { ...referenceInputs, timestepSeconds: 0 }],
  ])("preserves downstream scenario validation for %s", (_label, inputs) => {
    expect(() => analyzeVehicleReentryEvaluation(inputs)).toThrowError(
      RangeError,
    );
  });
});
