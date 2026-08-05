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

function MissionMetricCard({ label, unit, value }: MissionMetric) {
  const displayValue =
    typeof value === "number" ? metricFormatter.format(value) : value;

  return (
    <div className="min-h-28 rounded-xl border border-white/10 bg-[#081419] p-4 transition-colors hover:border-accent/25 motion-reduce:transition-none">
      <dt className="font-mono text-[0.57rem] tracking-[0.12em] text-[#71878d] uppercase">
        {label}
      </dt>
      <dd className="mt-3">
        <output
          className={
            "font-mono text-base font-semibold " +
            (value === undefined ? "text-[#657a80]" : "text-[#dfe9ea]")
          }
        >
          {displayValue ?? "Not reported"}
          {value !== undefined && unit ? (
            <span className="ml-1 text-[0.68rem] font-normal text-[#83999e]">
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
    <section aria-labelledby="mission-metrics-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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

      <div className="mt-5 space-y-5">
        {metricGroups.map((group) => {
          const Icon = group.icon;

          return (
            <section
              aria-labelledby={`mission-metrics-${group.id}`}
              key={group.id}
            >
              <h4
                className="flex items-center gap-2 font-mono text-[0.66rem] tracking-[0.12em] text-[#9fb2b6] uppercase"
                id={`mission-metrics-${group.id}`}
              >
                <Icon aria-hidden="true" className="text-accent" size={15} />
                {group.label}
              </h4>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {group.metrics.map((metric) => (
                  <MissionMetricCard key={metric.label} {...metric} />
                ))}
              </dl>
            </section>
          );
        })}
      </div>
    </section>
  );
}
