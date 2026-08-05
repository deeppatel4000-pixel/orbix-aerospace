import type {
  DeltaVBudgetAnalysis,
  DeltaVBudgetInputs,
  DeltaVBudgetManeuver,
  HohmannTransferAnalysisResult,
  OrbitalPlaneChangeAnalysisResult,
} from "@/features/engineering-lab/types";

import { analyzeHohmannTransfer } from "./hohmann-transfer";
import { analyzeOrbitalPlaneChange } from "./orbital-plane-change";

const HOHMANN_TRANSFER_MANEUVER = {
  id: "hohmann-transfer",
  name: "Hohmann transfer",
} as const;

const ORBITAL_PLANE_CHANGE_MANEUVER = {
  id: "orbital-plane-change",
  name: "Orbital plane change",
} as const;

/**
 * Builds an ordered mission delta-v ledger from caller-supplied maneuvers and
 * optional existing orbital analyses. Source analyses retain ownership of all
 * orbital physics and numerical validation.
 */
export function analyzeDeltaVBudget(
  inputs: DeltaVBudgetInputs,
): DeltaVBudgetAnalysis {
  if (inputs.missionName.trim().length === 0) {
    throw new RangeError("Mission name must not be empty.");
  }

  const maneuvers: DeltaVBudgetManeuver[] = [...(inputs.maneuvers ?? [])];
  let hohmannTransfer: HohmannTransferAnalysisResult | undefined;
  let orbitalPlaneChange: OrbitalPlaneChangeAnalysisResult | undefined;

  if (inputs.hohmannTransfer !== undefined) {
    hohmannTransfer = analyzeHohmannTransfer(inputs.hohmannTransfer);
    maneuvers.push({
      ...HOHMANN_TRANSFER_MANEUVER,
      deltaVMetresPerSecond:
        hohmannTransfer.transfer.totalDeltaVMetresPerSecond,
    });
  }

  if (inputs.orbitalPlaneChange !== undefined) {
    orbitalPlaneChange = analyzeOrbitalPlaneChange(inputs.orbitalPlaneChange);
    maneuvers.push({
      ...ORBITAL_PLANE_CHANGE_MANEUVER,
      deltaVMetresPerSecond: orbitalPlaneChange.deltaVMetresPerSecond,
    });
  }

  let largestDeltaVContributor: DeltaVBudgetManeuver | null = null;
  let totalDeltaVMetresPerSecond = 0;

  for (const maneuver of maneuvers) {
    totalDeltaVMetresPerSecond += maneuver.deltaVMetresPerSecond;

    if (
      largestDeltaVContributor === null ||
      maneuver.deltaVMetresPerSecond >
        largestDeltaVContributor.deltaVMetresPerSecond
    ) {
      largestDeltaVContributor = maneuver;
    }
  }

  return {
    largestDeltaVContributor,
    maneuvers,
    missionName: inputs.missionName,
    numberOfManeuvers: maneuvers.length,
    sourceAnalyses: {
      ...(hohmannTransfer === undefined ? {} : { hohmannTransfer }),
      ...(orbitalPlaneChange === undefined ? {} : { orbitalPlaneChange }),
    },
    totalDeltaVMetresPerSecond,
  };
}
