"use client";

import type { ReactNode } from "react";

import type { MissionReport } from "@/features/engineering-lab/types";

interface MissionReportViewerProps {
  readonly report: MissionReport;
}

interface ReportMetricProps {
  readonly label: string;
  /** Set for a word value (a classification), which is not set in mono. */
  readonly text?: boolean;
  readonly value: ReactNode;
}

const measurementFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 2,
});

const preciseFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
  minimumFractionDigits: 3,
});

function measure(value: number, unit: string): string {
  return `${measurementFormatter.format(value)} ${unit}`;
}

function precise(value: number, unit: string): string {
  return `${preciseFormatter.format(value)} ${unit}`;
}

/** One labelled value: label left, value right in tabular mono. */
function ReportMetric({ label, text = false, value }: ReportMetricProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-border-subtle py-2">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right">
        <output
          className={
            text ? "text-sm text-foreground" : "orbix-data text-foreground"
          }
        >
          {value}
        </output>
      </dd>
    </div>
  );
}

function MetricList({ children }: { readonly children: ReactNode }) {
  return <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">{children}</dl>;
}

export function MissionReportViewer({ report }: MissionReportViewerProps) {
  const { missionAssessment, missionSummary } = report;
  const orbital = report.orbitalAnalysis;
  const vehicle = report.vehicleAnalysis;
  const thermal = report.thermalAnalysis;
  const transfer = orbital?.hohmannTransfer;
  const planeChange = orbital?.orbitalPlaneChange;
  const tps = thermal?.tpsRecommendation;

  return (
    <article
      aria-labelledby="mission-report-title"
      aria-live="polite"
      className="min-w-0"
      role="region"
    >
      <header className="border-b border-border-subtle pb-4">
        <h3 className="orbix-h3 text-foreground" id="mission-report-title">
          Mission engineering report
        </h3>
        <p className="sr-only">
          Report updated for {missionSummary.missionName}.
        </p>
      </header>

      <div className="space-y-8 pt-6">
        <section aria-labelledby="mission-report-overview-title">
          <h4
            className="orbix-h4 text-foreground"
            id="mission-report-overview-title"
          >
            Mission overview
          </h4>
          <p className="orbix-label mt-3">Mission name</p>
          <output className="mt-1 block text-base font-semibold text-foreground">
            {missionSummary.missionName}
          </output>
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
            <h4
              className="orbix-h4 text-foreground"
              id="mission-report-orbital-title"
            >
              Orbital analysis
            </h4>

            <MetricList>
              <ReportMetric
                label="Total mission delta-v"
                value={measure(orbital.totalDeltaVMetresPerSecond, "m/s")}
              />
              <ReportMetric
                label="Maneuvers reported"
                value={orbital.maneuvers.length}
              />
              {transfer ? (
                <ReportMetric
                  label="Transfer duration"
                  value={measure(transfer.transfer.transferTimeHours, "h")}
                />
              ) : null}
            </MetricList>

            {transfer ? (
              <section
                aria-labelledby="mission-report-transfer-title"
                className="mt-6"
              >
                <h5
                  className="text-sm font-semibold text-foreground"
                  id="mission-report-transfer-title"
                >
                  Hohmann transfer
                </h5>
                <MetricList>
                  <ReportMetric
                    label="Initial orbit altitude"
                    value={measure(transfer.initialOrbit.altitudeMetres, "m")}
                  />
                  <ReportMetric
                    label="Final orbit altitude"
                    value={measure(transfer.finalOrbit.altitudeMetres, "m")}
                  />
                  <ReportMetric
                    label="Transfer semi-major axis"
                    value={measure(
                      transfer.transfer.transferSemiMajorAxisMetres,
                      "m",
                    )}
                  />
                  <ReportMetric
                    label="First burn delta-v"
                    value={measure(
                      transfer.transfer.firstBurnDeltaVMetresPerSecond,
                      "m/s",
                    )}
                  />
                  <ReportMetric
                    label="Second burn delta-v"
                    value={measure(
                      transfer.transfer.secondBurnDeltaVMetresPerSecond,
                      "m/s",
                    )}
                  />
                  <ReportMetric
                    label="Transfer delta-v"
                    value={measure(
                      transfer.transfer.totalDeltaVMetresPerSecond,
                      "m/s",
                    )}
                  />
                </MetricList>
              </section>
            ) : null}

            {planeChange ? (
              <section
                aria-labelledby="mission-report-plane-change-title"
                className="mt-6"
              >
                <h5
                  className="text-sm font-semibold text-foreground"
                  id="mission-report-plane-change-title"
                >
                  Orbital plane change
                </h5>
                <MetricList>
                  <ReportMetric
                    label="Inclination change"
                    value={measure(planeChange.inclinationChangeDegrees, "deg")}
                  />
                  <ReportMetric
                    label="Maneuver orbital velocity"
                    value={measure(
                      planeChange.orbitalVelocityMetresPerSecond,
                      "m/s",
                    )}
                  />
                  <ReportMetric
                    label="Plane-change delta-v"
                    value={measure(planeChange.deltaVMetresPerSecond, "m/s")}
                  />
                </MetricList>
              </section>
            ) : null}

            {orbital.maneuvers.length > 0 ? (
              <div
                aria-label="Delta-v maneuver breakdown"
                className="orbix-table-wrap mt-6"
                role="region"
                tabIndex={0}
              >
                <table className="orbix-table">
                  <caption className="sr-only">
                    Delta-v maneuver breakdown
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Maneuver</th>
                      <th className="text-right" scope="col">
                        Delta-v (m/s)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orbital.maneuvers.map((maneuver) => (
                      <tr key={maneuver.id}>
                        <th scope="row">{maneuver.name}</th>
                        <td className="orbix-data text-right">
                          <output>
                            {measurementFormatter.format(
                              maneuver.deltaVMetresPerSecond,
                            )}
                          </output>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
        ) : null}

        {vehicle ? (
          <section
            aria-labelledby="mission-report-vehicle-title"
            className="border-t border-border-subtle pt-8"
          >
            <h4
              className="orbix-h4 text-foreground"
              id="mission-report-vehicle-title"
            >
              Vehicle analysis
            </h4>
            <p className="orbix-label mt-3">Selected vehicle</p>
            <output className="mt-1 block text-base font-semibold text-foreground">
              {vehicle.selectedVehicle.vehicleName}
            </output>
            <MetricList>
              <ReportMetric
                label="Initial altitude"
                value={measure(
                  vehicle.performanceSummary.flight.initialAltitudeMeters,
                  "m",
                )}
              />
              <ReportMetric
                label="Initial velocity"
                value={measure(
                  vehicle.performanceSummary.flight
                    .initialVelocityMetersPerSecond,
                  "m/s",
                )}
              />
              <ReportMetric
                label="Final velocity"
                value={measure(
                  vehicle.performanceSummary.flight.finalState
                    .velocityMetersPerSecond,
                  "m/s",
                )}
              />
              <ReportMetric
                label="Reentry duration"
                value={measure(
                  vehicle.performanceSummary.flight.reentryDurationSeconds,
                  "s",
                )}
              />
              <ReportMetric
                label="Peak deceleration"
                value={measure(
                  vehicle.performanceSummary.dynamics.peakDeceleration
                    .decelerationMetersPerSecondSquared,
                  "m/s²",
                )}
              />
              <ReportMetric
                label="Peak deceleration load"
                value={measure(
                  vehicle.performanceSummary.dynamics.peakDeceleration
                    .decelerationGs,
                  "g",
                )}
              />
              {thermal ? (
                <ReportMetric
                  label="Peak heating"
                  value={measure(
                    thermal.thermalSummary.peakHeatFluxKilowattsPerSquareMetre,
                    "kW/m²",
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
            <h4
              className="orbix-h4 text-foreground"
              id="mission-report-thermal-title"
            >
              Thermal protection
            </h4>

            <MetricList>
              <ReportMetric
                label="Peak heat flux"
                value={measure(
                  thermal.thermalSummary.peakHeatFluxWattsPerSquareMetre,
                  "W/m²",
                )}
              />
              <ReportMetric
                label="Total heat load"
                value={precise(
                  thermal.thermalSummary.totalHeatLoadMegajoulesPerSquareMetre,
                  "MJ/m²",
                )}
              />
              <ReportMetric
                label="Peak heating altitude"
                value={measure(
                  thermal.thermalSummary.peakHeatingAltitudeMeters,
                  "m",
                )}
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
                    value={precise(tps.requiredThickness.millimetres, "mm")}
                  />
                  <ReportMetric
                    label="Estimated TPS mass"
                    value={precise(tps.estimatedTPSMassKilograms, "kg")}
                  />
                  <ReportMetric
                    label="Thermal margin"
                    value={
                      measurementFormatter.format(
                        tps.thermalMargin.marginPercentage,
                      ) + "%"
                    }
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
          <h4
            className="orbix-h4 text-foreground"
            id="mission-report-assumptions-title"
          >
            Assumptions and limits
          </h4>
          <p className="mt-3 max-w-[68ch] text-sm leading-6 text-text-secondary">
            {missionAssessment.educationalSummary}
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <h5 className="text-sm font-semibold text-foreground">
                Model assumptions
              </h5>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                {missionAssessment.modelAssumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-semibold text-foreground">Limits</h5>
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
