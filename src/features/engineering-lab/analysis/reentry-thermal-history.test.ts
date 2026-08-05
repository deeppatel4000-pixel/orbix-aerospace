import { describe, expect, it } from "vitest";

import type { ReentryThermalHistoryInputs } from "@/features/engineering-lab/types";

import { analyzeReentryThermalHistory } from "./reentry-thermal-history";
import { analyzeReentryTrajectory } from "./reentry-trajectory";

const referenceInputs: ReentryThermalHistoryInputs = {
  dragCoefficient: 1.5,
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  noseRadiusMetres: 1,
  referenceAreaSquareMetres: 12,
  vehicleMassKilograms: 5_000,
};

describe("analyzeReentryThermalHistory", () => {
  it("couples a normal reentry trajectory to a thermal history", () => {
    const result = analyzeReentryThermalHistory(referenceInputs);

    expect(result.thermalPoints.length).toBeGreaterThan(1);
    expect(result.thermalPoints).toHaveLength(
      result.trajectory.trajectoryPoints.length,
    );
    expect(
      result.thermalPoints[0]?.heatFluxWattsPerSquareMetre,
    ).toBeGreaterThan(0);
    expect(
      result.totalHeatLoadEstimate.heatLoadJoulesPerSquareMetre,
    ).toBeGreaterThan(0);
  });

  it("produces greater initial heat flux at higher velocity", () => {
    const slower = analyzeReentryThermalHistory({
      ...referenceInputs,
      initialVelocityMetersPerSecond: 120,
    });
    const faster = analyzeReentryThermalHistory({
      ...referenceInputs,
      initialVelocityMetersPerSecond: 180,
    });

    expect(
      faster.thermalPoints[0]?.heatFluxWattsPerSquareMetre,
    ).toBeGreaterThan(
      slower.thermalPoints[0]?.heatFluxWattsPerSquareMetre ??
        Number.POSITIVE_INFINITY,
    );
  });

  it("tracks the maximum heat flux and its trajectory location", () => {
    const result = analyzeReentryThermalHistory(referenceInputs);
    const maximumHeatFlux = Math.max(
      ...result.thermalPoints.map((point) => point.heatFluxWattsPerSquareMetre),
    );

    expect(result.peakHeatFlux.heatFluxWattsPerSquareMetre).toBe(
      maximumHeatFlux,
    );
    expect(result.peakHeatFluxLocation).toEqual({
      altitudeMeters: result.peakHeatFlux.altitudeMeters,
      timeSeconds: result.peakHeatFlux.timeSeconds,
      velocityMetersPerSecond: result.peakHeatFlux.velocityMetersPerSecond,
    });
  });

  it("accumulates heat load across actual trajectory time intervals", () => {
    const result = analyzeReentryThermalHistory(referenceInputs);
    let expectedHeatLoad = 0;

    for (let index = 1; index < result.thermalPoints.length; index += 1) {
      const previousPoint = result.thermalPoints[index - 1];
      const currentPoint = result.thermalPoints[index];

      if (!previousPoint || !currentPoint) continue;

      expectedHeatLoad +=
        previousPoint.heatFluxWattsPerSquareMetre *
        (currentPoint.timeSeconds - previousPoint.timeSeconds);
    }

    expect(
      result.totalHeatLoadEstimate.heatLoadJoulesPerSquareMetre,
    ).toBeCloseTo(expectedHeatLoad, 10);
    expect(
      result.totalHeatLoadEstimate.heatLoadMegajoulesPerSquareMetre,
    ).toBeCloseTo(expectedHeatLoad / 1_000_000, 12);
  });

  it("responds to timestep changes", () => {
    const oneSecond = analyzeReentryThermalHistory({
      ...referenceInputs,
      timestepSeconds: 1,
    });
    const halfSecond = analyzeReentryThermalHistory({
      ...referenceInputs,
      timestepSeconds: 0.5,
    });

    expect(halfSecond.thermalPoints.length).toBeGreaterThan(
      oneSecond.thermalPoints.length,
    );
    expect(
      halfSecond.totalHeatLoadEstimate.heatLoadJoulesPerSquareMetre,
    ).not.toBe(oneSecond.totalHeatLoadEstimate.heatLoadJoulesPerSquareMetre);
  });

  it("propagates a custom heating coefficient", () => {
    const defaultCoefficient = analyzeReentryThermalHistory(referenceInputs);
    const higherCoefficient = analyzeReentryThermalHistory({
      ...referenceInputs,
      heatingCoefficient: 2e-4,
    });

    expect(
      higherCoefficient.thermalPoints[0]?.heatFluxWattsPerSquareMetre,
    ).toBeGreaterThan(
      defaultCoefficient.thermalPoints[0]?.heatFluxWattsPerSquareMetre ??
        Number.POSITIVE_INFINITY,
    );
  });

  it("preserves the complete trajectory and timeline", () => {
    const inputs: ReentryThermalHistoryInputs = {
      ...referenceInputs,
      initialFlightPathAngleDegrees: -60,
      timestepSeconds: 0.5,
    };
    const result = analyzeReentryThermalHistory(inputs);
    const trajectory = analyzeReentryTrajectory({
      dragCoefficient: inputs.dragCoefficient,
      initialAltitudeMeters: inputs.initialAltitudeMeters,
      initialFlightPathAngleDegrees: inputs.initialFlightPathAngleDegrees,
      initialVelocityMetersPerSecond: inputs.initialVelocityMetersPerSecond,
      referenceAreaSquareMetres: inputs.referenceAreaSquareMetres,
      timeStepSeconds: inputs.timestepSeconds,
      vehicleMassKilograms: inputs.vehicleMassKilograms,
    });

    expect(result.trajectory).toEqual(trajectory);
    result.thermalPoints.forEach((thermalPoint, index) => {
      const trajectoryPoint = trajectory.trajectoryPoints[index];

      expect(thermalPoint).toMatchObject({
        altitudeMeters: trajectoryPoint?.altitudeMeters,
        densityKilogramsPerCubicMetre:
          trajectoryPoint?.densityKilogramsPerCubicMetre,
        timeSeconds: trajectoryPoint?.timeSeconds,
        velocityMetersPerSecond: trajectoryPoint?.velocityMetersPerSecond,
      });
    });
  });

  it("preserves a zero-velocity terminal point with zero heat flux", () => {
    const result = analyzeReentryThermalHistory({
      dragCoefficient: 2,
      initialAltitudeMeters: 1_000,
      initialVelocityMetersPerSecond: 100,
      noseRadiusMetres: 1,
      referenceAreaSquareMetres: 100,
      vehicleMassKilograms: 10,
    });
    const terminalThermalPoint =
      result.thermalPoints[result.thermalPoints.length - 1];

    expect(result.trajectory.finalState.velocityMetersPerSecond).toBe(0);
    expect(terminalThermalPoint?.velocityMetersPerSecond).toBe(0);
    expect(terminalThermalPoint?.heatFluxWattsPerSquareMetre).toBe(0);
    expect(terminalThermalPoint?.heatFluxKilowattsPerSquareMetre).toBe(0);
  });

  it.each([
    ["negative altitude", { ...referenceInputs, initialAltitudeMeters: -1 }],
    [
      "altitude above the atmosphere range",
      { ...referenceInputs, initialAltitudeMeters: 11_001 },
    ],
    [
      "zero velocity",
      { ...referenceInputs, initialVelocityMetersPerSecond: 0 },
    ],
    ["zero vehicle mass", { ...referenceInputs, vehicleMassKilograms: 0 }],
    ["negative drag coefficient", { ...referenceInputs, dragCoefficient: -1 }],
    [
      "zero reference area",
      { ...referenceInputs, referenceAreaSquareMetres: 0 },
    ],
    ["zero nose radius", { ...referenceInputs, noseRadiusMetres: 0 }],
    ["negative nose radius", { ...referenceInputs, noseRadiusMetres: -1 }],
    ["zero heating coefficient", { ...referenceInputs, heatingCoefficient: 0 }],
    [
      "negative heating coefficient",
      { ...referenceInputs, heatingCoefficient: -1 },
    ],
    ["zero timestep", { ...referenceInputs, timestepSeconds: 0 }],
    ["negative timestep", { ...referenceInputs, timestepSeconds: -1 }],
  ])("rejects %s", (_label, inputs) => {
    expect(() => analyzeReentryThermalHistory(inputs)).toThrowError(RangeError);
  });

  it.each([
    ["altitude", { ...referenceInputs, initialAltitudeMeters: Number.NaN }],
    [
      "velocity",
      {
        ...referenceInputs,
        initialVelocityMetersPerSecond: Number.POSITIVE_INFINITY,
      },
    ],
    [
      "vehicle mass",
      {
        ...referenceInputs,
        vehicleMassKilograms: Number.NEGATIVE_INFINITY,
      },
    ],
    ["drag coefficient", { ...referenceInputs, dragCoefficient: Number.NaN }],
    [
      "reference area",
      {
        ...referenceInputs,
        referenceAreaSquareMetres: Number.POSITIVE_INFINITY,
      },
    ],
    [
      "nose radius",
      { ...referenceInputs, noseRadiusMetres: Number.NEGATIVE_INFINITY },
    ],
    [
      "heating coefficient",
      {
        ...referenceInputs,
        heatingCoefficient: Number.POSITIVE_INFINITY,
      },
    ],
    ["timestep", { ...referenceInputs, timestepSeconds: Number.NaN }],
    [
      "flight path angle",
      {
        ...referenceInputs,
        initialFlightPathAngleDegrees: Number.POSITIVE_INFINITY,
      },
    ],
  ])("rejects non-finite %s", (_label, inputs) => {
    expect(() => analyzeReentryThermalHistory(inputs)).toThrowError(RangeError);
  });
});
