import type {
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";
import { formatLabValue } from "../visualization/format-lab-value";

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
  readonly id: string;
  readonly metrics: readonly SummaryMetric[];
  readonly title: string;
}

function SummaryCard({ description, id, metrics, title }: SummaryCardProps) {
  return (
    <section
      aria-labelledby={`briefing-summary-${id}`}
      className="rounded-md border border-border p-4"
    >
      <h5
        className="text-sm font-semibold text-foreground"
        id={`briefing-summary-${id}`}
      >
        {title}
      </h5>
      <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      <dl className="mt-3">
        {metrics.map((metric) => (
          <div
            className="flex items-baseline justify-between gap-4 border-t border-border-subtle py-2 text-sm"
            key={metric.label}
          >
            <dt className="text-muted">{metric.label}</dt>
            <dd className="text-right">
              <output
                className={
                  metric.value === undefined
                    ? "text-muted"
                    : typeof metric.value === "number"
                      ? "orbix-data text-foreground"
                      : "text-foreground"
                }
              >
                {typeof metric.value === "number"
                  ? formatLabValue(metric.value)
                  : (metric.value ?? "Not reported")}
                {metric.value !== undefined && metric.unit ? (
                  <span className="ml-1 text-muted">{metric.unit}</span>
                ) : null}
              </output>
            </dd>
          </div>
        ))}
      </dl>
    </section>
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
      <h4
        className="orbix-h4 text-foreground"
        id="mission-briefing-system-summary-title"
      >
        Engineering summary
      </h4>

      <div className="mt-3 grid gap-4 xl:grid-cols-3">
        <SummaryCard
          description="Reported orbital maneuver and transfer information from the completed mission profile."
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
