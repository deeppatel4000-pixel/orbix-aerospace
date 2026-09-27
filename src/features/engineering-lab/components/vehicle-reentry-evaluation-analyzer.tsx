"use client";

import { Button } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";
import {
  CircleAlert,
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
  focusFirstInvalidField,
  focusFirstInvalidFieldOnEnter,
  CalculatorResultSection,
  NotCalculated,
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
      <label className="orbix-field__label block" htmlFor={inputId}>
        {label}
        <span className="sr-only"> ({unit})</span>
      </label>
      <div className="orbix-field__control mt-2">
        <input
          aria-describedby={error ? hintId + " " + errorId : hintId}
          aria-errormessage={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className="orbix-input"
          id={inputId}
          inputMode="decimal"
          max={max}
          min={min}
          onChange={(event) => onChange(field, event.target.value)}
          step="any"
          type="number"
          value={value}
        />
        <span aria-hidden="true" className="orbix-field__unit">
          {unit}
        </span>
      </div>
      <p className="orbix-field__help mt-2" id={hintId}>
        {hint}
      </p>
      {error ? (
        <p className="orbix-field__error mt-1" id={errorId}>
          <CircleAlert aria-hidden="true" className="shrink-0" size={14} />
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
    focusFirstInvalidField(event.currentTarget);
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(30rem,1.18fr)] xl:gap-10">
      <div>
        <form
          noValidate
          onKeyDown={focusFirstInvalidFieldOnEnter}
          onSubmit={preventSubmission}
        >
          <fieldset>
            <legend className="text-base font-semibold text-foreground">
              Vehicle configuration
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  className="orbix-field__label block"
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
                  className="orbix-input mt-2"
                  id="vehicle-reentry-evaluation-vehicleName"
                  onChange={(event) =>
                    updateValue("vehicleName", event.target.value)
                  }
                  required
                  type="text"
                  value={values.vehicleName}
                />
                <p
                  className="orbix-field__help mt-2"
                  id="vehicle-reentry-evaluation-vehicleName-hint"
                >
                  Descriptive configuration name used only to identify this
                  evaluation.
                </p>
                {errors.vehicleName ? (
                  <p
                    className="orbix-field__error mt-1"
                    id="vehicle-reentry-evaluation-vehicleName-error"
                  >
                    <CircleAlert
                      aria-hidden="true"
                      className="shrink-0"
                      size={14}
                    />
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
                unit=""
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
            <legend className="text-base font-semibold text-foreground">
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
            <legend className="text-base font-semibold text-foreground">
              Analysis controls (optional)
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
                label="Heating coefficient k"
                min={0}
                onChange={updateValue}
                unit="kg½/m"
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
            <p className="text-sm leading-6 text-muted">
              Valid changes rerun trajectory, thermal history, and TPS
              comparison immediately.
            </p>
            <Button
              className="shrink-0 whitespace-nowrap sm:ml-auto"
              variant="secondary"
              onClick={resetAnalyzer}
            >
              <RotateCcw aria-hidden="true" size={16} />
              Reset inputs
            </Button>
          </div>
        </form>

        <section
          aria-labelledby="vehicle-reentry-evaluation-education-title"
          className="mt-8 border-t border-border pt-7"
        >
          <p className="orbix-label">Integrated engineering</p>
          <h3
            className="mt-1 text-lg font-semibold"
            id="vehicle-reentry-evaluation-education-title"
          >
            Coupled reentry disciplines
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <article className="rounded-md border border-border-subtle bg-surface-raised p-4">
              <Wind aria-hidden="true" className="text-muted" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Vehicle geometry</h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                Reference area and nose radius strongly affect aerodynamic and
                stagnation-heating behavior.
              </p>
            </article>
            <article className="rounded-md border border-border-subtle bg-surface-raised p-4">
              <Gauge aria-hidden="true" className="text-muted" size={18} />
              <h4 className="mt-3 text-sm font-semibold">
                Ballistic coefficient
              </h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                The relationship among vehicle mass, drag coefficient, and area
                influences atmospheric deceleration.
              </p>
            </article>
            <article className="rounded-md border border-border-subtle bg-surface-raised p-4">
              <Flame aria-hidden="true" className="text-muted" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Thermal loading</h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                Material selection depends on the integrated thermal history
                produced for the vehicle and trajectory.
              </p>
            </article>
            <article className="rounded-md border border-border-subtle bg-surface-raised p-4">
              <Shield aria-hidden="true" className="text-muted" size={18} />
              <h4 className="mt-3 text-sm font-semibold">
                Multidisciplinary workflow
              </h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                This analyzer combines flight dynamics, aerodynamics, thermal
                analysis, and TPS evaluation in one educational workflow.
              </p>
            </article>
          </div>
        </section>
      </div>

      <div className="space-y-5">
        <CalculatorResultSection
          eyebrow="Vehicle, trajectory, heating and TPS"
          icon={Plane}
          id="vehicle-reentry-evaluation-result"
          title="Vehicle reentry evaluation"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="vehicle-reentry-evaluation-vehicle-title">
                <h4
                  className="text-sm font-semibold text-foreground"
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
                    <dt className="orbix-label">Mass</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor="vehicle-reentry-evaluation-massKilograms"
                      >
                        {standardFormatter.format(result.vehicle.massKilograms)}{" "}
                        kg
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Drag coefficient</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor="vehicle-reentry-evaluation-dragCoefficient"
                      >
                        {standardFormatter.format(
                          result.vehicle.dragCoefficient,
                        )}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Reference area</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
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
                    <dt className="orbix-label">Nose radius</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
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
                  className="text-sm font-semibold text-foreground"
                  id="vehicle-reentry-evaluation-flight-title"
                >
                  Flight summary
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="orbix-label">Initial altitude</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={reentryOutputIds}>
                        {standardFormatter.format(
                          result.summary.flight.initialAltitudeMeters,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Initial velocity</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={reentryOutputIds}>
                        {standardFormatter.format(
                          result.summary.flight.initialVelocityMetersPerSecond,
                        )}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Final altitude</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        {standardFormatter.format(
                          result.summary.flight.finalState.altitudeMeters,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Final velocity</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        {standardFormatter.format(
                          result.summary.flight.finalState
                            .velocityMetersPerSecond,
                        )}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Reentry duration</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={allOutputIds}>
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
                  className="text-sm font-semibold text-foreground"
                  id="vehicle-reentry-evaluation-dynamics-title"
                >
                  Dynamics
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="orbix-label">Peak deceleration</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={allOutputIds}>
                        {standardFormatter.format(
                          result.summary.dynamics.peakDeceleration
                            .decelerationMetersPerSecondSquared,
                        )}{" "}
                        m/s²
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Peak deceleration</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={allOutputIds}>
                        {standardFormatter.format(
                          result.summary.dynamics.peakDeceleration
                            .decelerationGs,
                        )}{" "}
                        g
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Peak deceleration altitude</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        {standardFormatter.format(
                          result.summary.dynamics.peakDeceleration
                            .altitudeMeters,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Peak velocity state</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
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
                  className="text-sm font-semibold text-foreground"
                  id="vehicle-reentry-evaluation-thermal-title"
                >
                  Thermal
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="orbix-label">Peak heat flux</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={allOutputIds}>
                        {heatFluxFormatter.format(
                          result.summary.thermal
                            .peakHeatFluxWattsPerSquareMetre,
                        )}{" "}
                        W/m²
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Peak heating altitude</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        {standardFormatter.format(
                          result.summary.thermal.peakHeatingAltitudeMeters,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Total heat load</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={allOutputIds}>
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
                  className="text-sm font-semibold text-foreground"
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
                    <dt className="orbix-label">Margin classification</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        {result.summary.tps.thermalMargin.classification}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Required thickness</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={allOutputIds}>
                        {preciseFormatter.format(
                          result.summary.tps.requiredThickness.millimetres,
                        )}{" "}
                        mm
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Estimated TPS mass</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={allOutputIds}>
                        {preciseFormatter.format(
                          result.summary.tps.estimatedTPSMassKilograms,
                        )}{" "}
                        kg
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Thermal margin</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={allOutputIds}>
                        {standardFormatter.format(
                          result.summary.tps.thermalMargin.marginPercentage,
                        )}
                        %
                      </output>
                    </dd>
                    <p className="orbix-data mt-1 text-muted">
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
            <NotCalculated invalid={Object.values(errors).some(Boolean)}>
              Enter a valid vehicle and reentry scenario to generate the
              integrated evaluation.
            </NotCalculated>
          )}
        </CalculatorResultSection>

        <aside className="orbix-lab-note">
          <p className="orbix-lab-note__title">
            <AlertTriangle aria-hidden="true" size={17} />
            Engineering assumptions
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted sm:grid-cols-2">
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
