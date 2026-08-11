"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, RotateCcw, Wind } from "lucide-react";

import { analyzeObliqueShockCondition } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  ObliqueShockConditionAnalysis,
  ObliqueShockConditionInputs,
} from "@/features/engineering-lab/types";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";
import {
  validateAtmosphereInputs,
  validateObliqueShockInputs,
} from "@/features/engineering-lab/utils";

interface ObliqueShockConditionFormValues {
  readonly altitudeMeters: string;
  readonly deflectionAngleDegrees: string;
  readonly machNumber: string;
}

type ObliqueShockConditionField = keyof ObliqueShockConditionFormValues;

type ObliqueShockConditionValidationErrors = Readonly<
  Partial<Record<ObliqueShockConditionField, string>>
>;

interface ObliqueShockConditionViewState {
  readonly errors: ObliqueShockConditionValidationErrors;
  readonly result: ObliqueShockConditionAnalysis | null;
}

const initialFormValues: ObliqueShockConditionFormValues = {
  altitudeMeters: "0",
  deflectionAngleDegrees: "10",
  machNumber: "2",
};

const conditionFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const densityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 5,
  minimumFractionDigits: 5,
});

const precisionFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
  minimumFractionDigits: 4,
});

function parseNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function deriveViewState(
  values: ObliqueShockConditionFormValues,
): ObliqueShockConditionViewState {
  const inputs: ObliqueShockConditionInputs = {
    altitudeMeters: parseNumber(values.altitudeMeters),
    deflectionAngleDegrees: parseNumber(values.deflectionAngleDegrees),
    machNumber: parseNumber(values.machNumber),
  };
  const atmosphereErrors = validateAtmosphereInputs({
    altitudeMetres: inputs.altitudeMeters,
  });
  const shockErrors = validateObliqueShockInputs({
    deflectionAngleDegrees: inputs.deflectionAngleDegrees,
    machNumber: inputs.machNumber,
  });
  const errors: ObliqueShockConditionValidationErrors = {
    altitudeMeters: atmosphereErrors.altitudeMetres,
    deflectionAngleDegrees: shockErrors.deflectionAngleDegrees,
    machNumber: shockErrors.machNumber,
  };
  const hasErrors = Object.values(errors).some((error) => error !== undefined);

  if (hasErrors) {
    return { errors, result: null };
  }

  try {
    return {
      errors,
      result: analyzeObliqueShockCondition(inputs),
    };
  } catch (error) {
    if (error instanceof RangeError) {
      return {
        errors: {
          ...errors,
          deflectionAngleDegrees: error.message,
        },
        result: null,
      };
    }

    throw error;
  }
}

export function ObliqueShockConditionAnalyzer() {
  const [values, setValues] =
    useState<ObliqueShockConditionFormValues>(initialFormValues);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);

  function updateValue(field: ObliqueShockConditionField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  const outputIds =
    "oblique-shock-condition-altitudeMeters oblique-shock-condition-machNumber oblique-shock-condition-deflectionAngleDegrees";

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] xl:gap-10">
      <div>
        <form noValidate onSubmit={preventSubmission}>
          <div className="grid gap-5 sm:grid-cols-2">
            <CalculatorNumberField
              error={errors.altitudeMeters}
              field="altitudeMeters"
              hint={
                "Geometric altitude within the 0–" +
                STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES.toLocaleString(
                  "en-US",
                ) +
                " metre atmosphere model."
              }
              idPrefix="oblique-shock-condition"
              label="Altitude"
              onChange={updateValue}
              unit="m"
              value={values.altitudeMeters}
            />
            <CalculatorNumberField
              error={errors.machNumber}
              field="machNumber"
              hint="Supersonic upstream Mach number greater than one."
              idPrefix="oblique-shock-condition"
              label="Upstream Mach number"
              onChange={updateValue}
              unit="Mach"
              value={values.machNumber}
            />
            <CalculatorNumberField
              error={errors.deflectionAngleDegrees}
              field="deflectionAngleDegrees"
              hint="Positive flow-turning angle that must permit an attached weak shock."
              idPrefix="oblique-shock-condition"
              label="Flow deflection angle"
              onChange={updateValue}
              unit="deg"
              value={values.deflectionAngleDegrees}
            />
          </div>

          <ValidationErrorSummary errors={Object.values(errors)} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-muted">
              Valid attached-shock inputs update the flow state immediately.
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
      </div>

      <div className="space-y-5">
        <CalculatorResultSection
          eyebrow="Weak oblique-shock state change"
          icon={Wind}
          id="oblique-shock-condition-result"
          title="Oblique shock conditions"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="oblique-shock-upstream-title">
                <h4
                  className="orbix-label text-accent"
                  id="oblique-shock-upstream-title"
                >
                  Upstream conditions
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Temperature</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={outputIds}
                      >
                        {conditionFormatter.format(
                          result.upstream.temperatureKelvin,
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
                        htmlFor={outputIds}
                      >
                        {conditionFormatter.format(
                          result.upstream.pressurePascals,
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
                        htmlFor={outputIds}
                      >
                        {densityFormatter.format(
                          result.upstream.densityKilogramsPerCubicMetre,
                        )}{" "}
                        kg/m³
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Mach number</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={outputIds}
                      >
                        {precisionFormatter.format(result.upstream.machNumber)}
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="oblique-shock-geometry-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="oblique-shock-geometry-title"
                >
                  Shock geometry
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Shock angle β</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={outputIds}
                      >
                        {precisionFormatter.format(
                          result.shock.shockAngleDegrees,
                        )}
                        °
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">
                      Flow deflection angle θ
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={outputIds}
                      >
                        {precisionFormatter.format(
                          result.shock.deflectionAngleDegrees,
                        )}
                        °
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="oblique-shock-downstream-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="oblique-shock-downstream-title"
                >
                  Downstream conditions
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Downstream Mach</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={outputIds}
                      >
                        {precisionFormatter.format(
                          result.downstream.machNumber,
                        )}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Temperature</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={outputIds}
                      >
                        {conditionFormatter.format(
                          result.downstream.temperatureKelvin,
                        )}{" "}
                        K
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Pressure</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={outputIds}
                      >
                        {conditionFormatter.format(
                          result.downstream.pressurePascals,
                        )}{" "}
                        Pa
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Density</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={outputIds}
                      >
                        {densityFormatter.format(
                          result.downstream.densityKilogramsPerCubicMetre,
                        )}{" "}
                        kg/m³
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="oblique-shock-ratios-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="oblique-shock-ratios-title"
                >
                  Ratios
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted">
                      Pressure ratio (P₂/P₁)
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={outputIds}
                      >
                        {precisionFormatter.format(result.ratios.pressureRatio)}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">
                      Temperature ratio (T₂/T₁)
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={outputIds}
                      >
                        {precisionFormatter.format(
                          result.ratios.temperatureRatio,
                        )}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">
                      Density ratio (ρ₂/ρ₁)
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={outputIds}
                      >
                        {precisionFormatter.format(result.ratios.densityRatio)}
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
                Enter valid supersonic, atmospheric, and attached-shock inputs
                to restore the live flow state.
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
            <li>Perfect gas approximation</li>
            <li>Constant γ = 1.4 unless changed internally</li>
            <li>Inviscid flow</li>
            <li>Attached weak oblique shock solution</li>
            <li>No boundary layer effects</li>
            <li>No heat transfer</li>
            <li>No chemical dissociation</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
