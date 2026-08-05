import {
  calculateNormalShock,
  calculateTotalPressureRecovery,
} from "@/features/engineering-lab/calculators";
import type {
  InletCompressionAnalysis,
  InletCompressionInputs,
} from "@/features/engineering-lab/types";

import { analyzeMultiShockRecovery } from "./multi-shock-recovery";

export function analyzeInletCompression(
  inputs: InletCompressionInputs,
): InletCompressionAnalysis {
  const optionalAltitude =
    inputs.altitudeMeters === undefined
      ? {}
      : { altitudeMeters: inputs.altitudeMeters };
  const optionalGamma =
    inputs.gamma === undefined ? {} : { gamma: inputs.gamma };
  const externalCompression = analyzeMultiShockRecovery({
    ...optionalAltitude,
    ...optionalGamma,
    shocks: inputs.externalShocks,
    upstreamMach: inputs.initialMach,
  });
  const machBeforeTerminalShock = externalCompression.finalMach;

  if (machBeforeTerminalShock <= 1) {
    throw new RangeError(
      "Terminal normal shock requires a supersonic pre-shock Mach number greater than 1.",
    );
  }

  const terminalShock = calculateNormalShock({
    ...optionalGamma,
    machNumber: machBeforeTerminalShock,
  });
  const terminalRecovery = calculateTotalPressureRecovery({
    ...optionalGamma,
    machNumber: terminalShock.upstreamMach,
  });
  const externalPressureRecoveryRatio =
    externalCompression.totalPressureRecoveryRatio;
  const terminalShockPressureRecoveryRatio =
    terminalRecovery.pressureRecoveryRatio;

  return {
    externalPressureRecoveryRatio,
    externalShockStages: externalCompression.shockResults,
    finalExitMach: terminalShock.downstreamMach,
    initialMach: inputs.initialMach,
    machBeforeTerminalShock,
    overallPressureRecoveryRatio:
      externalPressureRecoveryRatio * terminalShockPressureRecoveryRatio,
    terminalShock,
    terminalShockPressureRecoveryRatio,
  };
}
