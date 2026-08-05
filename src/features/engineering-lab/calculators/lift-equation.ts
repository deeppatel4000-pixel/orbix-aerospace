import type {
  LiftEquationInputs,
  LiftEquationResult,
} from "@/features/engineering-lab/types";
import { assertValidLiftEquationInputs } from "@/features/engineering-lab/utils";

import { calculateDynamicPressure } from "./aerodynamic";

export function calculateLiftEquation(
  inputs: LiftEquationInputs,
): LiftEquationResult {
  assertValidLiftEquationInputs(inputs);

  const { dynamicPressurePascals } = calculateDynamicPressure(inputs);
  const liftForceNewtons =
    dynamicPressurePascals *
    inputs.wingAreaSquareMetres *
    inputs.liftCoefficient;

  return { liftForceNewtons };
}
