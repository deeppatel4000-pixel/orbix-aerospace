import type {
  RocketEquationInputs,
  RocketEquationResult,
} from "@/features/engineering-lab/types";
import { assertValidRocketEquationInputs } from "@/features/engineering-lab/utils";

import { STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED } from "./constants";

export { STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED } from "./constants";

export function calculateRocketEquation(
  inputs: RocketEquationInputs,
): RocketEquationResult {
  assertValidRocketEquationInputs(inputs);

  const massRatio = inputs.initialMassKg / inputs.finalMassKg;
  const effectiveExhaustVelocityMetresPerSecond =
    inputs.specificImpulseSeconds * STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED;
  const deltaVMetresPerSecond =
    effectiveExhaustVelocityMetresPerSecond * Math.log(massRatio);

  return {
    deltaVMetresPerSecond,
    effectiveExhaustVelocityMetresPerSecond,
    massRatio,
  };
}
