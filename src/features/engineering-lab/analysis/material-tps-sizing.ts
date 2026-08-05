import { getTPSMaterialById } from "@/features/engineering-lab/materials";
import type {
  MaterialTPSSizingAnalysis,
  MaterialTPSSizingInputs,
  TPSMaterial,
  TPSSizingInputs,
  TPSSuitabilitySummary,
} from "@/features/engineering-lab/types";

import { analyzeTPSSizing } from "./tps-sizing";

const MODERATE_MARGIN_MINIMUM_PERCENTAGE = 25;
const HIGH_MARGIN_MINIMUM_PERCENTAGE = 75;

function buildTPSSizingInputs(
  inputs: MaterialTPSSizingInputs,
  material: TPSMaterial,
): TPSSizingInputs {
  const optionalFlightPathAngle =
    inputs.initialFlightPathAngleDegrees === undefined
      ? {}
      : {
          initialFlightPathAngleDegrees: inputs.initialFlightPathAngleDegrees,
        };
  const optionalHeatingCoefficient =
    inputs.heatingCoefficient === undefined
      ? {}
      : { heatingCoefficient: inputs.heatingCoefficient };
  const optionalTimeStep =
    inputs.timestepSeconds === undefined
      ? {}
      : { timestepSeconds: inputs.timestepSeconds };

  return {
    ...optionalFlightPathAngle,
    ...optionalHeatingCoefficient,
    ...optionalTimeStep,
    allowableHeatLoadMegajoulesPerSquareMetre:
      material.allowableHeatLoadMegajoulesPerSquareMetre,
    dragCoefficient: inputs.dragCoefficient,
    initialAltitudeMeters: inputs.initialAltitudeMeters,
    initialVelocityMetersPerSecond: inputs.initialVelocityMetersPerSecond,
    materialDensityKilogramsPerCubicMetre:
      material.densityKilogramsPerCubicMetre,
    noseRadiusMetres: inputs.noseRadiusMetres,
    referenceAreaSquareMetres: inputs.referenceAreaSquareMetres,
    safetyFactor: inputs.safetyFactor,
    vehicleMassKilograms: inputs.vehicleMassKilograms,
  };
}

function classifyThermalMargin(
  marginPercentage: number,
): TPSSuitabilitySummary {
  if (marginPercentage < MODERATE_MARGIN_MINIMUM_PERCENTAGE) {
    return "Low thermal margin";
  }

  if (marginPercentage < HIGH_MARGIN_MINIMUM_PERCENTAGE) {
    return "Moderate thermal margin";
  }

  return "High thermal margin";
}

/**
 * Connects the educational TPS material catalog to the existing TPS sizing
 * analysis. Material properties are simplified estimates, and real selection
 * requires qualification testing. This orchestration excludes manufacturing
 * constraints, attachment systems, localized heating, and structural
 * integration.
 */
export function analyzeMaterialTPSSizing(
  inputs: MaterialTPSSizingInputs,
): MaterialTPSSizingAnalysis {
  const material = getTPSMaterialById(inputs.materialId);

  if (!material) {
    throw new RangeError(`Unknown TPS material ID: ${inputs.materialId}`);
  }

  const tpsSizing = analyzeTPSSizing(buildTPSSizingInputs(inputs, material));
  const arealDensityKilogramsPerSquareMetre =
    tpsSizing.requiredArealDensity.kilogramsPerSquareMetre;

  return {
    estimatedTPSMassForArea: {
      arealDensityKilogramsPerSquareMetre,
      totalTPSMassKilograms:
        arealDensityKilogramsPerSquareMetre * inputs.referenceAreaSquareMetres,
    },
    material,
    suitabilitySummary: classifyThermalMargin(
      tpsSizing.safetyMargin.marginPercentage,
    ),
    thermalHistory: tpsSizing.thermalHistory,
    tpsSizing,
  };
}
