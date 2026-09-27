"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type {
  MissionPreset,
  MissionPresetCategory,
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";
import type { MissionScenario } from "@/features/engineering-lab/missions";
import { generateMissionInsights } from "@/features/engineering-lab/analysis/mission-insights";

import { MissionInsightsPanel } from "../mission-insights-panel";
import { MissionDesignReview } from "../review/mission-design-review";
import { DemoMode } from "../presentation/demo-mode";
import { MissionBriefing } from "../presentation/mission-briefing";
import { MissionShowcase } from "../presentation/mission-showcase";
import { MissionStartupSequence } from "../presentation/mission-startup-sequence";
import { MissionTradeStudy } from "../presentation/mission-trade-study";
import { GroundTrackVisualization } from "./ground-track-visualization";
import { Mission3DScene } from "./mission-3d-scene";
import { MissionControlShell } from "./mission-control-shell";
import {
  MISSION_CONTROL_WORKSPACES,
  type MissionControlWorkspaceView,
} from "./mission-control-sidebar";
import { MissionMetricsGrid } from "./mission-metrics-grid";
import { MissionOrbitVisualization } from "./mission-orbit-visualization";
import { MissionReplay } from "./mission-replay";
import { MissionViewer } from "./mission-viewer";
import { ReentryProfileVisualization } from "./reentry-profile-visualization";

export interface MissionControlDashboardProps {
  readonly missionCategory?: MissionPresetCategory;
  readonly missionPreset?: MissionPreset;
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
  readonly missionScenario?: MissionScenario;
  readonly tradeStudyAnalyses?: readonly MissionProfileAnalysis[];
  readonly tradeStudyReports?: readonly MissionReport[];
  readonly tradeStudyScenarios?: readonly MissionScenario[];
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

interface WorkspaceEmptyStateProps {
  readonly expected: string;
  readonly message: string;
  readonly source: string;
  readonly title: string;
}

function WorkspaceEmptyState({
  expected,
  message,
  source,
  title,
}: WorkspaceEmptyStateProps) {
  return (
    <div className="orbix-empty-state">
      <h4 className="orbix-h4 text-foreground">{title}</h4>
      <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
        {message}
      </p>
      <dl className="mt-3 grid gap-x-8 text-sm sm:grid-cols-2">
        <div className="border-t border-border-subtle py-2">
          <dt className="text-muted">Expected output</dt>
          <dd className="mt-1 text-text-secondary">{expected}</dd>
        </div>
        <div className="border-t border-border-subtle py-2">
          <dt className="text-muted">Source</dt>
          <dd className="mt-1 text-text-secondary">{source}</dd>
        </div>
      </dl>
    </div>
  );
}

export function MissionControlDashboard({
  missionCategory,
  missionPreset,
  missionProfileAnalysis,
  missionReport,
  missionScenario,
  tradeStudyAnalyses,
  tradeStudyReports,
  tradeStudyScenarios,
  vehicleReentryEvaluation,
}: MissionControlDashboardProps) {
  const [activeView, setActiveView] =
    useState<MissionControlWorkspaceView>("overview");
  const workspacePanelRef = useRef<HTMLDivElement>(null);
  const shouldFocusWorkspacePanelRef = useRef(false);
  const missionInsights = useMemo(
    () =>
      missionProfileAnalysis && missionReport
        ? generateMissionInsights(
            missionProfileAnalysis,
            missionReport,
            vehicleReentryEvaluation ?? undefined,
          )
        : undefined,
    [missionProfileAnalysis, missionReport, vehicleReentryEvaluation],
  );
  const activeWorkspace =
    MISSION_CONTROL_WORKSPACES.find(
      (workspace) => workspace.id === activeView,
    ) ?? MISSION_CONTROL_WORKSPACES[0];

  useEffect(() => {
    if (!shouldFocusWorkspacePanelRef.current) return;

    workspacePanelRef.current?.focus({ preventScroll: true });
    shouldFocusWorkspacePanelRef.current = false;
  }, [activeView]);

  function handleWorkspaceChange(workspace: MissionControlWorkspaceView) {
    if (workspace === activeView) return;

    const activeElement = document.activeElement;
    const changeOriginatedInTablist =
      activeElement instanceof HTMLElement &&
      activeElement.getAttribute("role") === "tab";

    // Tabs retain focus for uninterrupted arrow-key navigation. A future
    // programmatic workspace change instead moves focus to the new panel.
    shouldFocusWorkspacePanelRef.current = !changeOriginatedInTablist;
    setActiveView(workspace);
  }

  function renderWorkspaceView() {
    if (activeView === "replay") {
      return (
        <MissionReplay
          missionProfileAnalysis={missionProfileAnalysis}
          missionReport={missionReport}
          vehicleReentryEvaluation={vehicleReentryEvaluation}
        />
      );
    }

    if (activeView === "unified") {
      return (
        <Mission3DScene
          missionProfileAnalysis={missionProfileAnalysis}
          missionReport={missionReport}
          vehicleReentryEvaluation={vehicleReentryEvaluation}
        />
      );
    }

    if (activeView === "orbit") {
      return <MissionOrbitVisualization analysis={missionProfileAnalysis} />;
    }

    if (activeView === "reentry") {
      return (
        <ReentryProfileVisualization analysis={vehicleReentryEvaluation} />
      );
    }

    if (activeView === "ground-track") {
      return <GroundTrackVisualization analysis={missionProfileAnalysis} />;
    }

    if (activeView === "design-review") {
      return (
        <MissionDesignReview
          insights={missionInsights}
          missionCategory={missionCategory}
          missionProfile={missionProfileAnalysis}
          report={missionReport}
        />
      );
    }

    if (activeView === "insights") {
      return <MissionInsightsPanel analysis={missionInsights} />;
    }

    if (activeView === "briefing") {
      return missionProfileAnalysis ? (
        <MissionBriefing
          insights={missionInsights}
          missionProfile={missionProfileAnalysis}
          preset={missionPreset}
          report={missionReport ?? undefined}
        />
      ) : (
        <WorkspaceEmptyState
          expected="Mission objectives, system coverage, and completed engineering summaries."
          message="Mission briefing unavailable until a completed mission analysis is supplied."
          source="Completed MissionProfileAnalysis supplied to Mission control."
          title="Mission briefing not yet assembled"
        />
      );
    }

    if (activeView === "trade-study") {
      return (
        <MissionTradeStudy
          analyses={tradeStudyAnalyses}
          reports={tradeStudyReports}
          scenarios={tradeStudyScenarios ?? []}
        />
      );
    }

    if (activeView === "showcase") {
      return missionProfileAnalysis ? (
        <MissionShowcase
          insights={missionInsights}
          missionProfile={missionProfileAnalysis}
          report={missionReport ?? undefined}
        />
      ) : (
        <WorkspaceEmptyState
          expected="A presentation sequence using the mission's completed orbital, vehicle, and thermal outputs."
          message="Mission showcase unavailable until a completed mission analysis is supplied."
          source="Completed MissionProfileAnalysis supplied to Mission control."
          title="Mission showcase awaiting analysis"
        />
      );
    }

    if (activeView === "demo-mode") {
      return (
        <DemoMode
          insights={missionInsights}
          missionProfile={missionProfileAnalysis ?? undefined}
          missionScenario={missionScenario}
          report={missionReport ?? undefined}
        />
      );
    }

    return missionProfileAnalysis && missionReport ? (
      <MissionViewer
        missionProfileAnalysis={missionProfileAnalysis}
        missionReport={missionReport}
        vehicleReentryEvaluation={vehicleReentryEvaluation}
      />
    ) : (
      <WorkspaceEmptyState
        expected="A unified mission timeline, visualization panels, and computed engineering values."
        message="Unified mission visualization unavailable until analysis and report outputs are supplied."
        source="Completed mission analysis and MissionReport supplied to Mission control."
        title="Unified mission view awaiting source data"
      />
    );
  }

  return (
    <MissionStartupSequence
      missionCategory={missionCategory}
      missionProfileAnalysis={missionProfileAnalysis}
      missionReport={missionReport}
      vehicleReentryEvaluation={vehicleReentryEvaluation}
    >
      <MissionControlShell
        activeWorkspace={activeView}
        missionCategory={missionCategory}
        missionPreset={missionPreset}
        missionProfileAnalysis={missionProfileAnalysis}
        missionReport={missionReport}
        onWorkspaceChange={handleWorkspaceChange}
        vehicleReentryEvaluation={vehicleReentryEvaluation}
      >
        <div className="min-w-0 space-y-8">
          <MissionMetricsGrid
            missionProfileAnalysis={missionProfileAnalysis}
            missionReport={missionReport}
            vehicleReentryEvaluation={vehicleReentryEvaluation}
          />

          <section
            aria-labelledby="mission-workspace-title"
            className="border-t border-border-subtle pt-8"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <h4
                className="orbix-h4 text-foreground"
                id="mission-workspace-title"
              >
                Mission visualization workspace
              </h4>
              <p className="text-sm text-muted">
                Showing: {activeWorkspace?.label ?? "Overview"}
              </p>
            </div>

            <div
              aria-labelledby={`mission-workspace-${activeView}-tab`}
              className="mt-4 min-h-48"
              id="mission-workspace-panel"
              ref={workspacePanelRef}
              role="tabpanel"
              tabIndex={0}
            >
              <div key={activeView}>{renderWorkspaceView()}</div>
            </div>
          </section>

          <section
            aria-labelledby="engineering-review-title"
            className="border-t border-border-subtle pt-8"
          >
            <h4
              className="orbix-h4 text-foreground"
              id="engineering-review-title"
            >
              Engineering review
            </h4>

            {missionReport ? (
              <div className="mt-3 grid gap-6 lg:grid-cols-3">
                <section aria-labelledby="engineering-review-scope-title">
                  <h5
                    className="text-sm font-semibold text-foreground"
                    id="engineering-review-scope-title"
                  >
                    Modeling scope
                  </h5>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {missionReport.missionAssessment.educationalSummary}
                  </p>
                </section>
                <section aria-labelledby="engineering-review-assumptions-title">
                  <h5
                    className="text-sm font-semibold text-foreground"
                    id="engineering-review-assumptions-title"
                  >
                    Assumptions
                  </h5>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                    {missionReport.missionAssessment.modelAssumptions.map(
                      (assumption) => (
                        <li key={assumption}>{assumption}</li>
                      ),
                    )}
                  </ul>
                </section>
                <section aria-labelledby="engineering-review-limits-title">
                  <h5
                    className="text-sm font-semibold text-foreground"
                    id="engineering-review-limits-title"
                  >
                    Limits
                  </h5>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                    {missionReport.missionAssessment.limitations.map(
                      (limitation) => (
                        <li key={limitation}>{limitation}</li>
                      ),
                    )}
                  </ul>
                </section>
              </div>
            ) : (
              <div className="mt-3">
                <WorkspaceEmptyState
                  expected="Reported modeling scope, assumptions, and analysis limitations."
                  message="Engineering review unavailable because no mission report was supplied."
                  source="MissionReport supplied to Mission control after report generation."
                  title="Engineering review awaiting report"
                />
              </div>
            )}
          </section>
        </div>
      </MissionControlShell>
    </MissionStartupSequence>
  );
}
