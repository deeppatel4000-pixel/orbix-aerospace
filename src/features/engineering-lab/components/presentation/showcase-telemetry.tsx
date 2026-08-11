import { Activity, Flame, Gauge, Orbit, Shield } from "lucide-react";

import type {
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

export interface ShowcaseTelemetryProps {
  readonly missionProfile: MissionProfileAnalysis;
  readonly report?: MissionReport;
}

interface TelemetryValue {
  readonly label: string;
  readonly unit?: string;
  readonly value?: number | string;
}

const telemetryFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

function TelemetryCard({ label, unit, value }: TelemetryValue) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface/90 p-4">
      <dt className="font-mono text-[0.55rem] tracking-[0.12em] text-muted uppercase">
        {label}
      </dt>
      <dd className="mt-2">
        <output className="font-mono text-sm font-semibold text-foreground">
          {typeof value === "number"
            ? telemetryFormatter.format(value)
            : (value ?? "Not reported")}
          {value !== undefined && unit ? (
            <span className="ml-1 text-[0.65rem] font-normal text-muted">
              {unit}
            </span>
          ) : null}
        </output>
      </dd>
    </div>
  );
}

export function ShowcaseTelemetry({
  missionProfile,
  report,
}: ShowcaseTelemetryProps) {
  const transfer =
    report?.orbitalAnalysis?.hohmannTransfer ??
    missionProfile.sourceAnalyses.deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const evaluation =
    missionProfile.sourceAnalyses.vehicleReentryEvaluation ??
    missionProfile.selectedVehicleRecommendation?.evaluation;
  const performance =
    report?.vehicleAnalysis?.performanceSummary ?? evaluation?.summary;
  const thermal =
    report?.thermalAnalysis?.thermalSummary ?? evaluation?.summary.thermal;
  const tps = report?.thermalAnalysis?.tpsRecommendation;
  const fallbackTps = evaluation?.summary.tps;
  const telemetryGroups: readonly {
    icon: typeof Orbit;
    id: string;
    label: string;
    values: readonly TelemetryValue[];
  }[] = [
    {
      icon: Orbit,
      id: "orbital",
      label: "Orbital",
      values: [
        {
          label: "Delta-v",
          unit: "m/s",
          value:
            report?.orbitalAnalysis?.totalDeltaVMetresPerSecond ??
            missionProfile.totalDeltaVMetresPerSecond,
        },
        {
          label: "Transfer time",
          unit: "s",
          value: transfer?.transfer.transferTimeSeconds,
        },
      ],
    },
    {
      icon: Gauge,
      id: "vehicle",
      label: "Vehicle",
      values: [
        {
          label: "Peak deceleration",
          unit: "g",
          value: performance?.dynamics.peakDeceleration.decelerationGs,
        },
      ],
    },
    {
      icon: Flame,
      id: "thermal",
      label: "Thermal",
      values: [
        {
          label: "Peak heat flux",
          unit: "kW/m²",
          value: thermal?.peakHeatFluxKilowattsPerSquareMetre,
        },
        {
          label: "TPS material",
          value: tps?.material.name ?? fallbackTps?.recommendedMaterial.name,
        },
        {
          label: "TPS mass",
          unit: "kg",
          value:
            tps?.estimatedTPSMassKilograms ??
            fallbackTps?.estimatedTPSMassKilograms,
        },
      ],
    },
  ];

  return (
    <section aria-labelledby="showcase-telemetry-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.16em] text-accent uppercase">
            <Activity aria-hidden="true" size={14} />
            Telemetry overlay // Supplied values
          </p>
          <h3
            className="mt-1 text-xl font-semibold"
            id="showcase-telemetry-title"
          >
            Mission Telemetry
          </h3>
        </div>
        <p className="flex items-center gap-2 text-xs text-muted">
          <Shield aria-hidden="true" size={14} />
          No values recalculated
        </p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {telemetryGroups.map((group) => {
          const Icon = group.icon;
          return (
            <section
              aria-labelledby={`showcase-telemetry-${group.id}`}
              className="rounded-2xl border border-white/10 bg-black/15 p-4"
              key={group.id}
            >
              <h4
                className="text-muted-strong flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.12em] uppercase"
                id={`showcase-telemetry-${group.id}`}
              >
                <Icon aria-hidden="true" className="text-accent" size={14} />
                {group.label}
              </h4>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                {group.values.map((value) => (
                  <TelemetryCard key={value.label} {...value} />
                ))}
              </dl>
            </section>
          );
        })}
      </div>
    </section>
  );
}
