"use client";

import { Button } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";

import { analyzeStagnationCondition } from "@/features/engineering-lab/analysis";
import {
  EQ_LINE,
  EQ_SUP,
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
  EQ_SUB_CLEAR,
  EqFrac,
  LabEquation,
} from "@/features/engineering-lab/components/shared";
import type {
  StagnationConditionAnalysis,
  StagnationConditionInputs,
} from "@/features/engineering-lab/types";
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

const toolEquation = (
  <LabEquation
    equation={
      <>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            <EqFrac
              den="T"
              num={
                <>
                  T<sub>t</sub>
                </>
              }
            />{" "}
            = 1
          </span>{" "}
          <span className={EQ_TERM}>
            + <EqFrac den="2" num="γ−1" />
          </span>
          <wbr />
          <span className={EQ_TERM}>
            <EqDot />M<sup className={EQ_SUP}>2</sup>
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            <EqFrac
              den="p"
              num={
                <>
                  p<sub className={EQ_SUB_CLEAR}>t</sub>
                </>
              }
            />
          </span>{" "}
          <span className={EQ_TERM}>
            ={" "}
            <EqFrac
              den="T"
              num={
                <>
                  T<sub>t</sub>
                </>
              }
              power={"γ/(γ−1)"}
            />
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            <EqFrac
              den="ρ"
              num={
                <>
                  ρ<sub>t</sub>
                </>
              }
            />
          </span>{" "}
          <span className={EQ_TERM}>
            ={" "}
            <EqFrac
              den="T"
              num={
                <>
                  T<sub>t</sub>
                </>
              }
              power={"1/(γ−1)"}
            />
          </span>
        </span>
      </>
    }
    label="Isentropic stagnation relations"
    spokenAs="T t over T equals 1 plus gamma minus 1 over 2 times M squared. p t over p equals that ratio raised to gamma over gamma minus 1. rho t over rho equals it raised to 1 over gamma minus 1."
    variables={[
      {
        symbol: "T, p, ρ",
        meaning:
          "Static conditions from the standard troposphere at geopotential altitude",
      },
      {
        symbol: (
          <>
            T<sub>t</sub>, p<sub className={EQ_SUB_CLEAR}>t</sub>, ρ<sub>t</sub>
          </>
        ),
        meaning: "Stagnation (total) conditions",
      },
      { symbol: "M", meaning: "Flight Mach number" },
      { symbol: "γ", meaning: "Ratio of specific heats for dry air, 1.4" },
    ]}
  />
);

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
                error={errors.altitudeMeters}
                field="altitudeMeters"
                hint={GEOPOTENTIAL_ALTITUDE_HINT}
                idPrefix="stagnation-condition"
                label={GEOPOTENTIAL_ALTITUDE_LABEL}
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

            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Button
                className="shrink-0 whitespace-nowrap"
                variant="secondary"
                onClick={resetAnalyzer}
              >
                Reset inputs
              </Button>
              <p className="min-w-0 flex-[1_1_14rem] text-[0.8125rem] leading-5 text-muted">
                Valid changes update the thermodynamic state immediately.
              </p>
            </div>
          </form>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <CalculatorResultSection
            id="stagnation-condition-result"
            title="Thermodynamic conditions"
          >
            {result ? (
              <>
                <ReadoutGrid columns={3} title="Static atmospheric conditions">
                  <div>
                    <dt className="orbix-label">Temperature</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        <LabFigure unit="K">
                          {conditionFormatter.format(
                            result.staticConditions.temperatureKelvin,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Pressure</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        <LabFigure unit="Pa">
                          {conditionFormatter.format(
                            result.staticConditions.pressurePascals,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Density</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        <LabFigure unit="kg/m³">
                          {densityFormatter.format(
                            result.staticConditions
                              .densityKilogramsPerCubicMetre,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={3} title="Stagnation conditions">
                  <div>
                    <dt className="orbix-label">Stagnation temperature</dt>
                    <dd className="mt-1">
                      <output className="orbix-readout-lg" htmlFor={outputIds}>
                        <LabFigure unit="K">
                          {conditionFormatter.format(
                            result.stagnationConditions.temperatureKelvin,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Stagnation pressure</dt>
                    <dd className="mt-1">
                      <output className="orbix-readout-lg" htmlFor={outputIds}>
                        <LabFigure unit="Pa">
                          {conditionFormatter.format(
                            result.stagnationConditions.pressurePascals,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Stagnation density</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        <LabFigure unit="kg/m³">
                          {densityFormatter.format(
                            result.stagnationConditions
                              .densityKilogramsPerCubicMetre,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={3} title="Isentropic ratios">
                  <div>
                    <dt className="orbix-label">Temperature ratio</dt>
                    <dd className="orbix-data mt-1">
                      <LabFigure>
                        {ratioFormatter.format(result.ratios.temperatureRatio)}
                      </LabFigure>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Pressure ratio</dt>
                    <dd className="orbix-data mt-1">
                      <LabFigure>
                        {ratioFormatter.format(result.ratios.pressureRatio)}
                      </LabFigure>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Density ratio</dt>
                    <dd className="orbix-data mt-1">
                      <LabFigure>
                        {ratioFormatter.format(result.ratios.densityRatio)}
                      </LabFigure>
                    </dd>
                  </div>
                </ReadoutGrid>
              </>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Enter a valid altitude and Mach number to restore the live
                thermodynamic state.
              </NotCalculated>
            )}
          </CalculatorResultSection>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Model assumptions
            </p>
            <p className="mt-3 text-sm leading-6 text-muted">
              Static-to-stagnation conversion assumes:
            </p>
            <ul className="mt-3 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted @min-[36rem]/col:grid-cols-2">
              <li>Steady flow</li>
              <li>Ideal gas behavior</li>
              <li>No viscous losses</li>
              <li>No shocks</li>
              <li>No heat transfer</li>
            </ul>
          </aside>
        </div>
      </div>
    </LabToolLayout>
  );
}
