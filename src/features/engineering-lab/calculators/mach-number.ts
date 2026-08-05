import type {
  FlowRegime,
  MachNumberInputs,
  MachNumberResult,
} from "@/features/engineering-lab/types";
import { assertValidMachNumberInputs } from "@/features/engineering-lab/utils";

export function classifyMachNumber(machNumber: number): FlowRegime {
  if (!Number.isFinite(machNumber) || machNumber < 0) {
    throw new RangeError("Mach number must be a finite, non-negative number.");
  }

  if (machNumber < 0.8) return "subsonic";
  if (machNumber < 1.2) return "transonic";
  if (machNumber < 5) return "supersonic";
  return "hypersonic";
}

export function calculateMachNumber(
  inputs: MachNumberInputs,
): MachNumberResult {
  assertValidMachNumberInputs(inputs);

  const machNumber =
    inputs.velocityMetresPerSecond / inputs.speedOfSoundMetersPerSecond;

  return {
    flowRegime: classifyMachNumber(machNumber),
    machNumber,
  };
}
