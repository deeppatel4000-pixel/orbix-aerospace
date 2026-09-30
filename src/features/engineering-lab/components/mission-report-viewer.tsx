"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import type {
  MissionPresetCategory,
  MissionReport,
} from "@/features/engineering-lab/types";
import { formatFigure } from "@/components/ui/readout";
import {
  altitudeReadout,
  formatLabValue,
} from "@/features/engineering-lab/components/visualization/format-lab-value";
import { LabHeading } from "@/features/engineering-lab/components/visualization/lab-heading";
import { MissionIdentity } from "@/features/engineering-lab/components/visualization/mission-identity";
import { LabUnit } from "./visualization/lab-unit";
import { THERMAL_MODEL_NOTE } from "./visualization/thermal-model-note";

interface MissionReportViewerProps {
  readonly category?: MissionPresetCategory;
  readonly report: MissionReport;
}

interface ReportMetricProps {
  readonly label: string;
  /** Set for a word value (a classification), which is not set in mono. */
  readonly text?: boolean;
  /** Muted unit after the value, as in the metrics grid and briefing. */
  readonly unit?: string;
  readonly value: ReactNode;
}

/**
 * Every figure goes through the lab's shared formatter, so the report
 * matches the briefing, mission control and the viewer: two decimals at
 * most, three significant figures below 1, no padded zeros.
 */
function figure(value: number): string {
  return formatLabValue(value);
}

/** One labelled value: label left, value right in tabular mono. */
function ReportMetric({ label, text = false, unit, value }: ReportMetricProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle py-2">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right">
        <output
          className={
            text ? "text-sm text-foreground" : "orbix-data text-foreground"
          }
        >
          {text ? value : formatFigure(value)}
          {unit ? <LabUnit unit={unit} /> : null}
        </output>
      </dd>
    </div>
  );
}

/** An altitude row in km from 1 km up, as the orbit diagrams label it. */
function AltitudeMetric({
  label,
  metres,
}: {
  readonly label: string;
  readonly metres: number;
}) {
  const { unit, value } = altitudeReadout(metres);
  return <ReportMetric label={label} unit={unit} value={figure(value)} />;
}

function MetricList({ children }: { readonly children: ReactNode }) {
  return <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">{children}</dl>;
}

export function MissionReportViewer({
  category,
  report,
}: MissionReportViewerProps) {
  const { missionAssessment, missionSummary } = report;
  const orbital = report.orbitalAnalysis;
  const vehicle = report.vehicleAnalysis;
  const thermal = report.thermalAnalysis;
  const transfer = orbital?.hohmannTransfer;
  const planeChange = orbital?.orbitalPlaneChange;
  const tps = thermal?.tpsRecommendation;

  // The status line stays empty on first render and is rewritten on every
  // later report, with a running update number, so each update (even one
  // that keeps the mission name) is announced once.
  const [announcement, setAnnouncement] = useState("");
  const updateCount = useRef(0);
  const firstReport = useRef(report);
  useEffect(() => {
    if (report === firstReport.current) {
      return;
    }
    updateCount.current += 1;
    const deltaV =
      orbital === undefined
        ? ""
        : ` Total delta-v ${figure(orbital.totalDeltaVMetresPerSecond)} m/s.`;
    setAnnouncement(
      `Report ${updateCount.current + 1} ready for ${missionSummary.missionName}.${deltaV}`,
    );
  }, [report, orbital, missionSummary.missionName]);

  return (
    <article aria-labelledby="mission-report-title" className="min-w-0">
      <MissionIdentity
        category={category}
        headingId="mission-report-title"
        missionName={missionSummary.missionName}
      >
        {/* Only this line is live, so an update announces one sentence
         * rather than every value in the report. */}
        <p className="sr-only" role="status">
          {announcement}
        </p>
      </MissionIdentity>

      <div className="space-y-8 pt-6">
        <section aria-labelledby="mission-report-overview-title">
          <LabHeading id="mission-report-overview-title" offset={1}>
            Mission overview
          </LabHeading>
          <p className="mt-3 max-w-[68ch] text-sm leading-6 text-muted">
            {missionSummary.description}
          </p>
          <div className="mt-4 border-t border-border-subtle pt-3">
            <p className="orbix-label">Systems used</p>
            {missionSummary.systemsUsed.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                {missionSummary.systemsUsed.map((system) => (
                  <li key={system}>{system}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">
                No optional engineering systems were included.
              </p>
            )}
          </div>
        </section>

        {orbital ? (
          <section
            aria-labelledby="mission-report-orbital-title"
            className="border-t border-border-subtle pt-8"
          >
            <LabHeading id="mission-report-orbital-title" offset={1}>
              Orbital analysis
            </LabHeading>

            <MetricList>
              <ReportMetric
                label="Total mission delta-v"
                unit="m/s"
                value={figure(orbital.totalDeltaVMetresPerSecond)}
              />
              <ReportMetric
                label="Maneuvers reported"
                value={orbital.maneuvers.length}
              />
              {transfer ? (
                <ReportMetric
                  label="Transfer duration"
                  unit="h"
                  value={figure(transfer.transfer.transferTimeHours)}
                />
              ) : null}
            </MetricList>

            {transfer ? (
              <section
                aria-labelledby="mission-report-transfer-title"
                className="mt-6"
              >
                <LabHeading
                  id="mission-report-transfer-title"
                  offset={2}
                  variant="sub"
                >
                  Hohmann transfer
                </LabHeading>
                <MetricList>
                  <AltitudeMetric
                    label="Initial orbit altitude"
                    metres={transfer.initialOrbit.altitudeMetres}
                  />
                  <AltitudeMetric
                    label="Final orbit altitude"
                    metres={transfer.finalOrbit.altitudeMetres}
                  />
                  <ReportMetric
                    label="Transfer semi-major axis"
                    unit="km"
                    value={figure(
                      transfer.transfer.transferSemiMajorAxisMetres / 1_000,
                    )}
                  />
                  <ReportMetric
                    label="First burn delta-v"
                    unit="m/s"
                    value={figure(
                      transfer.transfer.firstBurnDeltaVMetresPerSecond,
                    )}
                  />
                  <ReportMetric
                    label="Second burn delta-v"
                    unit="m/s"
                    value={figure(
                      transfer.transfer.secondBurnDeltaVMetresPerSecond,
                    )}
                  />
                  <ReportMetric
                    label="Transfer delta-v"
                    unit="m/s"
                    value={figure(transfer.transfer.totalDeltaVMetresPerSecond)}
                  />
                </MetricList>
              </section>
            ) : null}

            {planeChange ? (
              <section
                aria-labelledby="mission-report-plane-change-title"
                className="mt-6"
              >
                <LabHeading
                  id="mission-report-plane-change-title"
                  offset={2}
                  variant="sub"
                >
                  Orbital plane change
                </LabHeading>
                <MetricList>
                  <ReportMetric
                    label="Inclination change"
                    unit="°"
                    value={figure(planeChange.inclinationChangeDegrees)}
                  />
                  <ReportMetric
                    label="Maneuver orbital velocity"
                    unit="m/s"
                    value={figure(planeChange.orbitalVelocityMetresPerSecond)}
                  />
                  <ReportMetric
                    label="Plane-change delta-v"
                    unit="m/s"
                    value={figure(planeChange.deltaVMetresPerSecond)}
                  />
                </MetricList>
              </section>
            ) : null}

            {orbital.maneuvers.length > 0 ? (
              // Name and value pairs on hairlines, like the rows above; a
              // bordered table here would be a second panel in the tool.
              <section
                aria-labelledby="mission-report-maneuvers-title"
                className="mt-6"
              >
                <LabHeading
                  id="mission-report-maneuvers-title"
                  offset={2}
                  variant="sub"
                >
                  Delta-v maneuver breakdown
                </LabHeading>
                <MetricList>
                  {orbital.maneuvers.map((maneuver) => (
                    <ReportMetric
                      key={maneuver.id}
                      label={maneuver.name}
                      unit="m/s"
                      value={figure(maneuver.deltaVMetresPerSecond)}
                    />
                  ))}
                </MetricList>
              </section>
            ) : null}
          </section>
        ) : null}

        {vehicle ? (
          <section
            aria-labelledby="mission-report-vehicle-title"
            className="border-t border-border-subtle pt-8"
          >
            <LabHeading id="mission-report-vehicle-title" offset={1}>
              Vehicle analysis
            </LabHeading>
            <p className="orbix-label mt-3">Selected vehicle</p>
            <output className="mt-1 block text-base font-semibold text-foreground">
              {vehicle.selectedVehicle.vehicleName}
            </output>
            <MetricList>
              <AltitudeMetric
                label="Initial altitude"
                metres={vehicle.performanceSummary.flight.initialAltitudeMeters}
              />
              <ReportMetric
                label="Initial velocity"
                unit="m/s"
                value={figure(
                  vehicle.performanceSummary.flight
                    .initialVelocityMetersPerSecond,
                )}
              />
              <ReportMetric
                label="Final velocity"
                unit="m/s"
                value={figure(
                  vehicle.performanceSummary.flight.finalState
                    .velocityMetersPerSecond,
                )}
              />
              <ReportMetric
                label="Reentry duration"
                unit="s"
                value={figure(
                  vehicle.performanceSummary.flight.reentryDurationSeconds,
                )}
              />
              {/* g first, as in every mission view; m/s² as the
               * secondary unit. */}
              <ReportMetric
                label="Peak deceleration"
                value={
                  <>
                    {figure(
                      vehicle.performanceSummary.dynamics.peakDeceleration
                        .decelerationGs,
                    )}
                    <LabUnit unit="g" />
                    <span className="ml-2 text-muted">
                      (
                      {figure(
                        vehicle.performanceSummary.dynamics.peakDeceleration
                          .decelerationMetersPerSecondSquared,
                      )}{" "}
                      m/s²)
                    </span>
                  </>
                }
              />
              {thermal ? (
                <ReportMetric
                  label="Peak heating"
                  unit="kW/m²"
                  value={figure(
                    thermal.thermalSummary.peakHeatFluxKilowattsPerSquareMetre,
                  )}
                />
              ) : null}
            </MetricList>
          </section>
        ) : null}

        {thermal ? (
          <section
            aria-labelledby="mission-report-thermal-title"
            className="border-t border-border-subtle pt-8"
          >
            <LabHeading id="mission-report-thermal-title" offset={1}>
              Thermal protection
            </LabHeading>
            <p className="mt-1 max-w-[68ch] text-[0.8125rem] leading-5 text-muted">
              {THERMAL_MODEL_NOTE}
            </p>

            <MetricList>
              <ReportMetric
                label="Peak heat flux"
                unit="kW/m²"
                value={figure(
                  thermal.thermalSummary.peakHeatFluxKilowattsPerSquareMetre,
                )}
              />
              <ReportMetric
                label="Total heat load"
                unit="MJ/m²"
                value={figure(
                  thermal.thermalSummary.totalHeatLoadMegajoulesPerSquareMetre,
                )}
              />
              <AltitudeMetric
                label="Peak heating altitude"
                metres={thermal.thermalSummary.peakHeatingAltitudeMeters}
              />
            </MetricList>

            {tps ? (
              <div className="mt-6">
                <p className="orbix-label">TPS recommendation</p>
                <output className="mt-1 block text-base font-semibold text-foreground">
                  {tps.material.name}
                </output>
                <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
                  {tps.material.description}
                </p>
                <MetricList>
                  <ReportMetric
                    label="Required thickness"
                    unit="mm"
                    value={figure(tps.requiredThickness.millimetres)}
                  />
                  <ReportMetric
                    label="Estimated TPS mass"
                    unit="kg"
                    value={figure(tps.estimatedTPSMassKilograms)}
                  />
                  <ReportMetric
                    label="Thermal margin"
                    unit="%"
                    value={figure(tps.thermalMargin.marginPercentage)}
                  />
                  <ReportMetric
                    label="Margin classification"
                    text
                    value={tps.thermalMargin.classification}
                  />
                </MetricList>
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted">
                No TPS recommendation is present in this report.
              </p>
            )}
          </section>
        ) : null}

        <section
          aria-labelledby="mission-report-assumptions-title"
          className="border-t border-border-subtle pt-8"
        >
          <LabHeading id="mission-report-assumptions-title" offset={1}>
            Assumptions and limits
          </LabHeading>
          <p className="mt-3 max-w-[68ch] text-sm leading-6 text-text-secondary">
            {missionAssessment.educationalSummary}
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <LabHeading offset={2} variant="sub">
                Model assumptions
              </LabHeading>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                {missionAssessment.modelAssumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
            </div>
            <div>
              <LabHeading offset={2} variant="sub">
                Limits
              </LabHeading>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                {missionAssessment.limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
