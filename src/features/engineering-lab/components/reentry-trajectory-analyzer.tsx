"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CloudSun,
  Gauge,
  Plane,
  RotateCcw,
  Scale,
} from "lucide-react";

import { analyzeReentryTrajectory } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  ReentryTrajectoryAnalysis,
  ReentryTrajectoryInputs,
  ReentryTrajectoryPoint,
} from "@/features/engineering-lab/types";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";

const MAXIMUM_VISIBLE_TRAJECTORY_POINTS = 50;

type ReentryTrajectoryField =
  | "initialAltitudeMeters"
  | "initialVelocityMetersPerSecond"
  | "vehicleMassKilograms"
  | "dragCoefficient"
  | "referenceAreaSquareMetres"
  | "timeStepSeconds"
  | "initialFlightPathAngleDegrees";

interface ReentryTrajectoryFormValues {
  readonly dragCoefficient: string;
  readonly initialAltitudeMeters: string;
  readonly initialFlightPathAngleDegrees: string;
  readonly initialVelocityMetersPerSecond: string;
  readonly referenceAreaSquareMetres: string;
  readonly timeStepSeconds: string;
  readonly vehicleMassKilograms: string;
}

type ReentryTrajectoryValidationErrors = Readonly<
  Partial<Record<ReentryTrajectoryField | "form", string>>
>;

interface ReentryTrajectoryViewState {
  readonly errors: ReentryTrajectoryValidationErrors;
  readonly result: ReentryTrajectoryAnalysis | null;
}

interface SampledTrajectoryPoint {
  readonly originalIndex: number;
  readonly point: ReentryTrajectoryPoint;
}

const initialFormValues: ReentryTrajectoryFormValues = {
  dragCoefficient: "1.5",
  initialAltitudeMeters: "1000",
  initialFlightPathAngleDegrees: "",
  initialVelocityMetersPerSecond: "150",
  referenceAreaSquareMetres: "12",
  timeStepSeconds: "",
  vehicleMassKilograms: "5000",
};

const stateFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const densityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
  minimumFractionDigits: 6,
});

const loadFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
});

function parseRequiredNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function parseOptionalNumber(value: string): number | undefined {
  return value.trim() === "" ? undefined : Number(value);
}

function buildAnalysisInputs(
  values: ReentryTrajectoryFormValues,
): ReentryTrajectoryInputs {
  const initialFlightPathAngleDegrees = parseOptionalNumber(
    values.initialFlightPathAngleDegrees,
  );
  const timeStepSeconds = parseOptionalNumber(values.timeStepSeconds);
  const optionalFlightPathAngle =
    initialFlightPathAngleDegrees === undefined
      ? {}
      : { initialFlightPathAngleDegrees };
  const optionalTimeStep =
    timeStepSeconds === undefined ? {} : { timeStepSeconds };

  return {
    ...optionalFlightPathAngle,
    ...optionalTimeStep,
    dragCoefficient: parseRequiredNumber(values.dragCoefficient),
    initialAltitudeMeters: parseRequiredNumber(values.initialAltitudeMeters),
    initialVelocityMetersPerSecond: parseRequiredNumber(
      values.initialVelocityMetersPerSecond,
    ),
    referenceAreaSquareMetres: parseRequiredNumber(
      values.referenceAreaSquareMetres,
    ),
    vehicleMassKilograms: parseRequiredNumber(values.vehicleMassKilograms),
  };
}

function deriveViewState(
  values: ReentryTrajectoryFormValues,
): ReentryTrajectoryViewState {
  try {
    return {
      errors: {},
      result: analyzeReentryTrajectory(buildAnalysisInputs(values)),
    };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;

    const normalizedMessage = error.message.toLowerCase();
    const errors: Partial<Record<ReentryTrajectoryField | "form", string>> = {};

    if (normalizedMessage.includes("altitude")) {
      errors.initialAltitudeMeters = error.message;
    }

    if (normalizedMessage.includes("velocity")) {
      errors.initialVelocityMetersPerSecond = error.message;
    }

    if (normalizedMessage.includes("vehicle mass")) {
      errors.vehicleMassKilograms = error.message;
    }

    if (normalizedMessage.includes("drag coefficient")) {
      errors.dragCoefficient = error.message;
    }

    if (normalizedMessage.includes("reference area")) {
      errors.referenceAreaSquareMetres = error.message;
    }

    if (normalizedMessage.includes("time step")) {
      errors.timeStepSeconds = error.message;
    }

    if (normalizedMessage.includes("flight path angle")) {
      errors.initialFlightPathAngleDegrees = error.message;
    }

    if (Object.keys(errors).length === 0) {
      errors.form = error.message;
    }

    return { errors, result: null };
  }
}

function sampleTrajectoryPoints(
  trajectoryPoints: readonly ReentryTrajectoryPoint[],
): readonly SampledTrajectoryPoint[] {
  if (trajectoryPoints.length <= MAXIMUM_VISIBLE_TRAJECTORY_POINTS) {
    return trajectoryPoints.map((point, originalIndex) => ({
      originalIndex,
      point,
    }));
  }

  const lastIndex = trajectoryPoints.length - 1;
  const lastVisibleIndex = MAXIMUM_VISIBLE_TRAJECTORY_POINTS - 1;
  const sampledPoints: SampledTrajectoryPoint[] = [];

  for (
    let visibleIndex = 0;
    visibleIndex < MAXIMUM_VISIBLE_TRAJECTORY_POINTS;
    visibleIndex += 1
  ) {
    const originalIndex = Math.round(
      (visibleIndex * lastIndex) / lastVisibleIndex,
    );
    const point = trajectoryPoints[originalIndex];

    if (point) sampledPoints.push({ originalIndex, point });
  }

  return sampledPoints;
}

export function ReentryTrajectoryAnalyzer() {
  const [values, setValues] =
    useState<ReentryTrajectoryFormValues>(initialFormValues);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);
  const visibleTrajectoryPoints = useMemo(
    () => sampleTrajectoryPoints(result?.trajectoryPoints ?? []),
    [result],
  );
  const allOutputIds =
    "reentry-trajectory-initialAltitudeMeters reentry-trajectory-initialVelocityMetersPerSecond reentry-trajectory-vehicleMassKilograms reentry-trajectory-dragCoefficient reentry-trajectory-referenceAreaSquareMetres reentry-trajectory-timeStepSeconds reentry-trajectory-initialFlightPathAngleDegrees";

  function updateValue(field: ReentryTrajectoryField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] xl:gap-10">
      <div>
        <form noValidate onSubmit={preventSubmission}>
          <fieldset>
            <legend className="orbix-label text-accent">
              Initial trajectory state
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <CalculatorNumberField
                error={errors.initialAltitudeMeters}
                field="initialAltitudeMeters"
                hint={`Starting altitude from sea level through ${STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES.toLocaleString("en-US")} metres.`}
                idPrefix="reentry-trajectory"
                label="Initial altitude"
                onChange={updateValue}
                unit="m"
                value={values.initialAltitudeMeters}
              />
              <CalculatorNumberField
                error={errors.initialVelocityMetersPerSecond}
                field="initialVelocityMetersPerSecond"
                hint="Positive initial velocity along the fixed descent path."
                idPrefix="reentry-trajectory"
                label="Initial velocity"
                onChange={updateValue}
                unit="m/s"
                value={values.initialVelocityMetersPerSecond}
              />
              <CalculatorNumberField
                error={errors.vehicleMassKilograms}
                field="vehicleMassKilograms"
                hint="Positive vehicle mass held constant throughout the simulation."
                idPrefix="reentry-trajectory"
                label="Vehicle mass"
                onChange={updateValue}
                unit="kg"
                value={values.vehicleMassKilograms}
              />
              <CalculatorNumberField
                error={errors.dragCoefficient}
                field="dragCoefficient"
                hint="Positive dimensionless drag coefficient held constant during descent."
                idPrefix="reentry-trajectory"
                label="Drag coefficient"
                onChange={updateValue}
                unit="CD"
                value={values.dragCoefficient}
              />
              <CalculatorNumberField
                error={errors.referenceAreaSquareMetres}
                field="referenceAreaSquareMetres"
                hint="Positive aerodynamic reference area for the vehicle configuration."
                idPrefix="reentry-trajectory"
                label="Reference area"
                onChange={updateValue}
                unit="m²"
                value={values.referenceAreaSquareMetres}
              />
            </div>
          </fieldset>

          <fieldset className="mt-8 border-t border-border pt-7">
            <legend className="orbix-label text-accent">
              Integration controls // Optional
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <CalculatorNumberField
                error={errors.timeStepSeconds}
                field="timeStepSeconds"
                hint="Positive fixed Euler timestep. Leave blank to use the one-second default."
                idPrefix="reentry-trajectory"
                label="Time step (optional)"
                onChange={updateValue}
                unit="s"
                value={values.timeStepSeconds}
              />
              <CalculatorNumberField
                error={errors.initialFlightPathAngleDegrees}
                field="initialFlightPathAngleDegrees"
                hint="Fixed descent angle from -90 to 0 degrees. Leave blank for vertical descent."
                idPrefix="reentry-trajectory"
                label="Flight path angle (optional)"
                onChange={updateValue}
                unit="deg"
                value={values.initialFlightPathAngleDegrees}
              />
            </div>
          </fieldset>

          <ValidationErrorSummary
            errors={[
              errors.initialAltitudeMeters,
              errors.initialVelocityMetersPerSecond,
              errors.vehicleMassKilograms,
              errors.dragCoefficient,
              errors.referenceAreaSquareMetres,
              errors.timeStepSeconds,
              errors.initialFlightPathAngleDegrees,
              errors.form,
            ]}
          />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-muted">
              Valid changes rerun the complete trajectory immediately.
            </p>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent/60 hover:text-accent sm:ml-auto"
              onClick={resetAnalyzer}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={16} />
              Reset example
            </button>
          </div>
        </form>

        <section
          aria-labelledby="reentry-trajectory-relationships-title"
          className="mt-8 border-t border-border pt-7"
        >
          <p className="orbix-label text-accent">Educational visualization</p>
          <h3
            className="mt-1 text-lg font-semibold"
            id="reentry-trajectory-relationships-title"
          >
            Why the trajectory changes
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Gauge aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Velocity</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                Aerodynamic drag opposes the flight direction, removing velocity
                as the vehicle moves through the atmosphere.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <CloudSun aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Density</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                Atmospheric density generally rises during descent, increasing
                dynamic pressure and the drag acting on the vehicle.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Scale aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">G-load</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                G-load changes as velocity and density evolve, so the strongest
                deceleration can occur between the initial and final states.
              </p>
            </article>
          </div>
        </section>
      </div>

      <div className="space-y-5">
        <CalculatorResultSection
          eyebrow="Integrated descent history"
          icon={Plane}
          id="reentry-trajectory-result"
          title="Reentry trajectory analysis"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="reentry-trajectory-initial-title">
                <h4
                  className="orbix-label text-accent"
                  id="reentry-trajectory-initial-title"
                >
                  Initial state
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Altitude</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor="reentry-trajectory-initialAltitudeMeters"
                      >
                        {stateFormatter.format(
                          result.initialState.altitudeMeters,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Velocity</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor="reentry-trajectory-initialVelocityMetersPerSecond"
                      >
                        {stateFormatter.format(
                          result.initialState.velocityMetersPerSecond,
                        )}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="reentry-trajectory-final-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="reentry-trajectory-final-title"
                >
                  Final state
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted">Altitude</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={allOutputIds}
                      >
                        {stateFormatter.format(
                          result.finalState.altitudeMeters,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Velocity</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={allOutputIds}
                      >
                        {stateFormatter.format(
                          result.finalState.velocityMetersPerSecond,
                        )}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Elapsed time</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={allOutputIds}
                      >
                        {stateFormatter.format(result.durationSeconds)} s
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="reentry-trajectory-performance-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="reentry-trajectory-performance-title"
                >
                  Performance summary
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Peak deceleration</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {stateFormatter.format(
                          result.peakDeceleration
                            .decelerationMetersPerSecondSquared,
                        )}{" "}
                        m/s²
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Peak deceleration</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {loadFormatter.format(
                          result.peakDeceleration.decelerationGs,
                        )}{" "}
                        g
                      </output>
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted">Peak velocity state</dt>
                    <dd className="mt-2 grid gap-3 rounded-xl border border-border bg-background/35 p-4 sm:grid-cols-3">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={allOutputIds}
                      >
                        {stateFormatter.format(
                          result.peakHeatingVelocityState
                            .velocityMetersPerSecond,
                        )}{" "}
                        m/s
                      </output>
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={allOutputIds}
                      >
                        {stateFormatter.format(
                          result.peakHeatingVelocityState.altitudeMeters,
                        )}{" "}
                        m altitude
                      </output>
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={allOutputIds}
                      >
                        {stateFormatter.format(
                          result.peakHeatingVelocityState.timeSeconds,
                        )}{" "}
                        s
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="reentry-trajectory-table-title"
                className="border-t border-border pt-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h4
                      className="orbix-label text-accent"
                      id="reentry-trajectory-table-title"
                    >
                      Trajectory table
                    </h4>
                    <p className="mt-2 text-xs leading-5 text-muted">
                      Showing {visibleTrajectoryPoints.length} sampled points
                      from {result.trajectoryPoints.length} total simulation
                      points.
                    </p>
                  </div>
                </div>

                <div
                  aria-label="Sampled reentry trajectory data"
                  className="mt-4 overflow-x-auto rounded-xl border border-border focus:ring-2 focus:ring-accent/30 focus:outline-none"
                  role="region"
                  tabIndex={0}
                >
                  <table className="w-full min-w-[62rem] border-collapse text-left text-xs">
                    <caption className="sr-only">
                      Evenly sampled states from the complete reentry trajectory
                      simulation
                    </caption>
                    <thead className="bg-surface/80 text-muted">
                      <tr>
                        <th className="px-3 py-3 font-semibold" scope="col">
                          Time (s)
                        </th>
                        <th className="px-3 py-3 font-semibold" scope="col">
                          Altitude (m)
                        </th>
                        <th className="px-3 py-3 font-semibold" scope="col">
                          Velocity (m/s)
                        </th>
                        <th className="px-3 py-3 font-semibold" scope="col">
                          Density (kg/m³)
                        </th>
                        <th className="px-3 py-3 font-semibold" scope="col">
                          Dynamic pressure (Pa)
                        </th>
                        <th className="px-3 py-3 font-semibold" scope="col">
                          Deceleration (m/s²)
                        </th>
                        <th className="px-3 py-3 font-semibold" scope="col">
                          G-load
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTrajectoryPoints.map(
                        ({ originalIndex, point }) => (
                          <tr
                            className="border-t border-border bg-background/30"
                            key={originalIndex}
                          >
                            <th
                              className="px-3 py-3 font-mono font-medium text-foreground"
                              scope="row"
                            >
                              <output htmlFor={allOutputIds}>
                                {stateFormatter.format(point.timeSeconds)}
                              </output>
                            </th>
                            <td className="px-3 py-3 font-mono">
                              <output htmlFor={allOutputIds}>
                                {stateFormatter.format(point.altitudeMeters)}
                              </output>
                            </td>
                            <td className="px-3 py-3 font-mono">
                              <output htmlFor={allOutputIds}>
                                {stateFormatter.format(
                                  point.velocityMetersPerSecond,
                                )}
                              </output>
                            </td>
                            <td className="px-3 py-3 font-mono">
                              <output htmlFor={allOutputIds}>
                                {densityFormatter.format(
                                  point.densityKilogramsPerCubicMetre,
                                )}
                              </output>
                            </td>
                            <td className="px-3 py-3 font-mono">
                              <output htmlFor={allOutputIds}>
                                {stateFormatter.format(
                                  point.dynamicPressurePascals,
                                )}
                              </output>
                            </td>
                            <td className="px-3 py-3 font-mono">
                              <output htmlFor={allOutputIds}>
                                {stateFormatter.format(
                                  point.decelerationMetersPerSecondSquared,
                                )}
                              </output>
                            </td>
                            <td className="px-3 py-3 font-mono">
                              <output htmlFor={allOutputIds}>
                                {loadFormatter.format(point.decelerationGs)}
                              </output>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">—</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Enter a valid initial state and vehicle configuration to
                integrate the descent trajectory.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <aside className="orbix-lab-note">
          <p className="orbix-lab-note__title">
            <AlertTriangle aria-hidden="true" size={17} />
            Engineering assumptions
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-xs leading-5 text-muted sm:grid-cols-2">
            <li>Simplified point-mass model</li>
            <li>Constant vehicle properties</li>
            <li>Fixed flight-path angle</li>
            <li>No lift</li>
            <li>No winds</li>
            <li>No planetary rotation</li>
            <li>No heating feedback</li>
            <li>No structural limits</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
