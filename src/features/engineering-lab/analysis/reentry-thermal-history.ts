import { calculateStagnationHeating } from "@/features/engineering-lab/calculators";
import type {
  ReentryThermalHistoryAnalysis,
  ReentryThermalHistoryInputs,
  ReentryThermalPoint,
  ReentryTrajectoryInputs,
  ReentryTrajectoryPoint,
} from "@/features/engineering-lab/types";

import { analyzeReentryTrajectory } from "./reentry-trajectory";

const JOULES_PER_MEGAJOULE = 1_000_000;

function buildTrajectoryInputs(
  inputs: ReentryThermalHistoryInputs,
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
    dragCoefficient: inputs.dragCoefficient,
    initialAltitudeMeters: inputs.initialAltitudeMeters,
    initialVelocityMetersPerSecond: inputs.initialVelocityMetersPerSecond,
    referenceAreaSquareMetres: inputs.referenceAreaSquareMetres,
    vehicleMassKilograms: inputs.vehicleMassKilograms,
  };
}

function calculateThermalPoint(
  point: ReentryTrajectoryPoint,
  inputs: ReentryThermalHistoryInputs,
): ReentryThermalPoint {
  if (point.velocityMetersPerSecond === 0) {
    return {
      altitudeMeters: point.altitudeMeters,
      densityKilogramsPerCubicMetre: point.densityKilogramsPerCubicMetre,
      heatFluxKilowattsPerSquareMetre: 0,
      heatFluxWattsPerSquareMetre: 0,
      timeSeconds: point.timeSeconds,
      velocityMetersPerSecond: 0,
    };
  }

  const optionalHeatingCoefficient =
    inputs.heatingCoefficient === undefined
      ? {}
      : { heatingCoefficient: inputs.heatingCoefficient };
  const heating = calculateStagnationHeating({
    ...optionalHeatingCoefficient,
    atmosphericDensityKilogramsPerCubicMetre:
      point.densityKilogramsPerCubicMetre,
    noseRadiusMetres: inputs.noseRadiusMetres,
    velocityMetresPerSecond: point.velocityMetersPerSecond,
  });

  return {
    altitudeMeters: point.altitudeMeters,
    densityKilogramsPerCubicMetre: point.densityKilogramsPerCubicMetre,
    heatFluxKilowattsPerSquareMetre: heating.heatFluxKilowattsPerSquareMetre,
    heatFluxWattsPerSquareMetre: heating.heatFluxWattsPerSquareMetre,
    timeSeconds: point.timeSeconds,
    velocityMetersPerSecond: point.velocityMetersPerSecond,
  };
}

function estimateTotalHeatLoad(
  thermalPoints: readonly ReentryThermalPoint[],
): number {
  let heatLoadJoulesPerSquareMetre = 0;

  for (let index = 1; index < thermalPoints.length; index += 1) {
    const previousPoint = thermalPoints[index - 1];
    const currentPoint = thermalPoints[index];

    if (!previousPoint || !currentPoint) continue;

    const elapsedSeconds = currentPoint.timeSeconds - previousPoint.timeSeconds;
    heatLoadJoulesPerSquareMetre +=
      previousPoint.heatFluxWattsPerSquareMetre * elapsedSeconds;
  }

  return heatLoadJoulesPerSquareMetre;
}

/**
 * Couples the existing trajectory timeline to the existing stagnation-heating
 * calculator. Heat load uses left-endpoint rectangular integration over the
 * actual time delta between trajectory points.
 */
export function analyzeReentryThermalHistory(
  inputs: ReentryThermalHistoryInputs,
): ReentryThermalHistoryAnalysis {
  const trajectory = analyzeReentryTrajectory(buildTrajectoryInputs(inputs));
  const thermalPoints = trajectory.trajectoryPoints.map((point) =>
    calculateThermalPoint(point, inputs),
  );
  const firstThermalPoint = thermalPoints[0];

  if (!firstThermalPoint) {
    throw new Error("Reentry thermal history requires a trajectory point.");
  }

  let peakHeatFlux = firstThermalPoint;

  for (const point of thermalPoints) {
    if (
      point.heatFluxWattsPerSquareMetre >
      peakHeatFlux.heatFluxWattsPerSquareMetre
    ) {
      peakHeatFlux = point;
    }
  }

  const heatLoadJoulesPerSquareMetre = estimateTotalHeatLoad(thermalPoints);

  return {
    peakHeatFlux,
    peakHeatFluxLocation: {
      altitudeMeters: peakHeatFlux.altitudeMeters,
      timeSeconds: peakHeatFlux.timeSeconds,
      velocityMetersPerSecond: peakHeatFlux.velocityMetersPerSecond,
    },
    thermalPoints,
    totalHeatLoadEstimate: {
      heatLoadJoulesPerSquareMetre,
      heatLoadMegajoulesPerSquareMetre:
        heatLoadJoulesPerSquareMetre / JOULES_PER_MEGAJOULE,
    },
    trajectory,
  };
}
