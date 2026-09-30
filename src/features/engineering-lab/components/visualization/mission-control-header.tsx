import type { ReactNode } from "react";

import { MissionIdentity } from "./mission-identity";
import type {
  MissionPreset,
  MissionPresetCategory,
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

export interface MissionControlHeaderProps {
  /** Shown under the identity row: the supplied-analyses checklist. */
  readonly children?: ReactNode;
  /** Accepted for existing callers; the tabs already name the workspace. */
  readonly currentWorkspace?: string;
  readonly missionCategory?: MissionPresetCategory;
  readonly missionPreset?: MissionPreset;
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
}

/**
 * One header for the loaded mission: its name, the one-line description, a
 * category label, a hairline row of preset and analyses resolved, then the
 * checklist of supplied analyses. None of it is repeated further down.
 */
export function MissionControlHeader({
  children,
  missionCategory,
  missionPreset,
  missionProfileAnalysis,
  missionReport,
}: MissionControlHeaderProps) {
  const missionName =
    missionReport?.missionSummary.missionName ??
    missionProfileAnalysis?.missionName ??
    "Mission profile unavailable";
  const missionDescription =
    missionReport?.missionSummary.description ??
    "Load a completed mission to fill this workspace.";
  const analysesResolved =
    missionProfileAnalysis?.missionSummaryState.analysesResolved;

  return (
    <MissionIdentity
      category={missionCategory}
      className="pb-6"
      headingId="mission-control-dashboard-title"
      level={3}
      missionName={missionName}
    >
      <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
        {missionDescription}
      </p>

      {/* One hairline row; a vertical rule splits the cells on wider
       * columns. The category is the label above the name. The preset cell
       * shows only when the mission came from a preset: a lab example or
       * custom mission would otherwise read as a missing value. */}
      <dl
        className={
          missionPreset
            ? "mt-4 grid border-y border-border-subtle text-sm sm:grid-cols-2 sm:divide-x sm:divide-border-subtle"
            : "mt-4 grid border-y border-border-subtle text-sm"
        }
      >
        {missionPreset ? (
          <div className="min-w-0 border-b border-border-subtle py-2 sm:border-b-0 sm:pr-4">
            <dt className="text-muted">Mission preset</dt>
            <dd className="mt-0.5 break-words text-foreground">
              {missionPreset.name}
            </dd>
          </div>
        ) : null}
        <div
          className={missionPreset ? "min-w-0 py-2 sm:pl-4" : "min-w-0 py-2"}
        >
          <dt className="text-muted">Analyses resolved</dt>
          <dd
            className={
              analysesResolved === undefined
                ? "mt-0.5 text-muted"
                : "orbix-data mt-0.5 text-foreground"
            }
          >
            {analysesResolved ?? "Not reported"}
          </dd>
        </div>
      </dl>

      {children}
    </MissionIdentity>
  );
}
