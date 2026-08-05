import type {
  StagnationHeatingInputs,
  StagnationHeatingResult,
} from "@/features/engineering-lab/types";
import { assertValidStagnationHeatingInputs } from "@/features/engineering-lab/utils";

/**
 * Educational Earth-air Sutton-Graves style coefficient for SI inputs.
 * This empirical value is not universal across atmospheres, gas models,
 * surface chemistry, or heating regimes.
 */
export const DEFAULT_STAGNATION_HEATING_COEFFICIENT = 1.83e-4;

const WATTS_PER_KILOWATT = 1_000;

export function calculateStagnationHeating(
  inputs: StagnationHeatingInputs,
): StagnationHeatingResult {
  assertValidStagnationHeatingInputs(inputs);

  const resolvedHeatingCoefficient =
    inputs.heatingCoefficient ?? DEFAULT_STAGNATION_HEATING_COEFFICIENT;
  const heatFluxWattsPerSquareMetre =
    resolvedHeatingCoefficient *
    Math.sqrt(
      inputs.atmosphericDensityKilogramsPerCubicMetre / inputs.noseRadiusMetres,
    ) *
    inputs.velocityMetresPerSecond ** 3;

  return {
    heatFluxKilowattsPerSquareMetre:
      heatFluxWattsPerSquareMetre / WATTS_PER_KILOWATT,
    heatFluxWattsPerSquareMetre,
    inputs: {
      atmosphericDensityKilogramsPerCubicMetre:
        inputs.atmosphericDensityKilogramsPerCubicMetre,
      heatingCoefficient: resolvedHeatingCoefficient,
      noseRadiusMetres: inputs.noseRadiusMetres,
      velocityMetresPerSecond: inputs.velocityMetresPerSecond,
    },
    resolvedHeatingCoefficient,
  };
}
