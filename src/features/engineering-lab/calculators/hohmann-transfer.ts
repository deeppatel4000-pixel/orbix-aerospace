import type {
  HohmannTransferInputs,
  HohmannTransferResult,
} from "@/features/engineering-lab/types";
import { assertValidHohmannTransferInputs } from "@/features/engineering-lab/utils";

import { EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED } from "./orbital-elements";

const SECONDS_PER_HOUR = 3_600;

/**
 * Calculates a classical two-impulse Hohmann transfer between circular,
 * coplanar orbits around the same central body. Inputs and outputs use SI units.
 */
export function calculateHohmannTransfer(
  inputs: HohmannTransferInputs,
): HohmannTransferResult {
  assertValidHohmannTransferInputs(inputs);

  const resolvedGravitationalParameter =
    inputs.gravitationalParameter ??
    EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED;
  const transferSemiMajorAxisMetres =
    (inputs.initialOrbitRadiusMetres + inputs.finalOrbitRadiusMetres) / 2;

  const initialCircularVelocityMetresPerSecond = Math.sqrt(
    resolvedGravitationalParameter / inputs.initialOrbitRadiusMetres,
  );
  const finalCircularVelocityMetresPerSecond = Math.sqrt(
    resolvedGravitationalParameter / inputs.finalOrbitRadiusMetres,
  );
  const transferVelocityAtInitialOrbitMetresPerSecond = Math.sqrt(
    resolvedGravitationalParameter *
      (2 / inputs.initialOrbitRadiusMetres - 1 / transferSemiMajorAxisMetres),
  );
  const transferVelocityAtFinalOrbitMetresPerSecond = Math.sqrt(
    resolvedGravitationalParameter *
      (2 / inputs.finalOrbitRadiusMetres - 1 / transferSemiMajorAxisMetres),
  );

  const firstBurnDeltaVMetresPerSecond = Math.abs(
    transferVelocityAtInitialOrbitMetresPerSecond -
      initialCircularVelocityMetresPerSecond,
  );
  const secondBurnDeltaVMetresPerSecond = Math.abs(
    finalCircularVelocityMetresPerSecond -
      transferVelocityAtFinalOrbitMetresPerSecond,
  );
  const transferTimeSeconds =
    Math.PI *
    Math.sqrt(
      transferSemiMajorAxisMetres ** 3 / resolvedGravitationalParameter,
    );

  return {
    finalOrbitRadiusMetres: inputs.finalOrbitRadiusMetres,
    firstBurnDeltaVMetresPerSecond,
    initialOrbitRadiusMetres: inputs.initialOrbitRadiusMetres,
    resolvedGravitationalParameter,
    secondBurnDeltaVMetresPerSecond,
    totalDeltaVMetresPerSecond:
      firstBurnDeltaVMetresPerSecond + secondBurnDeltaVMetresPerSecond,
    transferSemiMajorAxisMetres,
    transferTimeHours: transferTimeSeconds / SECONDS_PER_HOUR,
    transferTimeSeconds,
  };
}
