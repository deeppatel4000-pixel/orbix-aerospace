import type {
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";
import { formatLabValue } from "../visualization/format-lab-value";
import { formatFigure } from "@/components/ui/readout";
import { LabHeading } from "../visualization/lab-heading";
import { LabUnit } from "../visualization/lab-unit";
import { THERMAL_MODEL_NOTE } from "../visualization/thermal-model-note";

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
      className="min-w-0 py-4 xl:row-span-3 xl:grid xl:grid-rows-subgrid"
    >
      <LabHeading offset={2} variant="sub" id={`briefing-summary-${id}`}>
        {title}
      </LabHeading>
      <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      {/* One rule under the heading block, then rows separated by space
       * only. Figures (B612 Mono) sit on the label's line, right-aligned;
       * words (vehicle, material, margin) go on their own line under the
       * label, left-aligned, so they never wrap ragged against the edge. */}
      <dl className="mt-3 self-start border-t border-border-subtle pt-2">
        {metrics.map((metric) =>
          typeof metric.value === "number" ? (
            <div
              className="flex items-baseline justify-between gap-4 py-1.5 text-sm"
              key={metric.label}
            >
              <dt className="shrink-0 text-muted">{metric.label}</dt>
              <dd className="text-right whitespace-nowrap">
                <output className="orbix-data text-foreground">
                  {formatFigure(formatLabValue(metric.value))}
                  {metric.unit ? <LabUnit unit={metric.unit} /> : null}
                </output>
              </dd>
            </div>
          ) : (
            <div className="py-1.5 text-sm" key={metric.label}>
              <dt className="text-muted">{metric.label}</dt>
              <dd className="mt-0.5 min-w-0 break-words">
                <output
                  className={
                    metric.value === undefined
                      ? "text-muted"
                      : "text-foreground"
                  }
                >
                  {metric.value ?? "Not reported"}
                </output>
              </dd>
            </div>
          ),
        )}
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
      <LabHeading offset={1} id="mission-briefing-system-summary-title">
        Engineering summary
      </LabHeading>

      {/* Three open groups separated by space; each has one rule under its
       * heading and no box (spec 6). From xl each group shares the grid's
       * rows through subgrid, so the heading, the description and the
       * first data row line up across columns. */}
      <div className="mt-3 grid gap-y-4 xl:grid-cols-3 xl:gap-x-10">
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
          description="Reported heating and thermal-protection outputs."
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
      <p className="mt-3 max-w-[68ch] text-sm leading-6 text-muted">
        {THERMAL_MODEL_NOTE}
      </p>
    </section>
  );
}
