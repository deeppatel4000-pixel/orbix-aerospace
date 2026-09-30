"use client";

import { Button, EquationBlock } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";

import { analyzeObliqueShockCondition } from "@/features/engineering-lab/analysis";
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
  LabSymbol,
  EqDot,
  EqSubSup,
  EqFrac,
  EQ_SUP,
  EQ_CONT,
  EQ_JOIN,
} from "@/features/engineering-lab/components/shared";
import type {
  ObliqueShockConditionAnalysis,
  ObliqueShockConditionInputs,
} from "@/features/engineering-lab/types";
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

const toolEquation = (
  <EquationBlock
    equation={
      <>
        <span className={EQ_JOIN}>
          <span className={EQ_TERM}>tan θ</span>
        </span>{" "}
        <span className={EQ_CONT}>
          <span className={EQ_TERM}>
            ={" "}
            <EqFrac
              den={
                <>
                  M
                  <EqSubSup sub="1" sup="2" />
                  (γ+cos 2β) + 2
                </>
              }
              num={
                <>
                  <span className={EQ_TERM}>
                    2 cot β<EqDot />
                  </span>
                  <wbr />
                  <span className={EQ_TERM}>
                    (M
                    <EqSubSup sub="1" sup="2" /> sin
                    <sup className={EQ_SUP}>2</sup>β−1)
                  </span>
                </>
              }
              wrap
            />
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            M<sub>n1</sub> = M<sub>1</sub> sin β
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            M<sub>2</sub> ={" "}
            <EqFrac
              den="sin(β−θ)"
              num={
                <>
                  M<sub>n2</sub>
                </>
              }
            />
          </span>
        </span>
      </>
    }
    label="Oblique shock, weak solution"
    spokenAs="Tan theta equals 2 cot beta times M 1 squared sine squared beta minus 1, over M 1 squared times gamma plus cos 2 beta, plus 2. The normal Mach number M n 1 equals M 1 sine beta. M 2 equals M n 2 over the sine of beta minus theta."
    variables={[
      { symbol: "θ", meaning: "Flow deflection angle", unit: "deg" },
      {
        symbol: "β",
        meaning: "Shock wave angle, solved numerically for the weak shock",
        unit: "deg",
      },
      {
        symbol: (
          <>
            M<sub>1</sub>
          </>
        ),
        meaning: "Upstream Mach number",
      },
      {
        symbol: (
          <>
            M<sub>n1</sub>, M<sub>n2</sub>
          </>
        ),
        meaning: (
          <>
            Normal Mach components; the normal shock relations applied to M
            <sub>n1</sub> give the pressure, density and temperature ratios
          </>
        ),
      },
      { symbol: "γ", meaning: "Ratio of specific heats for dry air, 1.4" },
    ]}
  />
);

export function ObliqueShockConditionAnalyzer() {
  const [values, setValues] =
    useState<ObliqueShockConditionFormValues>(initialFormValues);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);

  function updateValue(field: ObliqueShockConditionField, value: string) {
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
    "oblique-shock-condition-altitudeMeters oblique-shock-condition-machNumber oblique-shock-condition-deflectionAngleDegrees";

  return (
    <LabToolLayout equation={toolEquation}>
      <div className={LAB_TOOL_SPLIT}>
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
                idPrefix="oblique-shock-condition"
                label={GEOPOTENTIAL_ALTITUDE_LABEL}
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

            <ValidationErrorSummary
              errors={errors}
              idPrefix="oblique-shock-condition"
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
                Valid attached-shock inputs update the flow state immediately.
              </p>
            </div>
          </form>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <CalculatorResultSection
            id="oblique-shock-condition-result"
            title="Oblique shock conditions"
          >
            {result ? (
              <>
                <ReadoutGrid columns={2}>
                  <div>
                    <dt className="orbix-label">Downstream Mach</dt>
                    <dd className="mt-1">
                      <output className="orbix-readout-lg" htmlFor={outputIds}>
                        <LabFigure>
                          {precisionFormatter.format(
                            result.downstream.machNumber,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">
                      Shock angle <LabSymbol>β</LabSymbol>
                    </dt>
                    <dd className="mt-1">
                      <output className="orbix-readout-lg" htmlFor={outputIds}>
                        <LabFigure unit="°">
                          {precisionFormatter.format(
                            result.shock.shockAngleDegrees,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={2} title="Downstream conditions">
                  <div>
                    <dt className="orbix-label">Temperature</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        <LabFigure unit="K">
                          {conditionFormatter.format(
                            result.downstream.temperatureKelvin,
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
                            result.downstream.pressurePascals,
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
                            result.downstream.densityKilogramsPerCubicMetre,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">
                      Flow deflection angle <LabSymbol>θ</LabSymbol>
                    </dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        <LabFigure unit="°">
                          {precisionFormatter.format(
                            result.shock.deflectionAngleDegrees,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={3} title="Ratios">
                  <div>
                    <dt className="orbix-label">
                      Pressure ratio <LabSymbol>(p₂/p₁)</LabSymbol>
                    </dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        <LabFigure>
                          {precisionFormatter.format(
                            result.ratios.pressureRatio,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">
                      Temperature ratio <LabSymbol>(T₂/T₁)</LabSymbol>
                    </dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        <LabFigure>
                          {precisionFormatter.format(
                            result.ratios.temperatureRatio,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">
                      Density ratio <LabSymbol>(ρ₂/ρ₁)</LabSymbol>
                    </dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        <LabFigure>
                          {precisionFormatter.format(
                            result.ratios.densityRatio,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={2} title="Upstream conditions">
                  <div>
                    <dt className="orbix-label">Temperature</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        <LabFigure unit="K">
                          {conditionFormatter.format(
                            result.upstream.temperatureKelvin,
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
                            result.upstream.pressurePascals,
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
                            result.upstream.densityKilogramsPerCubicMetre,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Mach number</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        <LabFigure>
                          {precisionFormatter.format(
                            result.upstream.machNumber,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>
              </>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Enter valid supersonic, atmospheric, and attached-shock inputs
                to restore the live flow state.
              </NotCalculated>
            )}
          </CalculatorResultSection>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Engineering assumptions
            </p>
            <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted @min-[36rem]/col:grid-cols-2">
              <li>Perfect gas approximation</li>
              <li>Constant γ = 1.4</li>
              <li>Inviscid flow</li>
              <li>Attached weak oblique shock solution</li>
              <li>No boundary layer effects</li>
              <li>No heat transfer</li>
              <li>No chemical dissociation</li>
            </ul>
          </aside>
        </div>
      </div>
    </LabToolLayout>
  );
}
