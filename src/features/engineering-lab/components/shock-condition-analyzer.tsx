"use client";

import { Button } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, MoveRight, RotateCcw } from "lucide-react";

import { analyzeShockCondition } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  focusFirstInvalidField,
  focusFirstInvalidFieldOnEnter,
  CalculatorResultSection,
  NotCalculated,
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
    focusFirstInvalidField(event.currentTarget);
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  const outputIds = "shock-condition-altitudeMeters shock-condition-machNumber";

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] xl:gap-10">
      <div>
        <form
          noValidate
          onKeyDown={focusFirstInvalidFieldOnEnter}
          onSubmit={preventSubmission}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <CalculatorNumberField
              error={errors.altitudeMeters}
              field="altitudeMeters"
              hint={
                "Geometric altitude within the 0 to " +
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

          <ValidationErrorSummary errors={errors} idPrefix="shock-condition" />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-sm leading-6 text-muted">
              Valid changes update the upstream and downstream states
              immediately.
            </p>
            <Button
              className="shrink-0 whitespace-nowrap sm:ml-auto"
              variant="secondary"
              onClick={resetAnalyzer}
            >
              <RotateCcw aria-hidden="true" size={16} />
              Reset inputs
            </Button>
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
                  className="text-sm font-semibold text-foreground"
                  id="shock-upstream-title"
                >
                  Upstream conditions
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="orbix-label">Temperature</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        {conditionFormatter.format(
                          result.upstream.temperatureKelvin,
                        )}{" "}
                        K
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Pressure</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        {conditionFormatter.format(
                          result.upstream.pressurePascals,
                        )}{" "}
                        Pa
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Density</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        {densityFormatter.format(
                          result.upstream.densityKilogramsPerCubicMetre,
                        )}{" "}
                        kg/m³
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Mach</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
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
                  className="text-sm font-semibold text-foreground"
                  id="shock-downstream-title"
                >
                  Downstream conditions
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="orbix-label">Temperature</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={outputIds}>
                        {conditionFormatter.format(
                          result.downstream.temperatureKelvin,
                        )}{" "}
                        K
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Pressure</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={outputIds}>
                        {conditionFormatter.format(
                          result.downstream.pressurePascals,
                        )}{" "}
                        Pa
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Density</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={outputIds}>
                        {densityFormatter.format(
                          result.downstream.densityKilogramsPerCubicMetre,
                        )}{" "}
                        kg/m³
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Mach</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={outputIds}>
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
                  className="text-sm font-semibold text-foreground"
                  id="shock-ratios-title"
                >
                  Shock ratios
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="orbix-label">Temperature ratio (T₂/T₁)</dt>
                    <dd className="orbix-data mt-1">
                      {ratioFormatter.format(result.ratios.temperatureRatio)}
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Pressure ratio (P₂/P₁)</dt>
                    <dd className="orbix-data mt-1">
                      {ratioFormatter.format(result.ratios.pressureRatio)}
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Density ratio (ρ₂/ρ₁)</dt>
                    <dd className="orbix-data mt-1">
                      {ratioFormatter.format(result.ratios.densityRatio)}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          ) : (
            <NotCalculated invalid={Object.values(errors).some(Boolean)}>
              Enter a valid altitude and Mach number at or above one to restore
              the live shock state.
            </NotCalculated>
          )}
        </CalculatorResultSection>

        <aside className="orbix-lab-note">
          <p className="orbix-lab-note__title">
            <AlertTriangle aria-hidden="true" size={17} />
            Model assumptions
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted sm:grid-cols-2">
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
