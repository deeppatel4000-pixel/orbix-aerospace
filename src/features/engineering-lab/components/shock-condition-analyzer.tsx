"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, MoveRight, RotateCcw } from "lucide-react";

import { analyzeShockCondition } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  ShockConditionAnalysis,
  ShockConditionInputs,
} from "@/features/engineering-lab/types";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";
import {
  validateAtmosphereInputs,
  validateNormalShockInputs,
} from "@/features/engineering-lab/utils";

interface ShockConditionFormValues {
  readonly altitudeMeters: string;
  readonly machNumber: string;
}

type ShockConditionField = keyof ShockConditionFormValues;

type ShockConditionValidationErrors = Readonly<
  Partial<Record<ShockConditionField, string>>
>;

interface ShockConditionViewState {
  readonly errors: ShockConditionValidationErrors;
  readonly result: ShockConditionAnalysis | null;
}

const initialFormValues: ShockConditionFormValues = {
  altitudeMeters: "0",
  machNumber: "2",
};

const conditionFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const densityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 5,
  minimumFractionDigits: 5,
});

const machFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
  minimumFractionDigits: 4,
});

const ratioFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
  minimumFractionDigits: 4,
});

function parseNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function deriveViewState(
  values: ShockConditionFormValues,
): ShockConditionViewState {
  const inputs: ShockConditionInputs = {
    altitudeMeters: parseNumber(values.altitudeMeters),
    machNumber: parseNumber(values.machNumber),
  };
  const atmosphereErrors = validateAtmosphereInputs({
    altitudeMetres: inputs.altitudeMeters,
  });
  const shockErrors = validateNormalShockInputs({
    machNumber: inputs.machNumber,
  });
  const errors: ShockConditionValidationErrors = {
    altitudeMeters: atmosphereErrors.altitudeMetres,
    machNumber: shockErrors.machNumber,
  };
  const hasErrors = Object.values(errors).some((error) => error !== undefined);

  return {
    errors,
    result: hasErrors ? null : analyzeShockCondition(inputs),
  };
}

export function ShockConditionAnalyzer() {
  const [values, setValues] =
    useState<ShockConditionFormValues>(initialFormValues);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);

  function updateValue(field: ShockConditionField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  const outputIds = "shock-condition-altitudeMeters shock-condition-machNumber";

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
              idPrefix="shock-condition"
              label="Altitude"
              onChange={updateValue}
              unit="m"
              value={values.altitudeMeters}
            />
            <CalculatorNumberField
              error={errors.machNumber}
              field="machNumber"
              hint="Upstream Mach number; a normal shock requires Mach 1 or greater."
              idPrefix="shock-condition"
              label="Mach number"
              onChange={updateValue}
              unit="Mach"
              value={values.machNumber}
            />
          </div>

          <ValidationErrorSummary errors={Object.values(errors)} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-muted">
              Valid changes update the upstream and downstream states
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
      </div>

      <div className="space-y-5">
        <CalculatorResultSection
          eyebrow="Normal-shock state change"
          icon={MoveRight}
          id="shock-condition-result"
          title="Shock conditions"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="shock-upstream-title">
                <h4
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="shock-upstream-title"
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
                    <dt className="text-xs text-muted">Mach</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={outputIds}
                      >
                        {machFormatter.format(result.upstream.machNumber)}
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="shock-downstream-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="shock-downstream-title"
                >
                  Downstream conditions
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
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
                  <div>
                    <dt className="text-xs text-muted">Mach</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={outputIds}
                      >
                        {machFormatter.format(result.downstream.machNumber)}
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="shock-ratios-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="shock-ratios-title"
                >
                  Shock ratios
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted">
                      Temperature ratio (T₂/T₁)
                    </dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">
                      {ratioFormatter.format(result.ratios.temperatureRatio)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">
                      Pressure ratio (P₂/P₁)
                    </dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">
                      {ratioFormatter.format(result.ratios.pressureRatio)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">
                      Density ratio (ρ₂/ρ₁)
                    </dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">
                      {ratioFormatter.format(result.ratios.densityRatio)}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">—</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Enter a valid altitude and Mach number at or above one to
                restore the live shock state.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <aside className="rounded-2xl border border-signal/25 bg-signal/6 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-signal">
            <AlertTriangle aria-hidden="true" size={17} />
            Model assumptions
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-xs leading-5 text-muted sm:grid-cols-2">
            <li>Perfect gas approximation</li>
            <li>Dry air gamma = 1.4</li>
            <li>One-dimensional normal shock</li>
            <li>No boundary-layer effects</li>
            <li>No heat transfer</li>
            <li>No chemical reactions</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
