import type { ReactNode } from "react";

import type {
  MissionPresetCategory,
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

interface SourceCheck {
  readonly available: boolean;
  readonly id: string;
  readonly label: string;
}

/** "a", "a and b", "a, b and c". */
function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/**
 * One sentence naming what the workspace was built from, and what was not
 * supplied. It replaces a five-row list of check icons that never changed
 * on this page and read as status chrome (spec 2).
 */
export function describeMissionSources(checks: readonly SourceCheck[]): string {
  const byId = (id: string) => checks.find((check) => check.id === id);
  const analyses = ["orbital-systems", "vehicle-data", "thermal-data"]
    .map(byId)
    .filter((check): check is SourceCheck => check !== undefined);
  const suppliedAnalyses = analyses
    .filter((check) => check.available)
    .map((check) => check.label);
  const parts = [
    byId("mission-profile")?.available ? "the mission profile" : null,
    suppliedAnalyses.length > 0
      ? `the ${joinList(suppliedAnalyses)} ${
          suppliedAnalyses.length === 1 ? "analysis" : "analyses"
        }`
      : null,
    byId("mission-report")?.available ? "the mission report" : null,
  ].filter((part): part is string => part !== null);
  const missing = checks
    .filter((check) => !check.available)
    .map((check) =>
      analyses.includes(check) ? `${check.label} analysis` : check.label,
    );

  if (parts.length === 0) {
    return "No completed analysis has been supplied to this workspace yet.";
  }
  const built = `Built from ${parts.length > 2 ? parts.slice(0, -1).join(", ") + ", and " + parts.at(-1) : parts.join(" and ")}.`;
  return missing.length > 0
    ? `${built} Not supplied: ${joinList(missing)}.`
    : built;
}

export interface MissionStartupSequenceProps {
  readonly children?: ReactNode;
  /** Accepted for existing callers; the mission header shows the category. */
  readonly missionCategory?: MissionPresetCategory;
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

/**
 * The sources of a mission workspace: which completed analyses were
 * supplied, as one sentence. Mission control renders it at the foot of its header, under the
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
  const checks: readonly SourceCheck[] = [
    {
      available: Boolean(missionProfileAnalysis),
      id: "mission-profile",
      label: "mission profile",
    },
    {
      available: Boolean(
        missionProfileAnalysis?.missionSummaryState.hasDeltaVBudget ||
        missionReport?.orbitalAnalysis,
      ),
      id: "orbital-systems",
      label: "orbital",
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
      label: "vehicle",
    },
    {
      available: Boolean(
        missionProfileAnalysis?.tpsRecommendation ||
        missionReport?.thermalAnalysis ||
        vehicleReentryEvaluation,
      ),
      id: "thermal-data",
      label: "thermal",
    },
    {
      available: Boolean(missionReport),
      id: "mission-report",
      label: "mission report",
    },
  ];

  return (
    <>
      <p
        className="mt-6 max-w-[68ch] text-sm leading-6 text-muted"
        data-mission-sources=""
      >
        {describeMissionSources(checks)}
      </p>

      {children}
    </>
  );
}
