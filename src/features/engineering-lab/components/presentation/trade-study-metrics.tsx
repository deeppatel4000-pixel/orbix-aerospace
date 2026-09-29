import type { ReactNode } from "react";

import type { MissionScenario } from "@/features/engineering-lab/missions";
import type {
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { formatFigure } from "@/components/ui/readout";

import { formatLabValue } from "../visualization/format-lab-value";
import { LabHeading } from "../visualization/lab-heading";

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

/** One metric of the transposed table: a row, with one cell per mission. */
interface TradeStudyMetricRow {
  readonly key: string;
  readonly label: string;
  readonly numeric: boolean;
  readonly unit?: string;
  readonly value: (metrics: ScenarioMetrics) => number | string | undefined;
}

const METRIC_ROWS: readonly TradeStudyMetricRow[] = [
  ...NUMERIC_COLUMNS.map((column): TradeStudyMetricRow => ({
    key: column.key,
    label: column.label,
    numeric: true,
    unit: "unit" in column ? column.unit : undefined,
    value: (metrics) => metrics[column.key],
  })),
  {
    key: "vehicle",
    label: "Vehicle",
    numeric: false,
    value: (metrics) => metrics.vehicleName,
  },
  {
    key: "peak-deceleration",
    label: "Peak deceleration",
    numeric: true,
    unit: "g",
    value: (metrics) => metrics.peakDecelerationGs,
  },
  {
    key: "reentry-duration",
    label: "Reentry duration",
    numeric: true,
    unit: "s",
    value: (metrics) => metrics.reentryDurationSeconds,
  },
  {
    key: "tps-material",
    label: "TPS material",
    numeric: false,
    value: (metrics) => metrics.tpsMaterial,
  },
  {
    key: "tps-mass",
    label: "TPS mass",
    numeric: true,
    unit: "kg",
    value: (metrics) => metrics.tpsMassKilograms,
  },
  {
    key: "tps-thickness",
    label: "Thickness",
    numeric: true,
    unit: "mm",
    value: (metrics) => metrics.tpsThicknessMillimetres,
  },
  {
    key: "thermal-margin",
    label: "Thermal margin",
    numeric: false,
    value: (metrics) => metrics.thermalMargin,
  },
];

/**
 * A plain function, not a component: `DataTable` only formats figures in
 * strings and plain elements, and leaves components alone. Every cell in a
 * mission column shares one right edge (spec 8: figures right-aligned);
 * figures are set in B612 Mono with tabular numbers, and a missing value
 * reads "Not reported" in muted text. The columns are not marked `numeric`
 * because some rows (vehicle, material, margin) hold words that should wrap
 * in the interface face.
 */
function metricCell(
  row: TradeStudyMetricRow,
  metrics: ScenarioMetrics,
): ReactNode {
  const value = row.value(metrics);
  if (value === undefined) {
    return (
      <span className="block text-right leading-5 text-muted">
        Not reported
      </span>
    );
  }
  if (typeof value === "number") {
    return (
      <span className="orbix-data block text-right leading-5 whitespace-nowrap tabular-nums">
        {formatFigure(formatLabValue(value))}
      </span>
    );
  }
  return <span className="block text-right leading-5">{value}</span>;
}

export function TradeStudyMetrics({ entries }: TradeStudyMetricsProps) {
  // Transposed: metrics down the side, one column per mission, so three
  // missions fit the tool column without clipping or wrapping.
  const missions = entries.map((entry) => ({
    entry,
    metrics: getScenarioMetrics(entry),
  }));
  const columns: readonly DataTableColumn<TradeStudyMetricRow>[] = [
    {
      cell: (row) => (
        <span className="block min-w-[8rem] leading-5">
          {row.label}
          {row.unit ? (
            <span className="orbix-table-unit">{` (${row.unit})`}</span>
          ) : null}
        </span>
      ),
      header: (
        <span className="[font-family:var(--font-interface)] text-[0.8125rem] font-medium tracking-normal text-text-secondary normal-case">
          Metric
        </span>
      ),
      key: "metric",
    },
    ...missions.map(
      ({ entry, metrics }): DataTableColumn<TradeStudyMetricRow> => ({
        cell: (row) => metricCell(row, metrics),
        // Mission names are long; let them wrap in the header instead of
        // widening the column past the tool width.
        header: (
          // Sentence-case sans 500 heads (spec 8); B612 is kept for
          // the figures in the cells.
          <span className="block min-w-[7rem] text-right [font-family:var(--font-interface)] text-[0.8125rem] font-medium tracking-normal whitespace-normal text-text-secondary normal-case">
            {entry.scenario.name}
          </span>
        ),
        key: entry.scenario.id,
      }),
    ),
  ];

  return (
    <section aria-labelledby="trade-study-metrics-title">
      <LabHeading offset={1} id="trade-study-metrics-title">
        Mission comparison metrics
      </LabHeading>
      <p className="mt-1 max-w-[60ch] text-sm leading-6 text-pretty text-muted">
        Values as supplied by each completed analysis, one column per mission in
        scenario order, not ranked.
      </p>
      <DataTable
        caption="Metrics by mission"
        // Mono figures and sans words share one 20px line and a baseline,
        // so a figure never sits above the label in its row.
        className="mt-3 [&_tbody_:is(th,td)]:align-baseline"
        columns={columns}
        getRowKey={(row) => row.key}
        rows={METRIC_ROWS}
      />
    </section>
  );
}
