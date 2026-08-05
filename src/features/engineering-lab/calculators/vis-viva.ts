import type {
  VisVivaInputs,
  VisVivaResult,
} from "@/features/engineering-lab/types";
import { assertValidVisVivaInputs } from "@/features/engineering-lab/utils";

import { EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED } from "./orbital-elements";

/**
 * Calculates instantaneous speed along an ideal two-body Keplerian orbit.
 * Inputs and outputs use SI units.
 */
export function calculateVisViva(inputs: VisVivaInputs): VisVivaResult {
  assertValidVisVivaInputs(inputs);

  const resolvedGravitationalParameter =
    inputs.gravitationalParameter ??
    EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED;
  const orbitalVelocityMetresPerSecond = Math.sqrt(
    resolvedGravitationalParameter *
      (2 / inputs.orbitalRadiusMetres - 1 / inputs.semiMajorAxisMetres),
  );

  return {
    orbitalRadiusMetres: inputs.orbitalRadiusMetres,
    orbitalVelocityMetresPerSecond,
    resolvedGravitationalParameter,
    semiMajorAxisMetres: inputs.semiMajorAxisMetres,
  };
}
