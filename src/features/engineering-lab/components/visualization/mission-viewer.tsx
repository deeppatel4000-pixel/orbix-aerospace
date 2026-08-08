"use client";

import {
  Activity,
  ArrowDown,
  FileText,
  Gauge,
  Orbit,
  Shield,
} from "lucide-react";

import type {
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

import { MissionOrbitVisualization } from "./mission-orbit-visualization";
import { MissionTimeline } from "./mission-timeline";
import { ReentryProfileVisualization } from "./reentry-profile-visualization";

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

const telemetryFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 2,
});

function TelemetryCard({ label, unit, value }: TelemetryCardProps) {
  const displayedValue =
    typeof value === "number" ? telemetryFormatter.format(value) : value;

  return (
    <div className="border-b border-white/10 p-4 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0">
      <dt className="font-mono text-[0.59rem] tracking-[0.12em] text-[#789097] uppercase">
        {label}
      </dt>
      <dd className="mt-2">
        <output
          className={
            "font-mono text-base font-semibold " +
            (value === undefined ? "text-[#667b81]" : "text-accent")
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
      className="technical-grid overflow-hidden rounded-2xl border border-white/12 bg-[#050d11] text-[#e3ebec]"
    >
      <header className="relative overflow-hidden border-b border-white/10 p-5 sm:p-7">
        <div
          aria-hidden="true"
          className="absolute top-0 right-0 h-40 w-40 rounded-full bg-accent/5 blur-3xl"
        />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.2em] text-accent uppercase">
              <Activity aria-hidden="true" size={15} />
              Mission Control
            </p>
            <h3
              className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl"
              id="unified-mission-viewer-title"
            >
              {missionReport.missionSummary.missionName}
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#94a9ae]">
              {missionReport.missionSummary.description}
            </p>
          </div>
          <div className="shrink-0 rounded-xl border border-accent/20 bg-accent/6 px-4 py-3">
            <p className="font-mono text-[0.58rem] tracking-[0.14em] text-[#7f999f] uppercase">
              Data link
            </p>
            <p className="mt-1 flex items-center gap-2 font-mono text-xs text-accent uppercase">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-accent motion-safe:animate-pulse motion-reduce:animate-none"
              />
              Analysis outputs loaded
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-8 p-5 sm:p-7">
        <section aria-labelledby="mission-control-summary-title">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
              <FileText aria-hidden="true" size={17} />
            </span>
            <div>
              <p className="font-mono text-[0.59rem] tracking-[0.14em] text-[#789097] uppercase">
                Mission definition
              </p>
              <h4
                className="mt-0.5 text-lg font-semibold"
                id="mission-control-summary-title"
              >
                Mission Summary
              </h4>
            </div>
          </div>

          <div className="mt-4 grid gap-4 rounded-xl border border-white/10 bg-black/10 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="text-sm leading-6 text-[#a8babf]">
                {missionReport.missionAssessment.educationalSummary}
              </p>
              {missionReport.missionSummary.systemsUsed.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {missionReport.missionSummary.systemsUsed.map((system) => (
                    <li
                      className="rounded-full border border-white/10 bg-white/4 px-3 py-1 font-mono text-[0.61rem] text-[#a8bdc1]"
                      key={system}
                    >
                      {system}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 font-mono text-xs text-[#71868c]">
                  No optional mission systems reported.
                </p>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg border border-white/10 bg-[#08151a] px-4 py-3">
                <dt className="font-mono text-[0.55rem] text-[#71868c] uppercase">
                  Analyses
                </dt>
                <dd className="mt-1">
                  <output className="font-mono text-lg text-accent">
                    {
                      missionProfileAnalysis.missionSummaryState
                        .analysesResolved
                    }
                  </output>
                </dd>
              </div>
              <div className="rounded-lg border border-white/10 bg-[#08151a] px-4 py-3">
                <dt className="font-mono text-[0.55rem] text-[#71868c] uppercase">
                  Systems
                </dt>
                <dd className="mt-1">
                  <output className="font-mono text-lg text-accent">
                    {missionReport.missionSummary.systemsUsed.length}
                  </output>
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section
          aria-label="Interactive mission timeline"
          className="border-t border-white/10 pt-8"
        >
          <MissionTimeline
            missionProfileAnalysis={missionProfileAnalysis}
            missionReport={missionReport}
            vehicleReentryEvaluation={vehicleReentryEvaluation}
          />
        </section>

        <section
          aria-labelledby="mission-control-visualization-title"
          className="border-t border-white/10 pt-8"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
              <Orbit aria-hidden="true" size={17} />
            </span>
            <div>
              <p className="font-mono text-[0.59rem] tracking-[0.14em] text-[#789097] uppercase">
                Coupled mission views
              </p>
              <h4
                className="mt-0.5 text-lg font-semibold"
                id="mission-control-visualization-title"
              >
                Visualization Panel
              </h4>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <MissionOrbitVisualization analysis={missionProfileAnalysis} />
            <div
              aria-hidden="true"
              className="flex items-center justify-center text-[#698087]"
            >
              <span className="h-5 w-px bg-white/12" />
              <ArrowDown
                className="mx-2 motion-safe:animate-bounce motion-reduce:animate-none"
                size={17}
              />
              <span className="h-5 w-px bg-white/12" />
            </div>
            <ReentryProfileVisualization analysis={vehicleReentryEvaluation} />
          </div>
        </section>

        <section
          aria-labelledby="mission-control-telemetry-title"
          className="border-t border-white/10 pt-8"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-accent">
              <Gauge aria-hidden="true" size={17} />
            </span>
            <div>
              <p className="font-mono text-[0.59rem] tracking-[0.14em] text-[#789097] uppercase">
                Reported mission outputs
              </p>
              <h4
                className="mt-0.5 text-lg font-semibold"
                id="mission-control-telemetry-title"
              >
                Engineering Telemetry
              </h4>
            </div>
          </div>

          <dl className="mt-5 grid overflow-hidden rounded-xl border border-white/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-5">
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

        <aside className="flex items-start gap-3 rounded-xl border border-signal/20 bg-signal/5 p-4">
          <Shield
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-signal"
            size={16}
          />
          <p className="text-xs leading-5 text-[#91a5aa]">
            Educational mission visualization only. Every telemetry value and
            recommendation shown here is presented from the supplied report and
            completed analysis objects; this interface performs no engineering
            calculations.
          </p>
        </aside>
      </div>
    </article>
  );
}
