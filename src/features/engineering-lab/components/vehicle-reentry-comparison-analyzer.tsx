"use client";

import { Button, DataTable, EquationBlock } from "@/components/ui";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { CircleAlert } from "lucide-react";

import { analyzeVehicleReentryComparison } from "@/features/engineering-lab/analysis";
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
} from "@/features/engineering-lab/components/shared";
import type {
  VehicleReentryComparisonAnalysis,
  VehicleReentryComparisonInputs,
} from "@/features/engineering-lab/types";

const MAXIMUM_VEHICLES = 5;

type SharedField =
  | "heatingCoefficient"
  | "initialAltitudeMeters"
  | "initialFlightPathAngleDegrees"
  | "initialVelocityMetersPerSecond"
  | "safetyFactor"
  | "timestepSeconds";

type VehicleField =
  | "dragCoefficient"
  | "massKilograms"
  | "noseRadiusMetres"
  | "referenceAreaSquareMetres"
  | "vehicleName";

interface VehicleFormValue {
  readonly dragCoefficient: string;
  readonly id: number;
  readonly massKilograms: string;
  readonly noseRadiusMetres: string;
  readonly referenceAreaSquareMetres: string;
  readonly vehicleName: string;
}

interface ComparisonFormValues {
  readonly heatingCoefficient: string;
  readonly initialAltitudeMeters: string;
  readonly initialFlightPathAngleDegrees: string;
  readonly initialVelocityMetersPerSecond: string;
  readonly safetyFactor: string;
  readonly timestepSeconds: string;
  readonly vehicles: readonly VehicleFormValue[];
}

type SharedValidationErrors = Readonly<Partial<Record<SharedField, string>>>;
type VehicleValidationErrors = Readonly<
  Partial<Record<VehicleField | "entry", string>>
>;

interface ComparisonValidationErrors {
  readonly form?: string;
  readonly shared: SharedValidationErrors;
  readonly vehicleList?: string;
  readonly vehicles: Readonly<Record<number, VehicleValidationErrors>>;
}

interface ComparisonViewState {
  readonly errors: ComparisonValidationErrors;
  readonly result: VehicleReentryComparisonAnalysis | null;
}

interface OptionalNumberFieldProps {
  readonly error?: string;
  readonly field:
    "heatingCoefficient" | "initialFlightPathAngleDegrees" | "timestepSeconds";
  readonly hint: string;
  readonly label: string;
  readonly max?: number;
  readonly min?: number;
  readonly onChange: (field: SharedField, value: string) => void;
  readonly unit: string;
  readonly value: string;
}

interface VehicleFailure {
  readonly id: number;
  readonly message: string;
}

function createInitialFormValues(): ComparisonFormValues {
  return {
    heatingCoefficient: "",
    initialAltitudeMeters: "1000",
    initialFlightPathAngleDegrees: "",
    initialVelocityMetersPerSecond: "150",
    safetyFactor: "1.5",
    timestepSeconds: "",
    vehicles: [
      {
        dragCoefficient: "1.5",
        id: 1,
        massKilograms: "5000",
        noseRadiusMetres: "1",
        referenceAreaSquareMetres: "12",
        vehicleName: "Reference Vehicle",
      },
      {
        dragCoefficient: "1.3",
        id: 2,
        massKilograms: "3600",
        noseRadiusMetres: "0.8",
        referenceAreaSquareMetres: "9",
        vehicleName: "Compact Vehicle",
      },
    ],
  };
}

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
  values: ComparisonFormValues,
  selectedVehicles = values.vehicles,
): VehicleReentryComparisonInputs {
  const heatingCoefficient = parseOptionalNumber(values.heatingCoefficient);
  const initialFlightPathAngleDegrees = parseOptionalNumber(
    values.initialFlightPathAngleDegrees,
  );
  const timestepSeconds = parseOptionalNumber(values.timestepSeconds);

  return {
    ...(heatingCoefficient === undefined ? {} : { heatingCoefficient }),
    ...(initialFlightPathAngleDegrees === undefined
      ? {}
      : { initialFlightPathAngleDegrees }),
    ...(timestepSeconds === undefined ? {} : { timestepSeconds }),
    initialAltitudeMeters: parseRequiredNumber(values.initialAltitudeMeters),
    initialVelocityMetersPerSecond: parseRequiredNumber(
      values.initialVelocityMetersPerSecond,
    ),
    safetyFactor: parseRequiredNumber(values.safetyFactor),
    vehicles: selectedVehicles.map((vehicle) => ({
      dragCoefficient: parseRequiredNumber(vehicle.dragCoefficient),
      massKilograms: parseRequiredNumber(vehicle.massKilograms),
      noseRadiusMetres: parseRequiredNumber(vehicle.noseRadiusMetres),
      referenceAreaSquareMetres: parseRequiredNumber(
        vehicle.referenceAreaSquareMetres,
      ),
      vehicleName: vehicle.vehicleName,
    })),
  };
}

function locateVehicleFailure(
  values: ComparisonFormValues,
): VehicleFailure | null {
  for (const vehicle of values.vehicles) {
    try {
      analyzeVehicleReentryComparison(buildAnalysisInputs(values, [vehicle]));
    } catch (error) {
      if (error instanceof RangeError) {
        return { id: vehicle.id, message: error.message };
      }

      throw error;
    }
  }

  return null;
}

function getVehicleErrorField(message: string): VehicleField | null {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("vehicle name")) return "vehicleName";
  if (normalizedMessage.includes("vehicle mass")) return "massKilograms";
  if (normalizedMessage.includes("drag coefficient")) {
    return "dragCoefficient";
  }
  if (normalizedMessage.includes("reference area")) {
    return "referenceAreaSquareMetres";
  }
  if (normalizedMessage.includes("nose radius")) return "noseRadiusMetres";

  return null;
}

function deriveViewState(values: ComparisonFormValues): ComparisonViewState {
  try {
    return {
      errors: { shared: {}, vehicles: {} },
      result: analyzeVehicleReentryComparison(buildAnalysisInputs(values)),
    };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;

    const normalizedMessage = error.message.toLowerCase();
    const shared: Partial<Record<SharedField, string>> = {};

    if (normalizedMessage.includes("altitude")) {
      shared.initialAltitudeMeters = error.message;
    }
    if (normalizedMessage.includes("velocity")) {
      shared.initialVelocityMetersPerSecond = error.message;
    }
    if (normalizedMessage.includes("safety factor")) {
      shared.safetyFactor = error.message;
    }
    if (normalizedMessage.includes("flight path angle")) {
      shared.initialFlightPathAngleDegrees = error.message;
    }
    if (normalizedMessage.includes("time step")) {
      shared.timestepSeconds = error.message;
    }
    if (normalizedMessage.includes("heating coefficient")) {
      shared.heatingCoefficient = error.message;
    }

    if (Object.keys(shared).length > 0) {
      return { errors: { shared, vehicles: {} }, result: null };
    }

    if (
      normalizedMessage.includes("vehicle reentry comparison") &&
      normalizedMessage.includes("at least one vehicle")
    ) {
      return {
        errors: {
          shared: {},
          vehicleList: error.message,
          vehicles: {},
        },
        result: null,
      };
    }

    const failure = locateVehicleFailure(values);

    if (failure) {
      const field = getVehicleErrorField(failure.message);
      const vehicleErrors: VehicleValidationErrors = field
        ? { [field]: failure.message }
        : { entry: failure.message };

      return {
        errors: {
          shared: {},
          vehicles: { [failure.id]: vehicleErrors },
        },
        result: null,
      };
    }

    return {
      errors: { form: error.message, shared: {}, vehicles: {} },
      result: null,
    };
  }
}

function collectValidationMessages(
  values: ComparisonFormValues,
  errors: ComparisonValidationErrors,
): readonly (string | undefined)[] {
  const vehicleMessages = values.vehicles.flatMap((vehicle, index) => {
    const vehicleErrors = errors.vehicles[vehicle.id];
    const prefix = "Vehicle " + (index + 1) + ": ";

    return [
      vehicleErrors?.vehicleName,
      vehicleErrors?.massKilograms,
      vehicleErrors?.dragCoefficient,
      vehicleErrors?.referenceAreaSquareMetres,
      vehicleErrors?.noseRadiusMetres,
      vehicleErrors?.entry,
    ].map((message) => (message ? prefix + message : undefined));
  });

  return [
    errors.shared.initialAltitudeMeters,
    errors.shared.initialVelocityMetersPerSecond,
    errors.shared.safetyFactor,
    errors.shared.timestepSeconds,
    errors.shared.initialFlightPathAngleDegrees,
    errors.shared.heatingCoefficient,
    errors.vehicleList,
    ...vehicleMessages,
    errors.form,
  ];
}

function getVehicleInputIds(vehicleId: number): string {
  const prefix = "vehicle-reentry-comparison-vehicle-" + vehicleId;

  return [
    prefix + "-vehicleName",
    prefix + "-massKilograms",
    prefix + "-dragCoefficient",
    prefix + "-referenceAreaSquareMetres",
    prefix + "-noseRadiusMetres",
  ].join(" ");
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
  const inputId = "vehicle-reentry-comparison-" + field;
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
    label="Entry deceleration and heating, per vehicle"
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

export function VehicleReentryComparisonAnalyzer() {
  const [values, setValues] = useState<ComparisonFormValues>(
    createInitialFormValues,
  );
  const nextVehicleId = useRef(3);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);
  const hasReachedVehicleLimit = values.vehicles.length >= MAXIMUM_VEHICLES;
  const sharedOutputIds =
    "vehicle-reentry-comparison-initialAltitudeMeters vehicle-reentry-comparison-initialVelocityMetersPerSecond vehicle-reentry-comparison-safetyFactor vehicle-reentry-comparison-timestepSeconds vehicle-reentry-comparison-initialFlightPathAngleDegrees vehicle-reentry-comparison-heatingCoefficient";
  const allOutputIds = [
    sharedOutputIds,
    ...values.vehicles.map((vehicle) => getVehicleInputIds(vehicle.id)),
  ].join(" ");
  const validationMessages = collectValidationMessages(values, errors);

  function updateSharedValue(field: SharedField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function updateVehicleValue(
    vehicleId: number,
    field: VehicleField,
    value: string,
  ) {
    setValues((current) => ({
      ...current,
      vehicles: current.vehicles.map((vehicle) =>
        vehicle.id === vehicleId ? { ...vehicle, [field]: value } : vehicle,
      ),
    }));
  }

  function addVehicle() {
    setValues((current) => {
      if (current.vehicles.length >= MAXIMUM_VEHICLES) return current;

      const vehicleId = nextVehicleId.current;
      nextVehicleId.current += 1;

      return {
        ...current,
        vehicles: [
          ...current.vehicles,
          {
            dragCoefficient: "1.4",
            id: vehicleId,
            massKilograms: "4500",
            noseRadiusMetres: "1",
            referenceAreaSquareMetres: "10",
            vehicleName: "Comparison Vehicle " + vehicleId,
          },
        ],
      };
    });
  }

  function removeVehicle(vehicleId: number) {
    setValues((current) => ({
      ...current,
      vehicles: current.vehicles.filter((vehicle) => vehicle.id !== vehicleId),
    }));
  }

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    focusFirstInvalidField(event.currentTarget);
  }

  function resetAnalyzer() {
    nextVehicleId.current = 3;
    setValues(createInitialFormValues());
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
                Shared reentry conditions
              </legend>
              <div className="mt-4 grid gap-5 @min-[36rem]/col:grid-cols-2">
                <CalculatorNumberField
                  error={errors.shared.initialAltitudeMeters}
                  field="initialAltitudeMeters"
                  hint={GEOPOTENTIAL_ALTITUDE_HINT}
                  idPrefix="vehicle-reentry-comparison"
                  label={INITIAL_GEOPOTENTIAL_ALTITUDE_LABEL}
                  onChange={updateSharedValue}
                  unit="m"
                  value={values.initialAltitudeMeters}
                />
                <CalculatorNumberField
                  error={errors.shared.initialVelocityMetersPerSecond}
                  field="initialVelocityMetersPerSecond"
                  hint="Common positive initial velocity applied to every vehicle."
                  idPrefix="vehicle-reentry-comparison"
                  label="Initial velocity"
                  onChange={updateSharedValue}
                  unit="m/s"
                  value={values.initialVelocityMetersPerSecond}
                />
                <CalculatorNumberField
                  error={errors.shared.safetyFactor}
                  field="safetyFactor"
                  hint="Common positive TPS heat-load multiplier for every evaluation."
                  idPrefix="vehicle-reentry-comparison"
                  label="Safety factor"
                  onChange={updateSharedValue}
                  unit="×"
                  value={values.safetyFactor}
                />
                <OptionalNumberField
                  error={errors.shared.timestepSeconds}
                  field="timestepSeconds"
                  hint="Leave blank to preserve the trajectory analysis default."
                  label="Time step (optional)"
                  min={0}
                  onChange={updateSharedValue}
                  unit="s"
                  value={values.timestepSeconds}
                />
                <OptionalNumberField
                  error={errors.shared.initialFlightPathAngleDegrees}
                  field="initialFlightPathAngleDegrees"
                  hint="Leave blank to preserve the default vertical descent."
                  label="Flight-path angle (optional)"
                  max={0}
                  min={-90}
                  onChange={updateSharedValue}
                  unit="deg"
                  value={values.initialFlightPathAngleDegrees}
                />
                <OptionalNumberField
                  error={errors.shared.heatingCoefficient}
                  field="heatingCoefficient"
                  hint="Leave blank to use the heating calculator's educational default."
                  label="Heating coefficient k (optional)"
                  min={0}
                  onChange={updateSharedValue}
                  unit="kg½/m"
                  value={values.heatingCoefficient}
                />
              </div>
            </fieldset>

            <section
              aria-labelledby="vehicle-reentry-comparison-vehicles-title"
              className="mt-8 border-t border-border pt-7"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3
                    className="text-lg font-semibold"
                    id="vehicle-reentry-comparison-vehicles-title"
                  >
                    Vehicle configurations
                  </h3>
                </div>
                <Button
                  aria-describedby="vehicle-reentry-comparison-limit"
                  className="shrink-0 whitespace-nowrap"
                  variant="secondary"
                  disabled={hasReachedVehicleLimit}
                  onClick={addVehicle}
                >
                  Add vehicle
                </Button>
              </div>

              <p
                aria-live="polite"
                className={
                  "mt-3 text-xs leading-5 " +
                  (hasReachedVehicleLimit
                    ? "text-status-warning"
                    : "text-muted")
                }
                id="vehicle-reentry-comparison-limit"
              >
                {hasReachedVehicleLimit
                  ? "Maximum comparison size reached: five vehicles."
                  : values.vehicles.length +
                    " of " +
                    MAXIMUM_VEHICLES +
                    " vehicles configured."}
              </p>

              {values.vehicles.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {values.vehicles.map((vehicle, index) => {
                    const vehicleNumber = index + 1;
                    const vehicleErrors = errors.vehicles[vehicle.id];
                    const prefix =
                      "vehicle-reentry-comparison-vehicle-" + vehicle.id;
                    const nameHintId = prefix + "-vehicleName-hint";
                    const nameErrorId = prefix + "-vehicleName-error";
                    const entryErrorId = prefix + "-entry-error";

                    return (
                      <fieldset
                        aria-describedby={
                          vehicleErrors?.entry ? entryErrorId : undefined
                        }
                        className="border-t border-border pt-6"
                        key={vehicle.id}
                      >
                        <legend className="sr-only">
                          Vehicle {vehicleNumber} configuration
                        </legend>
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="text-base font-semibold">
                            Vehicle {vehicleNumber}
                          </h4>
                          <Button
                            className="whitespace-nowrap"
                            aria-label={
                              "Remove vehicle " +
                              vehicleNumber +
                              ": " +
                              (vehicle.vehicleName || "unnamed vehicle")
                            }
                            variant="secondary"
                            onClick={() => removeVehicle(vehicle.id)}
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="mt-5 grid gap-5 @min-[36rem]/col:grid-cols-2">
                          <div className="@min-[36rem]/col:col-span-2">
                            <label
                              className="orbix-field__label block"
                              htmlFor={prefix + "-vehicleName"}
                            >
                              Vehicle name
                            </label>
                            <input
                              aria-describedby={
                                vehicleErrors?.vehicleName
                                  ? nameHintId + " " + nameErrorId
                                  : nameHintId
                              }
                              aria-errormessage={
                                vehicleErrors?.vehicleName
                                  ? nameErrorId
                                  : undefined
                              }
                              aria-invalid={Boolean(vehicleErrors?.vehicleName)}
                              className="orbix-input mt-2"
                              id={prefix + "-vehicleName"}
                              onChange={(event) =>
                                updateVehicleValue(
                                  vehicle.id,
                                  "vehicleName",
                                  event.target.value,
                                )
                              }
                              required
                              type="text"
                              value={vehicle.vehicleName}
                            />
                            <p
                              className="orbix-field__help mt-2"
                              id={nameHintId}
                            >
                              Identifies this configuration in result cards and
                              ranking output.
                            </p>
                            {vehicleErrors?.vehicleName ? (
                              <p
                                className="orbix-field__error mt-1"
                                id={nameErrorId}
                              >
                                <CircleAlert
                                  aria-hidden="true"
                                  className="shrink-0"
                                  size={14}
                                />
                                {vehicleErrors.vehicleName}
                              </p>
                            ) : null}
                          </div>

                          <CalculatorNumberField
                            error={vehicleErrors?.massKilograms}
                            field="massKilograms"
                            hint="Positive vehicle mass held constant during evaluation."
                            idPrefix={prefix}
                            label="Mass"
                            onChange={(_field, value) =>
                              updateVehicleValue(
                                vehicle.id,
                                "massKilograms",
                                value,
                              )
                            }
                            unit="kg"
                            value={vehicle.massKilograms}
                          />
                          <CalculatorNumberField
                            error={vehicleErrors?.dragCoefficient}
                            field="dragCoefficient"
                            hint="Positive dimensionless drag coefficient for this vehicle."
                            idPrefix={prefix}
                            label="Drag coefficient"
                            onChange={(_field, value) =>
                              updateVehicleValue(
                                vehicle.id,
                                "dragCoefficient",
                                value,
                              )
                            }
                            unit=""
                            value={vehicle.dragCoefficient}
                          />
                          <CalculatorNumberField
                            error={vehicleErrors?.referenceAreaSquareMetres}
                            field="referenceAreaSquareMetres"
                            hint="Aerodynamic reference area and TPS coverage area."
                            idPrefix={prefix}
                            label="Reference area"
                            onChange={(_field, value) =>
                              updateVehicleValue(
                                vehicle.id,
                                "referenceAreaSquareMetres",
                                value,
                              )
                            }
                            unit="m²"
                            value={vehicle.referenceAreaSquareMetres}
                          />
                          <CalculatorNumberField
                            error={vehicleErrors?.noseRadiusMetres}
                            field="noseRadiusMetres"
                            hint="Effective stagnation-point radius used by heating analysis."
                            idPrefix={prefix}
                            label="Nose radius"
                            onChange={(_field, value) =>
                              updateVehicleValue(
                                vehicle.id,
                                "noseRadiusMetres",
                                value,
                              )
                            }
                            unit="m"
                            value={vehicle.noseRadiusMetres}
                          />
                        </div>

                        {vehicleErrors?.entry ? (
                          <p
                            className="orbix-field__error mt-4"
                            id={entryErrorId}
                            role="alert"
                          >
                            <CircleAlert
                              aria-hidden="true"
                              className="shrink-0"
                              size={14}
                            />
                            {vehicleErrors.entry}
                          </p>
                        ) : null}
                      </fieldset>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-border p-4">
                  <p className="text-sm font-semibold">
                    No vehicles configured
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Add at least one vehicle to run the shared reentry
                    comparison.
                  </p>
                </div>
              )}

              {errors.vehicleList ? (
                <p
                  className="orbix-field__error mt-3"
                  id="vehicle-reentry-comparison-list-error"
                  role="alert"
                >
                  {errors.vehicleList}
                </p>
              ) : null}
            </section>

            <ValidationErrorSummary errors={validationMessages} />

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <p className="min-w-0 flex-[1_1_16rem] text-sm leading-6 text-muted">
                Valid changes rerun every vehicle under the same scenario and
                refresh the ranking immediately.
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
            id="vehicle-reentry-comparison-result"
            title="Vehicle reentry comparison"
          >
            {result ? (
              <>
                <ReadoutGrid columns={1}>
                  <div>
                    <dt className="orbix-label">Recommended vehicle</dt>
                    <dd>
                      <output className="lab-value-text" htmlFor={allOutputIds}>
                        {result.recommendedVehicle.vehicleName}
                      </output>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        Selected from the configured vehicles using the analysis
                        ranking order: lowest TPS mass, lowest required
                        thickness, then lowest peak deceleration.
                      </p>
                    </dd>
                  </div>
                </ReadoutGrid>

                {result.evaluatedVehicles.map((entry, index) => {
                  const formVehicle = values.vehicles[index];
                  const outputIds = formVehicle
                    ? sharedOutputIds + " " + getVehicleInputIds(formVehicle.id)
                    : sharedOutputIds;

                  return (
                    <ReadoutGrid
                      columns={2}
                      key={formVehicle?.id ?? entry.vehicleName}
                      title={
                        entry === result.recommendedVehicle
                          ? entry.vehicleName + ", recommended"
                          : entry.vehicleName
                      }
                    >
                      <div>
                        <dt className="orbix-label">TPS mass</dt>
                        <dd className="mt-1">
                          <output
                            className="orbix-readout-lg"
                            htmlFor={outputIds}
                          >
                            <LabFigure unit="kg">
                              {preciseFormatter.format(entry.tpsMassKilograms)}
                            </LabFigure>
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="orbix-label">Final velocity</dt>
                        <dd className="mt-1">
                          <output className="orbix-data" htmlFor={outputIds}>
                            <LabFigure unit="m/s">
                              {standardFormatter.format(
                                entry.trajectorySummary.finalState
                                  .velocityMetersPerSecond,
                              )}
                            </LabFigure>
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="orbix-label">Reentry duration</dt>
                        <dd className="mt-1">
                          <output className="orbix-data" htmlFor={outputIds}>
                            <LabFigure unit="s">
                              {standardFormatter.format(
                                entry.trajectorySummary.reentryDurationSeconds,
                              )}
                            </LabFigure>
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="orbix-label">Peak deceleration</dt>
                        <dd className="mt-1">
                          <output className="orbix-data" htmlFor={outputIds}>
                            <LabFigure unit="m/s²">
                              {standardFormatter.format(
                                entry.peakDeceleration
                                  .decelerationMetersPerSecondSquared,
                              )}
                            </LabFigure>
                          </output>
                          <output
                            className="lab-figure-note"
                            htmlFor={outputIds}
                          >
                            <LabFigure unit="g">
                              {standardFormatter.format(
                                entry.peakDeceleration.decelerationGs,
                              )}
                            </LabFigure>
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="orbix-label">Peak heat flux</dt>
                        <dd className="mt-1">
                          <output className="orbix-data" htmlFor={outputIds}>
                            <LabFigure unit="W/m²">
                              {heatFluxFormatter.format(
                                entry.peakHeating.heatFluxWattsPerSquareMetre,
                              )}
                            </LabFigure>
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="orbix-label">Total heat load</dt>
                        <dd className="mt-1">
                          <output className="orbix-data" htmlFor={outputIds}>
                            <LabFigure unit="MJ/m²">
                              {preciseFormatter.format(
                                entry.totalHeatLoad
                                  .heatLoadMegajoulesPerSquareMetre,
                              )}
                            </LabFigure>
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="orbix-label">
                          Recommended TPS material
                        </dt>
                        <dd className="mt-1">
                          <output
                            className="lab-value-text"
                            htmlFor={outputIds}
                          >
                            {entry.recommendedTPSMaterial.name}
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="orbix-label">TPS thickness</dt>
                        <dd className="mt-1">
                          <output className="orbix-data" htmlFor={outputIds}>
                            <LabFigure unit="mm">
                              {preciseFormatter.format(
                                entry.tpsThickness.millimetres,
                              )}
                            </LabFigure>
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="orbix-label">Thermal margin</dt>
                        <dd className="mt-1">
                          <output className="orbix-data" htmlFor={outputIds}>
                            <LabFigure unit="%">
                              {standardFormatter.format(
                                entry.thermalMargin.marginPercentage,
                              )}
                            </LabFigure>
                          </output>
                          <output
                            className="lab-figure-note"
                            htmlFor={outputIds}
                          >
                            <LabFigure unit="MJ/m²">
                              {preciseFormatter.format(
                                entry.thermalMargin
                                  .heatLoadMarginMegajoulesPerSquareMetre,
                              )}
                            </LabFigure>
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="orbix-label">Margin classification</dt>
                        <dd className="mt-1">
                          <output
                            className="lab-value-text"
                            htmlFor={outputIds}
                          >
                            {entry.thermalClassification}
                          </output>
                        </dd>
                      </div>
                    </ReadoutGrid>
                  );
                })}
              </>
            ) : (
              <NotCalculated invalid={validationMessages.some(Boolean)}>
                Configure at least one valid vehicle to generate the shared
                reentry comparison.
              </NotCalculated>
            )}
          </CalculatorResultSection>

          {result ? (
            <DataTable
              caption="Vehicles ranked under the shared reentry scenario"
              columns={[
                {
                  key: "rank",
                  header: "Rank",
                  numeric: true,
                  cell: ({ rank }) => String(rank),
                },
                {
                  key: "vehicle",
                  header: "Vehicle",
                  cell: ({ entry, outputIds, recommended }) => (
                    <span className="block min-w-[16ch]">
                      <output htmlFor={outputIds}>{entry.vehicleName}</output>
                      {recommended ? (
                        <span className="block text-sm text-muted">
                          <span className="sr-only">, </span>Recommended
                        </span>
                      ) : null}
                    </span>
                  ),
                },
                {
                  key: "tps-mass",
                  header: "TPS mass",
                  unit: "kg",
                  numeric: true,
                  cell: ({ entry, outputIds }) => (
                    <output htmlFor={outputIds}>
                      {preciseFormatter.format(entry.tpsMassKilograms)}
                    </output>
                  ),
                },
                {
                  key: "tps-thickness",
                  header: "TPS thickness",
                  unit: "mm",
                  numeric: true,
                  cell: ({ entry, outputIds }) => (
                    <output htmlFor={outputIds}>
                      {preciseFormatter.format(entry.tpsThickness.millimetres)}
                    </output>
                  ),
                },
                {
                  key: "peak-deceleration",
                  header: "Peak deceleration",
                  unit: "m/s²",
                  numeric: true,
                  cell: ({ entry, outputIds }) => (
                    <output htmlFor={outputIds}>
                      {standardFormatter.format(
                        entry.peakDeceleration
                          .decelerationMetersPerSecondSquared,
                      )}
                    </output>
                  ),
                },
                {
                  key: "peak-heat-flux",
                  header: "Peak heat flux",
                  unit: "W/m²",
                  numeric: true,
                  cell: ({ entry, outputIds }) => (
                    <output htmlFor={outputIds}>
                      {heatFluxFormatter.format(
                        entry.peakHeating.heatFluxWattsPerSquareMetre,
                      )}
                    </output>
                  ),
                },
                {
                  key: "material",
                  header: "Recommended TPS material",
                  cell: ({ entry, outputIds }) => (
                    <output htmlFor={outputIds}>
                      {entry.recommendedTPSMaterial.name}
                    </output>
                  ),
                },
                {
                  key: "margin",
                  header: "Margin classification",
                  cell: ({ entry, outputIds }) => (
                    <output htmlFor={outputIds}>
                      {entry.thermalClassification}
                    </output>
                  ),
                },
              ]}
              getRowKey={({ key }) => key}
              rows={result.ranking.map((entry, rankIndex) => {
                const inputIndex = result.evaluatedVehicles.indexOf(entry);
                const formVehicle = values.vehicles[inputIndex];
                return {
                  entry,
                  key: formVehicle ? String(formVehicle.id) : entry.vehicleName,
                  outputIds: formVehicle
                    ? sharedOutputIds + " " + getVehicleInputIds(formVehicle.id)
                    : sharedOutputIds,
                  rank: rankIndex + 1,
                  recommended: entry === result.recommendedVehicle,
                };
              })}
            />
          ) : null}
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <section
            aria-labelledby="vehicle-reentry-comparison-education-title"
            className="border-t border-border pt-7"
          >
            <h3
              className="text-lg font-semibold"
              id="vehicle-reentry-comparison-education-title"
            >
              Reading the vehicle trade space
            </h3>
            <div className="mt-4 border-t border-border">
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Vehicle trade-offs
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Mass, drag, area, and nose geometry change deceleration,
                  heating, and the resulting TPS estimates together.
                </p>
              </article>
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Ranking order
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  The existing comparison ranks lowest TPS mass first, then
                  lower thickness, and finally lower peak deceleration.
                </p>
              </article>
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Shared scenario
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Every vehicle receives identical reentry conditions so the
                  displayed differences originate from its configuration.
                </p>
              </article>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              This is an educational comparison, not a flight-design selection
              or certification recommendation.
            </p>
          </section>
          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Modeling assumptions
            </p>
            <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted @min-[36rem]/col:grid-cols-2">
              <li>Educational engineering comparison only</li>
              <li>Identical reentry conditions for every vehicle</li>
              <li>Constant mass, drag coefficient, area, and nose radius</li>
              <li>Simplified point-mass trajectory and atmosphere</li>
              <li>Simplified stagnation-heating and TPS models</li>
              <li>No lift guidance or flight-control behavior</li>
              <li>No ablation, structural failure, or vehicle integration</li>
              <li>Not suitable for flight design or certification</li>
            </ul>
          </aside>
        </div>
      </div>
    </LabToolLayout>
  );
}
