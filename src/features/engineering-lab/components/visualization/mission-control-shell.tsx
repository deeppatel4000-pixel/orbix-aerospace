import type { ReactNode } from "react";

import { OrbixEnvironmentBackdrop } from "@/components/brand/orbix-environment";
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
import { MissionControlStatusBar } from "./mission-control-status-bar";

export interface MissionControlShellProps {
  readonly activeWorkspace: MissionControlWorkspaceView;
  readonly children: ReactNode;
  readonly missionCategory?: MissionPresetCategory;
  readonly missionPreset?: MissionPreset;
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
  readonly onWorkspaceChange: (workspace: MissionControlWorkspaceView) => void;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

export function MissionControlShell({
  activeWorkspace,
  children,
  missionCategory,
  missionPreset,
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
      className="relative isolate overflow-hidden rounded-[1.35rem] border border-[#294451]/70 bg-[#02080c] text-[#e8f0f1] shadow-[0_38px_110px_rgba(0,0,0,0.48)] ring-1 ring-white/[0.025]"
      data-active-workspace={activeWorkspace}
    >
      <OrbixEnvironmentBackdrop className="z-0 opacity-24" theme="orbital" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(108,230,255,0.045)_1px,transparent_1px),linear-gradient(rgba(108,230,255,0.035)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_72%)] bg-[size:48px_48px] opacity-35"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-20 h-px w-28 bg-gradient-to-r from-accent via-accent/70 to-transparent sm:w-48"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 z-20 h-12 w-12 border-t border-r border-accent/35"
      />
      <MissionControlHeader
        currentWorkspace={currentWorkspace?.label ?? "Overview"}
        missionCategory={missionCategory}
        missionPreset={missionPreset}
        missionProfileAnalysis={missionProfileAnalysis}
        missionReport={missionReport}
      />

      <div className="relative z-10 grid min-w-0 xl:grid-cols-[16.5rem_minmax(0,1fr)]">
        <MissionControlSidebar
          activeWorkspace={activeWorkspace}
          onWorkspaceChange={onWorkspaceChange}
        />
        <section
          aria-label="Mission Control workspace content"
          className="min-w-0 border-white/[0.035] bg-[#030b10]/86 p-4 sm:p-6 lg:p-8 xl:border-l"
        >
          {children}
        </section>
      </div>

      <MissionControlStatusBar
        missionProfileAnalysis={missionProfileAnalysis}
        missionReport={missionReport}
        vehicleReentryEvaluation={vehicleReentryEvaluation}
      />

      <p
        aria-atomic="true"
        aria-live="polite"
        className="sr-only"
        role="status"
      >
        Active Mission Control workspace:{" "}
        {currentWorkspace?.label ?? "Overview"}.
      </p>
    </article>
  );
}
