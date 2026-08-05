import {
  calculateOrbitalElements,
  calculateOrbitalPlaneChange,
} from "@/features/engineering-lab/calculators";
import type {
  HohmannTransferAnalysisResult,
  OrbitalTransferPlaneChangeAnalysis,
  OrbitalTransferPlaneChangeInputs,
} from "@/features/engineering-lab/types";

import { analyzeHohmannTransfer } from "./hohmann-transfer";

function analyzeNoTransferOrbit(
  inputs: OrbitalTransferPlaneChangeInputs,
): HohmannTransferAnalysisResult {
  const orbitalElements = calculateOrbitalElements({
    altitudeMetres: inputs.initialAltitudeMetres,
    gravitationalParameter: inputs.gravitationalParameter,
    planetRadiusMetres: inputs.planetRadiusMetres,
  });
  const circularOrbit = {
    altitudeMetres: inputs.initialAltitudeMetres,
    circularVelocityMetresPerSecond:
      orbitalElements.orbitalVelocityMetresPerSecond,
    orbitalRadiusMetres: orbitalElements.orbitalRadiusMetres,
  };

  return {
    finalOrbit: circularOrbit,
    initialOrbit: circularOrbit,
    resolved: {
      gravitationalParameter:
        orbitalElements.resolvedConstants
          .gravitationalParameterCubicMetresPerSecondSquared,
      planetRadiusMetres: orbitalElements.resolvedConstants.planetRadiusMetres,
    },
    transfer: {
      firstBurnDeltaVMetresPerSecond: 0,
      secondBurnDeltaVMetresPerSecond: 0,
      totalDeltaVMetresPerSecond: 0,
      transferSemiMajorAxisMetres: orbitalElements.orbitalRadiusMetres,
      transferTimeHours: 0,
      transferTimeSeconds: 0,
    },
  };
}

function resolveTransfer(
  inputs: OrbitalTransferPlaneChangeInputs,
): HohmannTransferAnalysisResult {
  if (inputs.initialAltitudeMetres === inputs.finalAltitudeMetres) {
    return analyzeNoTransferOrbit(inputs);
  }

  return analyzeHohmannTransfer({
    finalAltitudeMetres: inputs.finalAltitudeMetres,
    gravitationalParameter: inputs.gravitationalParameter,
    initialAltitudeMetres: inputs.initialAltitudeMetres,
    planetRadiusMetres: inputs.planetRadiusMetres,
  });
}

/**
 * Models an ideal Hohmann transfer followed by a separate impulsive plane
 * change at final circular-orbit velocity. Delta-v values are added as a
 * sequential mission budget; burns are not combined vectorially.
 */
export function analyzeOrbitalTransferPlaneChange(
  inputs: OrbitalTransferPlaneChangeInputs,
): OrbitalTransferPlaneChangeAnalysis {
  const hohmannTransfer = resolveTransfer(inputs);
  const finalOrbitVelocityMetresPerSecond =
    hohmannTransfer.finalOrbit.circularVelocityMetresPerSecond;
  const planeChange = calculateOrbitalPlaneChange({
    inclinationChangeDegrees: inputs.inclinationChangeDegrees,
    orbitalVelocityMetresPerSecond: finalOrbitVelocityMetresPerSecond,
  });
  const transferDeltaVMetresPerSecond =
    hohmannTransfer.transfer.totalDeltaVMetresPerSecond;
  const planeChangeDeltaVMetresPerSecond = planeChange.deltaVMetresPerSecond;

  return {
    finalOrbitVelocityMetresPerSecond,
    hohmannTransfer,
    planeChange,
    planeChangeDeltaVMetresPerSecond,
    totalDeltaVMetresPerSecond:
      transferDeltaVMetresPerSecond + planeChangeDeltaVMetresPerSecond,
    transferDeltaVMetresPerSecond,
  };
}
