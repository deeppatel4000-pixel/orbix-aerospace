import type {
  OrbitalElementsInputs,
  OrbitalElementsResult,
} from "@/features/engineering-lab/types";
import { assertValidOrbitalElementsInputs } from "@/features/engineering-lab/utils";

export const EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED = 3.986004418e14;
export const EARTH_MEAN_RADIUS_METRES = 6_371_000;

const SECONDS_PER_MINUTE = 60;

/**
 * Derives circular two-body orbital quantities from altitude above a spherical
 * central body. Defaults describe an idealized Earth orbit and exclude
 * perturbations, oblateness, atmosphere, and non-circular motion.
 */
export function calculateOrbitalElements(
  inputs: OrbitalElementsInputs,
): OrbitalElementsResult {
  assertValidOrbitalElementsInputs(inputs);

  const gravitationalParameter =
    inputs.gravitationalParameter ??
    EARTH_STANDARD_GRAVITATIONAL_PARAMETER_CUBIC_METRES_PER_SECOND_SQUARED;
  const planetRadiusMetres =
    inputs.planetRadiusMetres ?? EARTH_MEAN_RADIUS_METRES;
  const orbitalRadiusMetres = planetRadiusMetres + inputs.altitudeMetres;
  const orbitalVelocityMetresPerSecond = Math.sqrt(
    gravitationalParameter / orbitalRadiusMetres,
  );
  const orbitalPeriodSeconds =
    2 * Math.PI * Math.sqrt(orbitalRadiusMetres ** 3 / gravitationalParameter);
  const specificOrbitalEnergyJoulesPerKilogram =
    -gravitationalParameter / (2 * orbitalRadiusMetres);

  return {
    orbitalPeriodMinutes: orbitalPeriodSeconds / SECONDS_PER_MINUTE,
    orbitalPeriodSeconds,
    orbitalRadiusMetres,
    orbitalVelocityMetresPerSecond,
    resolvedConstants: {
      gravitationalParameterCubicMetresPerSecondSquared: gravitationalParameter,
      planetRadiusMetres,
    },
    specificOrbitalEnergyJoulesPerKilogram,
  };
}
