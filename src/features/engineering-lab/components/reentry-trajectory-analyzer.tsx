"use client";

import { Button, DataTable, EquationBlock } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";

import { analyzeReentryTrajectory } from "@/features/engineering-lab/analysis";
import {
  EQ_LINE,
  EQ_TERM,
  CalculatorNumberField,
  focusFirstInvalidField,
  focusFirstInvalidFieldOnEnter,
  CalculatorResultSection,
  LAB_TOOL_STACK,
  GEOPOTENTIAL_ALTITUDE_HINT,
  INITIAL_GEOPOTENTIAL_ALTITUDE_LABEL,
  LabToolLayout,
  NotCalculated,
  ReadoutGrid,
  ValidationErrorSummary,
  LabFigure,
  EqDot,
  EQ_SUP,
  LAB_GROUP,
  LAB_GROUP_LEGEND,
  EQ_SUB_CLEAR,
} from "@/features/engineering-lab/components/shared";
import type {
  ReentryTrajectoryAnalysis,
  ReentryTrajectoryInputs,
  ReentryTrajectoryPoint,
} from "@/features/engineering-lab/types";

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

// Display only: the table shows density to 4 decimals so its seven
// columns fit a desktop tool without scrolling. The analysis is unchanged.
const densityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
  minimumFractionDigits: 4,
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

const toolEquation = (
  <EquationBlock
    equation={
      <>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>β = m</span>
          <wbr />
          <span className={EQ_TERM}>
            /(C<sub>D</sub>
            <EqDot />
            A)
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            a = ½ρV<sup className={EQ_SUP}>2</sup>/β
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            V<sub>n+1</sub> = V<sub>n</sub>
          </span>{" "}
          <span className={EQ_TERM}>
            + (g<sub className={EQ_SUB_CLEAR}>0</sub> sin|γ|
          </span>{" "}
          <span className={EQ_TERM}>
            − a<sub>n</sub>) Δt
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            h<sub>n+1</sub> = h<sub>n</sub>
          </span>{" "}
          <span className={EQ_TERM}>
            − V<sub>n</sub> sin|γ| Δt
          </span>
        </span>
      </>
    }
    label="Entry trajectory, explicit time steps"
    spokenAs="Ballistic coefficient beta equals m over C D times A, and deceleration a equals one half rho V squared over beta. Each step, the next velocity equals V plus g zero times the sine of the flight path angle minus a, times delta t, and the next altitude equals h minus V times the sine of the flight path angle times delta t."
    variables={[
      { symbol: "β", meaning: "Ballistic coefficient", unit: "kg/m²" },
      { symbol: "a", meaning: "Drag deceleration", unit: "m/s²" },
      {
        symbol: "ρ",
        meaning:
          "Air density from the standard troposphere at geopotential altitude h",
        unit: "kg/m³",
      },
      { symbol: "γ", meaning: "Flight path angle, held constant", unit: "deg" },
      { symbol: "Δt", meaning: "Time step", unit: "s" },
      {
        symbol: (
          <>
            g<sub className={EQ_SUB_CLEAR}>0</sub>
          </>
        ),
        meaning: "Standard gravity, 9.80665",
        unit: "m/s²",
      },
    ]}
  />
);

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
    focusFirstInvalidField(event.currentTarget);
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  return (
    <LabToolLayout equation={toolEquation}>
      <div className={LAB_TOOL_STACK}>
        <div className="@container/col min-w-0">
          <form
            noValidate
            onKeyDown={focusFirstInvalidFieldOnEnter}
            onSubmit={preventSubmission}
          >
            <fieldset className={LAB_GROUP}>
              <legend className={LAB_GROUP_LEGEND}>
                Initial trajectory state
              </legend>
              <div className="mt-4 grid gap-5 @min-[36rem]/col:grid-cols-2">
                <CalculatorNumberField
                  error={errors.initialAltitudeMeters}
                  field="initialAltitudeMeters"
                  hint={GEOPOTENTIAL_ALTITUDE_HINT}
                  idPrefix="reentry-trajectory"
                  label={INITIAL_GEOPOTENTIAL_ALTITUDE_LABEL}
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
                  unit=""
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

            <fieldset className={LAB_GROUP}>
              <legend className={LAB_GROUP_LEGEND}>
                Integration controls (optional)
              </legend>
              <div className="mt-4 grid gap-5 @min-[36rem]/col:grid-cols-2">
                <CalculatorNumberField
                  error={errors.timeStepSeconds}
                  field="timeStepSeconds"
                  hint="Positive fixed Euler timestep. Leave blank to use the one-second default."
                  idPrefix="reentry-trajectory"
                  label="Time step (optional)"
                  optional
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
                  optional
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

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <p className="min-w-0 flex-[1_1_16rem] text-sm leading-6 text-muted">
                Valid changes rerun the complete trajectory immediately.
              </p>
              <Button
                className="shrink-0 whitespace-nowrap"
                variant="secondary"
                onClick={resetAnalyzer}
              >
                Reset inputs
              </Button>
            </div>
          </form>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <CalculatorResultSection
            id="reentry-trajectory-result"
            title="Reentry trajectory analysis"
          >
            {result ? (
              <>
                <ReadoutGrid columns={1}>
                  <div>
                    <dt className="orbix-label">Peak deceleration</dt>
                    <dd>
                      <output
                        className="orbix-readout-lg"
                        htmlFor={allOutputIds}
                      >
                        <LabFigure unit="m/s²">
                          {stateFormatter.format(
                            result.peakDeceleration
                              .decelerationMetersPerSecondSquared,
                          )}
                        </LabFigure>
                      </output>
                      <output
                        className="lab-figure-note"
                        htmlFor={allOutputIds}
                      >
                        <LabFigure unit="g">
                          {loadFormatter.format(
                            result.peakDeceleration.decelerationGs,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={2} title="Initial state">
                  <div>
                    <dt className="orbix-label">Altitude</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor="reentry-trajectory-initialAltitudeMeters"
                      >
                        <LabFigure unit="m">
                          {stateFormatter.format(
                            result.initialState.altitudeMeters,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Velocity</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor="reentry-trajectory-initialVelocityMetersPerSecond"
                      >
                        <LabFigure unit="m/s">
                          {stateFormatter.format(
                            result.initialState.velocityMetersPerSecond,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={3} title="Final state">
                  <div>
                    <dt className="orbix-label">Altitude</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="m">
                          {stateFormatter.format(
                            result.finalState.altitudeMeters,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Velocity</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="m/s">
                          {stateFormatter.format(
                            result.finalState.velocityMetersPerSecond,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Elapsed time</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="s">
                          {stateFormatter.format(result.durationSeconds)}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={3} title="Peak velocity state">
                  <div>
                    <dt className="orbix-label">Velocity</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="m/s">
                          {stateFormatter.format(
                            result.peakHeatingVelocityState
                              .velocityMetersPerSecond,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Altitude</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="m">
                          {stateFormatter.format(
                            result.peakHeatingVelocityState.altitudeMeters,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Time</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="s">
                          {stateFormatter.format(
                            result.peakHeatingVelocityState.timeSeconds,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>
              </>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Enter a valid initial state and vehicle configuration to
                integrate the descent trajectory.
              </NotCalculated>
            )}
          </CalculatorResultSection>

          {result ? (
            <DataTable
              caption={
                "Trajectory, " +
                visibleTrajectoryPoints.length +
                " evenly sampled points of " +
                result.trajectoryPoints.length +
                " simulated"
              }
              columns={[
                {
                  key: "time",
                  header: <span className="block">Time</span>,
                  unit: "s",
                  numeric: true,
                  cell: ({ point }) => (
                    <output htmlFor={allOutputIds}>
                      {stateFormatter.format(point.timeSeconds)}
                    </output>
                  ),
                },
                {
                  key: "altitude",
                  header: <span className="block">Altitude</span>,
                  unit: "m",
                  numeric: true,
                  cell: ({ point }) => (
                    <output htmlFor={allOutputIds}>
                      {stateFormatter.format(point.altitudeMeters)}
                    </output>
                  ),
                },
                {
                  key: "velocity",
                  header: <span className="block">Velocity</span>,
                  unit: "m/s",
                  numeric: true,
                  cell: ({ point }) => (
                    <output htmlFor={allOutputIds}>
                      {stateFormatter.format(point.velocityMetersPerSecond)}
                    </output>
                  ),
                },
                {
                  key: "density",
                  header: <span className="block">Density</span>,
                  unit: "kg/m³",
                  numeric: true,
                  cell: ({ point }) => (
                    <output htmlFor={allOutputIds}>
                      {densityFormatter.format(
                        point.densityKilogramsPerCubicMetre,
                      )}
                    </output>
                  ),
                },
                {
                  key: "dynamic-pressure",
                  header: <span className="block">Dynamic pressure</span>,
                  unit: "Pa",
                  numeric: true,
                  cell: ({ point }) => (
                    <output htmlFor={allOutputIds}>
                      {stateFormatter.format(point.dynamicPressurePascals)}
                    </output>
                  ),
                },
                {
                  key: "deceleration",
                  header: <span className="block">Deceleration</span>,
                  unit: "m/s²",
                  numeric: true,
                  cell: ({ point }) => (
                    <output htmlFor={allOutputIds}>
                      {stateFormatter.format(
                        point.decelerationMetersPerSecondSquared,
                      )}
                    </output>
                  ),
                },
                {
                  key: "g-load",
                  header: "G-load",
                  numeric: true,
                  cell: ({ point }) => (
                    <output htmlFor={allOutputIds}>
                      {loadFormatter.format(point.decelerationGs)}
                    </output>
                  ),
                },
              ]}
              getRowKey={({ originalIndex }) => String(originalIndex)}
              rows={visibleTrajectoryPoints}
            />
          ) : null}
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <section
            aria-labelledby="reentry-trajectory-relationships-title"
            className="border-t border-border pt-7"
          >
            <h3
              className="text-lg font-semibold"
              id="reentry-trajectory-relationships-title"
            >
              Why the trajectory changes
            </h3>
            <div className="mt-4 border-t border-border">
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Velocity
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Aerodynamic drag opposes the flight direction, removing
                  velocity as the vehicle moves through the atmosphere.
                </p>
              </article>
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Density
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Atmospheric density generally rises during descent, increasing
                  dynamic pressure and the drag acting on the vehicle.
                </p>
              </article>
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  G-load
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  G-load changes as velocity and density evolve, so the
                  strongest deceleration can occur between the initial and final
                  states.
                </p>
              </article>
            </div>
          </section>
          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Engineering assumptions
            </p>
            <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted @min-[36rem]/col:grid-cols-2">
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
    </LabToolLayout>
  );
}
