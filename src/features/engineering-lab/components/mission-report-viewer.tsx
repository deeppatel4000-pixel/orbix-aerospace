"use client";

import type { ReactNode } from "react";
import {
  AlertTriangle,
  CircleDot,
  FileText,
  Flame,
  Gauge,
  Orbit,
  Plane,
  Shield,
} from "lucide-react";

import type { MissionReport } from "@/features/engineering-lab/types";

interface MissionReportViewerProps {
  readonly report: MissionReport;
}

interface ReportMetricProps {
  readonly label: string;
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

function ReportMetric({ label, value }: ReportMetricProps) {
  return (
    <div className="rounded-xl border border-border bg-background/35 p-4">
      <dt className="text-xs leading-5 text-muted">{label}</dt>
      <dd className="mt-1.5">
        <output className="font-mono text-sm font-semibold text-foreground">
          {value}
        </output>
      </dd>
    </div>
  );
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
      className="overflow-hidden rounded-2xl border border-border bg-background/35"
      role="region"
    >
      <header className="technical-grid border-b border-border p-5 sm:p-7">
        <p className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.16em] text-accent uppercase">
          <FileText aria-hidden="true" size={16} />
          Structured engineering report
        </p>
        <h3
          className="mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl"
          id="mission-report-title"
        >
          Mission Engineering Report
        </h3>
        <p className="sr-only">
          Report updated for {missionSummary.missionName}.
        </p>
      </header>

      <div className="space-y-8 p-5 sm:p-7">
        <section aria-labelledby="mission-report-overview-title">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <FileText aria-hidden="true" size={17} />
            </span>
            <div>
              <p className="orbix-label text-accent">Section 01</p>
              <h4
                className="mt-1 text-xl font-semibold"
                id="mission-report-overview-title"
              >
                Mission Overview
              </h4>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-surface/45 p-5 sm:p-6">
            <p className="text-xs text-muted">Mission name</p>
            <output className="mt-1 block text-xl font-semibold">
              {missionSummary.missionName}
            </output>
            <p className="mt-4 text-sm leading-6 text-muted">
              {missionSummary.description}
            </p>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs text-muted">Systems used</p>
              {missionSummary.systemsUsed.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {missionSummary.systemsUsed.map((system) => (
                    <li
                      className="rounded-full border border-accent/20 bg-accent/8 px-3 py-1.5 font-mono text-[0.68rem] text-accent"
                      key={system}
                    >
                      {system}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted">
                  No optional engineering systems were included.
                </p>
              )}
            </div>
          </div>
        </section>

        {orbital ? (
          <section
            aria-labelledby="mission-report-orbital-title"
            className="border-t border-border pt-8"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Orbit aria-hidden="true" size={18} />
              </span>
              <div>
                <p className="orbix-label text-accent">Section 02</p>
                <h4
                  className="mt-1 text-xl font-semibold"
                  id="mission-report-orbital-title"
                >
                  Orbital Analysis
                </h4>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ReportMetric
                label="Total mission delta-v"
                value={
                  measurementFormatter.format(
                    orbital.totalDeltaVMetresPerSecond,
                  ) + " m/s"
                }
              />
              <ReportMetric
                label="Maneuvers reported"
                value={orbital.maneuvers.length}
              />
              {transfer ? (
                <ReportMetric
                  label="Transfer duration"
                  value={
                    measurementFormatter.format(
                      transfer.transfer.transferTimeHours,
                    ) + " h"
                  }
                />
              ) : null}
            </dl>

            {transfer ? (
              <section
                aria-labelledby="mission-report-transfer-title"
                className="mt-5 rounded-2xl border border-border bg-surface/45 p-5"
              >
                <h5
                  className="flex items-center gap-2 text-sm font-semibold"
                  id="mission-report-transfer-title"
                >
                  <CircleDot aria-hidden="true" size={16} />
                  Hohmann transfer
                </h5>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <ReportMetric
                    label="Initial orbit altitude"
                    value={
                      measurementFormatter.format(
                        transfer.initialOrbit.altitudeMetres,
                      ) + " m"
                    }
                  />
                  <ReportMetric
                    label="Final orbit altitude"
                    value={
                      measurementFormatter.format(
                        transfer.finalOrbit.altitudeMetres,
                      ) + " m"
                    }
                  />
                  <ReportMetric
                    label="Transfer semi-major axis"
                    value={
                      measurementFormatter.format(
                        transfer.transfer.transferSemiMajorAxisMetres,
                      ) + " m"
                    }
                  />
                  <ReportMetric
                    label="First burn delta-v"
                    value={
                      measurementFormatter.format(
                        transfer.transfer.firstBurnDeltaVMetresPerSecond,
                      ) + " m/s"
                    }
                  />
                  <ReportMetric
                    label="Second burn delta-v"
                    value={
                      measurementFormatter.format(
                        transfer.transfer.secondBurnDeltaVMetresPerSecond,
                      ) + " m/s"
                    }
                  />
                  <ReportMetric
                    label="Transfer delta-v"
                    value={
                      measurementFormatter.format(
                        transfer.transfer.totalDeltaVMetresPerSecond,
                      ) + " m/s"
                    }
                  />
                </dl>
              </section>
            ) : null}

            {planeChange ? (
              <section
                aria-labelledby="mission-report-plane-change-title"
                className="mt-5 rounded-2xl border border-border bg-surface/45 p-5"
              >
                <h5
                  className="flex items-center gap-2 text-sm font-semibold"
                  id="mission-report-plane-change-title"
                >
                  <Orbit aria-hidden="true" size={16} />
                  Orbital plane change
                </h5>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <ReportMetric
                    label="Inclination change"
                    value={
                      measurementFormatter.format(
                        planeChange.inclinationChangeDegrees,
                      ) + " deg"
                    }
                  />
                  <ReportMetric
                    label="Maneuver orbital velocity"
                    value={
                      measurementFormatter.format(
                        planeChange.orbitalVelocityMetresPerSecond,
                      ) + " m/s"
                    }
                  />
                  <ReportMetric
                    label="Plane-change delta-v"
                    value={
                      measurementFormatter.format(
                        planeChange.deltaVMetresPerSecond,
                      ) + " m/s"
                    }
                  />
                </dl>
              </section>
            ) : null}

            {orbital.maneuvers.length > 0 ? (
              <div
                aria-label="Delta-v maneuver breakdown"
                className="mt-5 overflow-x-auto rounded-2xl border border-border"
                role="region"
                tabIndex={0}
              >
                <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                  <caption className="border-b border-border bg-background/45 px-4 py-3 text-left font-semibold">
                    Delta-v maneuver breakdown
                  </caption>
                  <thead className="bg-surface/55 text-xs text-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium" scope="col">
                        Maneuver
                      </th>
                      <th
                        className="px-4 py-3 text-right font-medium"
                        scope="col"
                      >
                        Delta-v
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orbital.maneuvers.map((maneuver) => (
                      <tr key={maneuver.id}>
                        <th className="px-4 py-3 font-medium" scope="row">
                          {maneuver.name}
                        </th>
                        <td className="px-4 py-3 text-right font-mono">
                          <output>
                            {measurementFormatter.format(
                              maneuver.deltaVMetresPerSecond,
                            )}
                            {}
                            m/s
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
            className="border-t border-border pt-8"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Plane aria-hidden="true" size={18} />
              </span>
              <div>
                <p className="orbix-label text-accent">Section 03</p>
                <h4
                  className="mt-1 text-xl font-semibold"
                  id="mission-report-vehicle-title"
                >
                  Vehicle Analysis
                </h4>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-surface/45 p-5">
              <p className="text-xs text-muted">Selected vehicle</p>
              <output className="mt-1 block text-xl font-semibold">
                {vehicle.selectedVehicle.vehicleName}
              </output>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <ReportMetric
                  label="Initial altitude"
                  value={
                    measurementFormatter.format(
                      vehicle.performanceSummary.flight.initialAltitudeMeters,
                    ) + " m"
                  }
                />
                <ReportMetric
                  label="Initial velocity"
                  value={
                    measurementFormatter.format(
                      vehicle.performanceSummary.flight
                        .initialVelocityMetersPerSecond,
                    ) + " m/s"
                  }
                />
                <ReportMetric
                  label="Final velocity"
                  value={
                    measurementFormatter.format(
                      vehicle.performanceSummary.flight.finalState
                        .velocityMetersPerSecond,
                    ) + " m/s"
                  }
                />
                <ReportMetric
                  label="Reentry duration"
                  value={
                    measurementFormatter.format(
                      vehicle.performanceSummary.flight.reentryDurationSeconds,
                    ) + " s"
                  }
                />
                <ReportMetric
                  label="Peak deceleration"
                  value={
                    measurementFormatter.format(
                      vehicle.performanceSummary.dynamics.peakDeceleration
                        .decelerationMetersPerSecondSquared,
                    ) + " m/s²"
                  }
                />
                <ReportMetric
                  label="Peak deceleration load"
                  value={
                    measurementFormatter.format(
                      vehicle.performanceSummary.dynamics.peakDeceleration
                        .decelerationGs,
                    ) + " g"
                  }
                />
                {thermal ? (
                  <ReportMetric
                    label="Peak heating"
                    value={
                      measurementFormatter.format(
                        thermal.thermalSummary
                          .peakHeatFluxKilowattsPerSquareMetre,
                      ) + " kW/m²"
                    }
                  />
                ) : null}
              </dl>
            </div>
          </section>
        ) : null}

        {thermal ? (
          <section
            aria-labelledby="mission-report-thermal-title"
            className="border-t border-border pt-8"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Shield aria-hidden="true" size={18} />
              </span>
              <div>
                <p className="orbix-label text-accent">Section 04</p>
                <h4
                  className="mt-1 text-xl font-semibold"
                  id="mission-report-thermal-title"
                >
                  Thermal Protection
                </h4>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ReportMetric
                label="Peak heat flux"
                value={
                  measurementFormatter.format(
                    thermal.thermalSummary.peakHeatFluxWattsPerSquareMetre,
                  ) + " W/m²"
                }
              />
              <ReportMetric
                label="Total heat load"
                value={
                  preciseFormatter.format(
                    thermal.thermalSummary
                      .totalHeatLoadMegajoulesPerSquareMetre,
                  ) + " MJ/m²"
                }
              />
              <ReportMetric
                label="Peak heating altitude"
                value={
                  measurementFormatter.format(
                    thermal.thermalSummary.peakHeatingAltitudeMeters,
                  ) + " m"
                }
              />
            </dl>

            {tps ? (
              <div className="mt-5 rounded-2xl border border-accent/20 bg-accent/6 p-5">
                <p className="orbix-label flex items-center gap-2 text-accent">
                  <Flame aria-hidden="true" size={15} />
                  Existing TPS recommendation
                </p>
                <output className="mt-2 block text-xl font-semibold">
                  {tps.material.name}
                </output>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {tps.material.description}
                </p>
                <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <ReportMetric
                    label="Required thickness"
                    value={
                      preciseFormatter.format(
                        tps.requiredThickness.millimetres,
                      ) + " mm"
                    }
                  />
                  <ReportMetric
                    label="Estimated TPS mass"
                    value={
                      preciseFormatter.format(tps.estimatedTPSMassKilograms) +
                      " kg"
                    }
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
                    value={tps.thermalMargin.classification}
                  />
                </dl>
              </div>
            ) : (
              <p className="mt-5 rounded-xl border border-border bg-background/35 p-4 text-sm text-muted">
                No TPS recommendation is present in this report.
              </p>
            )}
          </section>
        ) : null}

        <section
          aria-labelledby="mission-report-assumptions-title"
          className="border-t border-border pt-8"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-signal/10 text-signal">
              <AlertTriangle aria-hidden="true" size={18} />
            </span>
            <div>
              <p className="font-mono text-[0.64rem] tracking-[0.14em] text-signal uppercase">
                Educational assessment
              </p>
              <h4
                className="mt-1 text-xl font-semibold"
                id="mission-report-assumptions-title"
              >
                Assumptions and Limitations
              </h4>
            </div>
          </div>

          <div className="orbix-lab-note mt-5">
            <p className="flex items-start gap-2 text-sm leading-6 text-signal">
              <Gauge aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
              {missionAssessment.educationalSummary}
            </p>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <div>
                <h5 className="text-sm font-semibold">Model assumptions</h5>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-5 text-muted">
                  {missionAssessment.modelAssumptions.map((assumption) => (
                    <li key={assumption}>{assumption}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-semibold">Limitations</h5>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-xs leading-5 text-muted">
                  {missionAssessment.limitations.map((limitation) => (
                    <li key={limitation}>{limitation}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
