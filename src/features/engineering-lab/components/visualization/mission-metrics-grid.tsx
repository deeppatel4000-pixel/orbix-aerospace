import { Flame, Gauge, Orbit, Plane, Shield } from "lucide-react";

import type {
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";

export interface MissionMetricsGridProps {
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
  readonly vehicleReentryEvaluation?: VehicleReentryEvaluationAnalysis | null;
}

interface MissionMetric {
  readonly label: string;
  readonly unit?: string;
  readonly value: number | string | undefined;
}

interface MetricGroup {
  readonly icon: typeof Orbit;
  readonly id: string;
  readonly label: string;
  readonly metrics: readonly MissionMetric[];
}

const metricFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 2,
});

function MissionMetricReadout({ label, unit, value }: MissionMetric) {
  const displayValue =
    typeof value === "number" ? metricFormatter.format(value) : value;

  return (
    /* Stacked, not two competing columns.
     *
     * This row used `grid-cols-[minmax(0,1fr)_auto]`: a long value grew the
     * `auto` track, squeezed the label track toward zero, and the label — a
     * grid item, so still `min-width: auto` — painted past its own box under
     * the value. Two attempts to rebalance those tracks each fixed one side
     * and broke the other: giving the label `min-w-0` with `break-words` split
     * it one character per line, and putting a floor under the label column
     * pushed the value back over the label.
     *
     * There is no width at which "Peak deceleration" and "200,000.00 m" both
     * fit side by side in a ~150px column, so the columns were removed. The
     * label takes a line, the value takes the next, and neither can crowd the
     * other at any viewport. Verified by
     * `mission-telemetry-legibility.spec.ts`, which checks label fit, value
     * fit, intersection, row containment and word-boundary wrapping together.
     */
    <div className="min-h-12 border-b border-white/7 px-3 py-2.5 last:border-b-0 sm:px-4">
      <dt className="font-mono text-[0.56rem] leading-4 tracking-[0.11em] text-[#7f9499] uppercase">
        {label}
      </dt>
      <dd className="mt-1.5">
        <output
          className={
            "block font-mono text-sm font-semibold break-words tabular-nums " +
            (value === undefined ? "text-[#657a80]" : "text-[#dfe9ea]")
          }
        >
          {displayValue ?? "Not reported"}
          {value !== undefined && unit ? (
            <span className="ml-1 text-[0.61rem] font-normal text-[#82979c]">
              {unit}
            </span>
          ) : null}
        </output>
      </dd>
    </div>
  );
}

export function MissionMetricsGrid({
  missionProfileAnalysis,
  missionReport,
  vehicleReentryEvaluation,
}: MissionMetricsGridProps) {
  const transfer = missionReport?.orbitalAnalysis?.hohmannTransfer;
  const selectedVehicle = missionReport?.vehicleAnalysis?.selectedVehicle;
  const thermal = missionReport?.thermalAnalysis;
  const tps = thermal?.tpsRecommendation;

  const metricGroups: readonly MetricGroup[] = [
    {
      icon: Orbit,
      id: "orbital",
      label: "Orbital",
      metrics: [
        {
          label: "Initial altitude",
          unit: "m",
          value: transfer?.initialOrbit.altitudeMetres,
        },
        {
          label: "Final altitude",
          unit: "m",
          value: transfer?.finalOrbit.altitudeMetres,
        },
        {
          label: "Transfer duration",
          unit: "s",
          value: transfer?.transfer.transferTimeSeconds,
        },
        {
          label: "Total delta-v",
          unit: "m/s",
          value:
            missionReport?.orbitalAnalysis?.totalDeltaVMetresPerSecond ??
            missionProfileAnalysis?.totalDeltaVMetresPerSecond,
        },
      ],
    },
    {
      icon: Plane,
      id: "vehicle",
      label: "Vehicle",
      metrics: [
        {
          label: "Vehicle name",
          value:
            selectedVehicle?.vehicleName ??
            vehicleReentryEvaluation?.vehicle.vehicleName,
        },
        {
          label: "Peak deceleration",
          unit: "m/s²",
          value:
            vehicleReentryEvaluation?.summary.dynamics.peakDeceleration
              .decelerationMetersPerSecondSquared,
        },
        {
          label: "Reentry duration",
          unit: "s",
          value:
            vehicleReentryEvaluation?.summary.flight.reentryDurationSeconds,
        },
      ],
    },
    {
      icon: Flame,
      id: "thermal",
      label: "Thermal",
      metrics: [
        {
          label: "Peak heat flux",
          unit: "kW/m²",
          value: thermal?.thermalSummary.peakHeatFluxKilowattsPerSquareMetre,
        },
        {
          label: "Total heat load",
          unit: "MJ/m²",
          value: thermal?.thermalSummary.totalHeatLoadMegajoulesPerSquareMetre,
        },
        {
          label: "TPS material",
          value: tps?.material.name,
        },
        {
          label: "TPS mass",
          unit: "kg",
          value: tps?.estimatedTPSMassKilograms,
        },
        {
          label: "TPS thickness",
          unit: "mm",
          value: tps?.requiredThickness.millimetres,
        },
      ],
    },
  ];

  return (
    <section aria-labelledby="mission-metrics-title" className="min-w-0">
      <div className="flex flex-col gap-2 border-b border-white/10 pb-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[0.61rem] tracking-[0.16em] text-accent uppercase">
            <Gauge aria-hidden="true" size={14} />
            Engineering telemetry // Supplied values
          </p>
          <h3 className="mt-1 text-xl font-semibold" id="mission-metrics-title">
            Mission Metrics
          </h3>
        </div>
        <p className="flex items-center gap-2 text-xs text-[#7c9297]">
          <Shield aria-hidden="true" size={14} />
          No feasibility assessment
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {metricGroups.map((group) => {
          const Icon = group.icon;

          return (
            <section
              aria-labelledby={`mission-metrics-${group.id}`}
              className="overflow-hidden rounded-xl border border-white/10 bg-[#061015]/[0.78]"
              key={group.id}
            >
              <h4
                className="flex min-h-10 items-center gap-2 border-b border-white/10 bg-white/[0.025] px-3 font-mono text-[0.62rem] tracking-[0.14em] text-[#a9babd] uppercase sm:px-4"
                id={`mission-metrics-${group.id}`}
              >
                <Icon aria-hidden="true" className="text-accent" size={15} />
                {group.label}
              </h4>
              <dl>
                {group.metrics.map((metric) => (
                  <MissionMetricReadout key={metric.label} {...metric} />
                ))}
              </dl>
            </section>
          );
        })}
      </div>
    </section>
  );
}
