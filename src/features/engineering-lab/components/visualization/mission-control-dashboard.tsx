"use client";

import { useMemo, useState } from "react";
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

function WorkspaceEmptyState({ message }: { readonly message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 px-6 py-14 text-center">
      <Radar aria-hidden="true" className="mx-auto text-[#60767c]" size={26} />
      <p className="mt-4 text-sm text-[#80959a]">{message}</p>
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
        <WorkspaceEmptyState message="Mission briefing unavailable until a completed mission analysis is supplied." />
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
        <WorkspaceEmptyState message="Mission showcase unavailable until a completed mission analysis is supplied." />
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
      <WorkspaceEmptyState message="Unified mission visualization unavailable until analysis and report outputs are supplied." />
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
        missionProfileAnalysis={missionProfileAnalysis}
        missionReport={missionReport}
        onWorkspaceChange={setActiveView}
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

            <div
              aria-labelledby={`mission-workspace-${activeView}-tab`}
              className="mt-5"
              id="mission-workspace-panel"
              role="tabpanel"
              tabIndex={0}
            >
              {renderWorkspaceView()}
            </div>
            <p aria-live="polite" className="sr-only" role="status">
              Active visualization:{" "}
              {
                MISSION_CONTROL_WORKSPACES.find(
                  (workspace) => workspace.id === activeView,
                )?.label
              }
              .
            </p>
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
              <WorkspaceEmptyState message="Engineering review unavailable because no mission report was supplied." />
            )}
          </section>
        </div>
      </MissionControlShell>
    </MissionStartupSequence>
  );
}
