import type { ReactNode } from "react";

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

const categoryLabels: Readonly<Record<MissionPresetCategory, string>> = {
  "deep-space-concept": "Deep-space concept",
  "lunar-transfer": "Lunar transfer",
  "orbital-deployment": "Orbital deployment",
  "orbital-logistics": "Orbital logistics",
  "reentry-demonstration": "Reentry demonstration",
};

/**
 * One header for the loaded mission: its name, the one-line description, a
 * single hairline row of category, preset and analyses resolved, then the
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
    <header className="border-b border-border-subtle pb-6">
      <p className="orbix-label">Mission control, educational simulation</p>
      <h3
        className="orbix-h3 mt-1 text-foreground"
        id="mission-control-dashboard-title"
      >
        {missionName}
      </h3>
      <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
        {missionDescription}
      </p>

      {/* One hairline row; vertical rules split the cells on wider columns. */}
      <dl className="mt-4 grid border-y border-border-subtle text-sm sm:grid-cols-3 sm:divide-x sm:divide-border-subtle">
        <div className="min-w-0 border-b border-border-subtle py-2 sm:border-b-0 sm:pr-4">
          <dt className="text-muted">Category</dt>
          <dd className="mt-0.5 text-foreground">
            {missionCategory ? categoryLabels[missionCategory] : "Not reported"}
          </dd>
        </div>
        <div className="min-w-0 border-b border-border-subtle py-2 sm:border-b-0 sm:px-4">
          <dt className="text-muted">Mission preset</dt>
          <dd className="mt-0.5 break-words text-foreground">
            {missionPreset?.name ?? "Not reported"}
          </dd>
        </div>
        <div className="min-w-0 py-2 sm:pl-4">
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
    </header>
  );
}
