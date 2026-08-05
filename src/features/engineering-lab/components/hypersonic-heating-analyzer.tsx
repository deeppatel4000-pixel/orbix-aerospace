"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CircleDot,
  CloudSun,
  Flame,
  Gauge,
  RotateCcw,
} from "lucide-react";

import { analyzeHypersonicHeating } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  FlowRegime,
  HypersonicHeatingAnalysis,
  HypersonicHeatingInputs,
} from "@/features/engineering-lab/types";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";

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
              Thermal analysis inputs
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <CalculatorNumberField
                error={errors.altitudeMetres}
                field="altitudeMetres"
                hint={`Geometric altitude from sea level through ${STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES.toLocaleString("en-US")} metres.`}
                idPrefix="hypersonic-heating"
                label="Altitude"
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
                label="Heating coefficient (optional)"
                onChange={updateValue}
                unit="k"
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

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-muted">
              Valid changes update the atmospheric, flow, and thermal states
              immediately.
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
          aria-labelledby="hypersonic-heating-relationships-title"
          className="mt-8 border-t border-border pt-7"
        >
          <p className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
            Educational visualization
          </p>
          <h3
            className="mt-1 text-lg font-semibold"
            id="hypersonic-heating-relationships-title"
          >
            What shapes stagnation heating?
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Gauge aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Velocity</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                Velocity has the strongest influence in this approximation, so
                modest speed increases can produce much larger heat flux.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <CloudSun aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">
                Altitude and density
              </h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                Standard-atmosphere density falls with altitude, leaving fewer
                air particles available to transfer convective heat.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <CircleDot aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Nose radius</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                A larger, blunter radius spreads the stagnation region and
                lowers the model&apos;s predicted peak heating.
              </p>
            </article>
          </div>
        </section>
      </div>

      <div className="space-y-5">
        <CalculatorResultSection
          eyebrow="Atmosphere + Flow + Thermal"
          icon={Flame}
          id="hypersonic-heating-result"
          title="Hypersonic heating analysis"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="hypersonic-heating-atmosphere-title">
                <h4
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="hypersonic-heating-atmosphere-title"
                >
                  Atmospheric state
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Temperature</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={atmosphericOutputIds}
                      >
                        {stateFormatter.format(
                          result.atmosphere.temperatureKelvin,
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
                        htmlFor={atmosphericOutputIds}
                      >
                        {stateFormatter.format(
                          result.atmosphere.pressurePascals,
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
                        htmlFor={atmosphericOutputIds}
                      >
                        {densityFormatter.format(
                          result.atmosphere.densityKilogramsPerCubicMetre,
                        )}{" "}
                        kg/m³
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Speed of sound</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={atmosphericOutputIds}
                      >
                        {stateFormatter.format(
                          result.atmosphere.speedOfSoundMetersPerSecond,
                        )}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="hypersonic-heating-flow-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="hypersonic-heating-flow-title"
                >
                  Flow state
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Velocity</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={flowOutputIds}
                      >
                        {stateFormatter.format(
                          result.flow.velocityMetresPerSecond,
                        )}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Mach number</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold text-accent"
                        htmlFor={flowOutputIds}
                      >
                        {machFormatter.format(result.flow.machNumber)}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Flow regime</dt>
                    <dd className="mt-1">
                      <output
                        className="text-sm font-semibold text-accent"
                        htmlFor={flowOutputIds}
                      >
                        {flowRegimeLabels[result.flow.flowRegime]}
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="hypersonic-heating-thermal-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="hypersonic-heating-thermal-title"
                >
                  Thermal state
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Heat flux</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={thermalOutputIds}
                      >
                        {heatFluxFormatter.format(
                          result.thermal.heatFluxWattsPerSquareMetre,
                        )}{" "}
                        W/m²
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Heat flux</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={thermalOutputIds}
                      >
                        {heatFluxFormatter.format(
                          result.thermal.heatFluxKilowattsPerSquareMetre,
                        )}{" "}
                        kW/m²
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">
                      Heating coefficient used
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={thermalOutputIds}
                      >
                        {coefficientFormatter.format(
                          result.thermal.heatingCoefficient,
                        )}
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">—</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Enter valid atmospheric and vehicle conditions to resolve the
                flow regime and estimated stagnation-point heat flux.
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
            <li>Dry-air standard atmosphere</li>
            <li>Convective stagnation-point heating only</li>
            <li>Sutton–Graves style approximation</li>
            <li>No radiation</li>
            <li>No ablation</li>
            <li>No real-gas chemistry</li>
            <li>No thermal protection system modeling</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
