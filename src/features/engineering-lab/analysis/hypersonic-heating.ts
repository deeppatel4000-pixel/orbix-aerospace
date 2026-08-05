import {
  calculateMachNumber,
  calculateStagnationHeating,
  calculateStandardAtmosphere,
} from "@/features/engineering-lab/calculators";
import type {
  HypersonicHeatingAnalysis,
  HypersonicHeatingInputs,
} from "@/features/engineering-lab/types";

export function analyzeHypersonicHeating(
  inputs: HypersonicHeatingInputs,
): HypersonicHeatingAnalysis {
  const atmosphere = calculateStandardAtmosphere({
    altitudeMetres: inputs.altitudeMetres,
  });
  const mach = calculateMachNumber({
    speedOfSoundMetersPerSecond: atmosphere.speedOfSoundMetersPerSecond,
    velocityMetresPerSecond: inputs.velocityMetresPerSecond,
  });
  const optionalHeatingCoefficient =
    inputs.heatingCoefficient === undefined
      ? {}
      : { heatingCoefficient: inputs.heatingCoefficient };
  const heating = calculateStagnationHeating({
    ...optionalHeatingCoefficient,
    atmosphericDensityKilogramsPerCubicMetre:
      atmosphere.densityKilogramsPerCubicMetre,
    noseRadiusMetres: inputs.noseRadiusMetres,
    velocityMetresPerSecond: inputs.velocityMetresPerSecond,
  });

  return {
    atmosphere,
    flow: {
      ...mach,
      velocityMetresPerSecond: inputs.velocityMetresPerSecond,
    },
    thermal: {
      heatFluxKilowattsPerSquareMetre: heating.heatFluxKilowattsPerSquareMetre,
      heatFluxWattsPerSquareMetre: heating.heatFluxWattsPerSquareMetre,
      heatingCoefficient: heating.resolvedHeatingCoefficient,
    },
  };
}
