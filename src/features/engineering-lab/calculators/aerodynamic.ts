import type {
  DynamicPressureInputs,
  DynamicPressureResult,
} from "@/features/engineering-lab/types";
import { assertValidDynamicPressureInputs } from "@/features/engineering-lab/utils";

export function calculateDynamicPressure(
  inputs: DynamicPressureInputs,
): DynamicPressureResult {
  assertValidDynamicPressureInputs(inputs);

  const dynamicPressurePascals =
    0.5 *
    inputs.airDensityKilogramsPerCubicMetre *
    inputs.velocityMetresPerSecond ** 2;

  return { dynamicPressurePascals };
}
