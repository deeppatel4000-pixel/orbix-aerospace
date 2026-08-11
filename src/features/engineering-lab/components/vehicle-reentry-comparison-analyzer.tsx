"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Award,
  Flame,
  Plus,
  RotateCcw,
  Scale,
  Trash2,
} from "lucide-react";

import { analyzeVehicleReentryComparison } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  VehicleReentryComparisonAnalysis,
  VehicleReentryComparisonInputs,
} from "@/features/engineering-lab/types";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";

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
  }

  function resetAnalyzer() {
    nextVehicleId.current = 3;
    setValues(createInitialFormValues());
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(34rem,1.08fr)] xl:gap-10">
      <div>
        <form noValidate onSubmit={preventSubmission}>
          <fieldset>
            <legend className="orbix-label text-accent">
              Shared reentry conditions
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <CalculatorNumberField
                error={errors.shared.initialAltitudeMeters}
                field="initialAltitudeMeters"
                hint={
                  "Common starting altitude from 0 through " +
                  STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES.toLocaleString(
                    "en-US",
                  ) +
                  " metres."
                }
                idPrefix="vehicle-reentry-comparison"
                label="Initial altitude"
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
                label="Time step"
                min={0}
                onChange={updateSharedValue}
                unit="s"
                value={values.timestepSeconds}
              />
              <OptionalNumberField
                error={errors.shared.initialFlightPathAngleDegrees}
                field="initialFlightPathAngleDegrees"
                hint="Leave blank to preserve the default vertical descent."
                label="Flight-path angle"
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
                label="Heating coefficient"
                min={0}
                onChange={updateSharedValue}
                unit="k"
                value={values.heatingCoefficient}
              />
            </div>
          </fieldset>

          <section
            aria-labelledby="vehicle-reentry-comparison-vehicles-title"
            className="mt-8 border-t border-border pt-7"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="orbix-label text-accent">Comparison fleet</p>
                <h3
                  className="mt-1 text-lg font-semibold"
                  id="vehicle-reentry-comparison-vehicles-title"
                >
                  Vehicle configurations
                </h3>
              </div>
              <button
                aria-describedby="vehicle-reentry-comparison-limit"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent/45 bg-accent/8 px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:border-accent hover:bg-accent/12 disabled:cursor-not-allowed disabled:border-border disabled:bg-surface/50 disabled:text-muted"
                disabled={hasReachedVehicleLimit}
                onClick={addVehicle}
                type="button"
              >
                <Plus aria-hidden="true" size={16} />
                Add vehicle
              </button>
            </div>

            <p
              aria-live="polite"
              className={
                "mt-3 text-xs leading-5 " +
                (hasReachedVehicleLimit ? "text-signal" : "text-muted")
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
                      className="rounded-2xl border border-border bg-background/40 p-4 sm:p-5"
                      key={vehicle.id}
                    >
                      <legend className="sr-only">
                        Vehicle {vehicleNumber} configuration
                      </legend>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-mono text-[0.64rem] tracking-[0.14em] text-muted uppercase">
                            Stable entry {vehicle.id}
                          </p>
                          <h4 className="mt-1 text-base font-semibold">
                            Vehicle {vehicleNumber}
                          </h4>
                        </div>
                        <button
                          aria-label={
                            "Remove vehicle " +
                            vehicleNumber +
                            ": " +
                            (vehicle.vehicleName || "unnamed vehicle")
                          }
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border px-3.5 py-2 text-xs font-semibold text-muted transition-colors hover:border-signal/50 hover:text-signal"
                          onClick={() => removeVehicle(vehicle.id)}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" size={15} />
                          Remove
                        </button>
                      </div>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label
                            className="text-sm font-semibold"
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
                            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background/55 px-4 py-3 text-base text-foreground transition-colors outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
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
                            className="mt-2 text-xs leading-5 text-muted"
                            id={nameHintId}
                          >
                            Identifies this configuration in result cards and
                            ranking output.
                          </p>
                          {vehicleErrors?.vehicleName ? (
                            <p
                              className="mt-1.5 text-xs leading-5 text-signal"
                              id={nameErrorId}
                            >
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
                          unit="CD"
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
                          className="mt-4 rounded-xl border border-signal/35 bg-signal/8 p-3 text-xs leading-5 text-signal"
                          id={entryErrorId}
                          role="alert"
                        >
                          {vehicleErrors.entry}
                        </p>
                      ) : null}
                    </fieldset>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-border p-5 text-center">
                <p className="text-sm font-semibold">No vehicles configured</p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Add at least one vehicle to run the shared reentry comparison.
                </p>
              </div>
            )}

            {errors.vehicleList ? (
              <p
                className="mt-3 text-xs leading-5 text-signal"
                id="vehicle-reentry-comparison-list-error"
                role="alert"
              >
                {errors.vehicleList}
              </p>
            ) : null}
          </section>

          <ValidationErrorSummary errors={validationMessages} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-muted">
              Valid changes rerun every vehicle under the same scenario and
              refresh the ranking immediately.
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
          aria-labelledby="vehicle-reentry-comparison-education-title"
          className="mt-8 border-t border-border pt-7"
        >
          <p className="orbix-label text-accent">Educational comparison</p>
          <h3
            className="mt-1 text-lg font-semibold"
            id="vehicle-reentry-comparison-education-title"
          >
            Reading the vehicle trade space
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Scale aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Vehicle trade-offs</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                Mass, drag, area, and nose geometry change deceleration,
                heating, and the resulting TPS estimates together.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Award aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Ranking order</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                The existing comparison ranks lowest TPS mass first, then lower
                thickness, and finally lower peak deceleration.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Flame aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Shared scenario</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                Every vehicle receives identical reentry conditions so the
                displayed differences originate from its configuration.
              </p>
            </article>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">
            This is an educational comparison, not a flight-design selection or
            certification recommendation.
          </p>
        </section>
      </div>

      <div className="min-w-0 space-y-5">
        <CalculatorResultSection
          eyebrow="Shared scenario // Ranked vehicles"
          icon={Award}
          id="vehicle-reentry-comparison-result"
          title="Vehicle reentry comparison"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="vehicle-reentry-comparison-recommended-title">
                <h4
                  className="orbix-label text-accent"
                  id="vehicle-reentry-comparison-recommended-title"
                >
                  Recommended vehicle
                </h4>
                <output
                  className="mt-3 block text-2xl font-semibold"
                  htmlFor={allOutputIds}
                >
                  {result.recommendedVehicle.vehicleName}
                </output>
                <p className="mt-3 rounded-xl border border-accent/25 bg-accent/7 p-4 text-xs leading-5 text-muted">
                  Selected from the configured vehicles using the analysis
                  ranking order: lowest TPS mass, lowest required thickness,
                  then lowest peak deceleration.
                </p>
              </section>

              <section
                aria-labelledby="vehicle-reentry-comparison-details-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="vehicle-reentry-comparison-details-title"
                >
                  Vehicle results
                </h4>
                <div className="mt-4 space-y-4">
                  {result.evaluatedVehicles.map((entry, index) => {
                    const formVehicle = values.vehicles[index];
                    const outputIds = formVehicle
                      ? sharedOutputIds +
                        " " +
                        getVehicleInputIds(formVehicle.id)
                      : sharedOutputIds;

                    return (
                      <article
                        className="rounded-2xl border border-border bg-background/35 p-4 sm:p-5"
                        key={formVehicle?.id ?? entry.vehicleName}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h5 className="text-lg font-semibold">
                            {entry.vehicleName}
                          </h5>
                          {entry === result.recommendedVehicle ? (
                            <span className="rounded-full border border-accent/35 bg-accent/8 px-3 py-1 font-mono text-[0.62rem] tracking-[0.1em] text-accent uppercase">
                              Recommended
                            </span>
                          ) : null}
                        </div>
                        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                          <div>
                            <dt className="text-xs text-muted">
                              Final velocity
                            </dt>
                            <dd className="mt-1">
                              <output
                                className="font-mono text-sm font-semibold"
                                htmlFor={outputIds}
                              >
                                {standardFormatter.format(
                                  entry.trajectorySummary.finalState
                                    .velocityMetersPerSecond,
                                )}{" "}
                                m/s
                              </output>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted">
                              Reentry duration
                            </dt>
                            <dd className="mt-1">
                              <output
                                className="font-mono text-sm font-semibold"
                                htmlFor={outputIds}
                              >
                                {standardFormatter.format(
                                  entry.trajectorySummary
                                    .reentryDurationSeconds,
                                )}{" "}
                                s
                              </output>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted">
                              Peak deceleration
                            </dt>
                            <dd className="mt-1">
                              <output
                                className="font-mono text-sm font-semibold"
                                htmlFor={outputIds}
                              >
                                {standardFormatter.format(
                                  entry.peakDeceleration
                                    .decelerationMetersPerSecondSquared,
                                )}{" "}
                                m/s² ·{" "}
                                {standardFormatter.format(
                                  entry.peakDeceleration.decelerationGs,
                                )}{" "}
                                g
                              </output>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted">
                              Peak heat flux
                            </dt>
                            <dd className="mt-1">
                              <output
                                className="font-mono text-sm font-semibold"
                                htmlFor={outputIds}
                              >
                                {heatFluxFormatter.format(
                                  entry.peakHeating.heatFluxWattsPerSquareMetre,
                                )}{" "}
                                W/m²
                              </output>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted">
                              Total heat load
                            </dt>
                            <dd className="mt-1">
                              <output
                                className="font-mono text-sm font-semibold"
                                htmlFor={outputIds}
                              >
                                {preciseFormatter.format(
                                  entry.totalHeatLoad
                                    .heatLoadMegajoulesPerSquareMetre,
                                )}{" "}
                                MJ/m²
                              </output>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted">
                              Recommended TPS material
                            </dt>
                            <dd className="mt-1">
                              <output
                                className="text-sm font-semibold"
                                htmlFor={outputIds}
                              >
                                {entry.recommendedTPSMaterial.name}
                              </output>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted">
                              TPS thickness
                            </dt>
                            <dd className="mt-1">
                              <output
                                className="font-mono text-sm font-semibold"
                                htmlFor={outputIds}
                              >
                                {preciseFormatter.format(
                                  entry.tpsThickness.millimetres,
                                )}{" "}
                                mm
                              </output>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted">TPS mass</dt>
                            <dd className="mt-1">
                              <output
                                className="font-mono text-sm font-semibold"
                                htmlFor={outputIds}
                              >
                                {preciseFormatter.format(
                                  entry.tpsMassKilograms,
                                )}{" "}
                                kg
                              </output>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted">
                              Thermal margin
                            </dt>
                            <dd className="mt-1">
                              <output
                                className="font-mono text-sm font-semibold"
                                htmlFor={outputIds}
                              >
                                {standardFormatter.format(
                                  entry.thermalMargin.marginPercentage,
                                )}
                                % ·{" "}
                                {preciseFormatter.format(
                                  entry.thermalMargin
                                    .heatLoadMarginMegajoulesPerSquareMetre,
                                )}{" "}
                                MJ/m²
                              </output>
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted">
                              Margin classification
                            </dt>
                            <dd className="mt-1">
                              <output
                                className="text-sm font-semibold text-accent"
                                htmlFor={outputIds}
                              >
                                {entry.thermalClassification}
                              </output>
                            </dd>
                          </div>
                        </dl>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section
                aria-labelledby="vehicle-reentry-comparison-table-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="vehicle-reentry-comparison-table-title"
                >
                  Comparison table
                </h4>
                <div
                  aria-label="Scrollable ranked vehicle reentry comparison table"
                  className="mt-3 overflow-x-auto rounded-xl border border-border outline-none focus:ring-2 focus:ring-accent/25"
                  role="region"
                  tabIndex={0}
                >
                  <table className="w-full min-w-[76rem] border-collapse text-left text-sm">
                    <caption className="sr-only">
                      Vehicles ranked under the shared reentry scenario
                    </caption>
                    <thead className="bg-surface/85">
                      <tr>
                        <th className="px-4 py-3 font-semibold" scope="col">
                          Rank
                        </th>
                        <th className="px-4 py-3 font-semibold" scope="col">
                          Vehicle
                        </th>
                        <th className="px-4 py-3 font-semibold" scope="col">
                          TPS mass
                        </th>
                        <th className="px-4 py-3 font-semibold" scope="col">
                          TPS thickness
                        </th>
                        <th className="px-4 py-3 font-semibold" scope="col">
                          Peak deceleration
                        </th>
                        <th className="px-4 py-3 font-semibold" scope="col">
                          Peak heat flux
                        </th>
                        <th className="px-4 py-3 font-semibold" scope="col">
                          Recommended TPS material
                        </th>
                        <th className="px-4 py-3 font-semibold" scope="col">
                          Margin classification
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.ranking.map((entry, rankIndex) => {
                        const inputIndex =
                          result.evaluatedVehicles.indexOf(entry);
                        const formVehicle = values.vehicles[inputIndex];
                        const outputIds = formVehicle
                          ? sharedOutputIds +
                            " " +
                            getVehicleInputIds(formVehicle.id)
                          : sharedOutputIds;
                        const recommended = entry === result.recommendedVehicle;

                        return (
                          <tr
                            className={
                              recommended
                                ? "border-t border-border bg-accent/7"
                                : "border-t border-border"
                            }
                            key={formVehicle?.id ?? entry.vehicleName}
                          >
                            <th
                              className="px-4 py-3 font-mono text-accent"
                              scope="row"
                            >
                              {rankIndex + 1}
                            </th>
                            <td className="px-4 py-3 font-semibold">
                              <output htmlFor={outputIds}>
                                {entry.vehicleName}
                              </output>
                              {recommended ? (
                                <span className="ml-2 text-[0.62rem] tracking-[0.1em] text-accent uppercase">
                                  Recommended
                                </span>
                              ) : null}
                            </td>
                            <td className="px-4 py-3 font-mono">
                              <output htmlFor={outputIds}>
                                {preciseFormatter.format(
                                  entry.tpsMassKilograms,
                                )}{" "}
                                kg
                              </output>
                            </td>
                            <td className="px-4 py-3 font-mono">
                              <output htmlFor={outputIds}>
                                {preciseFormatter.format(
                                  entry.tpsThickness.millimetres,
                                )}{" "}
                                mm
                              </output>
                            </td>
                            <td className="px-4 py-3 font-mono">
                              <output htmlFor={outputIds}>
                                {standardFormatter.format(
                                  entry.peakDeceleration
                                    .decelerationMetersPerSecondSquared,
                                )}{" "}
                                m/s²
                              </output>
                            </td>
                            <td className="px-4 py-3 font-mono">
                              <output htmlFor={outputIds}>
                                {heatFluxFormatter.format(
                                  entry.peakHeating.heatFluxWattsPerSquareMetre,
                                )}{" "}
                                W/m²
                              </output>
                            </td>
                            <td className="px-4 py-3">
                              <output htmlFor={outputIds}>
                                {entry.recommendedTPSMaterial.name}
                              </output>
                            </td>
                            <td className="px-4 py-3">
                              <output htmlFor={outputIds}>
                                {entry.thermalClassification}
                              </output>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">—</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Configure at least one valid vehicle to generate the shared
                reentry comparison.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <aside className="orbix-lab-note">
          <p className="orbix-lab-note__title">
            <AlertTriangle aria-hidden="true" size={17} />
            Modeling assumptions
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-xs leading-5 text-muted sm:grid-cols-2">
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
  );
}
