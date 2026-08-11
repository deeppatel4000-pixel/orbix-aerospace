"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CircleDot,
  Gauge,
  MoveRight,
  RotateCcw,
} from "lucide-react";

import { analyzeHohmannTransfer } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  HohmannTransferAnalysisInputs,
  HohmannTransferAnalysisResult,
} from "@/features/engineering-lab/types";

type HohmannTransferField =
  | "initialAltitudeMetres"
  | "finalAltitudeMetres"
  | "gravitationalParameter"
  | "planetRadiusMetres";

interface HohmannTransferFormValues {
  readonly finalAltitudeMetres: string;
  readonly gravitationalParameter: string;
  readonly initialAltitudeMetres: string;
  readonly planetRadiusMetres: string;
}

type HohmannTransferValidationErrors = Readonly<
  Partial<Record<HohmannTransferField | "form", string>>
>;

interface HohmannTransferViewState {
  readonly errors: HohmannTransferValidationErrors;
  readonly result: HohmannTransferAnalysisResult | null;
}

const initialFormValues: HohmannTransferFormValues = {
  finalAltitudeMetres: "35786000",
  gravitationalParameter: "",
  initialAltitudeMetres: "400000",
  planetRadiusMetres: "",
};

const distanceFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const velocityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
});

const timeFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
});

function parseRequiredNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function buildAnalysisInputs(
  values: HohmannTransferFormValues,
): HohmannTransferAnalysisInputs {
  const gravitationalParameter =
    values.gravitationalParameter.trim() === ""
      ? undefined
      : Number(values.gravitationalParameter);
  const planetRadiusMetres =
    values.planetRadiusMetres.trim() === ""
      ? undefined
      : Number(values.planetRadiusMetres);

  return {
    ...(gravitationalParameter === undefined ? {} : { gravitationalParameter }),
    ...(planetRadiusMetres === undefined ? {} : { planetRadiusMetres }),
    finalAltitudeMetres: parseRequiredNumber(values.finalAltitudeMetres),
    initialAltitudeMetres: parseRequiredNumber(values.initialAltitudeMetres),
  };
}

function locateAltitudeError(
  inputs: HohmannTransferAnalysisInputs,
): "initialAltitudeMetres" | "finalAltitudeMetres" {
  try {
    analyzeHohmannTransfer({ ...inputs, finalAltitudeMetres: 0 });
  } catch (error) {
    if (
      error instanceof RangeError &&
      error.message.toLowerCase().includes("altitude")
    ) {
      return "initialAltitudeMetres";
    }
  }

  return "finalAltitudeMetres";
}

function deriveViewState(
  values: HohmannTransferFormValues,
): HohmannTransferViewState {
  const inputs = buildAnalysisInputs(values);

  try {
    return { errors: {}, result: analyzeHohmannTransfer(inputs) };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;

    const normalizedMessage = error.message.toLowerCase();
    const errors: Partial<Record<HohmannTransferField | "form", string>> = {};

    if (normalizedMessage.includes("initial and final orbit radii")) {
      errors.initialAltitudeMetres = error.message;
      errors.finalAltitudeMetres = error.message;
    } else if (normalizedMessage.includes("altitude")) {
      errors[locateAltitudeError(inputs)] = error.message;
    }

    if (normalizedMessage.includes("gravitational parameter")) {
      errors.gravitationalParameter = error.message;
    }

    if (normalizedMessage.includes("planet radius")) {
      errors.planetRadiusMetres = error.message;
    }

    if (Object.keys(errors).length === 0) {
      errors.form = error.message;
    }

    return { errors, result: null };
  }
}

export function HohmannTransferAnalyzer() {
  const [values, setValues] =
    useState<HohmannTransferFormValues>(initialFormValues);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);
  const initialOrbitOutputIds =
    "hohmann-transfer-initialAltitudeMetres hohmann-transfer-gravitationalParameter hohmann-transfer-planetRadiusMetres";
  const finalOrbitOutputIds =
    "hohmann-transfer-finalAltitudeMetres hohmann-transfer-gravitationalParameter hohmann-transfer-planetRadiusMetres";
  const transferOutputIds =
    "hohmann-transfer-initialAltitudeMetres hohmann-transfer-finalAltitudeMetres hohmann-transfer-gravitationalParameter hohmann-transfer-planetRadiusMetres";
  const transferDirection = result
    ? result.finalOrbit.altitudeMetres > result.initialOrbit.altitudeMetres
      ? "Orbit raising"
      : "Orbit lowering"
    : null;

  function updateValue(field: HohmannTransferField, value: string) {
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
            <legend className="orbix-label text-accent">Initial orbit</legend>
            <div className="mt-5">
              <CalculatorNumberField
                error={errors.initialAltitudeMetres}
                field="initialAltitudeMetres"
                hint="Altitude above the modeled central body's reference radius."
                idPrefix="hohmann-transfer"
                label="Initial altitude"
                onChange={updateValue}
                unit="m"
                value={values.initialAltitudeMetres}
              />
            </div>
          </fieldset>

          <fieldset className="mt-7 border-t border-border pt-7">
            <legend className="orbix-label text-accent">Final orbit</legend>
            <div className="mt-5">
              <CalculatorNumberField
                error={errors.finalAltitudeMetres}
                field="finalAltitudeMetres"
                hint="Target circular-orbit altitude above the same reference radius."
                idPrefix="hohmann-transfer"
                label="Final altitude"
                onChange={updateValue}
                unit="m"
                value={values.finalAltitudeMetres}
              />
            </div>
          </fieldset>

          <fieldset className="mt-7 border-t border-border pt-7">
            <legend className="orbix-label text-accent">
              Central-body constants
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <CalculatorNumberField
                error={errors.gravitationalParameter}
                field="gravitationalParameter"
                hint="Optional. Leave blank to use Earth's standard gravitational parameter."
                idPrefix="hohmann-transfer"
                label="Gravitational parameter (optional)"
                onChange={updateValue}
                unit="m³/s²"
                value={values.gravitationalParameter}
              />
              <CalculatorNumberField
                error={errors.planetRadiusMetres}
                field="planetRadiusMetres"
                hint="Optional. Leave blank to use Earth's mean radius."
                idPrefix="hohmann-transfer"
                label="Planet radius (optional)"
                onChange={updateValue}
                unit="m"
                value={values.planetRadiusMetres}
              />
            </div>
          </fieldset>

          <ValidationErrorSummary
            errors={[
              errors.initialAltitudeMetres,
              errors.finalAltitudeMetres,
              errors.gravitationalParameter,
              errors.planetRadiusMetres,
              errors.form,
            ]}
          />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-muted">
              Valid changes update the ideal transfer solution immediately.
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
          aria-labelledby="hohmann-transfer-explanation-title"
          className="mt-8 border-t border-border pt-7"
        >
          <p className="orbix-label text-accent">Educational context</p>
          <h3
            className="mt-1 text-lg font-semibold"
            id="hohmann-transfer-explanation-title"
          >
            Two impulses, one transfer ellipse
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            A Hohmann transfer uses one ideal burn to enter an elliptical
            transfer orbit and a second burn to circularize at the destination.
            It is the classical minimum-energy two-impulse transfer between two
            circular, coplanar orbits.
          </p>
        </section>
      </div>

      <div className="space-y-5">
        <CalculatorResultSection
          eyebrow="Circular Orbits + Transfer"
          icon={CircleDot}
          id="hohmann-transfer-result"
          title="Hohmann transfer solution"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="hohmann-transfer-initial-title">
                <h4
                  className="orbix-label text-accent"
                  id="hohmann-transfer-initial-title"
                >
                  Initial orbit
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted">Altitude</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={initialOrbitOutputIds}
                      >
                        {distanceFormatter.format(
                          result.initialOrbit.altitudeMetres,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Orbital radius</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={initialOrbitOutputIds}
                      >
                        {distanceFormatter.format(
                          result.initialOrbit.orbitalRadiusMetres,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Circular velocity</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold text-accent"
                        htmlFor={initialOrbitOutputIds}
                      >
                        {velocityFormatter.format(
                          result.initialOrbit.circularVelocityMetresPerSecond,
                        )}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="hohmann-transfer-final-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="hohmann-transfer-final-title"
                >
                  Final orbit
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted">Altitude</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={finalOrbitOutputIds}
                      >
                        {distanceFormatter.format(
                          result.finalOrbit.altitudeMetres,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Orbital radius</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={finalOrbitOutputIds}
                      >
                        {distanceFormatter.format(
                          result.finalOrbit.orbitalRadiusMetres,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Circular velocity</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold text-accent"
                        htmlFor={finalOrbitOutputIds}
                      >
                        {velocityFormatter.format(
                          result.finalOrbit.circularVelocityMetresPerSecond,
                        )}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="hohmann-transfer-orbit-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label flex items-center gap-2 text-accent"
                  id="hohmann-transfer-orbit-title"
                >
                  <MoveRight aria-hidden="true" size={14} />
                  Transfer orbit
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Semi-major axis</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={transferOutputIds}
                      >
                        {distanceFormatter.format(
                          result.transfer.transferSemiMajorAxisMetres,
                        )}{" "}
                        m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">First burn Δv</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={transferOutputIds}
                      >
                        {velocityFormatter.format(
                          result.transfer.firstBurnDeltaVMetresPerSecond,
                        )}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Second burn Δv</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={transferOutputIds}
                      >
                        {velocityFormatter.format(
                          result.transfer.secondBurnDeltaVMetresPerSecond,
                        )}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Total Δv</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={transferOutputIds}
                      >
                        {velocityFormatter.format(
                          result.transfer.totalDeltaVMetresPerSecond,
                        )}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Transfer duration</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={transferOutputIds}
                      >
                        {timeFormatter.format(
                          result.transfer.transferTimeSeconds,
                        )}{" "}
                        s
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Transfer duration</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={transferOutputIds}
                      >
                        {timeFormatter.format(
                          result.transfer.transferTimeHours,
                        )}{" "}
                        h
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
                Enter two valid, different circular-orbit altitudes to resolve
                the ideal transfer.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <CalculatorResultSection
          eyebrow="Mission Interpretation"
          icon={Gauge}
          id="hohmann-transfer-mission-summary"
          title="Mission summary"
        >
          {result && transferDirection ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs text-muted">Transfer classification</p>
                <output
                  className="mt-2 block text-lg font-semibold text-accent"
                  htmlFor="hohmann-transfer-initialAltitudeMetres hohmann-transfer-finalAltitudeMetres"
                >
                  {transferDirection}
                </output>
              </div>
              <div className="border-t border-border pt-5">
                <h4 className="text-sm font-semibold">
                  Delta-v interpretation
                </h4>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Total Δv is the ideal velocity-change budget across both
                  impulses. It does not include finite-burn, launch, drag, or
                  operational correction losses.
                </p>
              </div>
              <div className="border-t border-border pt-5">
                <h4 className="text-sm font-semibold">Transfer character</h4>
                <p className="mt-2 text-xs leading-5 text-muted">
                  The spacecraft coasts along half of an ideal transfer ellipse
                  between the two circular orbits before the second impulse.
                </p>
              </div>
            </div>
          ) : (
            <p className="py-3 text-sm leading-6 text-muted">
              A valid solution will classify the transfer and summarize its
              ideal mission-level meaning.
            </p>
          )}
        </CalculatorResultSection>

        <aside className="orbix-lab-note">
          <p className="orbix-lab-note__title">
            <AlertTriangle aria-hidden="true" size={17} />
            Modeling assumptions
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-xs leading-5 text-muted sm:grid-cols-2">
            <li>Two-body gravity model</li>
            <li>Circular initial and final orbits</li>
            <li>Instantaneous impulsive burns</li>
            <li>Coplanar orbit assumption</li>
            <li>No atmospheric drag</li>
            <li>No gravity assists</li>
            <li>No launch losses</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
