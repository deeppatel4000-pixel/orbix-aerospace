import type { ReactNode } from "react";

import type {
  MissionPresetCategory,
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

import { StartupCheckList, type StartupCheckItem } from "./startup-check-list";

export interface MissionStartupSequenceProps {
  readonly children: ReactNode;
  readonly missionCategory?: MissionPresetCategory;
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

const categoryLabels: Readonly<Record<MissionPresetCategory, string>> = {
  "deep-space-concept": "Deep-space concept",
  "lunar-transfer": "Lunar transfer",
  "orbital-deployment": "Orbital deployment",
  "orbital-logistics": "Orbital logistics",
  "reentry-demonstration": "Reentry demonstration",
};

/**
 * The data checks for a mission workspace, shown statically above it.
 *
 * This used to be a timed "startup sequence" overlay that implied live
 * systems coming online. Per spec 15.4 the animation and framing are gone;
 * what remains is the real information it carried: which completed analyses
 * were supplied to the workspace below.
 */
export function MissionStartupSequence({
  children,
  missionCategory,
  missionProfileAnalysis,
  missionReport,
  vehicleReentryEvaluation,
}: MissionStartupSequenceProps) {
  const missionName =
    missionReport?.missionSummary.missionName ??
    missionProfileAnalysis?.missionName;
  const category = missionCategory
    ? categoryLabels[missionCategory]
    : undefined;
  const analysesResolved =
    missionProfileAnalysis?.missionSummaryState.analysesResolved;

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
    <div className="space-y-6">
      <section
        aria-labelledby="mission-checks-title"
        className="border-b border-border-subtle pb-6"
      >
        <h3 className="orbix-h4 text-foreground" id="mission-checks-title">
          Checks performed
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted">
          Which completed analyses were supplied to this workspace. Nothing
          below is live data.
        </p>
        <dl className="mt-3 grid gap-x-8 text-sm sm:grid-cols-3">
          <div className="border-t border-border-subtle py-2">
            <dt className="orbix-label">Mission</dt>
            <dd className="mt-1 text-foreground">
              {missionName ?? "Not reported"}
            </dd>
          </div>
          <div className="border-t border-border-subtle py-2">
            <dt className="orbix-label">Category</dt>
            <dd className="mt-1 text-foreground">
              {category ?? "Not reported"}
            </dd>
          </div>
          <div className="border-t border-border-subtle py-2">
            <dt className="orbix-label">Analyses resolved</dt>
            <dd
              className={
                analysesResolved === undefined
                  ? "mt-1 text-muted"
                  : "orbix-data mt-1 text-foreground"
              }
            >
              {analysesResolved ?? "Not reported"}
            </dd>
          </div>
        </dl>
        <StartupCheckList items={checks} />
      </section>

      {children}
    </div>
  );
}
