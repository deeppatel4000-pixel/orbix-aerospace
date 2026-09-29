import type { ReactNode } from "react";

import type {
  MissionPreset,
  MissionPresetCategory,
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

import { MissionControlHeader } from "./mission-control-header";
import {
  MISSION_CONTROL_WORKSPACES,
  MissionControlSidebar,
  type MissionControlWorkspaceView,
} from "./mission-control-sidebar";

export interface MissionControlShellProps {
  readonly activeWorkspace: MissionControlWorkspaceView;
  readonly children: ReactNode;
  /** Rendered at the foot of the mission header: the supplied checks. */
  readonly checks?: ReactNode;
  readonly missionCategory?: MissionPresetCategory;
  readonly missionPreset?: MissionPreset;
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
  readonly onWorkspaceChange: (workspace: MissionControlWorkspaceView) => void;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

export function MissionControlShell({
  activeWorkspace,
  checks,
  children,
  missionCategory,
  missionPreset,
  missionProfileAnalysis,
  missionReport,
  onWorkspaceChange,
}: MissionControlShellProps) {
  const currentWorkspace =
    MISSION_CONTROL_WORKSPACES.find(
      (workspace) => workspace.id === activeWorkspace,
    ) ?? MISSION_CONTROL_WORKSPACES[0];

  return (
    <article
      aria-labelledby="mission-control-dashboard-title"
      className="min-w-0 text-foreground"
      data-active-workspace={activeWorkspace}
    >
      <MissionControlHeader
        currentWorkspace={currentWorkspace?.label ?? "Overview"}
        missionCategory={missionCategory}
        missionPreset={missionPreset}
        missionProfileAnalysis={missionProfileAnalysis}
        missionReport={missionReport}
      >
        {checks}
      </MissionControlHeader>

      <MissionControlSidebar
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={onWorkspaceChange}
      />
      <section
        aria-label="Mission control workspace content"
        className="min-w-0 py-4 sm:py-6"
      >
        {children}
      </section>

      <p
        aria-atomic="true"
        aria-live="polite"
        className="sr-only"
        role="status"
      >
        Active Mission control workspace:{" "}
        {currentWorkspace?.label ?? "Overview"}.
      </p>
    </article>
  );
}
