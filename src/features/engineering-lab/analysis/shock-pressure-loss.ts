import {
  calculateNormalShock,
  calculateObliqueShock,
  calculateTotalPressureRecovery,
} from "@/features/engineering-lab/calculators";
import type {
  ShockPressureLossAnalysis,
  ShockPressureLossInputs,
} from "@/features/engineering-lab/types";
import { assertValidAtmosphereInputs } from "@/features/engineering-lab/utils";

const DEGREES_TO_RADIANS = Math.PI / 180;

export function analyzeShockPressureLoss(
  inputs: ShockPressureLossInputs,
): ShockPressureLossAnalysis {
  if (inputs.altitudeMeters !== undefined) {
    assertValidAtmosphereInputs({
      altitudeMetres: inputs.altitudeMeters,
    });
  }

  if (inputs.shockType === "normal") {
    const shock = calculateNormalShock({ machNumber: inputs.machNumber });
    const recovery = calculateTotalPressureRecovery({
      machNumber: shock.upstreamMach,
    });

    return {
      downstreamMach: shock.downstreamMach,
      pressureLossPercentage: recovery.pressureLossPercentage,
      pressureRecoveryRatio: recovery.pressureRecoveryRatio,
      shockType: "normal",
      upstreamMach: shock.upstreamMach,
    };
  }

  const shock = calculateObliqueShock({
    deflectionAngleDegrees: inputs.deflectionAngleDegrees,
    machNumber: inputs.machNumber,
  });
  const normalMachComponent =
    shock.upstreamMach * Math.sin(shock.shockAngleDegrees * DEGREES_TO_RADIANS);
  const recovery = calculateTotalPressureRecovery({
    machNumber: normalMachComponent,
  });

  return {
    downstreamMach: shock.downstreamMach,
    normalMachComponent,
    pressureLossPercentage: recovery.pressureLossPercentage,
    pressureRecoveryRatio: recovery.pressureRecoveryRatio,
    shockAngleDegrees: shock.shockAngleDegrees,
    shockType: "oblique",
    upstreamMach: shock.upstreamMach,
  };
}
