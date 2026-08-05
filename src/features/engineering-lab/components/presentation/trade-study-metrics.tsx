import { Activity, BarChart3 } from "lucide-react";

import type { MissionScenario } from "@/features/engineering-lab/missions";
import type {
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

export interface MissionTradeStudyEntry {
  readonly analysis?: MissionProfileAnalysis;
  readonly report?: MissionReport;
  readonly scenario: MissionScenario;
}

export interface TradeStudyMetricsProps {
  readonly entries: readonly MissionTradeStudyEntry[];
}

interface ScenarioMetrics {
  readonly deltaVMetresPerSecond?: number;
  readonly maneuverCount?: number;
  readonly peakDecelerationGs?: number;
  readonly reentryDurationSeconds?: number;
  readonly thermalMargin?: string;
  readonly tpsMassKilograms?: number;
  readonly tpsMaterial?: string;
  readonly tpsThicknessMillimetres?: number;
  readonly transferDurationHours?: number;
  readonly vehicleName?: string;
}

const metricFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

function getScenarioMetrics({
  analysis,
  report,
}: MissionTradeStudyEntry): ScenarioMetrics {
  const deltaVBudget = analysis?.sourceAnalyses.deltaVBudget;
  const transfer =
    report?.orbitalAnalysis?.hohmannTransfer ??
    deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const evaluation =
    analysis?.sourceAnalyses.vehicleReentryEvaluation ??
    analysis?.selectedVehicleRecommendation?.evaluation;
  const vehicle =
    report?.vehicleAnalysis?.selectedVehicle ?? evaluation?.vehicle;
  const performance =
    report?.vehicleAnalysis?.performanceSummary ?? evaluation?.summary;
  const tps = report?.thermalAnalysis?.tpsRecommendation;
  const fallbackTps = evaluation?.summary.tps;

  return {
    deltaVMetresPerSecond:
      report?.orbitalAnalysis?.totalDeltaVMetresPerSecond ??
      analysis?.totalDeltaVMetresPerSecond,
    maneuverCount:
      report?.orbitalAnalysis?.maneuvers.length ??
      deltaVBudget?.maneuvers.length,
    peakDecelerationGs: performance?.dynamics.peakDeceleration.decelerationGs,
    reentryDurationSeconds: performance?.flight.reentryDurationSeconds,
    thermalMargin:
      tps?.thermalMargin.classification ??
      fallbackTps?.thermalMargin.classification,
    tpsMassKilograms:
      tps?.estimatedTPSMassKilograms ?? fallbackTps?.estimatedTPSMassKilograms,
    tpsMaterial: tps?.material.name ?? fallbackTps?.recommendedMaterial.name,
    tpsThicknessMillimetres:
      tps?.requiredThickness.millimetres ??
      fallbackTps?.requiredThickness.millimetres,
    transferDurationHours: transfer?.transfer.transferTimeHours,
    vehicleName: vehicle?.vehicleName,
  };
}

function displayMetric(value: number | string | undefined, unit?: string) {
  const displayed =
    typeof value === "number" ? metricFormatter.format(value) : value;
  return displayed === undefined ? "Not reported" : `${displayed}${unit ?? ""}`;
}

function TelemetryRail({
  label,
  unit,
  value,
}: {
  readonly label: string;
  readonly unit: string;
  readonly value?: number;
}) {
  return (
    <div aria-label={`${label}: ${displayMetric(value, unit)}`}>
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="font-semibold text-[#b9c8ca]">{label}</span>
        <output className="font-mono text-accent">
          {displayMetric(value, unit)}
        </output>
      </div>
      <div
        aria-hidden="true"
        className="mt-2 h-2 overflow-hidden rounded-full border border-white/10 bg-black/25"
      >
        <div
          className={
            "h-full rounded-full transition-opacity motion-reduce:transition-none " +
            (value === undefined
              ? "w-0 bg-transparent"
              : "w-full bg-[linear-gradient(90deg,rgba(73,198,190,0.35),rgba(73,198,190,0.8))]")
          }
        />
      </div>
    </div>
  );
}

export function buildTradeStudyExplanations(
  entries: readonly MissionTradeStudyEntry[],
): readonly string[] {
  const explanations: string[] = [];

  for (let index = 1; index < entries.length; index += 1) {
    const current = entries[index];
    const previous = entries[index - 1];
    if (!current || !previous) continue;

    const currentMetrics = getScenarioMetrics(current);
    const previousMetrics = getScenarioMetrics(previous);

    if (
      currentMetrics.deltaVMetresPerSecond !== undefined &&
      previousMetrics.deltaVMetresPerSecond !== undefined
    ) {
      const relationship =
        currentMetrics.deltaVMetresPerSecond ===
        previousMetrics.deltaVMetresPerSecond
          ? "the same reported total delta-v as"
          : currentMetrics.deltaVMetresPerSecond >
              previousMetrics.deltaVMetresPerSecond
            ? "a larger reported total delta-v than"
            : "a smaller reported total delta-v than";
      explanations.push(
        `${current.scenario.name} has ${relationship} ${previous.scenario.name}.`,
      );
    }

    if (
      currentMetrics.tpsMassKilograms !== undefined &&
      previousMetrics.tpsMassKilograms !== undefined
    ) {
      const relationship =
        currentMetrics.tpsMassKilograms === previousMetrics.tpsMassKilograms
          ? "the same reported TPS mass as"
          : currentMetrics.tpsMassKilograms > previousMetrics.tpsMassKilograms
            ? "a heavier reported TPS mass than"
            : "a lighter reported TPS mass than";
      explanations.push(
        `${current.scenario.name} has ${relationship} ${previous.scenario.name}.`,
      );
    }
  }

  if (explanations.length === 0) {
    explanations.push(
      "No common completed orbital or TPS metrics are available for a direct explanatory comparison.",
    );
  }

  return explanations;
}

export function TradeStudyMetrics({ entries }: TradeStudyMetricsProps) {
  const rows = entries.map((entry) => ({
    entry,
    metrics: getScenarioMetrics(entry),
  }));

  return (
    <div className="space-y-9">
      <section aria-labelledby="trade-study-metrics-title">
        <p className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.16em] text-accent uppercase">
          <Activity aria-hidden="true" size={14} />
          Comparison matrix // Supplied outputs
        </p>
        <h3
          className="mt-1 text-xl font-semibold"
          id="trade-study-metrics-title"
        >
          Mission Comparison Metrics
        </h3>

        <div
          aria-label="Scrollable mission comparison table"
          className="mt-5 overflow-x-auto rounded-2xl border border-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          tabIndex={0}
        >
          <table className="min-w-[78rem] border-collapse text-left text-xs">
            <caption className="sr-only">
              Existing orbital, vehicle, and thermal outputs for each mission
              scenario; no ranking or feasibility result is provided.
            </caption>
            <thead className="bg-[#0a171c] font-mono tracking-[0.08em] text-[#8da2a7] uppercase">
              <tr>
                <th className="px-4 py-3" scope="col">
                  Mission
                </th>
                <th className="px-4 py-3" scope="col">
                  Delta-v
                </th>
                <th className="px-4 py-3" scope="col">
                  Transfer duration
                </th>
                <th className="px-4 py-3" scope="col">
                  Maneuvers
                </th>
                <th className="px-4 py-3" scope="col">
                  Vehicle
                </th>
                <th className="px-4 py-3" scope="col">
                  Peak deceleration
                </th>
                <th className="px-4 py-3" scope="col">
                  Reentry duration
                </th>
                <th className="px-4 py-3" scope="col">
                  TPS material
                </th>
                <th className="px-4 py-3" scope="col">
                  TPS mass
                </th>
                <th className="px-4 py-3" scope="col">
                  Thickness
                </th>
                <th className="px-4 py-3" scope="col">
                  Thermal margin
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 bg-[#061116] text-[#c4d1d3]">
              {rows.map(({ entry, metrics }) => (
                <tr key={entry.scenario.id}>
                  <th className="px-4 py-4 font-semibold" scope="row">
                    {entry.scenario.name}
                  </th>
                  <td className="px-4 py-4 font-mono">
                    {displayMetric(metrics.deltaVMetresPerSecond, " m/s")}
                  </td>
                  <td className="px-4 py-4 font-mono">
                    {displayMetric(metrics.transferDurationHours, " h")}
                  </td>
                  <td className="px-4 py-4 font-mono">
                    {displayMetric(metrics.maneuverCount)}
                  </td>
                  <td className="px-4 py-4">
                    {displayMetric(metrics.vehicleName)}
                  </td>
                  <td className="px-4 py-4 font-mono">
                    {displayMetric(metrics.peakDecelerationGs, " g")}
                  </td>
                  <td className="px-4 py-4 font-mono">
                    {displayMetric(metrics.reentryDurationSeconds, " s")}
                  </td>
                  <td className="px-4 py-4">
                    {displayMetric(metrics.tpsMaterial)}
                  </td>
                  <td className="px-4 py-4 font-mono">
                    {displayMetric(metrics.tpsMassKilograms, " kg")}
                  </td>
                  <td className="px-4 py-4 font-mono">
                    {displayMetric(metrics.tpsThicknessMillimetres, " mm")}
                  </td>
                  <td className="px-4 py-4">
                    {displayMetric(metrics.thermalMargin)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="trade-study-visual-comparison-title">
        <p className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.16em] text-accent uppercase">
          <BarChart3 aria-hidden="true" size={14} />
          Visual comparison // Unscaled telemetry rails
        </p>
        <h3
          className="mt-1 text-xl font-semibold"
          id="trade-study-visual-comparison-title"
        >
          Reported Metric Availability
        </h3>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-[#758b90]">
          Rail length indicates that a value is available, not its relative
          magnitude. Exact supplied values remain the comparison reference.
        </p>

        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {rows.map(({ entry, metrics }) => (
            <article
              className="rounded-xl border border-white/10 bg-[#081419]/80 p-4"
              key={entry.scenario.id}
            >
              <h4 className="text-sm font-semibold">{entry.scenario.name}</h4>
              <div className="mt-4 space-y-4">
                <TelemetryRail
                  label="Delta-v"
                  unit=" m/s"
                  value={metrics.deltaVMetresPerSecond}
                />
                <TelemetryRail
                  label="Peak deceleration"
                  unit=" g"
                  value={metrics.peakDecelerationGs}
                />
                <TelemetryRail
                  label="TPS mass"
                  unit=" kg"
                  value={metrics.tpsMassKilograms}
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
