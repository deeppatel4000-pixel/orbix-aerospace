import { describe, expect, it } from "vitest";

import type { ReentryTrajectoryInputs } from "@/features/engineering-lab/types";

import {
  analyzeReentryTrajectory,
  DEFAULT_REENTRY_TRAJECTORY_TIME_STEP_SECONDS,
  MAXIMUM_REENTRY_TRAJECTORY_ITERATIONS,
  MAXIMUM_REENTRY_TRAJECTORY_TIME_SECONDS,
} from "./reentry-trajectory";

const descendingTrajectoryInputs: ReentryTrajectoryInputs = {
  dragCoefficient: 1.5,
  initialAltitudeMeters: 1_000,
  initialVelocityMetersPerSecond: 150,
  referenceAreaSquareMetres: 12,
  vehicleMassKilograms: 5_000,
};

const maximumDurationInputs: ReentryTrajectoryInputs = {
  dragCoefficient: 0.1,
  initialAltitudeMeters: 1_000,
  initialFlightPathAngleDegrees: 0,
  initialVelocityMetersPerSecond: 100,
  referenceAreaSquareMetres: 0.1,
  timeStepSeconds: 100,
  vehicleMassKilograms: 1e12,
};

describe("analyzeReentryTrajectory", () => {
  it("integrates a basic descending trajectory", () => {
    const result = analyzeReentryTrajectory(descendingTrajectoryInputs);

    expect(result.trajectoryPoints.length).toBeGreaterThan(1);
    expect(result.initialState).toBe(result.trajectoryPoints[0]);
    expect(result.initialState.altitudeMeters).toBe(1_000);
    expect(result.initialState.velocityMetersPerSecond).toBe(150);
    expect(result.finalState.altitudeMeters).toBe(0);
    expect(result.durationSeconds).toBe(result.finalState.timeSeconds);
    expect(result.durationSeconds).toBeGreaterThan(0);
  });

  it("decreases velocity through the drag-dominated trajectory", () => {
    const result = analyzeReentryTrajectory(descendingTrajectoryInputs);

    expect(result.trajectoryPoints[1]?.velocityMetersPerSecond).toBeLessThan(
      result.initialState.velocityMetersPerSecond,
    );
    expect(result.finalState.velocityMetersPerSecond).toBeLessThan(
      result.initialState.velocityMetersPerSecond,
    );
  });

  it("decreases altitude monotonically during descent", () => {
    const result = analyzeReentryTrajectory(descendingTrajectoryInputs);

    for (let index = 1; index < result.trajectoryPoints.length; index += 1) {
      const previous = result.trajectoryPoints[index - 1];
      const current = result.trajectoryPoints[index];

      expect(current?.altitudeMeters).toBeLessThanOrEqual(
        previous?.altitudeMeters ?? Number.NEGATIVE_INFINITY,
      );
    }
  });

  it("tracks peak deceleration and the highest-velocity sampled state", () => {
    const result = analyzeReentryTrajectory(descendingTrajectoryInputs);
    const maximumDeceleration = Math.max(
      ...result.trajectoryPoints.map(
        (point) => point.decelerationMetersPerSecondSquared,
      ),
    );
    const maximumVelocity = Math.max(
      ...result.trajectoryPoints.map((point) => point.velocityMetersPerSecond),
    );

    expect(result.peakDeceleration.decelerationMetersPerSecondSquared).toBe(
      maximumDeceleration,
    );
    expect(result.peakHeatingVelocityState.velocityMetersPerSecond).toBe(
      maximumVelocity,
    );
  });

  it("uses a one-second default and responds to timestep changes", () => {
    const defaultStep = analyzeReentryTrajectory(descendingTrajectoryInputs);
    const halfSecondStep = analyzeReentryTrajectory({
      ...descendingTrajectoryInputs,
      timeStepSeconds: 0.5,
    });

    expect(DEFAULT_REENTRY_TRAJECTORY_TIME_STEP_SECONDS).toBe(1);
    expect(defaultStep.trajectoryPoints[1]?.timeSeconds).toBe(1);
    expect(halfSecondStep.trajectoryPoints[1]?.timeSeconds).toBe(0.5);
    expect(halfSecondStep.trajectoryPoints.length).toBeGreaterThan(
      defaultStep.trajectoryPoints.length,
    );
  });

  it("terminates immediately when the initial altitude is ground level", () => {
    const result = analyzeReentryTrajectory({
      ...descendingTrajectoryInputs,
      initialAltitudeMeters: 0,
    });

    expect(result.trajectoryPoints).toHaveLength(1);
    expect(result.finalState.altitudeMeters).toBe(0);
    expect(result.durationSeconds).toBe(0);
  });

  it("terminates when drag reduces velocity to zero", () => {
    const result = analyzeReentryTrajectory({
      dragCoefficient: 2,
      initialAltitudeMeters: 1_000,
      initialVelocityMetersPerSecond: 100,
      referenceAreaSquareMetres: 100,
      vehicleMassKilograms: 10,
    });

    expect(result.finalState.velocityMetersPerSecond).toBe(0);
    expect(result.finalState.altitudeMeters).toBeGreaterThan(0);
    expect(result.trajectoryPoints).toHaveLength(2);
  });

  it("terminates at the maximum simulation time", () => {
    const result = analyzeReentryTrajectory(maximumDurationInputs);

    expect(result.durationSeconds).toBe(
      MAXIMUM_REENTRY_TRAJECTORY_TIME_SECONDS,
    );
    expect(result.finalState.altitudeMeters).toBe(
      maximumDurationInputs.initialAltitudeMeters,
    );
    expect(result.finalState.velocityMetersPerSecond).toBeGreaterThan(0);
  });

  it("uses the iteration safeguard for extremely small timesteps", () => {
    const result = analyzeReentryTrajectory({
      ...maximumDurationInputs,
      timeStepSeconds: 0.1,
    });

    expect(result.trajectoryPoints.length).toBeLessThanOrEqual(
      MAXIMUM_REENTRY_TRAJECTORY_ITERATIONS + 1,
    );
    expect(result.trajectoryPoints).toHaveLength(
      MAXIMUM_REENTRY_TRAJECTORY_ITERATIONS + 1,
    );
    expect(result.durationSeconds).toBeLessThan(
      MAXIMUM_REENTRY_TRAJECTORY_TIME_SECONDS,
    );
  });

  it.each([
    [
      "negative starting altitude",
      { ...descendingTrajectoryInputs, initialAltitudeMeters: -1 },
    ],
    [
      "altitude above the atmosphere range",
      { ...descendingTrajectoryInputs, initialAltitudeMeters: 11_001 },
    ],
    [
      "zero starting velocity",
      { ...descendingTrajectoryInputs, initialVelocityMetersPerSecond: 0 },
    ],
    [
      "negative starting velocity",
      { ...descendingTrajectoryInputs, initialVelocityMetersPerSecond: -1 },
    ],
    [
      "zero vehicle mass",
      { ...descendingTrajectoryInputs, vehicleMassKilograms: 0 },
    ],
    [
      "negative drag coefficient",
      { ...descendingTrajectoryInputs, dragCoefficient: -1 },
    ],
    [
      "zero reference area",
      { ...descendingTrajectoryInputs, referenceAreaSquareMetres: 0 },
    ],
    ["zero timestep", { ...descendingTrajectoryInputs, timeStepSeconds: 0 }],
    [
      "negative timestep",
      { ...descendingTrajectoryInputs, timeStepSeconds: -1 },
    ],
    [
      "ascending flight path angle",
      { ...descendingTrajectoryInputs, initialFlightPathAngleDegrees: 1 },
    ],
    [
      "flight path angle below vertical",
      { ...descendingTrajectoryInputs, initialFlightPathAngleDegrees: -91 },
    ],
  ])("rejects %s", (_label, inputs) => {
    expect(() => analyzeReentryTrajectory(inputs)).toThrowError(RangeError);
  });

  it.each([
    [
      "starting altitude",
      { ...descendingTrajectoryInputs, initialAltitudeMeters: Number.NaN },
    ],
    [
      "starting velocity",
      {
        ...descendingTrajectoryInputs,
        initialVelocityMetersPerSecond: Number.POSITIVE_INFINITY,
      },
    ],
    [
      "vehicle mass",
      {
        ...descendingTrajectoryInputs,
        vehicleMassKilograms: Number.NEGATIVE_INFINITY,
      },
    ],
    [
      "drag coefficient",
      { ...descendingTrajectoryInputs, dragCoefficient: Number.NaN },
    ],
    [
      "reference area",
      {
        ...descendingTrajectoryInputs,
        referenceAreaSquareMetres: Number.POSITIVE_INFINITY,
      },
    ],
    [
      "timestep",
      {
        ...descendingTrajectoryInputs,
        timeStepSeconds: Number.POSITIVE_INFINITY,
      },
    ],
    [
      "flight path angle",
      {
        ...descendingTrajectoryInputs,
        initialFlightPathAngleDegrees: Number.NaN,
      },
    ],
  ])("rejects non-finite %s", (_label, inputs) => {
    expect(() => analyzeReentryTrajectory(inputs)).toThrowError(RangeError);
  });
});
