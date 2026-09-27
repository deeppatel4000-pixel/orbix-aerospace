import type { MissionScenario } from "@/features/engineering-lab/missions";
import type {
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";
import { formatLabValue } from "../visualization/format-lab-value";

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

function displayMetric(value: number | string | undefined) {
  const displayed = typeof value === "number" ? formatLabValue(value) : value;
  return displayed === undefined ? "Not reported" : displayed;
}

const NUMERIC_COLUMNS = [
  { key: "deltaVMetresPerSecond", label: "Delta-v", unit: "m/s" },
  { key: "transferDurationHours", label: "Transfer duration", unit: "h" },
  { key: "maneuverCount", label: "Maneuvers" },
] as const;

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

function NumberCell({ value }: { readonly value?: number }) {
  return (
    <td
      className={
        value === undefined ? "text-right text-muted" : "orbix-data text-right"
      }
    >
      {displayMetric(value)}
    </td>
  );
}

function TextCell({ value }: { readonly value?: string }) {
  return (
    <td className={value === undefined ? "text-muted" : undefined}>
      {displayMetric(value)}
    </td>
  );
}

export function TradeStudyMetrics({ entries }: TradeStudyMetricsProps) {
  const rows = entries.map((entry) => ({
    entry,
    metrics: getScenarioMetrics(entry),
  }));

  return (
    <section aria-labelledby="trade-study-metrics-title">
      <h4 className="orbix-h4 text-foreground" id="trade-study-metrics-title">
        Mission comparison metrics
      </h4>
      <p className="mt-1 text-sm leading-6 text-muted">
        Values as supplied by each completed analysis. The table scrolls
        sideways on narrow screens.
      </p>

      <div
        aria-label="Scrollable mission comparison table"
        className="orbix-table-wrap mt-3"
        role="region"
        tabIndex={0}
      >
        <table className="orbix-table">
          <caption className="sr-only">
            Existing orbital, vehicle, and thermal outputs for each mission
            scenario; no ranking or feasibility result is provided.
          </caption>
          <thead>
            <tr>
              <th scope="col">Mission</th>
              {NUMERIC_COLUMNS.map((column) => (
                <th className="text-right" key={column.key} scope="col">
                  {column.label}
                  {"unit" in column ? ` (${column.unit})` : ""}
                </th>
              ))}
              <th scope="col">Vehicle</th>
              <th className="text-right" scope="col">
                Peak deceleration (g)
              </th>
              <th className="text-right" scope="col">
                Reentry duration (s)
              </th>
              <th scope="col">TPS material</th>
              <th className="text-right" scope="col">
                TPS mass (kg)
              </th>
              <th className="text-right" scope="col">
                Thickness (mm)
              </th>
              <th scope="col">Thermal margin</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ entry, metrics }) => (
              <tr key={entry.scenario.id}>
                <th scope="row">{entry.scenario.name}</th>
                {NUMERIC_COLUMNS.map((column) => (
                  <NumberCell key={column.key} value={metrics[column.key]} />
                ))}
                <TextCell value={metrics.vehicleName} />
                <NumberCell value={metrics.peakDecelerationGs} />
                <NumberCell value={metrics.reentryDurationSeconds} />
                <TextCell value={metrics.tpsMaterial} />
                <NumberCell value={metrics.tpsMassKilograms} />
                <NumberCell value={metrics.tpsThicknessMillimetres} />
                <TextCell value={metrics.thermalMargin} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
