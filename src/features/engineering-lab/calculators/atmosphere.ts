import type {
  AtmosphereInputs,
  AtmosphereResult,
} from "@/features/engineering-lab/types";
import { assertValidAtmosphereInputs } from "@/features/engineering-lab/utils";

import { STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED } from "./constants";

export const SEA_LEVEL_STANDARD_TEMPERATURE_KELVIN = 288.15;
export const SEA_LEVEL_STANDARD_PRESSURE_PASCALS = 101_325;
export const TROPOSPHERIC_LAPSE_RATE_KELVIN_PER_METRE = 0.0065;
export const DRY_AIR_SPECIFIC_GAS_CONSTANT_JOULES_PER_KILOGRAM_KELVIN = 287.05;
export const RATIO_OF_SPECIFIC_HEATS_FOR_DRY_AIR = 1.4;

export function calculateStandardAtmosphere(
  inputs: AtmosphereInputs,
): AtmosphereResult {
  assertValidAtmosphereInputs(inputs);

  const temperatureKelvin =
    SEA_LEVEL_STANDARD_TEMPERATURE_KELVIN -
    TROPOSPHERIC_LAPSE_RATE_KELVIN_PER_METRE * inputs.altitudeMetres;
  const pressureExponent =
    STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED /
    (DRY_AIR_SPECIFIC_GAS_CONSTANT_JOULES_PER_KILOGRAM_KELVIN *
      TROPOSPHERIC_LAPSE_RATE_KELVIN_PER_METRE);
  const pressurePascals =
    SEA_LEVEL_STANDARD_PRESSURE_PASCALS *
    Math.pow(
      temperatureKelvin / SEA_LEVEL_STANDARD_TEMPERATURE_KELVIN,
      pressureExponent,
    );
  const densityKilogramsPerCubicMetre =
    pressurePascals /
    (DRY_AIR_SPECIFIC_GAS_CONSTANT_JOULES_PER_KILOGRAM_KELVIN *
      temperatureKelvin);
  const speedOfSoundMetersPerSecond = Math.sqrt(
    RATIO_OF_SPECIFIC_HEATS_FOR_DRY_AIR *
      DRY_AIR_SPECIFIC_GAS_CONSTANT_JOULES_PER_KILOGRAM_KELVIN *
      temperatureKelvin,
  );

  return {
    densityKilogramsPerCubicMetre,
    pressurePascals,
    speedOfSoundMetersPerSecond,
    temperatureKelvin,
  };
}
