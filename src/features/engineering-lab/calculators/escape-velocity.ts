import type {
  EscapeVelocityInputs,
  EscapeVelocityResult,
} from "@/features/engineering-lab/types";
import { assertValidEscapeVelocityInputs } from "@/features/engineering-lab/utils";

import { EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED } from "./orbital-elements";

/**
 * Calculates ideal two-body escape velocity at a supplied orbital radius.
 * Inputs and outputs use SI units.
 */
export function calculateEscapeVelocity(
  inputs: EscapeVelocityInputs,
): EscapeVelocityResult {
  assertValidEscapeVelocityInputs(inputs);

  const resolvedGravitationalParameter =
    inputs.gravitationalParameter ??
    EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED;
  const escapeVelocityMetresPerSecond = Math.sqrt(
    (2 * resolvedGravitationalParameter) / inputs.orbitalRadiusMetres,
  );

  return {
    escapeVelocityMetresPerSecond,
    orbitalRadiusMetres: inputs.orbitalRadiusMetres,
    resolvedGravitationalParameter,
  };
}
