"use client";

import { Button } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";

import { analyzeReentryDeceleration } from "@/features/engineering-lab/analysis";
import { calculateDynamicPressure } from "@/features/engineering-lab/calculators";
import {
  EQ_LINE,
  EQ_TERM,
  CalculatorNumberField,
  focusFirstInvalidField,
  GEOPOTENTIAL_ALTITUDE_HINT,
  GEOPOTENTIAL_ALTITUDE_LABEL,
  focusFirstInvalidFieldOnEnter,
  CalculatorResultSection,
  LAB_TOOL_SPLIT_STICKY,
  LabToolLayout,
  NotCalculated,
  ReadoutGrid,
  ValidationErrorSummary,
  LabFigure,
  EqDot,
  EQ_SUP,
  EQ_SUB_CLEAR,
  EqFrac,
  LabEquation,
} from "@/features/engineering-lab/components/shared";
import type {
  ReentryDecelerationAnalysis,
  ReentryDecelerationInputs,
} from "@/features/engineering-lab/types";

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

const toolEquation = (
  <LabEquation
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
            q = ½<EqDot />ρ<EqDot />V<sup className={EQ_SUP}>2</sup>
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            a = <EqFrac den="β" num="q" />
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            n ={" "}
            <EqFrac
              den={
                <>
                  g<sub className={EQ_SUB_CLEAR}>0</sub>
                </>
              }
              num="a"
            />
          </span>
        </span>
      </>
    }
    label="Ballistic entry deceleration"
    spokenAs="Ballistic coefficient beta equals m over C D times A. Dynamic pressure q equals one half rho V squared. Deceleration a equals q over beta, and n equals a over g zero."
    variables={[
      { symbol: "β", meaning: "Ballistic coefficient", unit: "kg/m²" },
      { symbol: "m", meaning: "Vehicle mass", unit: "kg" },
      {
        symbol: (
          <>
            C<sub>D</sub>
          </>
        ),
        meaning: "Drag coefficient",
      },
      { symbol: "A", meaning: "Reference area", unit: "m²" },
      {
        symbol: "ρ",
        meaning:
          "Air density from the standard troposphere at geopotential altitude",
        unit: "kg/m³",
      },
      { symbol: "V", meaning: "Velocity", unit: "m/s" },
      { symbol: "a", meaning: "Drag deceleration", unit: "m/s²" },
      {
        symbol: "n",
        meaning: "Deceleration in standard gravities",
        unit: "g₀",
      },
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
    focusFirstInvalidField(event.currentTarget);
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  return (
    <LabToolLayout equation={toolEquation}>
      <div className={LAB_TOOL_SPLIT_STICKY}>
        <div className="@container/col min-w-0">
          <form
            noValidate
            onKeyDown={focusFirstInvalidFieldOnEnter}
            onSubmit={preventSubmission}
          >
            <div className="grid gap-5 @min-[36rem]/col:grid-cols-2">
              <CalculatorNumberField
                error={errors.altitudeMetres}
                field="altitudeMetres"
                hint={GEOPOTENTIAL_ALTITUDE_HINT}
                idPrefix="reentry-deceleration"
                label={GEOPOTENTIAL_ALTITUDE_LABEL}
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
                unit=""
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

            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Button
                className="shrink-0 whitespace-nowrap"
                variant="secondary"
                onClick={resetAnalyzer}
              >
                Reset inputs
              </Button>
              <p className="min-w-0 flex-[1_1_14rem] text-[0.8125rem] leading-5 text-muted">
                Valid changes update the atmosphere, vehicle, and deceleration
                states immediately.
              </p>
            </div>
          </form>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <CalculatorResultSection
            id="reentry-deceleration-result"
            title="Reentry deceleration analysis"
          >
            {result ? (
              <>
                <ReadoutGrid columns={2} title="Atmospheric state">
                  <div>
                    <dt className="orbix-label">Temperature</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={atmosphereOutputIds}
                      >
                        <LabFigure unit="K">
                          {stateFormatter.format(
                            result.analysis.atmosphere.temperatureKelvin,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Pressure</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={atmosphereOutputIds}
                      >
                        <LabFigure unit="Pa">
                          {stateFormatter.format(
                            result.analysis.atmosphere.pressurePascals,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Density</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={atmosphereOutputIds}
                      >
                        <LabFigure unit="kg/m³">
                          {densityFormatter.format(
                            result.analysis.atmosphere
                              .densityKilogramsPerCubicMetre,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={1} title="Vehicle state">
                  <div>
                    <dt className="orbix-label">Ballistic coefficient</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={vehicleOutputIds}>
                        <LabFigure unit="kg/m²">
                          {engineeringFormatter.format(
                            result.analysis.vehicle
                              .ballisticCoefficientKilogramsPerSquareMetre,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={2} title="Flight state">
                  <div>
                    <dt className="orbix-label">Drag deceleration</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-readout-lg"
                        htmlFor={decelerationOutputIds}
                      >
                        <LabFigure unit="m/s²">
                          {engineeringFormatter.format(
                            result.analysis.flight
                              .decelerationMetresPerSecondSquared,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Standard-gravity equivalent</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={decelerationOutputIds}
                      >
                        <LabFigure unit="g₀">
                          {engineeringFormatter.format(
                            result.analysis.flight
                              .decelerationStandardGravities,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Dynamic pressure</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={dynamicPressureOutputIds}
                      >
                        <LabFigure unit="Pa">
                          {engineeringFormatter.format(
                            result.dynamicPressurePascals,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>
              </>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Enter valid atmospheric and vehicle conditions to estimate
                instantaneous drag deceleration.
              </NotCalculated>
            )}
          </CalculatorResultSection>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <section
            aria-labelledby="reentry-deceleration-relationships-title"
            className="border-t border-border pt-7"
          >
            <h3
              className="text-lg font-semibold"
              id="reentry-deceleration-relationships-title"
            >
              What controls drag deceleration?
            </h3>
            <div className="mt-3 divide-y divide-border">
              <article className="py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Ballistic coefficient
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  A higher ballistic coefficient places more vehicle mass behind
                  each unit of aerodynamic drag area, reducing instantaneous
                  deceleration.
                </p>
              </article>
              <article className="py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Velocity
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Dynamic pressure rises strongly with velocity, so faster entry
                  conditions produce substantially greater drag force and
                  deceleration.
                </p>
              </article>
              <article className="py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Atmospheric density
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Density controls how much air interacts with the vehicle. As
                  denser air is encountered, drag deceleration grows rapidly.
                </p>
              </article>
            </div>
          </section>
          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Engineering assumptions
            </p>
            <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted @min-[36rem]/col:grid-cols-2">
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
    </LabToolLayout>
  );
}
