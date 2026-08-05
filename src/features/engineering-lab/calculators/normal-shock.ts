import type {
  NormalShockAnalysis,
  NormalShockInputs,
} from "@/features/engineering-lab/types";
import { assertValidNormalShockInputs } from "@/features/engineering-lab/utils";

import { RATIO_OF_SPECIFIC_HEATS_FOR_DRY_AIR } from "./atmosphere";

export const DEFAULT_NORMAL_SHOCK_GAMMA = RATIO_OF_SPECIFIC_HEATS_FOR_DRY_AIR;

export function calculateNormalShock(
  inputs: NormalShockInputs,
): NormalShockAnalysis {
  assertValidNormalShockInputs(inputs);

  const upstreamMach = inputs.machNumber;
  const gamma = inputs.gamma ?? DEFAULT_NORMAL_SHOCK_GAMMA;
  const upstreamMachSquared = upstreamMach ** 2;
  const halfGammaDifference = (gamma - 1) / 2;
  const downstreamMach = Math.sqrt(
    (1 + halfGammaDifference * upstreamMachSquared) /
      (gamma * upstreamMachSquared - halfGammaDifference),
  );
  const pressureRatio =
    1 + ((2 * gamma) / (gamma + 1)) * (upstreamMachSquared - 1);
  const densityRatio =
    ((gamma + 1) * upstreamMachSquared) /
    ((gamma - 1) * upstreamMachSquared + 2);
  const temperatureRatio = pressureRatio / densityRatio;

  return {
    densityRatio,
    downstreamMach,
    pressureRatio,
    temperatureRatio,
    upstreamMach,
  };
}
