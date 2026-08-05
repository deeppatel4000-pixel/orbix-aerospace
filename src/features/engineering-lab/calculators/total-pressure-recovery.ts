import type {
  TotalPressureRecoveryInputs,
  TotalPressureRecoveryResult,
} from "@/features/engineering-lab/types";
import { assertValidNormalShockInputs } from "@/features/engineering-lab/utils";

import { DEFAULT_NORMAL_SHOCK_GAMMA } from "./normal-shock";

export const DEFAULT_TOTAL_PRESSURE_RECOVERY_GAMMA = DEFAULT_NORMAL_SHOCK_GAMMA;

export function calculateTotalPressureRecovery(
  inputs: TotalPressureRecoveryInputs,
): TotalPressureRecoveryResult {
  assertValidNormalShockInputs(inputs);

  const upstreamMach = inputs.machNumber;
  const gamma = inputs.gamma ?? DEFAULT_TOTAL_PRESSURE_RECOVERY_GAMMA;
  const upstreamMachSquared = upstreamMach ** 2;
  const compressionFactor =
    ((gamma + 1) * upstreamMachSquared) /
    ((gamma - 1) * upstreamMachSquared + 2);
  const shockStrengthFactor =
    (gamma + 1) / (2 * gamma * upstreamMachSquared - (gamma - 1));
  const pressureRecoveryRatio =
    compressionFactor ** (gamma / (gamma - 1)) *
    shockStrengthFactor ** (1 / (gamma - 1));
  const pressureLossPercentage = (1 - pressureRecoveryRatio) * 100;

  return {
    gamma,
    pressureLossPercentage,
    pressureRecoveryRatio,
    upstreamMach,
  };
}
