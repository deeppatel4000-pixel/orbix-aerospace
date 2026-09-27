"use client";

import { Button } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Gauge, RotateCcw } from "lucide-react";

import { analyzeStagnationCondition } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  focusFirstInvalidField,
  focusFirstInvalidFieldOnEnter,
  CalculatorResultSection,
  NotCalculated,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  StagnationConditionAnalysis,
  StagnationConditionInputs,
} from "@/features/engineering-lab/types";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";
import {
  validateAtmosphereInputs,
  validateIsentropicFlowInputs,
} from "@/features/engineering-lab/utils";

interface StagnationConditionFormValues {
  readonly altitudeMeters: string;
  readonly machNumber: string;
}

type StagnationConditionField = keyof StagnationConditionFormValues;

type StagnationConditionValidationErrors = Readonly<
  Partial<Record<StagnationConditionField, string>>
>;

interface StagnationConditionViewState {
  readonly errors: StagnationConditionValidationErrors;
  readonly result: StagnationConditionAnalysis | null;
}

const initialFormValues: StagnationConditionFormValues = {
  altitudeMeters: "10000",
  machNumber: "2",
};

const conditionFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const densityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 5,
  minimumFractionDigits: 5,
});

const ratioFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
  minimumFractionDigits: 4,
});

function parseNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function deriveViewState(
  values: StagnationConditionFormValues,
): StagnationConditionViewState {
  const inputs: StagnationConditionInputs = {
    altitudeMeters: parseNumber(values.altitudeMeters),
    machNumber: parseNumber(values.machNumber),
  };
  const atmosphereErrors = validateAtmosphereInputs({
    altitudeMetres: inputs.altitudeMeters,
  });
  const isentropicErrors = validateIsentropicFlowInputs({
    machNumber: inputs.machNumber,
  });
  const errors: StagnationConditionValidationErrors = {
    altitudeMeters: atmosphereErrors.altitudeMetres,
    machNumber: isentropicErrors.machNumber,
  };
  const hasErrors = Object.values(errors).some((error) => error !== undefined);

  return {
    errors,
    result: hasErrors ? null : analyzeStagnationCondition(inputs),
  };
}

export function StagnationConditionAnalyzer() {
  const [values, setValues] =
    useState<StagnationConditionFormValues>(initialFormValues);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);

  function updateValue(field: StagnationConditionField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    focusFirstInvalidField(event.currentTarget);
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  const outputIds =
    "stagnation-condition-altitudeMeters stagnation-condition-machNumber";

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
              idPrefix="stagnation-condition"
              label="Altitude"
              onChange={updateValue}
              unit="m"
              value={values.altitudeMeters}
            />
            <CalculatorNumberField
              error={errors.machNumber}
              field="machNumber"
              hint="Dimensionless flight speed relative to the local speed of sound."
              idPrefix="stagnation-condition"
              label="Mach number"
              onChange={updateValue}
              unit="Mach"
              value={values.machNumber}
            />
          </div>

          <ValidationErrorSummary
            errors={errors}
            idPrefix="stagnation-condition"
          />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-sm leading-6 text-muted">
              Valid changes update the thermodynamic state immediately.
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
          eyebrow="Static-to-stagnation state"
          icon={Gauge}
          id="stagnation-condition-result"
          title="Thermodynamic conditions"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="static-conditions-title">
                <h4
                  className="text-sm font-semibold text-foreground"
                  id="static-conditions-title"
                >
                  Static atmospheric conditions
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="orbix-label">Temperature</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        {conditionFormatter.format(
                          result.staticConditions.temperatureKelvin,
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
                          result.staticConditions.pressurePascals,
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
                          result.staticConditions.densityKilogramsPerCubicMetre,
                        )}{" "}
                        kg/m³
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="stagnation-conditions-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="text-sm font-semibold text-foreground"
                  id="stagnation-conditions-title"
                >
                  Stagnation conditions
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="orbix-label">Stagnation temperature</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={outputIds}>
                        {conditionFormatter.format(
                          result.stagnationConditions.temperatureKelvin,
                        )}{" "}
                        K
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Stagnation pressure</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={outputIds}>
                        {conditionFormatter.format(
                          result.stagnationConditions.pressurePascals,
                        )}{" "}
                        Pa
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Stagnation density</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={outputIds}>
                        {densityFormatter.format(
                          result.stagnationConditions
                            .densityKilogramsPerCubicMetre,
                        )}{" "}
                        kg/m³
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="isentropic-ratios-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="text-sm font-semibold text-foreground"
                  id="isentropic-ratios-title"
                >
                  Isentropic ratios
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="orbix-label">Temperature ratio</dt>
                    <dd className="orbix-data mt-1">
                      {ratioFormatter.format(result.ratios.temperatureRatio)}
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Pressure ratio</dt>
                    <dd className="orbix-data mt-1">
                      {ratioFormatter.format(result.ratios.pressureRatio)}
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Density ratio</dt>
                    <dd className="orbix-data mt-1">
                      {ratioFormatter.format(result.ratios.densityRatio)}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          ) : (
            <NotCalculated invalid={Object.values(errors).some(Boolean)}>
              Enter a valid altitude and Mach number to restore the live
              thermodynamic state.
            </NotCalculated>
          )}
        </CalculatorResultSection>

        <aside className="orbix-lab-note">
          <p className="orbix-lab-note__title">
            <AlertTriangle aria-hidden="true" size={17} />
            Model assumptions
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Static-to-stagnation conversion assumes:
          </p>
          <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted sm:grid-cols-2">
            <li>Steady flow</li>
            <li>Ideal gas behavior</li>
            <li>No viscous losses</li>
            <li>No shocks</li>
            <li>No heat transfer</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
