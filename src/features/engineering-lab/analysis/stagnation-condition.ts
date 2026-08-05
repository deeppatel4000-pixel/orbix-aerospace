import {
  calculateIsentropicFlow,
  calculateStandardAtmosphere,
} from "@/features/engineering-lab/calculators";
import type {
  StagnationConditionAnalysis,
  StagnationConditionInputs,
} from "@/features/engineering-lab/types";

export function analyzeStagnationCondition(
  inputs: StagnationConditionInputs,
): StagnationConditionAnalysis {
  const atmosphere = calculateStandardAtmosphere({
    altitudeMetres: inputs.altitudeMeters,
  });
  const ratios = calculateIsentropicFlow({ machNumber: inputs.machNumber });
  const staticConditions = {
    densityKilogramsPerCubicMetre: atmosphere.densityKilogramsPerCubicMetre,
    pressurePascals: atmosphere.pressurePascals,
    temperatureKelvin: atmosphere.temperatureKelvin,
  };

  return {
    ratios,
    stagnationConditions: {
      densityKilogramsPerCubicMetre:
        staticConditions.densityKilogramsPerCubicMetre * ratios.densityRatio,
      pressurePascals: staticConditions.pressurePascals * ratios.pressureRatio,
      temperatureKelvin:
        staticConditions.temperatureKelvin * ratios.temperatureRatio,
    },
    staticConditions,
  };
}
