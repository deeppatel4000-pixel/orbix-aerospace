import type {
  ReentryThermalHistoryInputs,
  ReentryTrajectoryInputs,
  TPSMaterialComparisonInputs,
  VehicleReentryEvaluationAnalysis,
  VehicleReentryEvaluationInputs,
} from "@/features/engineering-lab/types";

import { analyzeReentryThermalHistory } from "./reentry-thermal-history";
import { analyzeReentryTrajectory } from "./reentry-trajectory";
import { analyzeTPSMaterialComparison } from "./tps-material-comparison";

function buildTrajectoryInputs(
  inputs: VehicleReentryEvaluationInputs,
): ReentryTrajectoryInputs {
  const optionalFlightPathAngle =
    inputs.initialFlightPathAngleDegrees === undefined
      ? {}
      : {
          initialFlightPathAngleDegrees: inputs.initialFlightPathAngleDegrees,
        };
  const optionalTimeStep =
    inputs.timestepSeconds === undefined
      ? {}
      : { timeStepSeconds: inputs.timestepSeconds };

  return {
    ...optionalFlightPathAngle,
    ...optionalTimeStep,
    dragCoefficient: inputs.vehicle.dragCoefficient,
    initialAltitudeMeters: inputs.initialAltitudeMeters,
    initialVelocityMetersPerSecond: inputs.initialVelocityMetersPerSecond,
    referenceAreaSquareMetres: inputs.vehicle.referenceAreaSquareMetres,
    vehicleMassKilograms: inputs.vehicle.massKilograms,
  };
}

function buildThermalInputs(
  inputs: VehicleReentryEvaluationInputs,
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
    dragCoefficient: inputs.vehicle.dragCoefficient,
    initialAltitudeMeters: inputs.initialAltitudeMeters,
    initialVelocityMetersPerSecond: inputs.initialVelocityMetersPerSecond,
    noseRadiusMetres: inputs.vehicle.noseRadiusMetres,
    referenceAreaSquareMetres: inputs.vehicle.referenceAreaSquareMetres,
    vehicleMassKilograms: inputs.vehicle.massKilograms,
  };
}

function buildTPSComparisonInputs(
  inputs: VehicleReentryEvaluationInputs,
): TPSMaterialComparisonInputs {
  return {
    ...buildThermalInputs(inputs),
    safetyFactor: inputs.safetyFactor,
  };
}

/**
 * Integrates one caller-supplied vehicle configuration with the existing
 * trajectory, thermal-history, and TPS material-comparison analyses.
 *
 * This is an educational vehicle-level integration, not certified reentry
 * prediction. It excludes guidance, lift modulation, control systems,
 * trajectory optimization, structural loads, ablation, and qualified TPS
 * material data.
 */
export function analyzeVehicleReentryEvaluation(
  inputs: VehicleReentryEvaluationInputs,
): VehicleReentryEvaluationAnalysis {
  if (inputs.vehicle.vehicleName.trim().length === 0) {
    throw new RangeError("Vehicle name must not be empty.");
  }

  const trajectory = analyzeReentryTrajectory(buildTrajectoryInputs(inputs));
  const thermalHistory = analyzeReentryThermalHistory(
    buildThermalInputs(inputs),
  );
  const tpsComparison = analyzeTPSMaterialComparison(
    buildTPSComparisonInputs(inputs),
  );
  const recommendedTPS = tpsComparison.recommendedMaterial;

  return {
    summary: {
      dynamics: {
        peakDeceleration: {
          altitudeMeters: trajectory.peakDeceleration.altitudeMeters,
          decelerationGs: trajectory.peakDeceleration.decelerationGs,
          decelerationMetersPerSecondSquared:
            trajectory.peakDeceleration.decelerationMetersPerSecondSquared,
        },
        peakVelocityState: trajectory.peakHeatingVelocityState,
      },
      flight: {
        finalState: trajectory.finalState,
        initialAltitudeMeters: trajectory.initialState.altitudeMeters,
        initialVelocityMetersPerSecond:
          trajectory.initialState.velocityMetersPerSecond,
        reentryDurationSeconds: trajectory.durationSeconds,
      },
      thermal: {
        peakHeatFluxKilowattsPerSquareMetre:
          thermalHistory.peakHeatFlux.heatFluxKilowattsPerSquareMetre,
        peakHeatFluxWattsPerSquareMetre:
          thermalHistory.peakHeatFlux.heatFluxWattsPerSquareMetre,
        peakHeatingAltitudeMeters:
          thermalHistory.peakHeatFluxLocation.altitudeMeters,
        totalHeatLoadJoulesPerSquareMetre:
          thermalHistory.totalHeatLoadEstimate.heatLoadJoulesPerSquareMetre,
        totalHeatLoadMegajoulesPerSquareMetre:
          thermalHistory.totalHeatLoadEstimate.heatLoadMegajoulesPerSquareMetre,
      },
      tps: {
        estimatedTPSMassKilograms:
          recommendedTPS.estimatedTPSMass.totalTPSMassKilograms,
        recommendedMaterial: recommendedTPS.material,
        requiredThickness: recommendedTPS.thickness,
        thermalMargin: {
          classification: recommendedTPS.marginClassification,
          heatLoadMarginMegajoulesPerSquareMetre:
            recommendedTPS.heatLoadMargin
              .heatLoadMarginMegajoulesPerSquareMetre,
          marginPercentage: recommendedTPS.heatLoadMargin.marginPercentage,
        },
      },
    },
    thermalHistory,
    tpsComparison,
    trajectory,
    vehicle: inputs.vehicle,
  };
}
