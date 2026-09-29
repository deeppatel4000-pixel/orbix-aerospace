import type {
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";
import { formatLabValue } from "../visualization/format-lab-value";
import { formatFigure } from "@/components/ui/readout";
import { LabHeading } from "../visualization/lab-heading";

export interface ShowcaseTelemetryProps {
  readonly missionProfile: MissionProfileAnalysis;
  readonly report?: MissionReport;
}

interface TelemetryValue {
  readonly label: string;
  readonly unit?: string;
  readonly value?: number | string;
}

function TelemetryCard({ label, unit, value }: TelemetryValue) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle py-2 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">
        <output
          className={
            value === undefined
              ? "text-muted"
              : typeof value === "number"
                ? "orbix-data text-foreground"
                : "text-foreground"
          }
        >
          {typeof value === "number"
            ? formatFigure(formatLabValue(value))
            : (value ?? "Not reported")}
          {value !== undefined && unit ? (
            <span className="ml-1 text-muted">{unit}</span>
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
    id: string;
    label: string;
    values: readonly TelemetryValue[];
  }[] = [
    {
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
          unit: "h",
          value: transfer?.transfer.transferTimeHours,
        },
      ],
    },
    {
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
      <LabHeading offset={1} id="showcase-telemetry-title">
        Mission values
      </LabHeading>
      <p className="mt-1 text-sm leading-6 text-muted">
        Values from the completed calculation. No values recalculated.
      </p>

      <div className="mt-3 grid gap-x-8 gap-y-4 xl:grid-cols-3">
        {telemetryGroups.map((group) => (
          <section
            aria-labelledby={`showcase-telemetry-${group.id}`}
            key={group.id}
          >
            <LabHeading
              offset={2}
              variant="sub"
              id={`showcase-telemetry-${group.id}`}
            >
              {group.label}
            </LabHeading>
            <dl className="mt-2">
              {group.values.map((value) => (
                <TelemetryCard key={value.label} {...value} />
              ))}
            </dl>
          </section>
        ))}
      </div>
    </section>
  );
}
