"use client";

import { Button, EquationBlock } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";
import { CircleAlert } from "lucide-react";

import { analyzeVehicleReentryEvaluation } from "@/features/engineering-lab/analysis";
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
  TpsFigure,
  EqDot,
  EQ_SUP,
  LAB_GROUP,
  LAB_GROUP_LEGEND,
  EqFrac,
} from "@/features/engineering-lab/components/shared";
import type {
  VehicleReentryEvaluationAnalysis,
  VehicleReentryEvaluationInputs,
} from "@/features/engineering-lab/types";

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
  initialAltitudeMeters: "11000",
  initialFlightPathAngleDegrees: "",
  initialVelocityMetersPerSecond: "400",
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
        <span aria-hidden="true" className="orbix-field__unit lab-field__unit">
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

const toolEquation = (
  <EquationBlock
    equation={
      <>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            β ={" "}
            <EqFrac
              den={
                <>
                  C<sub>D</sub>
                  <EqDot />A
                </>
              }
              num="m"
            />
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            a ={" "}
            <EqFrac
              den="β"
              num={
                <>
                  ½ρV<sup className={EQ_SUP}>2</sup>
                </>
              }
            />
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>q̇ = k</span>
          <wbr />
          <span className={EQ_TERM}>
            <EqDot />
            √(ρ/r<sub>n</sub>)
          </span>
          <wbr />
          <span className={EQ_TERM}>
            <EqDot />V<sup className={EQ_SUP}>3</sup>
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            Q = Σ q̇<sub>i</sub>
            <EqDot />
            Δt<sub>i</sub>
          </span>
        </span>
      </>
    }
    label="Entry deceleration and heating"
    spokenAs="Ballistic coefficient beta equals m over C D times A, and deceleration a equals one half rho V squared over beta. heat flux equals k times the square root of density over nose radius, times velocity cubed. Heat load Q equals the sum of heat flux times time step."
    variables={[
      { symbol: "β", meaning: "Ballistic coefficient", unit: "kg/m²" },
      { symbol: "a", meaning: "Drag deceleration", unit: "m/s²" },
      {
        symbol: "ρ, V",
        meaning:
          "Air density and velocity at each step of the entry trajectory",
      },
      {
        symbol: "k",
        meaning:
          "Heating coefficient; by default 1.83 × 10⁻⁴ in SI units, for Earth air",
      },
      {
        symbol: (
          <>
            r<sub>n</sub>
          </>
        ),
        meaning: "Nose radius",
        unit: "m",
      },
      {
        symbol: "Q",
        meaning: "Stagnation-point heat load, summed over the trajectory",
        unit: "MJ/m²",
      },
    ]}
  />
);

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
                Vehicle configuration
              </legend>
              <div className="mt-4 grid gap-5 @min-[36rem]/col:grid-cols-2">
                <div className="@min-[36rem]/col:col-span-2">
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
                    A name for this vehicle, used in the results.
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
                  hint="Vehicle mass, held constant along the trajectory."
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
                  hint="Aerodynamic reference area, also taken as the area the TPS covers."
                  idPrefix="vehicle-reentry-evaluation"
                  label="Reference area"
                  onChange={updateValue}
                  unit="m²"
                  value={values.referenceAreaSquareMetres}
                />
                <CalculatorNumberField
                  error={errors.noseRadiusMetres}
                  field="noseRadiusMetres"
                  hint="Effective stagnation-point nose radius."
                  idPrefix="vehicle-reentry-evaluation"
                  label="Nose radius"
                  onChange={updateValue}
                  unit="m"
                  value={values.noseRadiusMetres}
                />
              </div>
            </fieldset>

            <fieldset className={LAB_GROUP}>
              <legend className={LAB_GROUP_LEGEND}>Reentry conditions</legend>
              <div className="mt-4 grid gap-5 @min-[36rem]/col:grid-cols-2">
                <CalculatorNumberField
                  error={errors.initialAltitudeMeters}
                  field="initialAltitudeMeters"
                  hint={GEOPOTENTIAL_ALTITUDE_HINT}
                  idPrefix="vehicle-reentry-evaluation"
                  label={INITIAL_GEOPOTENTIAL_ALTITUDE_LABEL}
                  onChange={updateValue}
                  unit="m"
                  value={values.initialAltitudeMeters}
                />
                <CalculatorNumberField
                  error={errors.initialVelocityMetersPerSecond}
                  field="initialVelocityMetersPerSecond"
                  hint="Vehicle speed at the start of reentry."
                  idPrefix="vehicle-reentry-evaluation"
                  label="Initial velocity"
                  onChange={updateValue}
                  unit="m/s"
                  value={values.initialVelocityMetersPerSecond}
                />
                <CalculatorNumberField
                  error={errors.safetyFactor}
                  field="safetyFactor"
                  hint="Multiplies the heat load used to size the TPS."
                  idPrefix="vehicle-reentry-evaluation"
                  label="Safety factor"
                  onChange={updateValue}
                  unit="×"
                  value={values.safetyFactor}
                />
              </div>
            </fieldset>

            <fieldset className={LAB_GROUP}>
              <legend className={LAB_GROUP_LEGEND}>
                Analysis controls (optional)
              </legend>
              <div className="mt-4 grid gap-5 @min-[36rem]/col:grid-cols-2">
                <OptionalNumberField
                  error={errors.initialFlightPathAngleDegrees}
                  field="initialFlightPathAngleDegrees"
                  hint="Leave blank for a vertical descent (−90°)."
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
                  hint="Leave blank to use the 1 s default."
                  label="Time step"
                  min={0}
                  onChange={updateValue}
                  unit="s"
                  value={values.timestepSeconds}
                />
                <OptionalNumberField
                  error={errors.heatingCoefficient}
                  field="heatingCoefficient"
                  hint="Leave blank to use the default of 1.83 × 10⁻⁴ for Earth air."
                  label="Heating coefficient k"
                  min={0}
                  onChange={updateValue}
                  unit="√kg/m"
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

            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Button
                className="shrink-0 whitespace-nowrap"
                variant="secondary"
                onClick={resetAnalyzer}
              >
                Reset inputs
              </Button>
              <p className="min-w-0 flex-[1_1_14rem] text-[0.8125rem] leading-5 text-muted">
                Valid changes rerun trajectory, thermal history, and TPS
                comparison immediately.
              </p>
            </div>
          </form>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <CalculatorResultSection
            id="vehicle-reentry-evaluation-result"
            title="Vehicle reentry evaluation"
          >
            {result ? (
              <>
                <ReadoutGrid columns={2} title="Vehicle">
                  <div>
                    <dt className="orbix-label">Name</dt>
                    <dd>
                      <output
                        className="lab-value-text"
                        htmlFor="vehicle-reentry-evaluation-vehicleName"
                      >
                        {result.vehicle.vehicleName}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Mass</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor="vehicle-reentry-evaluation-massKilograms"
                      >
                        <LabFigure unit="kg">
                          {standardFormatter.format(
                            result.vehicle.massKilograms,
                          )}
                        </LabFigure>
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
                        <LabFigure>
                          {standardFormatter.format(
                            result.vehicle.dragCoefficient,
                          )}
                        </LabFigure>
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
                        <LabFigure unit="m²">
                          {standardFormatter.format(
                            result.vehicle.referenceAreaSquareMetres,
                          )}
                        </LabFigure>
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
                        <LabFigure unit="m">
                          {standardFormatter.format(
                            result.vehicle.noseRadiusMetres,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={2} title="Flight summary">
                  <div>
                    <dt className="orbix-label">Reentry duration</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="s">
                          {standardFormatter.format(
                            result.summary.flight.reentryDurationSeconds,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Initial altitude</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={reentryOutputIds}>
                        <LabFigure unit="m">
                          {standardFormatter.format(
                            result.summary.flight.initialAltitudeMeters,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Initial velocity</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={reentryOutputIds}>
                        <LabFigure unit="m/s">
                          {standardFormatter.format(
                            result.summary.flight
                              .initialVelocityMetersPerSecond,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Final altitude</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="m">
                          {standardFormatter.format(
                            result.summary.flight.finalState.altitudeMeters,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Final velocity</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="m/s">
                          {standardFormatter.format(
                            result.summary.flight.finalState
                              .velocityMetersPerSecond,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={2} title="Dynamics">
                  <div>
                    <dt className="orbix-label">Peak deceleration</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-readout-lg"
                        htmlFor={allOutputIds}
                      >
                        <LabFigure unit="m/s²">
                          {standardFormatter.format(
                            result.summary.dynamics.peakDeceleration
                              .decelerationMetersPerSecondSquared,
                          )}
                        </LabFigure>
                      </output>
                      <output
                        className="lab-figure-note"
                        htmlFor={allOutputIds}
                      >
                        <LabFigure unit="g₀">
                          {standardFormatter.format(
                            result.summary.dynamics.peakDeceleration
                              .decelerationGs,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Peak deceleration altitude</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="m">
                          {standardFormatter.format(
                            result.summary.dynamics.peakDeceleration
                              .altitudeMeters,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Peak velocity</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="m/s">
                          {standardFormatter.format(
                            result.summary.dynamics.peakVelocityState
                              .velocityMetersPerSecond,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Peak velocity altitude</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="m">
                          {standardFormatter.format(
                            result.summary.dynamics.peakVelocityState
                              .altitudeMeters,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={2} title="Thermal">
                  <div>
                    <dt className="orbix-label">Peak heat flux</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-readout-lg"
                        htmlFor={allOutputIds}
                      >
                        <LabFigure unit="W/m²">
                          {heatFluxFormatter.format(
                            result.summary.thermal
                              .peakHeatFluxWattsPerSquareMetre,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Total heat load</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <TpsFigure
                          smallUnit="kJ/m²"
                          unit="MJ/m²"
                          value={
                            result.summary.thermal
                              .totalHeatLoadMegajoulesPerSquareMetre
                          }
                        />
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Peak heating altitude</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="m">
                          {standardFormatter.format(
                            result.summary.thermal.peakHeatingAltitudeMeters,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={2} title="TPS recommendation">
                  <div>
                    <dt className="orbix-label">Required thickness</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <TpsFigure
                          smallUnit="µm"
                          unit="mm"
                          value={
                            result.summary.tps.requiredThickness.millimetres
                          }
                        />
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Estimated TPS mass</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <TpsFigure
                          smallUnit="g"
                          unit="kg"
                          value={result.summary.tps.estimatedTPSMassKilograms}
                        />
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Thermal margin</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="%">
                          {standardFormatter.format(
                            result.summary.tps.thermalMargin.marginPercentage,
                          )}
                        </LabFigure>
                      </output>
                      <output
                        className="lab-figure-note"
                        htmlFor={allOutputIds}
                      >
                        <TpsFigure
                          smallUnit="kJ/m²"
                          unit="MJ/m²"
                          value={
                            result.summary.tps.thermalMargin
                              .heatLoadMarginMegajoulesPerSquareMetre
                          }
                        />{" "}
                        heat-load margin
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Margin classification</dt>
                    <dd className="mt-1">
                      <output className="lab-value-text" htmlFor={allOutputIds}>
                        {result.summary.tps.thermalMargin.classification}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Material</dt>
                    <dd>
                      <output className="lab-value-text" htmlFor={allOutputIds}>
                        {result.summary.tps.recommendedMaterial.name}
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>
              </>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Enter a valid vehicle and reentry scenario to generate the
                integrated evaluation.
              </NotCalculated>
            )}
          </CalculatorResultSection>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <section
            aria-labelledby="vehicle-reentry-evaluation-education-title"
            className="border-t border-border pt-7"
          >
            <h3
              className="text-lg font-semibold"
              id="vehicle-reentry-evaluation-education-title"
            >
              Coupled reentry disciplines
            </h3>
            <div className="mt-4 border-t border-border">
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Vehicle geometry
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Reference area and nose radius strongly affect aerodynamic and
                  stagnation-heating behavior.
                </p>
              </article>
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Ballistic coefficient
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  The relationship among vehicle mass, drag coefficient, and
                  area influences atmospheric deceleration.
                </p>
              </article>
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Thermal loading
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Material selection depends on the integrated thermal history
                  produced for the vehicle and trajectory.
                </p>
              </article>
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Multidisciplinary workflow
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  This analyzer combines flight dynamics, aerodynamics, thermal
                  analysis, and TPS evaluation in one educational workflow.
                </p>
              </article>
            </div>
          </section>
          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Engineering assumptions
            </p>
            <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted @min-[36rem]/col:grid-cols-2">
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
    </LabToolLayout>
  );
}
