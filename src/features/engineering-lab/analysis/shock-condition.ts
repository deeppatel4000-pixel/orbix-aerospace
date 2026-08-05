import {
  calculateNormalShock,
  calculateStandardAtmosphere,
} from "@/features/engineering-lab/calculators";
import type {
  ShockConditionAnalysis,
  ShockConditionInputs,
} from "@/features/engineering-lab/types";

export function analyzeShockCondition(
  inputs: ShockConditionInputs,
): ShockConditionAnalysis {
  const atmosphere = calculateStandardAtmosphere({
    altitudeMetres: inputs.altitudeMeters,
  });
  const shock = calculateNormalShock({ machNumber: inputs.machNumber });
  const upstream = {
    densityKilogramsPerCubicMetre: atmosphere.densityKilogramsPerCubicMetre,
    machNumber: shock.upstreamMach,
    pressurePascals: atmosphere.pressurePascals,
    temperatureKelvin: atmosphere.temperatureKelvin,
  };
  const ratios = {
    densityRatio: shock.densityRatio,
    pressureRatio: shock.pressureRatio,
    temperatureRatio: shock.temperatureRatio,
  };

  return {
    downstream: {
      densityKilogramsPerCubicMetre:
        upstream.densityKilogramsPerCubicMetre * ratios.densityRatio,
      machNumber: shock.downstreamMach,
      pressurePascals: upstream.pressurePascals * ratios.pressureRatio,
      temperatureKelvin: upstream.temperatureKelvin * ratios.temperatureRatio,
    },
    ratios,
    upstream,
  };
}
