"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Radar } from "lucide-react";

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
import { MissionStatusPanel } from "./mission-status-panel";
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
    <div className="relative isolate overflow-hidden rounded-2xl border border-dashed border-accent/20 bg-[#050e12]/92 px-5 py-10 sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(91,205,190,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(91,205,190,0.035)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent)] bg-[size:2rem_2rem]"
      />
      <div className="relative mx-auto max-w-2xl text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-accent/20 bg-accent/8 text-accent shadow-[0_0_30px_rgba(91,205,190,0.08)]">
          <Radar aria-hidden="true" size={22} />
        </span>
        <p className="mt-5 font-mono text-[0.58rem] tracking-[0.18em] text-accent uppercase">
          Data channel standby
        </p>
        <h4 className="mt-2 text-lg font-semibold text-[#dce7e8]">{title}</h4>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#82979c]">
          {message}
        </p>
        <dl className="mt-6 grid overflow-hidden rounded-xl border border-white/10 bg-black/15 text-left sm:grid-cols-2">
          <div className="border-b border-white/10 px-4 py-3 sm:border-r sm:border-b-0">
            <dt className="font-mono text-[0.55rem] tracking-[0.14em] text-[#6f858a] uppercase">
              Expected output
            </dt>
            <dd className="mt-1 text-xs leading-5 text-[#a5b6ba]">
              {expected}
            </dd>
          </div>
          <div className="px-4 py-3">
            <dt className="font-mono text-[0.55rem] tracking-[0.14em] text-[#6f858a] uppercase">
              Source
            </dt>
            <dd className="mt-1 text-xs leading-5 text-[#a5b6ba]">{source}</dd>
          </div>
        </dl>
      </div>
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
  const analysisAvailable =
    missionProfileAnalysis !== undefined && missionProfileAnalysis !== null;
  const reportAvailable = missionReport !== undefined && missionReport !== null;
  const visualizationAvailable = Boolean(
    missionProfileAnalysis?.sourceAnalyses.deltaVBudget ||
    vehicleReentryEvaluation,
  );
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
          source="Completed MissionProfileAnalysis supplied to Mission Control."
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
          source="Completed MissionProfileAnalysis supplied to Mission Control."
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
        expected="A unified mission timeline, visualization panels, and reported engineering telemetry."
        message="Unified mission visualization unavailable until analysis and report outputs are supplied."
        source="Completed mission analysis and MissionReport supplied to Mission Control."
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
          <div className="grid gap-6 2xl:grid-cols-[18rem_minmax(0,1fr)]">
            <aside aria-label="Mission control status">
              <MissionStatusPanel
                analysisAvailable={analysisAvailable}
                reportAvailable={reportAvailable}
                visualizationAvailable={visualizationAvailable}
              />
            </aside>

            <MissionMetricsGrid
              missionProfileAnalysis={missionProfileAnalysis}
              missionReport={missionReport}
              vehicleReentryEvaluation={vehicleReentryEvaluation}
            />
          </div>

          <section
            aria-labelledby="mission-workspace-title"
            className="border-t border-white/10 pt-8"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[0.61rem] tracking-[0.16em] text-accent uppercase">
                  Visual operations // Completed outputs
                </p>
                <h3
                  className="mt-1 text-xl font-semibold"
                  id="mission-workspace-title"
                >
                  Mission Visualization Workspace
                </h3>
              </div>
              <div className="flex items-center gap-2 self-start rounded-full border border-accent/20 bg-accent/7 px-3 py-1.5 sm:self-auto">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(91,205,190,0.65)]"
                />
                <span className="font-mono text-[0.57rem] tracking-[0.13em] text-accent uppercase">
                  {activeWorkspace?.label ?? "Overview"} channel active
                </span>
              </div>
            </div>

            <div
              aria-labelledby={`mission-workspace-${activeView}-tab`}
              className="mt-5 min-h-48 rounded-2xl border border-white/8 bg-black/10 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.025),0_18px_55px_rgba(0,0,0,0.14)] outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-[#040c10]"
              id="mission-workspace-panel"
              ref={workspacePanelRef}
              role="tabpanel"
              tabIndex={0}
            >
              <div
                className="orbix-enter motion-reduce:transform-none motion-reduce:animate-none"
                key={activeView}
              >
                {renderWorkspaceView()}
              </div>
            </div>
          </section>

          <section
            aria-labelledby="engineering-review-title"
            className="border-t border-white/10 pt-8"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
                <FileText aria-hidden="true" size={17} />
              </span>
              <div>
                <p className="font-mono text-[0.59rem] tracking-[0.14em] text-[#789097] uppercase">
                  Reported review context
                </p>
                <h3
                  className="mt-0.5 text-xl font-semibold"
                  id="engineering-review-title"
                >
                  Engineering Review
                </h3>
              </div>
            </div>

            {missionReport ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                <section className="rounded-xl border border-white/10 bg-[#081419] p-4">
                  <h4 className="font-mono text-xs text-accent uppercase">
                    Modeling scope
                  </h4>
                  <p className="mt-3 text-sm leading-6 text-[#91a5aa]">
                    {missionReport.missionAssessment.educationalSummary}
                  </p>
                </section>
                <section className="rounded-xl border border-white/10 bg-[#081419] p-4">
                  <h4 className="font-mono text-xs text-accent uppercase">
                    Assumptions
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#91a5aa]">
                    {missionReport.missionAssessment.modelAssumptions.map(
                      (assumption) => (
                        <li className="flex gap-2" key={assumption}>
                          <span aria-hidden="true" className="text-accent">
                            —
                          </span>
                          {assumption}
                        </li>
                      ),
                    )}
                  </ul>
                </section>
                <section className="rounded-xl border border-white/10 bg-[#081419] p-4">
                  <h4 className="font-mono text-xs text-accent uppercase">
                    Limitations
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[#91a5aa]">
                    {missionReport.missionAssessment.limitations.map(
                      (limitation) => (
                        <li className="flex gap-2" key={limitation}>
                          <span aria-hidden="true" className="text-signal">
                            —
                          </span>
                          {limitation}
                        </li>
                      ),
                    )}
                  </ul>
                </section>
              </div>
            ) : (
              <div className="mt-5">
                <WorkspaceEmptyState
                  expected="Reported modeling scope, assumptions, and analysis limitations."
                  message="Engineering review unavailable because no mission report was supplied."
                  source="MissionReport supplied to Mission Control after report generation."
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
