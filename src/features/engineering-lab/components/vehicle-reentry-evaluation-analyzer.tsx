"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Flame,
  Gauge,
  Plane,
  RotateCcw,
  Shield,
  Wind,
} from "lucide-react";

import { analyzeVehicleReentryEvaluation } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  VehicleReentryEvaluationAnalysis,
  VehicleReentryEvaluationInputs,
} from "@/features/engineering-lab/types";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";

type VehicleReentryEvaluationField =
  | "dragCoefficient"
  | "heatingCoefficient"
  | "initialAltitudeMeters"
  | "initialFlightPathAngleDegrees"
  | "initialVelocityMetersPerSecond"
  | "massKilograms"
  | "noseRadiusMetres"
  | "referenceAreaSquareMetres"
  | "safetyFactor"
  | "timestepSeconds"
  | "vehicleName";

interface VehicleReentryEvaluationFormValues {
  readonly dragCoefficient: string;
  readonly heatingCoefficient: string;
  readonly initialAltitudeMeters: string;
  readonly initialFlightPathAngleDegrees: string;
  readonly initialVelocityMetersPerSecond: string;
  readonly massKilograms: string;
  readonly noseRadiusMetres: string;
  readonly referenceAreaSquareMetres: string;
  readonly safetyFactor: string;
  readonly timestepSeconds: string;
  readonly vehicleName: string;
}

type VehicleReentryEvaluationValidationErrors = Readonly<
  Partial<Record<VehicleReentryEvaluationField | "form", string>>
>;

interface VehicleReentryEvaluationViewState {
  readonly errors: VehicleReentryEvaluationValidationErrors;
  readonly result: VehicleReentryEvaluationAnalysis | null;
}

interface OptionalNumberFieldProps {
  readonly error?: string;
  readonly field:
    "heatingCoefficient" | "initialFlightPathAngleDegrees" | "timestepSeconds";
  readonly hint: string;
  readonly label: string;
  readonly max?: number;
  readonly min?: number;
  readonly onChange: (
    field: VehicleReentryEvaluationField,
    value: string,
  ) => void;
  readonly unit: string;
  readonly value: string;
}

const initialFormValues: VehicleReentryEvaluationFormValues = {
  dragCoefficient: "1.5",
  heatingCoefficient: "",
  initialAltitudeMeters: "1000",
  initialFlightPathAngleDegrees: "",
  initialVelocityMetersPerSecond: "150",
  massKilograms: "5000",
  noseRadiusMetres: "1",
  referenceAreaSquareMetres: "12",
  safetyFactor: "1.5",
  timestepSeconds: "",
  vehicleName: "Reference Reentry Vehicle",
};

const standardFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 2,
});

const preciseFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
  minimumFractionDigits: 3,
});

const heatFluxFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function parseRequiredNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function parseOptionalNumber(value: string): number | undefined {
  return value.trim() === "" ? undefined : Number(value);
}

function buildAnalysisInputs(
  values: VehicleReentryEvaluationFormValues,
): VehicleReentryEvaluationInputs {
  const heatingCoefficient = parseOptionalNumber(values.heatingCoefficient);
  const initialFlightPathAngleDegrees = parseOptionalNumber(
    values.initialFlightPathAngleDegrees,
  );
  const timestepSeconds = parseOptionalNumber(values.timestepSeconds);
  const optionalHeatingCoefficient =
    heatingCoefficient === undefined ? {} : { heatingCoefficient };
  const optionalFlightPathAngle =
    initialFlightPathAngleDegrees === undefined
      ? {}
      : { initialFlightPathAngleDegrees };
  const optionalTimeStep =
    timestepSeconds === undefined ? {} : { timestepSeconds };

  return {
    ...optionalHeatingCoefficient,
    ...optionalFlightPathAngle,
    ...optionalTimeStep,
    initialAltitudeMeters: parseRequiredNumber(values.initialAltitudeMeters),
    initialVelocityMetersPerSecond: parseRequiredNumber(
      values.initialVelocityMetersPerSecond,
    ),
    safetyFactor: parseRequiredNumber(values.safetyFactor),
    vehicle: {
      dragCoefficient: parseRequiredNumber(values.dragCoefficient),
      massKilograms: parseRequiredNumber(values.massKilograms),
      noseRadiusMetres: parseRequiredNumber(values.noseRadiusMetres),
      referenceAreaSquareMetres: parseRequiredNumber(
        values.referenceAreaSquareMetres,
      ),
      vehicleName: values.vehicleName,
    },
  };
}

function deriveViewState(
  values: VehicleReentryEvaluationFormValues,
): VehicleReentryEvaluationViewState {
  try {
    return {
      errors: {},
      result: analyzeVehicleReentryEvaluation(buildAnalysisInputs(values)),
    };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;

    const normalizedMessage = error.message.toLowerCase();
    const errors: Partial<
      Record<VehicleReentryEvaluationField | "form", string>
    > = {};

    if (normalizedMessage.includes("vehicle name")) {
      errors.vehicleName = error.message;
    }

    if (normalizedMessage.includes("vehicle mass")) {
      errors.massKilograms = error.message;
    }

    if (normalizedMessage.includes("drag coefficient")) {
      errors.dragCoefficient = error.message;
    }

    if (normalizedMessage.includes("reference area")) {
      errors.referenceAreaSquareMetres = error.message;
    }

    if (normalizedMessage.includes("nose radius")) {
      errors.noseRadiusMetres = error.message;
    }

    if (normalizedMessage.includes("altitude")) {
      errors.initialAltitudeMeters = error.message;
    }

    if (normalizedMessage.includes("velocity")) {
      errors.initialVelocityMetersPerSecond = error.message;
    }

    if (normalizedMessage.includes("safety factor")) {
      errors.safetyFactor = error.message;
    }

    if (normalizedMessage.includes("flight path angle")) {
      errors.initialFlightPathAngleDegrees = error.message;
    }

    if (normalizedMessage.includes("time step")) {
      errors.timestepSeconds = error.message;
    }

    if (normalizedMessage.includes("heating coefficient")) {
      errors.heatingCoefficient = error.message;
    }

    if (Object.keys(errors).length === 0) {
      errors.form = error.message;
    }

    return { errors, result: null };
  }
}

function OptionalNumberField({
  error,
  field,
  hint,
  label,
  max,
  min,
  onChange,
  unit,
  value,
}: OptionalNumberFieldProps) {
  const inputId = "vehicle-reentry-evaluation-" + field;
  const hintId = inputId + "-hint";
  const errorId = inputId + "-error";

  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          aria-describedby={error ? hintId + " " + errorId : hintId}
          aria-errormessage={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className="min-h-12 w-full rounded-xl border border-border bg-background/55 px-4 py-3 pr-20 font-mono text-base text-foreground transition-colors outline-none placeholder:text-muted/55 focus:border-accent focus:ring-2 focus:ring-accent/15"
          id={inputId}
          inputMode="decimal"
          max={max}
          min={min}
          onChange={(event) => onChange(field, event.target.value)}
          step="any"
          type="number"
          value={value}
        />
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-mono text-xs text-muted">
          {unit}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted" id={hintId}>
        {hint}
      </p>
      {error ? (
        <p className="mt-1.5 text-xs leading-5 text-signal" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function VehicleReentryEvaluationAnalyzer() {
  const [values, setValues] =
    useState<VehicleReentryEvaluationFormValues>(initialFormValues);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);
  const vehicleOutputIds =
    "vehicle-reentry-evaluation-vehicleName vehicle-reentry-evaluation-massKilograms vehicle-reentry-evaluation-dragCoefficient vehicle-reentry-evaluation-referenceAreaSquareMetres vehicle-reentry-evaluation-noseRadiusMetres";
  const reentryOutputIds =
    "vehicle-reentry-evaluation-initialAltitudeMeters vehicle-reentry-evaluation-initialVelocityMetersPerSecond vehicle-reentry-evaluation-safetyFactor vehicle-reentry-evaluation-initialFlightPathAngleDegrees vehicle-reentry-evaluation-timestepSeconds vehicle-reentry-evaluation-heatingCoefficient";
  const allOutputIds = vehicleOutputIds + " " + reentryOutputIds;

  function updateValue(field: VehicleReentryEvaluationField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(30rem,1.18fr)] xl:gap-10">
      <div>
        <form noValidate onSubmit={preventSubmission}>
          <fieldset>
            <legend className="orbix-label text-accent">
              Vehicle configuration
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  className="text-sm font-semibold"
                  htmlFor="vehicle-reentry-evaluation-vehicleName"
                >
                  Vehicle name
                </label>
                <input
                  aria-describedby={
                    errors.vehicleName
                      ? "vehicle-reentry-evaluation-vehicleName-hint vehicle-reentry-evaluation-vehicleName-error"
                      : "vehicle-reentry-evaluation-vehicleName-hint"
                  }
                  aria-errormessage={
                    errors.vehicleName
                      ? "vehicle-reentry-evaluation-vehicleName-error"
                      : undefined
                  }
                  aria-invalid={Boolean(errors.vehicleName)}
                  className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background/55 px-4 py-3 text-base text-foreground transition-colors outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                  id="vehicle-reentry-evaluation-vehicleName"
                  onChange={(event) =>
                    updateValue("vehicleName", event.target.value)
                  }
                  required
                  type="text"
                  value={values.vehicleName}
                />
                <p
                  className="mt-2 text-xs leading-5 text-muted"
                  id="vehicle-reentry-evaluation-vehicleName-hint"
                >
                  Descriptive configuration name used only to identify this
                  evaluation.
                </p>
                {errors.vehicleName ? (
                  <p
                    className="mt-1.5 text-xs leading-5 text-signal"
                    id="vehicle-reentry-evaluation-vehicleName-error"
                  >
                    {errors.vehicleName}
                  </p>
                ) : null}
              </div>

              <CalculatorNumberField
                error={errors.massKilograms}
                field="massKilograms"
                hint="Positive vehicle mass held constant by the existing trajectory model."
                idPrefix="vehicle-reentry-evaluation"
                label="Mass"
                onChange={updateValue}
                unit="kg"
                value={values.massKilograms}
              />
              <CalculatorNumberField
                error={errors.dragCoefficient}
                field="dragCoefficient"
                hint="Positive dimensionless drag coefficient for this configuration."
                idPrefix="vehicle-reentry-evaluation"
                label="Drag coefficient"
                onChange={updateValue}
                unit="CD"
                value={values.dragCoefficient}
              />
              <CalculatorNumberField
                error={errors.referenceAreaSquareMetres}
                field="referenceAreaSquareMetres"
                hint="Aerodynamic reference area and TPS coverage area used downstream."
                idPrefix="vehicle-reentry-evaluation"
                label="Reference area"
                onChange={updateValue}
                unit="m²"
                value={values.referenceAreaSquareMetres}
              />
              <CalculatorNumberField
                error={errors.noseRadiusMetres}
                field="noseRadiusMetres"
                hint="Effective stagnation-point radius used by the heating analysis."
                idPrefix="vehicle-reentry-evaluation"
                label="Nose radius"
                onChange={updateValue}
                unit="m"
                value={values.noseRadiusMetres}
              />
            </div>
          </fieldset>

          <fieldset className="mt-8 border-t border-border pt-7">
            <legend className="orbix-label text-accent">
              Reentry conditions
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <CalculatorNumberField
                error={errors.initialAltitudeMeters}
                field="initialAltitudeMeters"
                hint={
                  "Starting altitude from sea level through " +
                  STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES.toLocaleString(
                    "en-US",
                  ) +
                  " metres."
                }
                idPrefix="vehicle-reentry-evaluation"
                label="Initial altitude"
                onChange={updateValue}
                unit="m"
                value={values.initialAltitudeMeters}
              />
              <CalculatorNumberField
                error={errors.initialVelocityMetersPerSecond}
                field="initialVelocityMetersPerSecond"
                hint="Positive initial velocity for the integrated descent."
                idPrefix="vehicle-reentry-evaluation"
                label="Initial velocity"
                onChange={updateValue}
                unit="m/s"
                value={values.initialVelocityMetersPerSecond}
              />
              <CalculatorNumberField
                error={errors.safetyFactor}
                field="safetyFactor"
                hint="Positive TPS heat-load multiplier used by material comparison."
                idPrefix="vehicle-reentry-evaluation"
                label="Safety factor"
                onChange={updateValue}
                unit="×"
                value={values.safetyFactor}
              />
            </div>
          </fieldset>

          <fieldset className="mt-8 border-t border-border pt-7">
            <legend className="orbix-label text-accent">
              Analysis controls // Optional
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <OptionalNumberField
                error={errors.initialFlightPathAngleDegrees}
                field="initialFlightPathAngleDegrees"
                hint="Leave blank to preserve the analysis default vertical descent."
                label="Flight-path angle"
                max={0}
                min={-90}
                onChange={updateValue}
                unit="deg"
                value={values.initialFlightPathAngleDegrees}
              />
              <OptionalNumberField
                error={errors.timestepSeconds}
                field="timestepSeconds"
                hint="Leave blank to preserve the existing one-second timestep default."
                label="Time step"
                min={0}
                onChange={updateValue}
                unit="s"
                value={values.timestepSeconds}
              />
              <OptionalNumberField
                error={errors.heatingCoefficient}
                field="heatingCoefficient"
                hint="Leave blank to use the heating calculator's educational default."
                label="Heating coefficient"
                min={0}
                onChange={updateValue}
                unit="k"
                value={values.heatingCoefficient}
              />
            </div>
          </fieldset>

          <ValidationErrorSummary
            errors={[
              errors.vehicleName,
              errors.massKilograms,
              errors.dragCoefficient,
              errors.referenceAreaSquareMetres,
              errors.noseRadiusMetres,
              errors.initialAltitudeMeters,
              errors.initialVelocityMetersPerSecond,
              errors.safetyFactor,
              errors.initialFlightPathAngleDegrees,
              errors.timestepSeconds,
              errors.heatingCoefficient,
              errors.form,
            ]}
          />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-muted">
              Valid changes rerun trajectory, thermal history, and TPS
              comparison immediately.
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
          aria-labelledby="vehicle-reentry-evaluation-education-title"
          className="mt-8 border-t border-border pt-7"
        >
          <p className="orbix-label text-accent">Integrated engineering</p>
          <h3
            className="mt-1 text-lg font-semibold"
            id="vehicle-reentry-evaluation-education-title"
          >
            Coupled reentry disciplines
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Wind aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Vehicle geometry</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                Reference area and nose radius strongly affect aerodynamic and
                stagnation-heating behavior.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Gauge aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">
                Ballistic coefficient
              </h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                The relationship among vehicle mass, drag coefficient, and area
                influences atmospheric deceleration.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Flame aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Thermal loading</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                Material selection depends on the integrated thermal history
                produced for the vehicle and trajectory.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Shield aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">
                Multidisciplinary workflow
              </h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                This analyzer combines flight dynamics, aerodynamics, thermal
                analysis, and TPS evaluation in one educational workflow.
              </p>
            </article>
          </div>
        </section>
      </div>

      <div className="space-y-5">
        <CalculatorResultSection
          eyebrow="Vehicle + trajectory + thermal + TPS"
          icon={Plane}
          id="vehicle-reentry-evaluation-result"
          title="Vehicle reentry evaluation"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="vehicle-reentry-evaluation-vehicle-title">
                <h4
                  className="orbix-label text-accent"
                  id="vehicle-reentry-evaluation-vehicle-title"
                >
                  Vehicle
                </h4>
                <output
                  className="mt-3 block text-xl font-semibold"
                  htmlFor="vehicle-reentry-evaluation-vehicleName"
                >
                  {result.vehicle.vehicleName}
                </output>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Mass</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor="vehicle-reentry-evaluation-massKilograms"
                      >
                        {standardFormatter.format(result.vehicle.massKilograms)}{" "}
                        kg
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Drag coefficient</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor="vehicle-reentry-evaluation-dragCoefficient"
                      >
                        {standardFormatter.format(
                          result.vehicle.dragCoefficient,
                        )}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Reference area</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor="vehicle-reentry-evaluation-referenceAreaSquareMetres"
                      >
                        {standardFormatter.format(
                          result.vehicle.referenceAreaSquareMetres,
                        )}{" "}
                        m²
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Nose radius</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor="vehicle-reentry-evaluation-noseRadiusMetres"
                      >
                        {standardFormatter.format(
                          result.vehicle.noseRadiusMetres,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="vehicle-reentry-evaluation-flight-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="vehicle-reentry-evaluation-flight-title"
                >
                  Flight summary
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Initial altitude</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={reentryOutputIds}
                      >
                        {standardFormatter.format(
                          result.summary.flight.initialAltitudeMeters,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Initial velocity</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={reentryOutputIds}
                      >
                        {standardFormatter.format(
                          result.summary.flight.initialVelocityMetersPerSecond,
                        )}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Final altitude</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={allOutputIds}
                      >
                        {standardFormatter.format(
                          result.summary.flight.finalState.altitudeMeters,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Final velocity</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={allOutputIds}
                      >
                        {standardFormatter.format(
                          result.summary.flight.finalState
                            .velocityMetersPerSecond,
                        )}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Reentry duration</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {standardFormatter.format(
                          result.summary.flight.reentryDurationSeconds,
                        )}{" "}
                        s
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="vehicle-reentry-evaluation-dynamics-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="vehicle-reentry-evaluation-dynamics-title"
                >
                  Dynamics
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Peak deceleration</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {standardFormatter.format(
                          result.summary.dynamics.peakDeceleration
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
                        {standardFormatter.format(
                          result.summary.dynamics.peakDeceleration
                            .decelerationGs,
                        )}{" "}
                        g
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">
                      Peak deceleration altitude
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={allOutputIds}
                      >
                        {standardFormatter.format(
                          result.summary.dynamics.peakDeceleration
                            .altitudeMeters,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Peak velocity state</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={allOutputIds}
                      >
                        {standardFormatter.format(
                          result.summary.dynamics.peakVelocityState
                            .velocityMetersPerSecond,
                        )}{" "}
                        m/s at{" "}
                        {standardFormatter.format(
                          result.summary.dynamics.peakVelocityState
                            .altitudeMeters,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="vehicle-reentry-evaluation-thermal-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="vehicle-reentry-evaluation-thermal-title"
                >
                  Thermal
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Peak heat flux</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {heatFluxFormatter.format(
                          result.summary.thermal
                            .peakHeatFluxWattsPerSquareMetre,
                        )}{" "}
                        W/m²
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">
                      Peak heating altitude
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={allOutputIds}
                      >
                        {standardFormatter.format(
                          result.summary.thermal.peakHeatingAltitudeMeters,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Total heat load</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {preciseFormatter.format(
                          result.summary.thermal
                            .totalHeatLoadMegajoulesPerSquareMetre,
                        )}{" "}
                        MJ/m²
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="vehicle-reentry-evaluation-tps-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="vehicle-reentry-evaluation-tps-title"
                >
                  TPS recommendation
                </h4>
                <output
                  className="mt-3 block text-xl font-semibold"
                  htmlFor={allOutputIds}
                >
                  {result.summary.tps.recommendedMaterial.name}
                </output>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">
                      Margin classification
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {result.summary.tps.thermalMargin.classification}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Required thickness</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {preciseFormatter.format(
                          result.summary.tps.requiredThickness.millimetres,
                        )}{" "}
                        mm
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Estimated TPS mass</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {preciseFormatter.format(
                          result.summary.tps.estimatedTPSMassKilograms,
                        )}{" "}
                        kg
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Thermal margin</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {standardFormatter.format(
                          result.summary.tps.thermalMargin.marginPercentage,
                        )}
                        %
                      </output>
                    </dd>
                    <p className="mt-1 font-mono text-[0.68rem] text-muted">
                      {preciseFormatter.format(
                        result.summary.tps.thermalMargin
                          .heatLoadMarginMegajoulesPerSquareMetre,
                      )}{" "}
                      MJ/m² heat-load margin
                    </p>
                  </div>
                </dl>
              </section>
            </div>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">—</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Enter a valid vehicle and reentry scenario to generate the
                integrated evaluation.
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
            <li>Educational engineering model</li>
            <li>Constant vehicle properties</li>
            <li>Simplified atmosphere and heating</li>
            <li>No lift guidance</li>
            <li>No structural failure</li>
            <li>No ablation</li>
            <li>No flight-control system</li>
            <li>Not suitable for flight certification</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
