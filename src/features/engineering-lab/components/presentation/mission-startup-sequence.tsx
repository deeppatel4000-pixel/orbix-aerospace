import type { ReactNode } from "react";

import type {
  MissionPresetCategory,
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

import { StartupCheckList, type StartupCheckItem } from "./startup-check-list";

export interface MissionStartupSequenceProps {
  readonly children?: ReactNode;
  /** Accepted for existing callers; the mission header shows the category. */
  readonly missionCategory?: MissionPresetCategory;
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

/**
 * The data checks for a mission workspace: which completed analyses were
 * supplied. Mission control renders it at the foot of its header, under the
 * mission's name and identity row, so name and category are not repeated.
 *
 * This used to be a timed "startup sequence" overlay that implied live
 * systems coming online. Per spec 15.4 the animation and framing are gone;
 * what remains is the real information it carried.
 */
export function MissionStartupSequence({
  children,
  missionProfileAnalysis,
  missionReport,
  vehicleReentryEvaluation,
}: MissionStartupSequenceProps) {
  const checks: readonly StartupCheckItem[] = [
    {
      available: Boolean(missionProfileAnalysis),
      id: "mission-profile",
      label: "Mission profile",
    },
    {
      available: Boolean(
        missionProfileAnalysis?.missionSummaryState.hasDeltaVBudget ||
        missionReport?.orbitalAnalysis,
      ),
      id: "orbital-systems",
      label: "Orbital analysis",
    },
    {
      available: Boolean(
        missionProfileAnalysis?.missionSummaryState
          .hasVehicleReentryEvaluation ||
        missionProfileAnalysis?.missionSummaryState.hasVehicleComparison ||
        missionReport?.vehicleAnalysis ||
        vehicleReentryEvaluation,
      ),
      id: "vehicle-data",
      label: "Vehicle analysis",
    },
    {
      available: Boolean(
        missionProfileAnalysis?.tpsRecommendation ||
        missionReport?.thermalAnalysis ||
        vehicleReentryEvaluation,
      ),
      id: "thermal-data",
      label: "Thermal analysis",
    },
    {
      available: Boolean(missionReport),
      id: "mission-report",
      label: "Mission report",
    },
  ];

  return (
    <>
      <section aria-labelledby="mission-checks-title" className="mt-6">
        <h4
          className="text-[0.9375rem] leading-6 font-semibold text-foreground"
          id="mission-checks-title"
        >
          Checks performed
        </h4>
        <p className="mt-1 text-sm leading-6 text-muted">
          Which completed analyses were supplied to this workspace. Nothing
          below is live data.
        </p>
        <StartupCheckList items={checks} />
      </section>

      {children}
    </>
  );
}
