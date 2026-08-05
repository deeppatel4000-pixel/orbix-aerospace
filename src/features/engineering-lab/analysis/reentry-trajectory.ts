import {
  calculateBallisticCoefficient,
  calculateDynamicPressure,
  calculateStandardAtmosphere,
  STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED,
} from "@/features/engineering-lab/calculators";
import type {
  BallisticCoefficientInputs,
  ReentryTrajectoryAnalysis,
  ReentryTrajectoryInputs,
  ReentryTrajectoryPoint,
} from "@/features/engineering-lab/types";

import { analyzeReentryDeceleration } from "./reentry-deceleration";

export const DEFAULT_REENTRY_TRAJECTORY_TIME_STEP_SECONDS = 1;
export const DEFAULT_REENTRY_TRAJECTORY_FLIGHT_PATH_ANGLE_DEGREES = -90;
export const MAXIMUM_REENTRY_TRAJECTORY_TIME_SECONDS = 3_600;
export const MAXIMUM_REENTRY_TRAJECTORY_ITERATIONS = 10_000;

const DEGREES_TO_RADIANS = Math.PI / 180;

interface ResolvedTrajectoryConfiguration {
  readonly descentFraction: number;
  readonly timeStepSeconds: number;
  readonly vehicle: BallisticCoefficientInputs;
}

function resolveTimeStepSeconds(timeStepSeconds: number | undefined): number {
  const resolvedTimeStep =
    timeStepSeconds ?? DEFAULT_REENTRY_TRAJECTORY_TIME_STEP_SECONDS;

  if (!Number.isFinite(resolvedTimeStep)) {
    throw new RangeError("Enter a finite number for time step.");
  }

  if (resolvedTimeStep <= 0) {
    throw new RangeError("Time step must be greater than zero.");
  }

  return resolvedTimeStep;
}

function resolveDescentFraction(
  flightPathAngleDegrees: number | undefined,
): number {
  const resolvedAngle =
    flightPathAngleDegrees ??
    DEFAULT_REENTRY_TRAJECTORY_FLIGHT_PATH_ANGLE_DEGREES;

  if (!Number.isFinite(resolvedAngle)) {
    throw new RangeError("Enter a finite number for flight path angle.");
  }

  if (resolvedAngle < -90 || resolvedAngle > 0) {
    throw new RangeError(
      "Flight path angle must be between -90 and 0 degrees for descent.",
    );
  }

  return Math.abs(Math.sin(resolvedAngle * DEGREES_TO_RADIANS));
}

function resolveConfiguration(
  inputs: ReentryTrajectoryInputs,
): ResolvedTrajectoryConfiguration {
  calculateStandardAtmosphere({
    altitudeMetres: inputs.initialAltitudeMeters,
  });
  const ballisticCoefficient = calculateBallisticCoefficient({
    dragCoefficient: inputs.dragCoefficient,
    referenceAreaSquareMetres: inputs.referenceAreaSquareMetres,
    vehicleMassKilograms: inputs.vehicleMassKilograms,
  });

  return {
    descentFraction: resolveDescentFraction(
      inputs.initialFlightPathAngleDegrees,
    ),
    timeStepSeconds: resolveTimeStepSeconds(inputs.timeStepSeconds),
    vehicle: ballisticCoefficient.inputs,
  };
}

function analyzeTrajectoryPoint(
  altitudeMeters: number,
  timeSeconds: number,
  velocityMetersPerSecond: number,
  vehicle: BallisticCoefficientInputs,
): ReentryTrajectoryPoint {
  const atmosphere = calculateStandardAtmosphere({
    altitudeMetres: altitudeMeters,
  });
  const { dynamicPressurePascals } = calculateDynamicPressure({
    airDensityKilogramsPerCubicMetre: atmosphere.densityKilogramsPerCubicMetre,
    velocityMetresPerSecond: velocityMetersPerSecond,
  });
  const deceleration = analyzeReentryDeceleration({
    altitudeMetres: altitudeMeters,
    dragCoefficient: vehicle.dragCoefficient,
    referenceAreaSquareMetres: vehicle.referenceAreaSquareMetres,
    vehicleMassKilograms: vehicle.vehicleMassKilograms,
    velocityMetresPerSecond: velocityMetersPerSecond,
  });

  return {
    altitudeMeters,
    decelerationGs: deceleration.flight.decelerationStandardGravities,
    decelerationMetersPerSecondSquared:
      deceleration.flight.decelerationMetresPerSecondSquared,
    densityKilogramsPerCubicMetre: atmosphere.densityKilogramsPerCubicMetre,
    dynamicPressurePascals,
    timeSeconds,
    velocityMetersPerSecond,
  };
}

function createZeroVelocityTerminalPoint(
  altitudeMeters: number,
  timeSeconds: number,
): ReentryTrajectoryPoint {
  const atmosphere = calculateStandardAtmosphere({
    altitudeMetres: altitudeMeters,
  });

  return {
    altitudeMeters,
    decelerationGs: 0,
    decelerationMetersPerSecondSquared: 0,
    densityKilogramsPerCubicMetre: atmosphere.densityKilogramsPerCubicMetre,
    dynamicPressurePascals: 0,
    timeSeconds,
    velocityMetersPerSecond: 0,
  };
}

/**
 * Integrates a simplified point-mass descent with fixed-step Euler updates.
 *
 * The model holds mass, drag coefficient, reference area, and flight-path
 * angle constant. It uses constant standard gravity and excludes lift,
 * planetary rotation, winds, heating feedback, structural failure, and any
 * atmosphere outside the existing standard-atmosphere model.
 */
export function analyzeReentryTrajectory(
  inputs: ReentryTrajectoryInputs,
): ReentryTrajectoryAnalysis {
  const configuration = resolveConfiguration(inputs);
  const initialState = analyzeTrajectoryPoint(
    inputs.initialAltitudeMeters,
    0,
    inputs.initialVelocityMetersPerSecond,
    configuration.vehicle,
  );
  const trajectoryPoints: ReentryTrajectoryPoint[] = [initialState];
  let peakDeceleration = initialState;
  let peakHeatingVelocityState = initialState;

  for (
    let iteration = 0;
    iteration < MAXIMUM_REENTRY_TRAJECTORY_ITERATIONS;
    iteration += 1
  ) {
    const currentState = trajectoryPoints[trajectoryPoints.length - 1];

    if (
      !currentState ||
      currentState.altitudeMeters <= 0 ||
      currentState.velocityMetersPerSecond <= 0 ||
      currentState.timeSeconds >= MAXIMUM_REENTRY_TRAJECTORY_TIME_SECONDS
    ) {
      break;
    }

    const stepSeconds = Math.min(
      configuration.timeStepSeconds,
      MAXIMUM_REENTRY_TRAJECTORY_TIME_SECONDS - currentState.timeSeconds,
    );
    const gravityAlongFlightPath =
      STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED *
      configuration.descentFraction;
    const nextVelocityMetersPerSecond = Math.max(
      0,
      currentState.velocityMetersPerSecond +
        (gravityAlongFlightPath -
          currentState.decelerationMetersPerSecondSquared) *
          stepSeconds,
    );
    const nextAltitudeMeters = Math.max(
      0,
      currentState.altitudeMeters -
        currentState.velocityMetersPerSecond *
          configuration.descentFraction *
          stepSeconds,
    );
    const nextTimeSeconds = currentState.timeSeconds + stepSeconds;
    const nextState =
      nextVelocityMetersPerSecond === 0
        ? createZeroVelocityTerminalPoint(nextAltitudeMeters, nextTimeSeconds)
        : analyzeTrajectoryPoint(
            nextAltitudeMeters,
            nextTimeSeconds,
            nextVelocityMetersPerSecond,
            configuration.vehicle,
          );

    trajectoryPoints.push(nextState);

    if (
      nextState.decelerationMetersPerSecondSquared >
      peakDeceleration.decelerationMetersPerSecondSquared
    ) {
      peakDeceleration = nextState;
    }

    if (
      nextState.velocityMetersPerSecond >
      peakHeatingVelocityState.velocityMetersPerSecond
    ) {
      peakHeatingVelocityState = nextState;
    }
  }

  const finalState = trajectoryPoints[trajectoryPoints.length - 1];

  if (!finalState) {
    throw new Error("Reentry trajectory did not produce an initial state.");
  }

  return {
    durationSeconds: finalState.timeSeconds,
    finalState,
    initialState,
    peakDeceleration,
    peakHeatingVelocityState,
    trajectoryPoints,
  };
}
