"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CloudSun,
  Gauge,
  RotateCcw,
  Scale,
  Wind,
} from "lucide-react";

import { analyzeReentryDeceleration } from "@/features/engineering-lab/analysis";
import { calculateDynamicPressure } from "@/features/engineering-lab/calculators";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  ReentryDecelerationAnalysis,
  ReentryDecelerationInputs,
} from "@/features/engineering-lab/types";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";

type ReentryDecelerationField =
  | "altitudeMetres"
  | "velocityMetresPerSecond"
  | "vehicleMassKilograms"
  | "dragCoefficient"
  | "referenceAreaSquareMetres";

interface ReentryDecelerationFormValues {
  readonly altitudeMetres: string;
  readonly dragCoefficient: string;
  readonly referenceAreaSquareMetres: string;
  readonly vehicleMassKilograms: string;
  readonly velocityMetresPerSecond: string;
}

type ReentryDecelerationValidationErrors = Readonly<
  Partial<Record<ReentryDecelerationField | "form", string>>
>;

interface ReentryDecelerationViewResult {
  readonly analysis: ReentryDecelerationAnalysis;
  readonly dynamicPressurePascals: number;
}

interface ReentryDecelerationViewState {
  readonly errors: ReentryDecelerationValidationErrors;
  readonly result: ReentryDecelerationViewResult | null;
}

const initialFormValues: ReentryDecelerationFormValues = {
  altitudeMetres: "10000",
  dragCoefficient: "1.5",
  referenceAreaSquareMetres: "12",
  vehicleMassKilograms: "5000",
  velocityMetresPerSecond: "3000",
};

const stateFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const densityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
  minimumFractionDigits: 6,
});

const engineeringFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
});

function parseRequiredNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function buildAnalysisInputs(
  values: ReentryDecelerationFormValues,
): ReentryDecelerationInputs {
  return {
    altitudeMetres: parseRequiredNumber(values.altitudeMetres),
    dragCoefficient: parseRequiredNumber(values.dragCoefficient),
    referenceAreaSquareMetres: parseRequiredNumber(
      values.referenceAreaSquareMetres,
    ),
    vehicleMassKilograms: parseRequiredNumber(values.vehicleMassKilograms),
    velocityMetresPerSecond: parseRequiredNumber(
      values.velocityMetresPerSecond,
    ),
  };
}

function deriveViewState(
  values: ReentryDecelerationFormValues,
): ReentryDecelerationViewState {
  try {
    const analysis = analyzeReentryDeceleration(buildAnalysisInputs(values));
    const { dynamicPressurePascals } = calculateDynamicPressure({
      airDensityKilogramsPerCubicMetre:
        analysis.atmosphere.densityKilogramsPerCubicMetre,
      velocityMetresPerSecond: analysis.flight.velocityMetresPerSecond,
    });

    return {
      errors: {},
      result: { analysis, dynamicPressurePascals },
    };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;

    const normalizedMessage = error.message.toLowerCase();
    const errors: Partial<Record<ReentryDecelerationField | "form", string>> =
      {};

    if (normalizedMessage.includes("altitude")) {
      errors.altitudeMetres = error.message;
    }

    if (normalizedMessage.includes("velocity")) {
      errors.velocityMetresPerSecond = error.message;
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

    if (Object.keys(errors).length === 0) {
      errors.form = error.message;
    }

    return { errors, result: null };
  }
}

export function ReentryDecelerationAnalyzer() {
  const [values, setValues] =
    useState<ReentryDecelerationFormValues>(initialFormValues);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);
  const atmosphereOutputIds = "reentry-deceleration-altitudeMetres";
  const vehicleOutputIds =
    "reentry-deceleration-vehicleMassKilograms reentry-deceleration-dragCoefficient reentry-deceleration-referenceAreaSquareMetres";
  const dynamicPressureOutputIds =
    "reentry-deceleration-altitudeMetres reentry-deceleration-velocityMetresPerSecond";
  const decelerationOutputIds =
    "reentry-deceleration-altitudeMetres reentry-deceleration-velocityMetresPerSecond reentry-deceleration-vehicleMassKilograms reentry-deceleration-dragCoefficient reentry-deceleration-referenceAreaSquareMetres";

  function updateValue(field: ReentryDecelerationField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(22rem,1.05fr)] xl:gap-10">
      <div>
        <form noValidate onSubmit={preventSubmission}>
          <fieldset>
            <legend className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
              Reentry condition inputs
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <CalculatorNumberField
                error={errors.altitudeMetres}
                field="altitudeMetres"
                hint={`Geometric altitude from sea level through ${STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES.toLocaleString("en-US")} metres.`}
                idPrefix="reentry-deceleration"
                label="Altitude"
                onChange={updateValue}
                unit="m"
                value={values.altitudeMetres}
              />
              <CalculatorNumberField
                error={errors.velocityMetresPerSecond}
                field="velocityMetresPerSecond"
                hint="Positive instantaneous velocity relative to the surrounding atmosphere."
                idPrefix="reentry-deceleration"
                label="Velocity"
                onChange={updateValue}
                unit="m/s"
                value={values.velocityMetresPerSecond}
              />
              <CalculatorNumberField
                error={errors.vehicleMassKilograms}
                field="vehicleMassKilograms"
                hint="Positive vehicle mass at the analyzed flight condition."
                idPrefix="reentry-deceleration"
                label="Vehicle mass"
                onChange={updateValue}
                unit="kg"
                value={values.vehicleMassKilograms}
              />
              <CalculatorNumberField
                error={errors.dragCoefficient}
                field="dragCoefficient"
                hint="Positive dimensionless drag coefficient for the selected configuration."
                idPrefix="reentry-deceleration"
                label="Drag coefficient"
                onChange={updateValue}
                unit="CD"
                value={values.dragCoefficient}
              />
              <CalculatorNumberField
                error={errors.referenceAreaSquareMetres}
                field="referenceAreaSquareMetres"
                hint="Positive aerodynamic reference area for the selected configuration."
                idPrefix="reentry-deceleration"
                label="Reference area"
                onChange={updateValue}
                unit="m²"
                value={values.referenceAreaSquareMetres}
              />
            </div>
          </fieldset>

          <ValidationErrorSummary
            errors={[
              errors.altitudeMetres,
              errors.velocityMetresPerSecond,
              errors.vehicleMassKilograms,
              errors.dragCoefficient,
              errors.referenceAreaSquareMetres,
              errors.form,
            ]}
          />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-muted">
              Valid changes update the atmosphere, vehicle, and deceleration
              states immediately.
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
          aria-labelledby="reentry-deceleration-relationships-title"
          className="mt-8 border-t border-border pt-7"
        >
          <p className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
            Educational visualization
          </p>
          <h3
            className="mt-1 text-lg font-semibold"
            id="reentry-deceleration-relationships-title"
          >
            What controls drag deceleration?
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Scale aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">
                Ballistic coefficient
              </h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                A higher ballistic coefficient places more vehicle mass behind
                each unit of aerodynamic drag area, reducing instantaneous
                deceleration.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Gauge aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Velocity</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                Dynamic pressure rises strongly with velocity, so faster entry
                conditions produce substantially greater drag force and
                deceleration.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <CloudSun aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">
                Atmospheric density
              </h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                Density controls how much air interacts with the vehicle. As
                denser air is encountered, drag deceleration grows rapidly.
              </p>
            </article>
          </div>
        </section>
      </div>

      <div className="space-y-5">
        <CalculatorResultSection
          eyebrow="Atmosphere + Vehicle + Flight"
          icon={Wind}
          id="reentry-deceleration-result"
          title="Reentry deceleration analysis"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="reentry-deceleration-atmosphere-title">
                <h4
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="reentry-deceleration-atmosphere-title"
                >
                  Atmospheric state
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Temperature</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={atmosphereOutputIds}
                      >
                        {stateFormatter.format(
                          result.analysis.atmosphere.temperatureKelvin,
                        )}{" "}
                        K
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Pressure</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={atmosphereOutputIds}
                      >
                        {stateFormatter.format(
                          result.analysis.atmosphere.pressurePascals,
                        )}{" "}
                        Pa
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Density</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={atmosphereOutputIds}
                      >
                        {densityFormatter.format(
                          result.analysis.atmosphere
                            .densityKilogramsPerCubicMetre,
                        )}{" "}
                        kg/m³
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="reentry-deceleration-vehicle-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="reentry-deceleration-vehicle-title"
                >
                  Vehicle state
                </h4>
                <dl className="mt-3">
                  <div>
                    <dt className="text-xs text-muted">
                      Ballistic coefficient
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={vehicleOutputIds}
                      >
                        {engineeringFormatter.format(
                          result.analysis.vehicle
                            .ballisticCoefficientKilogramsPerSquareMetre,
                        )}{" "}
                        kg/m²
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="reentry-deceleration-flight-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="reentry-deceleration-flight-title"
                >
                  Flight state
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Dynamic pressure</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={dynamicPressureOutputIds}
                      >
                        {engineeringFormatter.format(
                          result.dynamicPressurePascals,
                        )}{" "}
                        Pa
                      </output>
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold text-foreground">
                      Drag deceleration
                    </dt>
                    <dd className="mt-3 grid gap-4 rounded-xl border border-border bg-background/35 p-4 sm:grid-cols-2">
                      <div>
                        <span className="block text-xs text-muted">
                          Deceleration
                        </span>
                        <output
                          className="mt-1 block font-mono text-lg font-semibold text-accent"
                          htmlFor={decelerationOutputIds}
                        >
                          {engineeringFormatter.format(
                            result.analysis.flight
                              .decelerationMetresPerSecondSquared,
                          )}{" "}
                          m/s²
                        </output>
                      </div>
                      <div>
                        <span className="block text-xs text-muted">
                          Standard-gravity equivalent
                        </span>
                        <output
                          className="mt-1 block font-mono text-lg font-semibold text-accent"
                          htmlFor={decelerationOutputIds}
                        >
                          {engineeringFormatter.format(
                            result.analysis.flight
                              .decelerationStandardGravities,
                          )}{" "}
                          g
                        </output>
                      </div>
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">—</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Enter valid atmospheric and vehicle conditions to estimate
                instantaneous drag deceleration.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <aside className="rounded-2xl border border-signal/25 bg-signal/6 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-signal">
            <AlertTriangle aria-hidden="true" size={17} />
            Engineering assumptions
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-xs leading-5 text-muted sm:grid-cols-2">
            <li>Instantaneous drag deceleration estimate</li>
            <li>Constant vehicle properties</li>
            <li>No trajectory integration</li>
            <li>No lift effects</li>
            <li>No heating coupling</li>
            <li>No structural loads</li>
            <li>No changing atmosphere outside the current model</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
