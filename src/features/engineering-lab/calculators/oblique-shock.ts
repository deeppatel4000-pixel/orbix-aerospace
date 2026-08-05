import type {
  ObliqueShockAnalysis,
  ObliqueShockInputs,
} from "@/features/engineering-lab/types";
import { assertValidObliqueShockInputs } from "@/features/engineering-lab/utils";

import {
  calculateNormalShock,
  DEFAULT_NORMAL_SHOCK_GAMMA,
} from "./normal-shock";

const NUMERICAL_SOLVER_ITERATIONS = 100;
const ANGLE_SOLUTION_TOLERANCE_RADIANS = 1e-12;
const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;

export const DEFAULT_OBLIQUE_SHOCK_GAMMA = DEFAULT_NORMAL_SHOCK_GAMMA;

function calculateDeflectionAngleRadians(
  shockAngleRadians: number,
  machNumber: number,
  gamma: number,
): number {
  const machNumberSquared = machNumber ** 2;
  const sineOfShockAngle = Math.sin(shockAngleRadians);
  const numerator =
    (2 / Math.tan(shockAngleRadians)) *
    (machNumberSquared * sineOfShockAngle ** 2 - 1);
  const denominator =
    machNumberSquared * (gamma + Math.cos(2 * shockAngleRadians)) + 2;

  return Math.atan(numerator / denominator);
}

function findMaximumDeflectionShockAngle(
  machAngleRadians: number,
  machNumber: number,
  gamma: number,
): number {
  let lowerBound = machAngleRadians;
  let upperBound = Math.PI / 2;

  for (
    let iteration = 0;
    iteration < NUMERICAL_SOLVER_ITERATIONS;
    iteration += 1
  ) {
    const intervalThird = (upperBound - lowerBound) / 3;
    const lowerCandidate = lowerBound + intervalThird;
    const upperCandidate = upperBound - intervalThird;
    const lowerDeflection = calculateDeflectionAngleRadians(
      lowerCandidate,
      machNumber,
      gamma,
    );
    const upperDeflection = calculateDeflectionAngleRadians(
      upperCandidate,
      machNumber,
      gamma,
    );

    if (lowerDeflection < upperDeflection) {
      lowerBound = lowerCandidate;
    } else {
      upperBound = upperCandidate;
    }
  }

  return (lowerBound + upperBound) / 2;
}

function solveWeakShockAngle(
  machNumber: number,
  deflectionAngleRadians: number,
  gamma: number,
): number {
  const machAngleRadians = Math.asin(1 / machNumber);
  const maximumDeflectionShockAngle = findMaximumDeflectionShockAngle(
    machAngleRadians,
    machNumber,
    gamma,
  );
  const maximumDeflectionAngle = calculateDeflectionAngleRadians(
    maximumDeflectionShockAngle,
    machNumber,
    gamma,
  );

  if (
    deflectionAngleRadians >
    maximumDeflectionAngle + ANGLE_SOLUTION_TOLERANCE_RADIANS
  ) {
    throw new RangeError(
      "No attached weak-shock solution exists for these inputs.",
    );
  }

  if (
    Math.abs(deflectionAngleRadians - maximumDeflectionAngle) <=
    ANGLE_SOLUTION_TOLERANCE_RADIANS
  ) {
    return maximumDeflectionShockAngle;
  }

  let lowerBound = machAngleRadians;
  let upperBound = maximumDeflectionShockAngle;

  for (
    let iteration = 0;
    iteration < NUMERICAL_SOLVER_ITERATIONS;
    iteration += 1
  ) {
    const candidate = (lowerBound + upperBound) / 2;
    const candidateDeflection = calculateDeflectionAngleRadians(
      candidate,
      machNumber,
      gamma,
    );

    if (candidateDeflection < deflectionAngleRadians) {
      lowerBound = candidate;
    } else {
      upperBound = candidate;
    }
  }

  return (lowerBound + upperBound) / 2;
}

export function calculateObliqueShock(
  inputs: ObliqueShockInputs,
): ObliqueShockAnalysis {
  assertValidObliqueShockInputs(inputs);

  const gamma = inputs.gamma ?? DEFAULT_OBLIQUE_SHOCK_GAMMA;
  const deflectionAngleRadians =
    inputs.deflectionAngleDegrees * DEGREES_TO_RADIANS;
  const shockAngleRadians = solveWeakShockAngle(
    inputs.machNumber,
    deflectionAngleRadians,
    gamma,
  );
  const upstreamNormalMach = inputs.machNumber * Math.sin(shockAngleRadians);
  const normalShock = calculateNormalShock({
    gamma,
    machNumber: upstreamNormalMach,
  });
  const downstreamMach =
    normalShock.downstreamMach /
    Math.sin(shockAngleRadians - deflectionAngleRadians);

  return {
    deflectionAngleDegrees: inputs.deflectionAngleDegrees,
    densityRatio: normalShock.densityRatio,
    downstreamMach,
    pressureRatio: normalShock.pressureRatio,
    shockAngleDegrees: shockAngleRadians * RADIANS_TO_DEGREES,
    temperatureRatio: normalShock.temperatureRatio,
    upstreamMach: inputs.machNumber,
  };
}
