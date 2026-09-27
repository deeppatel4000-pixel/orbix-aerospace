"use client";

import type {
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

import { MissionOrbitVisualization } from "./mission-orbit-visualization";
import { MissionTimeline } from "./mission-timeline";
import { ReentryProfileVisualization } from "./reentry-profile-visualization";
import { formatLabValue } from "./format-lab-value";

export interface MissionViewerProps {
  readonly missionProfileAnalysis: MissionProfileAnalysis;
  readonly missionReport: MissionReport;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

interface TelemetryCardProps {
  readonly label: string;
  readonly unit?: string;
  readonly value: number | string | undefined;
}

function TelemetryCard({ label, unit, value }: TelemetryCardProps) {
  const displayedValue =
    typeof value === "number" ? formatLabValue(value) : value;

  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle py-2 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">
        <output
          className={
            value === undefined
              ? "text-muted"
              : typeof value === "number"
                ? "orbix-data text-foreground"
                : "text-foreground"
          }
        >
          {displayedValue ?? "Not reported"}
          {value !== undefined && unit ? ` ${unit}` : ""}
        </output>
      </dd>
    </div>
  );
}

export function MissionViewer({
  missionProfileAnalysis,
  missionReport,
  vehicleReentryEvaluation,
}: MissionViewerProps) {
  const transfer = missionReport.orbitalAnalysis?.hohmannTransfer?.transfer;
  const thermal = missionReport.thermalAnalysis;
  const tps = thermal?.tpsRecommendation;

  return (
    <article
      aria-labelledby="unified-mission-viewer-title"
      className="min-w-0 text-foreground"
    >
      <header className="border-b border-border-subtle pb-4">
        <p className="orbix-label">Mission control viewer</p>
        <h3
          className="orbix-h3 mt-1 text-foreground"
          id="unified-mission-viewer-title"
        >
          {missionReport.missionSummary.missionName}
        </h3>
        <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
          {missionReport.missionSummary.description}
        </p>
      </header>

      <div className="space-y-8 pt-6">
        <section aria-labelledby="mission-control-summary-title">
          <h4
            className="orbix-h4 text-foreground"
            id="mission-control-summary-title"
          >
            Mission summary
          </h4>
          <p className="mt-2 max-w-[68ch] text-sm leading-6 text-text-secondary">
            {missionReport.missionAssessment.educationalSummary}
          </p>
          <dl className="mt-3 grid gap-x-8 sm:grid-cols-3">
            <div className="border-t border-border-subtle py-2 text-sm sm:col-span-1">
              <dt className="text-muted">Analyses resolved</dt>
              <dd className="orbix-data mt-1 text-foreground">
                <output>
                  {missionProfileAnalysis.missionSummaryState.analysesResolved}
                </output>
              </dd>
            </div>
            <div className="border-t border-border-subtle py-2 text-sm sm:col-span-2">
              <dt className="text-muted">
                Systems used ({missionReport.missionSummary.systemsUsed.length})
              </dt>
              <dd className="mt-1 text-foreground">
                {missionReport.missionSummary.systemsUsed.length > 0
                  ? missionReport.missionSummary.systemsUsed.join(", ")
                  : "No optional mission systems reported."}
              </dd>
            </div>
          </dl>
        </section>

        <section
          aria-label="Interactive mission timeline"
          className="border-t border-border-subtle pt-8"
        >
          <MissionTimeline
            missionProfileAnalysis={missionProfileAnalysis}
            missionReport={missionReport}
            vehicleReentryEvaluation={vehicleReentryEvaluation}
          />
        </section>

        <section
          aria-labelledby="mission-control-visualization-title"
          className="border-t border-border-subtle pt-8"
        >
          <h4
            className="orbix-h4 text-foreground"
            id="mission-control-visualization-title"
          >
            Diagrams
          </h4>
          <div className="mt-3 space-y-4">
            <MissionOrbitVisualization analysis={missionProfileAnalysis} />
            <ReentryProfileVisualization analysis={vehicleReentryEvaluation} />
          </div>
        </section>

        <section
          aria-labelledby="mission-control-telemetry-title"
          className="border-t border-border-subtle pt-8"
        >
          <h4
            className="orbix-h4 text-foreground"
            id="mission-control-telemetry-title"
          >
            Reported values
          </h4>
          <dl className="mt-2 grid gap-x-8 sm:grid-cols-2">
            <TelemetryCard
              label="Total delta-v"
              unit="m/s"
              value={missionReport.orbitalAnalysis?.totalDeltaVMetresPerSecond}
            />
            <TelemetryCard
              label="Transfer time"
              unit="s"
              value={transfer?.transferTimeSeconds}
            />
            <TelemetryCard
              label="Peak heating"
              unit="kW/m²"
              value={
                thermal?.thermalSummary.peakHeatFluxKilowattsPerSquareMetre
              }
            />
            <TelemetryCard
              label="TPS mass"
              unit="kg"
              value={tps?.estimatedTPSMassKilograms}
            />
            <TelemetryCard
              label="Thermal margin"
              unit="%"
              value={tps?.thermalMargin.marginPercentage}
            />
          </dl>
        </section>

        <p className="border-t border-border-subtle pt-4 text-sm leading-6 text-muted">
          Educational mission viewer. Every value and recommendation shown here
          comes from the supplied report and completed analysis objects; this
          view performs no engineering calculations.
        </p>
      </div>
    </article>
  );
}
