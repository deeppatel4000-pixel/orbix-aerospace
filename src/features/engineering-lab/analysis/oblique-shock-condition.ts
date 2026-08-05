import {
  calculateObliqueShock,
  calculateStandardAtmosphere,
} from "@/features/engineering-lab/calculators";
import type {
  ObliqueShockConditionAnalysis,
  ObliqueShockConditionInputs,
} from "@/features/engineering-lab/types";

export function analyzeObliqueShockCondition(
  inputs: ObliqueShockConditionInputs,
): ObliqueShockConditionAnalysis {
  const atmosphere = calculateStandardAtmosphere({
    altitudeMetres: inputs.altitudeMeters,
  });
  const obliqueShock = calculateObliqueShock({
    deflectionAngleDegrees: inputs.deflectionAngleDegrees,
    machNumber: inputs.machNumber,
  });
  const upstream = {
    densityKilogramsPerCubicMetre: atmosphere.densityKilogramsPerCubicMetre,
    machNumber: obliqueShock.upstreamMach,
    pressurePascals: atmosphere.pressurePascals,
    temperatureKelvin: atmosphere.temperatureKelvin,
  };
  const ratios = {
    densityRatio: obliqueShock.densityRatio,
    pressureRatio: obliqueShock.pressureRatio,
    temperatureRatio: obliqueShock.temperatureRatio,
  };

  return {
    downstream: {
      densityKilogramsPerCubicMetre:
        upstream.densityKilogramsPerCubicMetre * ratios.densityRatio,
      machNumber: obliqueShock.downstreamMach,
      pressurePascals: upstream.pressurePascals * ratios.pressureRatio,
      temperatureKelvin: upstream.temperatureKelvin * ratios.temperatureRatio,
    },
    ratios,
    shock: {
      deflectionAngleDegrees: obliqueShock.deflectionAngleDegrees,
      shockAngleDegrees: obliqueShock.shockAngleDegrees,
    },
    upstream,
  };
}
