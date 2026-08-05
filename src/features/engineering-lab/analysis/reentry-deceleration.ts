import {
  calculateBallisticCoefficient,
  calculateDynamicPressure,
  calculateStandardAtmosphere,
  STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED,
} from "@/features/engineering-lab/calculators";
import type {
  ReentryDecelerationAnalysis,
  ReentryDecelerationInputs,
} from "@/features/engineering-lab/types";

export function analyzeReentryDeceleration(
  inputs: ReentryDecelerationInputs,
): ReentryDecelerationAnalysis {
  const atmosphere = calculateStandardAtmosphere({
    altitudeMetres: inputs.altitudeMetres,
  });
  const ballisticCoefficient = calculateBallisticCoefficient({
    dragCoefficient: inputs.dragCoefficient,
    referenceAreaSquareMetres: inputs.referenceAreaSquareMetres,
    vehicleMassKilograms: inputs.vehicleMassKilograms,
  });
  const { dynamicPressurePascals } = calculateDynamicPressure({
    airDensityKilogramsPerCubicMetre: atmosphere.densityKilogramsPerCubicMetre,
    velocityMetresPerSecond: inputs.velocityMetresPerSecond,
  });
  const decelerationMetresPerSecondSquared =
    dynamicPressurePascals /
    ballisticCoefficient.ballisticCoefficientKilogramsPerSquareMetre;

  return {
    atmosphere: {
      densityKilogramsPerCubicMetre: atmosphere.densityKilogramsPerCubicMetre,
      pressurePascals: atmosphere.pressurePascals,
      temperatureKelvin: atmosphere.temperatureKelvin,
    },
    flight: {
      decelerationMetresPerSecondSquared,
      decelerationStandardGravities:
        decelerationMetresPerSecondSquared /
        STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED,
      velocityMetresPerSecond: inputs.velocityMetresPerSecond,
    },
    vehicle: {
      ballisticCoefficientKilogramsPerSquareMetre:
        ballisticCoefficient.ballisticCoefficientKilogramsPerSquareMetre,
      dragCoefficient: ballisticCoefficient.inputs.dragCoefficient,
      referenceAreaSquareMetres:
        ballisticCoefficient.inputs.referenceAreaSquareMetres,
      vehicleMassKilograms: ballisticCoefficient.inputs.vehicleMassKilograms,
    },
  };
}
