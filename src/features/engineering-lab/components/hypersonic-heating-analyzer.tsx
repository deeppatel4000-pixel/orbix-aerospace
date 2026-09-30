"use client";

import { Button, EquationBlock } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";

import { analyzeHypersonicHeating } from "@/features/engineering-lab/analysis";
import {
  EQ_LINE,
  EQ_TERM,
  CalculatorNumberField,
  focusFirstInvalidField,
  GEOPOTENTIAL_ALTITUDE_HINT,
  GEOPOTENTIAL_ALTITUDE_LABEL,
  focusFirstInvalidFieldOnEnter,
  CalculatorResultSection,
  LAB_TOOL_SPLIT,
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
  FlowRegime,
  HypersonicHeatingAnalysis,
  HypersonicHeatingInputs,
} from "@/features/engineering-lab/types";

type HypersonicHeatingField =
  | "altitudeMetres"
  | "velocityMetresPerSecond"
  | "noseRadiusMetres"
  | "heatingCoefficient";

interface HypersonicHeatingFormValues {
  readonly altitudeMetres: string;
  readonly heatingCoefficient: string;
  readonly noseRadiusMetres: string;
  readonly velocityMetresPerSecond: string;
}

type HypersonicHeatingValidationErrors = Readonly<
  Partial<Record<HypersonicHeatingField | "form", string>>
>;

interface HypersonicHeatingViewState {
  readonly errors: HypersonicHeatingValidationErrors;
  readonly result: HypersonicHeatingAnalysis | null;
}

const initialFormValues: HypersonicHeatingFormValues = {
  altitudeMetres: "10000",
  heatingCoefficient: "",
  noseRadiusMetres: "1",
  velocityMetresPerSecond: "2500",
};

const stateFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const densityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
  minimumFractionDigits: 6,
});

const machFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
  minimumFractionDigits: 4,
});

const heatFluxFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const coefficientFormatter = new Intl.NumberFormat("en-US", {
  maximumSignificantDigits: 6,
});

const flowRegimeLabels: Record<FlowRegime, string> = {
  hypersonic: "Hypersonic",
  subsonic: "Subsonic",
  supersonic: "Supersonic",
  transonic: "Transonic",
};

function parseRequiredNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function buildAnalysisInputs(
  values: HypersonicHeatingFormValues,
): HypersonicHeatingInputs {
  const heatingCoefficient =
    values.heatingCoefficient.trim() === ""
      ? undefined
      : Number(values.heatingCoefficient);
  const optionalHeatingCoefficient =
    heatingCoefficient === undefined ? {} : { heatingCoefficient };

  return {
    ...optionalHeatingCoefficient,
    altitudeMetres: parseRequiredNumber(values.altitudeMetres),
    noseRadiusMetres: parseRequiredNumber(values.noseRadiusMetres),
    velocityMetresPerSecond: parseRequiredNumber(
      values.velocityMetresPerSecond,
    ),
  };
}

function deriveViewState(
  values: HypersonicHeatingFormValues,
): HypersonicHeatingViewState {
  try {
    return {
      errors: {},
      result: analyzeHypersonicHeating(buildAnalysisInputs(values)),
    };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;

    const normalizedMessage = error.message.toLowerCase();
    const errors: Partial<Record<HypersonicHeatingField | "form", string>> = {};

    if (normalizedMessage.includes("altitude")) {
      errors.altitudeMetres = error.message;
    }

    if (normalizedMessage.includes("velocity")) {
      errors.velocityMetresPerSecond = error.message;
    }

    if (normalizedMessage.includes("nose radius")) {
      errors.noseRadiusMetres = error.message;
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

const toolEquation = (
  <EquationBlock
    equation={
      <>
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
          <span className={EQ_TERM}>M = V/a</span>
        </span>
      </>
    }
    label="Stagnation-point heating, Sutton-Graves form"
    spokenAs="Heat flux equals k times the square root of density over nose radius, times velocity cubed. Mach number M equals V over a."
    variables={[
      {
        symbol: "q̇",
        meaning: "Stagnation-point convective heat flux",
        unit: "W/m²",
      },
      {
        symbol: "k",
        meaning:
          "Heating coefficient; by default 1.83 × 10⁻⁴ in SI units, for Earth air",
      },
      {
        symbol: "ρ",
        meaning:
          "Air density from the standard troposphere at geopotential altitude",
        unit: "kg/m³",
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
      { symbol: "V", meaning: "Flight velocity", unit: "m/s" },
      {
        symbol: "a",
        meaning: "Speed of sound at the same altitude",
        unit: "m/s",
      },
    ]}
  />
);

export function HypersonicHeatingAnalyzer() {
  const [values, setValues] =
    useState<HypersonicHeatingFormValues>(initialFormValues);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);
  const atmosphericOutputIds = "hypersonic-heating-altitudeMetres";
  const flowOutputIds =
    "hypersonic-heating-altitudeMetres hypersonic-heating-velocityMetresPerSecond";
  const thermalOutputIds =
    "hypersonic-heating-altitudeMetres hypersonic-heating-velocityMetresPerSecond hypersonic-heating-noseRadiusMetres hypersonic-heating-heatingCoefficient";

  function updateValue(field: HypersonicHeatingField, value: string) {
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
      <div className={LAB_TOOL_SPLIT}>
        <div className="@container/col min-w-0">
          <form
            noValidate
            onKeyDown={focusFirstInvalidFieldOnEnter}
            onSubmit={preventSubmission}
          >
            <fieldset className={LAB_GROUP}>
              <legend className={LAB_GROUP_LEGEND}>
                Thermal analysis inputs
              </legend>
              <div className="mt-4 grid gap-5 @min-[36rem]/col:grid-cols-2">
                <CalculatorNumberField
                  error={errors.altitudeMetres}
                  field="altitudeMetres"
                  hint={GEOPOTENTIAL_ALTITUDE_HINT}
                  idPrefix="hypersonic-heating"
                  label={GEOPOTENTIAL_ALTITUDE_LABEL}
                  onChange={updateValue}
                  unit="m"
                  value={values.altitudeMetres}
                />
                <CalculatorNumberField
                  error={errors.velocityMetresPerSecond}
                  field="velocityMetresPerSecond"
                  hint="Positive vehicle velocity relative to the surrounding atmosphere."
                  idPrefix="hypersonic-heating"
                  label="Velocity"
                  onChange={updateValue}
                  unit="m/s"
                  value={values.velocityMetresPerSecond}
                />
                <CalculatorNumberField
                  error={errors.noseRadiusMetres}
                  field="noseRadiusMetres"
                  hint="Positive local radius of curvature at the stagnation point."
                  idPrefix="hypersonic-heating"
                  label="Nose radius"
                  onChange={updateValue}
                  unit="m"
                  value={values.noseRadiusMetres}
                />
                <CalculatorNumberField
                  error={errors.heatingCoefficient}
                  field="heatingCoefficient"
                  hint="Optional positive empirical coefficient. Leave blank to use the educational default."
                  idPrefix="hypersonic-heating"
                  label="Heating coefficient k (optional)"
                  optional
                  onChange={updateValue}
                  unit="kg½/m"
                  value={values.heatingCoefficient}
                />
              </div>
            </fieldset>

            <ValidationErrorSummary
              errors={[
                errors.altitudeMetres,
                errors.velocityMetresPerSecond,
                errors.noseRadiusMetres,
                errors.heatingCoefficient,
                errors.form,
              ]}
            />

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <p className="min-w-0 flex-[1_1_16rem] text-sm leading-6 text-muted">
                Valid changes update the atmospheric, flow, and thermal states
                immediately.
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
            id="hypersonic-heating-result"
            title="Hypersonic heating analysis"
          >
            {result ? (
              <>
                <ReadoutGrid columns={2} title="Atmospheric state">
                  <div>
                    <dt className="orbix-label">Temperature</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={atmosphericOutputIds}
                      >
                        <LabFigure unit="K">
                          {stateFormatter.format(
                            result.atmosphere.temperatureKelvin,
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
                        htmlFor={atmosphericOutputIds}
                      >
                        <LabFigure unit="Pa">
                          {stateFormatter.format(
                            result.atmosphere.pressurePascals,
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
                        htmlFor={atmosphericOutputIds}
                      >
                        <LabFigure unit="kg/m³">
                          {densityFormatter.format(
                            result.atmosphere.densityKilogramsPerCubicMetre,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Speed of sound</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={atmosphericOutputIds}
                      >
                        <LabFigure unit="m/s">
                          {stateFormatter.format(
                            result.atmosphere.speedOfSoundMetersPerSecond,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={2} title="Flow state">
                  <div>
                    <dt className="orbix-label">Velocity</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={flowOutputIds}>
                        <LabFigure unit="m/s">
                          {stateFormatter.format(
                            result.flow.velocityMetresPerSecond,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Mach number</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={flowOutputIds}>
                        <LabFigure>
                          {machFormatter.format(result.flow.machNumber)}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Flow regime</dt>
                    <dd className="mt-1">
                      <output
                        className="lab-value-text"
                        htmlFor={flowOutputIds}
                      >
                        {flowRegimeLabels[result.flow.flowRegime]}
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={2} title="Thermal state">
                  <div>
                    <dt className="orbix-label">Heat flux</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-readout-lg"
                        htmlFor={thermalOutputIds}
                      >
                        <LabFigure unit="kW/m²">
                          {heatFluxFormatter.format(
                            result.thermal.heatFluxKilowattsPerSquareMetre,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">
                      Heat flux, watts per square metre
                    </dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={thermalOutputIds}>
                        <LabFigure unit="W/m²">
                          {heatFluxFormatter.format(
                            result.thermal.heatFluxWattsPerSquareMetre,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Heating coefficient used</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={thermalOutputIds}>
                        <LabFigure unit="kg½/m">
                          {coefficientFormatter.format(
                            result.thermal.heatingCoefficient,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>
              </>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Enter valid atmospheric and vehicle conditions to resolve the
                flow regime and estimated stagnation-point heat flux.
              </NotCalculated>
            )}
          </CalculatorResultSection>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <section
            aria-labelledby="hypersonic-heating-relationships-title"
            className="border-t border-border pt-7"
          >
            <h3
              className="text-lg font-semibold"
              id="hypersonic-heating-relationships-title"
            >
              What shapes stagnation heating?
            </h3>
            <div className="mt-4 border-t border-border">
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Velocity
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Velocity has the strongest influence in this approximation, so
                  modest speed increases can produce much larger heat flux.
                </p>
              </article>
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Altitude and density
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Standard-atmosphere density falls with altitude, leaving fewer
                  air particles available to transfer convective heat.
                </p>
              </article>
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Nose radius
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  A larger, blunter radius spreads the stagnation region and
                  lowers the model&apos;s predicted peak heating.
                </p>
              </article>
            </div>
          </section>
          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Engineering assumptions
            </p>
            <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted @min-[36rem]/col:grid-cols-2">
              <li>Dry-air standard atmosphere</li>
              <li>Convective stagnation-point heating only</li>
              <li>Sutton-Graves style approximation</li>
              <li>No radiation</li>
              <li>No ablation</li>
              <li>No real-gas chemistry</li>
              <li>No thermal protection system modeling</li>
            </ul>
          </aside>
        </div>
      </div>
    </LabToolLayout>
  );
}
