import type {
  ReentryThermalHistoryInputs,
  TPSSizingAnalysis,
  TPSSizingInputs,
} from "@/features/engineering-lab/types";

import { analyzeReentryThermalHistory } from "./reentry-thermal-history";

export const DEFAULT_TPS_MATERIAL_EFFICIENCY_FACTOR = 1;

const MILLIMETRES_PER_METRE = 1_000;

function assertPositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`Enter a finite number for ${label.toLowerCase()}.`);
  }

  if (value <= 0) {
    throw new RangeError(`${label} must be greater than zero.`);
  }
}

function buildThermalHistoryInputs(
  inputs: TPSSizingInputs,
): ReentryThermalHistoryInputs {
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
    dragCoefficient: inputs.dragCoefficient,
    initialAltitudeMeters: inputs.initialAltitudeMeters,
    initialVelocityMetersPerSecond: inputs.initialVelocityMetersPerSecond,
    noseRadiusMetres: inputs.noseRadiusMetres,
    referenceAreaSquareMetres: inputs.referenceAreaSquareMetres,
    vehicleMassKilograms: inputs.vehicleMassKilograms,
  };
}

/**
 * Produces a preliminary TPS estimate from the existing reentry thermal
 * history. The supplied allowable heat load is treated as the educational
 * model's normalized energy capacity per unit installed areal mass. The model
 * assumes constant material properties and excludes ablation,
 * temperature-dependent behavior, radiation heating, internal heat transfer,
 * structural sizing, and oxidation or other chemical effects.
 */
export function analyzeTPSSizing(inputs: TPSSizingInputs): TPSSizingAnalysis {
  assertPositiveFinite(
    inputs.materialDensityKilogramsPerCubicMetre,
    "Material density",
  );
  assertPositiveFinite(
    inputs.allowableHeatLoadMegajoulesPerSquareMetre,
    "Allowable heat load",
  );
  assertPositiveFinite(inputs.safetyFactor, "Safety factor");

  const materialEfficiencyFactor =
    inputs.materialEfficiencyFactor ?? DEFAULT_TPS_MATERIAL_EFFICIENCY_FACTOR;
  assertPositiveFinite(materialEfficiencyFactor, "Material efficiency factor");

  const thermalHistory = analyzeReentryThermalHistory(
    buildThermalHistoryInputs(inputs),
  );
  const peakHeatLoad = thermalHistory.totalHeatLoadEstimate;
  const designHeatLoadMegajoulesPerSquareMetre =
    peakHeatLoad.heatLoadMegajoulesPerSquareMetre * inputs.safetyFactor;
  const effectiveEnergyAbsorptionCapacity =
    inputs.allowableHeatLoadMegajoulesPerSquareMetre * materialEfficiencyFactor;
  const requiredArealDensityKilogramsPerSquareMetre =
    designHeatLoadMegajoulesPerSquareMetre / effectiveEnergyAbsorptionCapacity;
  const estimatedThicknessMetres =
    requiredArealDensityKilogramsPerSquareMetre /
    inputs.materialDensityKilogramsPerCubicMetre;

  return {
    estimatedThickness: {
      metres: estimatedThicknessMetres,
      millimetres: estimatedThicknessMetres * MILLIMETRES_PER_METRE,
    },
    peakHeatFlux: thermalHistory.peakHeatFlux,
    peakHeatLoad,
    requiredArealDensity: {
      kilogramsPerSquareMetre: requiredArealDensityKilogramsPerSquareMetre,
    },
    safetyMargin: {
      designHeatLoadMegajoulesPerSquareMetre,
      heatLoadMarginMegajoulesPerSquareMetre:
        designHeatLoadMegajoulesPerSquareMetre -
        peakHeatLoad.heatLoadMegajoulesPerSquareMetre,
      marginPercentage: (inputs.safetyFactor - 1) * 100,
    },
    thermalHistory,
  };
}
