import { Flame, Orbit, Plane, type LucideIcon } from "lucide-react";

import type {
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

export interface BriefingSystemSummaryProps {
  readonly missionProfile: MissionProfileAnalysis;
  readonly report?: MissionReport;
}

interface SummaryMetric {
  readonly label: string;
  readonly unit?: string;
  readonly value?: number | string;
}

interface SummaryCardProps {
  readonly description: string;
  readonly icon: LucideIcon;
  readonly id: string;
  readonly metrics: readonly SummaryMetric[];
  readonly title: string;
}

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

function SummaryCard({
  description,
  icon: Icon,
  id,
  metrics,
  title,
}: SummaryCardProps) {
  return (
    <article
      aria-labelledby={`briefing-summary-${id}`}
      className="rounded-2xl border border-white/10 bg-[#081419]/90 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.14)] transition-transform hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.58rem] tracking-[0.15em] text-[#789097] uppercase">
            Engineering summary
          </p>
          <h4
            className="mt-1 text-lg font-semibold"
            id={`briefing-summary-${id}`}
          >
            {title}
          </h4>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/6 text-accent">
          <Icon aria-hidden="true" size={18} />
        </span>
      </div>
      <p className="mt-3 min-h-12 text-xs leading-5 text-[#7f9499]">
        {description}
      </p>
      <dl className="mt-4 divide-y divide-white/8 border-t border-white/8">
        {metrics.map((metric) => (
          <div
            className="flex items-start justify-between gap-4 py-3 text-sm"
            key={metric.label}
          >
            <dt className="text-[#81969b]">{metric.label}</dt>
            <dd className="text-right font-mono font-semibold text-[#d8e3e4]">
              <output>
                {typeof metric.value === "number"
                  ? numberFormatter.format(metric.value)
                  : (metric.value ?? "Not reported")}
                {metric.value !== undefined && metric.unit ? (
                  <span className="ml-1 text-[0.66rem] font-normal text-[#7d9297]">
                    {metric.unit}
                  </span>
                ) : null}
              </output>
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export function BriefingSystemSummary({
  missionProfile,
  report,
}: BriefingSystemSummaryProps) {
  const deltaVBudget = missionProfile.sourceAnalyses.deltaVBudget;
  const transfer =
    report?.orbitalAnalysis?.hohmannTransfer ??
    deltaVBudget?.sourceAnalyses.hohmannTransfer;
  const vehicleEvaluation =
    missionProfile.sourceAnalyses.vehicleReentryEvaluation ??
    missionProfile.selectedVehicleRecommendation?.evaluation;
  const selectedVehicle =
    report?.vehicleAnalysis?.selectedVehicle ?? vehicleEvaluation?.vehicle;
  const vehicleSummary =
    report?.vehicleAnalysis?.performanceSummary ?? vehicleEvaluation?.summary;
  const thermalSummary =
    report?.thermalAnalysis?.thermalSummary ??
    vehicleEvaluation?.summary.thermal;
  const tps = report?.thermalAnalysis?.tpsRecommendation;
  const fallbackTps = vehicleEvaluation?.summary.tps;

  return (
    <section aria-labelledby="mission-briefing-system-summary-title">
      <p className="font-mono text-[0.6rem] tracking-[0.16em] text-accent uppercase">
        Telemetry cards // Existing outputs
      </p>
      <h3
        className="mt-1 text-xl font-semibold"
        id="mission-briefing-system-summary-title"
      >
        Engineering Summary
      </h3>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <SummaryCard
          description="Reported orbital maneuver and transfer information from the completed mission profile."
          icon={Orbit}
          id="orbital"
          metrics={[
            {
              label: "Transfer type",
              value: transfer
                ? "Hohmann transfer"
                : deltaVBudget
                  ? "Maneuver budget"
                  : undefined,
            },
            {
              label: "Total delta-v",
              unit: "m/s",
              value:
                report?.orbitalAnalysis?.totalDeltaVMetresPerSecond ??
                missionProfile.totalDeltaVMetresPerSecond,
            },
            {
              label: "Transfer duration",
              unit: "h",
              value: transfer?.transfer.transferTimeHours,
            },
          ]}
          title="Orbital"
        />
        <SummaryCard
          description="Selected vehicle and completed atmospheric-entry performance outputs."
          icon={Plane}
          id="vehicle"
          metrics={[
            { label: "Selected vehicle", value: selectedVehicle?.vehicleName },
            {
              label: "Peak deceleration",
              unit: "g",
              value: vehicleSummary?.dynamics.peakDeceleration.decelerationGs,
            },
            {
              label: "Reentry duration",
              unit: "s",
              value: vehicleSummary?.flight.reentryDurationSeconds,
            },
          ]}
          title="Vehicle"
        />
        <SummaryCard
          description="Reported heating and thermal-protection outputs; no suitability decision is added here."
          icon={Flame}
          id="thermal"
          metrics={[
            {
              label: "Peak heating",
              unit: "kW/m²",
              value: thermalSummary?.peakHeatFluxKilowattsPerSquareMetre,
            },
            {
              label: "TPS material",
              value:
                tps?.material.name ?? fallbackTps?.recommendedMaterial.name,
            },
            {
              label: "TPS mass",
              unit: "kg",
              value:
                tps?.estimatedTPSMassKilograms ??
                fallbackTps?.estimatedTPSMassKilograms,
            },
            {
              label: "Margin classification",
              value:
                tps?.thermalMargin.classification ??
                fallbackTps?.thermalMargin.classification,
            },
          ]}
          title="Thermal"
        />
      </div>
    </section>
  );
}
