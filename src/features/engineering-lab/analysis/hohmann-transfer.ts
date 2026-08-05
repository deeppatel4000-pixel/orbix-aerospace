import {
  calculateHohmannTransfer,
  calculateOrbitalElements,
} from "@/features/engineering-lab/calculators";
import type {
  HohmannTransferAnalysisInputs,
  HohmannTransferAnalysisResult,
} from "@/features/engineering-lab/types";

/**
 * Resolves two circular orbits from altitude and orchestrates their ideal
 * two-impulse Hohmann transfer. All physics and numerical validation remain in
 * the underlying calculators.
 */
export function analyzeHohmannTransfer(
  inputs: HohmannTransferAnalysisInputs,
): HohmannTransferAnalysisResult {
  const initialOrbitElements = calculateOrbitalElements({
    altitudeMetres: inputs.initialAltitudeMetres,
    gravitationalParameter: inputs.gravitationalParameter,
    planetRadiusMetres: inputs.planetRadiusMetres,
  });
  const finalOrbitElements = calculateOrbitalElements({
    altitudeMetres: inputs.finalAltitudeMetres,
    gravitationalParameter: inputs.gravitationalParameter,
    planetRadiusMetres: inputs.planetRadiusMetres,
  });
  const transfer = calculateHohmannTransfer({
    finalOrbitRadiusMetres: finalOrbitElements.orbitalRadiusMetres,
    gravitationalParameter:
      initialOrbitElements.resolvedConstants
        .gravitationalParameterCubicMetresPerSecondSquared,
    initialOrbitRadiusMetres: initialOrbitElements.orbitalRadiusMetres,
  });

  return {
    finalOrbit: {
      altitudeMetres: inputs.finalAltitudeMetres,
      circularVelocityMetresPerSecond:
        finalOrbitElements.orbitalVelocityMetresPerSecond,
      orbitalRadiusMetres: finalOrbitElements.orbitalRadiusMetres,
    },
    initialOrbit: {
      altitudeMetres: inputs.initialAltitudeMetres,
      circularVelocityMetresPerSecond:
        initialOrbitElements.orbitalVelocityMetresPerSecond,
      orbitalRadiusMetres: initialOrbitElements.orbitalRadiusMetres,
    },
    resolved: {
      gravitationalParameter: transfer.resolvedGravitationalParameter,
      planetRadiusMetres:
        initialOrbitElements.resolvedConstants.planetRadiusMetres,
    },
    transfer: {
      firstBurnDeltaVMetresPerSecond: transfer.firstBurnDeltaVMetresPerSecond,
      secondBurnDeltaVMetresPerSecond: transfer.secondBurnDeltaVMetresPerSecond,
      totalDeltaVMetresPerSecond: transfer.totalDeltaVMetresPerSecond,
      transferSemiMajorAxisMetres: transfer.transferSemiMajorAxisMetres,
      transferTimeHours: transfer.transferTimeHours,
      transferTimeSeconds: transfer.transferTimeSeconds,
    },
  };
}
