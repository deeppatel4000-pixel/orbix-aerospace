import type {
  MissionProfileAnalysis,
  MissionReport,
  VehicleReentryEvaluationAnalysis,
} from "@/features/engineering-lab/types";
import { formatFigure } from "@/components/ui/readout";

import { altitudeReadout, formatLabValue } from "./format-lab-value";
import { LabHeading } from "./lab-heading";
import { LabUnit } from "./lab-unit";
import { THERMAL_MODEL_NOTE } from "./thermal-model-note";

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
  readonly id: string;
  readonly label: string;
  readonly metrics: readonly MissionMetric[];
}

function MissionMetricReadout({ label, unit, value }: MissionMetric) {
  const displayValue =
    typeof value === "number" ? formatLabValue(value) : value;

  return (
    /* Stacked, not two competing columns.
     *
     * This row used `grid-cols-[minmax(0,1fr)_auto]`: a long value grew the
     * `auto` track, squeezed the label track toward zero, and the label (a
     * grid item, so still `min-width: auto`) painted past its own box under
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
    <div className="border-t border-border-subtle py-2">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-0.5">
        <output
          className={
            "block break-words " +
            (value === undefined
              ? "text-sm text-muted"
              : typeof value === "number"
                ? "orbix-data text-foreground"
                : "text-sm text-foreground")
          }
        >
          {displayValue === undefined
            ? "Not reported"
            : formatFigure(displayValue)}
          {value !== undefined && unit ? <LabUnit unit={unit} /> : null}
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
      id: "orbital",
      label: "Orbital",
      metrics: [
        {
          label: "Initial altitude",
          ...altitudeReadout(transfer?.initialOrbit.altitudeMetres),
        },
        {
          label: "Final altitude",
          ...altitudeReadout(transfer?.finalOrbit.altitudeMetres),
        },
        {
          label: "Transfer duration",
          unit: "h",
          value: transfer?.transfer.transferTimeHours,
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
          // g, as in every other mission view and the reentry profile.
          unit: "g",
          value:
            vehicleReentryEvaluation?.summary.dynamics.peakDeceleration
              .decelerationGs,
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
      <LabHeading id="mission-metrics-title">Mission metrics</LabHeading>

      <div className="mt-3 grid gap-x-8 gap-y-4 lg:grid-cols-3">
        {metricGroups.map((group) => (
          <section
            aria-labelledby={`mission-metrics-${group.id}`}
            className="min-w-0"
            key={group.id}
          >
            <LabHeading
              id={`mission-metrics-${group.id}`}
              offset={1}
              variant="sub"
            >
              {group.label}
            </LabHeading>
            <dl className="mt-1">
              {group.metrics.map((metric) => (
                <MissionMetricReadout key={metric.label} {...metric} />
              ))}
            </dl>
          </section>
        ))}
      </div>
      {thermal ? (
        <p className="mt-3 max-w-[68ch] text-[0.8125rem] leading-5 text-muted">
          {THERMAL_MODEL_NOTE}
        </p>
      ) : null}
    </section>
  );
}
