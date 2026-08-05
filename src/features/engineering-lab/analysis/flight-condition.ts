import {
  calculateDragEquation,
  calculateDynamicPressure,
  calculateLiftEquation,
  calculateMachNumber,
  calculateStandardAtmosphere,
} from "@/features/engineering-lab/calculators";
import type {
  FlightConditionAnalysis,
  FlightConditionInputs,
} from "@/features/engineering-lab/types";
import { assertValidFlightConditionInputs } from "@/features/engineering-lab/utils";

export function analyzeFlightCondition(
  inputs: FlightConditionInputs,
): FlightConditionAnalysis {
  assertValidFlightConditionInputs(inputs);

  const atmosphere = calculateStandardAtmosphere({
    altitudeMetres: inputs.altitudeMetres,
  });
  const flight = calculateMachNumber({
    speedOfSoundMetersPerSecond: atmosphere.speedOfSoundMetersPerSecond,
    velocityMetresPerSecond: inputs.velocityMetresPerSecond,
  });
  const aerodynamicState = {
    airDensityKilogramsPerCubicMetre: atmosphere.densityKilogramsPerCubicMetre,
    velocityMetresPerSecond: inputs.velocityMetresPerSecond,
  };
  const { dynamicPressurePascals } = calculateDynamicPressure(aerodynamicState);
  const { liftForceNewtons } = calculateLiftEquation({
    ...aerodynamicState,
    liftCoefficient: inputs.liftCoefficient,
    wingAreaSquareMetres: inputs.wingAreaSquareMetres,
  });
  const { dragForceNewtons } = calculateDragEquation({
    ...aerodynamicState,
    dragCoefficient: inputs.dragCoefficient,
    referenceAreaSquareMetres: inputs.wingAreaSquareMetres,
  });

  return {
    aerodynamics: {
      dragForceNewtons,
      dynamicPressurePascals,
      liftForceNewtons,
    },
    atmosphere,
    flight,
    performance: {
      liftToDragRatio: liftForceNewtons / dragForceNewtons,
    },
  };
}
