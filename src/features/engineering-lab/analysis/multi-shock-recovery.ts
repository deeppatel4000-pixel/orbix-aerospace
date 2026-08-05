import {
  calculateNormalShock,
  calculateObliqueShock,
  calculateTotalPressureRecovery,
} from "@/features/engineering-lab/calculators";
import type {
  MultiShockRecoveryAnalysis,
  MultiShockRecoveryInputs,
  MultiShockRecoveryShockResult,
} from "@/features/engineering-lab/types";
import { assertValidAtmosphereInputs } from "@/features/engineering-lab/utils";

const DEGREES_TO_RADIANS = Math.PI / 180;

export function analyzeMultiShockRecovery(
  inputs: MultiShockRecoveryInputs,
): MultiShockRecoveryAnalysis {
  if (inputs.altitudeMeters !== undefined) {
    assertValidAtmosphereInputs({
      altitudeMetres: inputs.altitudeMeters,
    });
  }

  if (inputs.shocks.length === 0) {
    throw new RangeError("At least one shock is required.");
  }

  const optionalGamma =
    inputs.gamma === undefined ? {} : { gamma: inputs.gamma };
  const shockResults: MultiShockRecoveryShockResult[] = [];
  let currentMach = inputs.upstreamMach;
  let cumulativeRecovery = 1;

  for (const shockElement of inputs.shocks) {
    if (shockElement.type === "normal") {
      const shock = calculateNormalShock({
        ...optionalGamma,
        machNumber: currentMach,
      });
      const recovery = calculateTotalPressureRecovery({
        ...optionalGamma,
        machNumber: shock.upstreamMach,
      });

      cumulativeRecovery *= recovery.pressureRecoveryRatio;
      shockResults.push({
        cumulativeRecoveryRatio: cumulativeRecovery,
        downstreamMach: shock.downstreamMach,
        pressureRecoveryRatio: recovery.pressureRecoveryRatio,
        shockType: "normal",
        upstreamMach: shock.upstreamMach,
      });
      currentMach = shock.downstreamMach;
      continue;
    }

    const shock = calculateObliqueShock({
      ...optionalGamma,
      deflectionAngleDegrees: shockElement.deflectionAngleDegrees,
      machNumber: currentMach,
    });
    const normalMachComponent =
      shock.upstreamMach *
      Math.sin(shock.shockAngleDegrees * DEGREES_TO_RADIANS);
    const recovery = calculateTotalPressureRecovery({
      ...optionalGamma,
      machNumber: normalMachComponent,
    });

    cumulativeRecovery *= recovery.pressureRecoveryRatio;
    shockResults.push({
      cumulativeRecoveryRatio: cumulativeRecovery,
      downstreamMach: shock.downstreamMach,
      normalMachComponent,
      pressureRecoveryRatio: recovery.pressureRecoveryRatio,
      shockAngleDegrees: shock.shockAngleDegrees,
      shockType: "oblique",
      upstreamMach: shock.upstreamMach,
    });
    currentMach = shock.downstreamMach;
  }

  return {
    finalMach: currentMach,
    numberOfShocks: shockResults.length,
    shockResults,
    totalPressureLossPercentage: (1 - cumulativeRecovery) * 100,
    totalPressureRecoveryRatio: cumulativeRecovery,
    upstreamMach: inputs.upstreamMach,
  };
}
