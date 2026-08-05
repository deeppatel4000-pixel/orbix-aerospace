import type {
  OrbitalPlaneChangeInputs,
  OrbitalPlaneChangeResult,
} from "@/features/engineering-lab/types";
import { assertValidOrbitalPlaneChangeInputs } from "@/features/engineering-lab/utils";

/**
 * Calculates the ideal impulsive delta-v for a pure orbital plane change.
 * The maneuver-point velocity must be supplied by the caller.
 */
export function calculateOrbitalPlaneChange(
  inputs: OrbitalPlaneChangeInputs,
): OrbitalPlaneChangeResult {
  assertValidOrbitalPlaneChangeInputs(inputs);

  const inclinationChangeRadians =
    (inputs.inclinationChangeDegrees * Math.PI) / 180;
  const deltaVMetresPerSecond =
    2 *
    inputs.orbitalVelocityMetresPerSecond *
    Math.sin(inclinationChangeRadians / 2);

  return {
    deltaVMetresPerSecond,
    inclinationChangeDegrees: inputs.inclinationChangeDegrees,
    inclinationChangeRadians,
    orbitalVelocityMetresPerSecond: inputs.orbitalVelocityMetresPerSecond,
  };
}
