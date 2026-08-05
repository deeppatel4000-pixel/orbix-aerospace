import {
  calculateOrbitalElements,
  calculateOrbitalPlaneChange,
} from "@/features/engineering-lab/calculators";
import type {
  OrbitalPlaneChangeAnalysisInputs,
  OrbitalPlaneChangeAnalysisResult,
} from "@/features/engineering-lab/types";

/**
 * Resolves a circular orbit from altitude and applies an ideal impulsive plane
 * change at that orbit's circular velocity. The calculators retain ownership
 * of all physics and numerical validation.
 */
export function analyzeOrbitalPlaneChange(
  inputs: OrbitalPlaneChangeAnalysisInputs,
): OrbitalPlaneChangeAnalysisResult {
  const orbitalElements = calculateOrbitalElements({
    altitudeMetres: inputs.orbitalAltitudeMetres,
    gravitationalParameter: inputs.gravitationalParameter,
    planetRadiusMetres: inputs.planetRadiusMetres,
  });
  const planeChange = calculateOrbitalPlaneChange({
    inclinationChangeDegrees: inputs.inclinationChangeDegrees,
    orbitalVelocityMetresPerSecond:
      orbitalElements.orbitalVelocityMetresPerSecond,
  });

  return {
    deltaVMetresPerSecond: planeChange.deltaVMetresPerSecond,
    inclinationChangeDegrees: planeChange.inclinationChangeDegrees,
    inclinationChangeRadians: planeChange.inclinationChangeRadians,
    orbitalElements,
    orbitalRadiusMetres: orbitalElements.orbitalRadiusMetres,
    orbitalVelocityMetresPerSecond:
      orbitalElements.orbitalVelocityMetresPerSecond,
    planeChange,
  };
}
