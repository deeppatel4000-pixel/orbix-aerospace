import type {
  ThrustToWeightInputs,
  ThrustToWeightRegime,
  ThrustToWeightResult,
} from "@/features/engineering-lab/types";
import { assertValidThrustToWeightInputs } from "@/features/engineering-lab/utils";

import { STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED } from "./constants";

export const THRUST_TO_WEIGHT_AROUND_ONE_TOLERANCE = 0.05;

export function classifyThrustToWeightRatio(
  thrustToWeightRatio: number,
): ThrustToWeightRegime {
  if (!Number.isFinite(thrustToWeightRatio) || thrustToWeightRatio <= 0) {
    throw new RangeError(
      "Thrust-to-weight ratio must be a positive, finite number.",
    );
  }

  if (thrustToWeightRatio < 1 - THRUST_TO_WEIGHT_AROUND_ONE_TOLERANCE) {
    return "below-one";
  }

  if (thrustToWeightRatio <= 1 + THRUST_TO_WEIGHT_AROUND_ONE_TOLERANCE) {
    return "around-one";
  }

  return "above-one";
}

export function calculateThrustToWeightRatio(
  inputs: ThrustToWeightInputs,
): ThrustToWeightResult {
  assertValidThrustToWeightInputs(inputs);

  const weightNewtons =
    inputs.massKg * STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED;
  const thrustToWeightRatio = inputs.thrustNewtons / weightNewtons;

  return {
    regime: classifyThrustToWeightRatio(thrustToWeightRatio),
    thrustToWeightRatio,
    weightNewtons,
  };
}
