"use client";

import type {
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

import { HeadingLevel, LabHeading, useHeadingLevel } from "./lab-heading";
import { MissionOrbitVisualization } from "./mission-orbit-visualization";
import { MissionTimeline } from "./mission-timeline";
import { ReentryProfileVisualization } from "./reentry-profile-visualization";
import { formatLabValue } from "./format-lab-value";
import { formatFigure } from "@/components/ui/readout";

export interface MissionViewerProps {
  /**
   * Inside Mission control, which already shows the mission's name,
   * description, scope sentence and key values: drop those here and title
   * each section at the surrounding level.
   */
  readonly embedded?: boolean;
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
          {displayedValue === undefined
            ? "Not reported"
            : formatFigure(displayedValue)}
          {/* "50%" with no space, as in every other mission tool. */}
          {value !== undefined && unit
            ? unit === "%"
              ? unit
              : ` ${unit}`
            : ""}
        </output>
      </dd>
    </div>
  );
}

export function MissionViewer({
  embedded = false,
  missionProfileAnalysis,
  missionReport,
  vehicleReentryEvaluation,
}: MissionViewerProps) {
  const level = useHeadingLevel();
  // Standalone, the mission name is the title and sections sit one below it.
  const sectionLevel = embedded ? level : level + 1;
  const transfer = missionReport.orbitalAnalysis?.hohmannTransfer?.transfer;
  const thermal = missionReport.thermalAnalysis;
  const tps = thermal?.tpsRecommendation;

  return (
    <article
      aria-label={embedded ? "Mission overview" : undefined}
      aria-labelledby={embedded ? undefined : "unified-mission-viewer-title"}
      className="min-w-0 text-foreground"
    >
      {embedded ? null : (
        <header className="border-b border-border-subtle pb-4">
          <p className="orbix-label">Mission control viewer</p>
          <LabHeading className="mt-1" id="unified-mission-viewer-title">
            {missionReport.missionSummary.missionName}
          </LabHeading>
          <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
            {missionReport.missionSummary.description}
          </p>
        </header>
      )}

      <HeadingLevel level={sectionLevel}>
        <div className={embedded ? "space-y-8" : "space-y-8 pt-6"}>
          <section aria-labelledby="mission-control-summary-title">
            <LabHeading id="mission-control-summary-title">
              Mission summary
            </LabHeading>
            {embedded ? null : (
              <p className="mt-2 max-w-[68ch] text-sm leading-6 text-text-secondary">
                {missionReport.missionAssessment.educationalSummary}
              </p>
            )}
            <dl className="mt-3 grid gap-x-8 sm:grid-cols-3">
              {/* Mission control's header already gives this count. */}
              {embedded ? null : (
                <div className="border-t border-border-subtle py-2 text-sm sm:col-span-1">
                  <dt className="text-muted">Analyses resolved</dt>
                  <dd className="orbix-data mt-1 text-foreground">
                    <output>
                      {
                        missionProfileAnalysis.missionSummaryState
                          .analysesResolved
                      }
                    </output>
                  </dd>
                </div>
              )}
              <div
                className={
                  "border-t border-border-subtle py-2 text-sm " +
                  (embedded ? "sm:col-span-3" : "sm:col-span-2")
                }
              >
                <dt className="text-muted">
                  Systems used (
                  {missionReport.missionSummary.systemsUsed.length})
                </dt>
                <dd className="mt-1 text-foreground">
                  {missionReport.missionSummary.systemsUsed.length > 0
                    ? missionReport.missionSummary.systemsUsed.join(", ")
                    : "No optional mission systems reported."}
                </dd>
              </div>
            </dl>
          </section>

          {/* Each part is a labelled section of its own, titled at this
           * level, so the wrappers are plain divs carrying the rule. */}
          <div className="border-t border-border-subtle pt-8">
            <MissionTimeline
              missionProfileAnalysis={missionProfileAnalysis}
              missionReport={missionReport}
              vehicleReentryEvaluation={vehicleReentryEvaluation}
            />
          </div>

          <div className="border-t border-border-subtle pt-8">
            <MissionOrbitVisualization analysis={missionProfileAnalysis} />
          </div>

          <div className="border-t border-border-subtle pt-8">
            <ReentryProfileVisualization analysis={vehicleReentryEvaluation} />
          </div>

          {/* Mission control lists these values in its metrics above. */}
          {embedded ? null : (
            <section
              aria-labelledby="mission-control-telemetry-title"
              className="border-t border-border-subtle pt-8"
            >
              <LabHeading id="mission-control-telemetry-title">
                Reported values
              </LabHeading>
              <dl className="mt-2 grid gap-x-8 sm:grid-cols-2">
                <TelemetryCard
                  label="Total delta-v"
                  unit="m/s"
                  value={
                    missionReport.orbitalAnalysis?.totalDeltaVMetresPerSecond
                  }
                />
                <TelemetryCard
                  label="Transfer time"
                  unit="h"
                  value={transfer?.transferTimeHours}
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
          )}

          <p className="border-t border-border-subtle pt-4 text-sm leading-6 text-muted">
            Educational mission viewer. Every value and recommendation shown
            here comes from the supplied report and completed analysis objects;
            this view performs no engineering calculations.
          </p>
        </div>
      </HeadingLevel>
    </article>
  );
}
