import type {
  IsentropicFlowInputs,
  IsentropicFlowResult,
} from "@/features/engineering-lab/types";
import { assertValidIsentropicFlowInputs } from "@/features/engineering-lab/utils";

import { RATIO_OF_SPECIFIC_HEATS_FOR_DRY_AIR } from "./atmosphere";

export const DEFAULT_ISENTROPIC_FLOW_GAMMA =
  RATIO_OF_SPECIFIC_HEATS_FOR_DRY_AIR;

export function calculateIsentropicFlow(
  inputs: IsentropicFlowInputs,
): IsentropicFlowResult {
  assertValidIsentropicFlowInputs(inputs);

  const gamma = inputs.gamma ?? DEFAULT_ISENTROPIC_FLOW_GAMMA;
  const temperatureRatio = 1 + ((gamma - 1) / 2) * inputs.machNumber ** 2;
  const pressureRatio = Math.pow(temperatureRatio, gamma / (gamma - 1));
  const densityRatio = Math.pow(temperatureRatio, 1 / (gamma - 1));

  return {
    densityRatio,
    pressureRatio,
    temperatureRatio,
  };
}
