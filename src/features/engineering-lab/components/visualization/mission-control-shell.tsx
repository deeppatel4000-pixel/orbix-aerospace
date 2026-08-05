import type { ReactNode } from "react";

import type {
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
import { MissionControlStatusBar } from "./mission-control-status-bar";

export interface MissionControlShellProps {
  readonly activeWorkspace: MissionControlWorkspaceView;
  readonly children: ReactNode;
  readonly missionCategory?: MissionPresetCategory;
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
  readonly onWorkspaceChange: (workspace: MissionControlWorkspaceView) => void;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

export function MissionControlShell({
  activeWorkspace,
  children,
  missionCategory,
  missionProfileAnalysis,
  missionReport,
  onWorkspaceChange,
  vehicleReentryEvaluation,
}: MissionControlShellProps) {
  const currentWorkspace =
    MISSION_CONTROL_WORKSPACES.find(
      (workspace) => workspace.id === activeWorkspace,
    ) ?? MISSION_CONTROL_WORKSPACES[0];

  return (
    <article
      aria-labelledby="mission-control-dashboard-title"
      className="technical-grid overflow-hidden rounded-2xl border border-white/12 bg-[#030a0e] text-[#e3ebec] shadow-[0_30px_90px_rgba(0,0,0,0.3)]"
      data-active-workspace={activeWorkspace}
    >
      <MissionControlHeader
        currentWorkspace={currentWorkspace?.label ?? "Overview"}
        missionCategory={missionCategory}
        missionProfileAnalysis={missionProfileAnalysis}
        missionReport={missionReport}
      />

      <div className="grid min-w-0 xl:grid-cols-[15.5rem_minmax(0,1fr)]">
        <MissionControlSidebar
          activeWorkspace={activeWorkspace}
          onWorkspaceChange={onWorkspaceChange}
        />
        <section
          aria-label="Mission Control workspace content"
          className="min-w-0 bg-[#040c10]/80 p-5 sm:p-7"
        >
          {children}
        </section>
      </div>

      <MissionControlStatusBar
        missionProfileAnalysis={missionProfileAnalysis}
        missionReport={missionReport}
        vehicleReentryEvaluation={vehicleReentryEvaluation}
      />

      <p aria-live="polite" className="sr-only" role="status">
        Active Mission Control workspace:{" "}
        {currentWorkspace?.label ?? "Overview"}.
      </p>
    </article>
  );
}
