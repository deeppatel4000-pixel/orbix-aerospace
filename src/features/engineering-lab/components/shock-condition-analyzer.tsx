"use client";

import { Button } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";

import { analyzeShockCondition } from "@/features/engineering-lab/analysis";
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
  EQ_SUB_CLEAR,
  LabEquation,
} from "@/features/engineering-lab/components/shared";
import type {
  ShockConditionAnalysis,
  ShockConditionInputs,
} from "@/features/engineering-lab/types";
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

const toolEquation = (
  <LabEquation
    equation={
      <>
        {/* A stacked fraction, so the only outer grouping is the bar:
            B612 Mono draws "(" and "[" almost alike. Numerator and
            denominator are the textbook form scaled by 2. */}
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            M<EqSubSup sub="2" sup="2" /> ={" "}
            <EqFrac
              den={
                <>
                  2γM
                  <EqSubSup sub="1" sup="2" /> − (γ−1)
                </>
              }
              num={
                <>
                  (γ−1)M
                  <EqSubSup sub="1" sup="2" /> + 2
                </>
              }
            />
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            <EqFrac
              den={
                <>
                  p<sub className={EQ_SUB_CLEAR}>1</sub>
                </>
              }
              num={
                <>
                  p<sub className={EQ_SUB_CLEAR}>2</sub>
                </>
              }
            />{" "}
            = 1
          </span>{" "}
          <span className={EQ_TERM}>
            + <EqFrac den="γ+1" num="2γ" />
            <EqDot />
            (M
            <EqSubSup sub="1" sup="2" />
            −1)
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            <EqFrac
              den={
                <>
                  ρ<sub>1</sub>
                </>
              }
              num={
                <>
                  ρ<sub>2</sub>
                </>
              }
            />{" "}
            ={" "}
            <EqFrac
              den={
                <>
                  (γ−1)M
                  <EqSubSup sub="1" sup="2" /> + 2
                </>
              }
              num={
                <>
                  (γ+1)M
                  <EqSubSup sub="1" sup="2" />
                </>
              }
            />
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            <EqFrac
              den={
                <>
                  T<sub>1</sub>
                </>
              }
              num={
                <>
                  T<sub>2</sub>
                </>
              }
            />{" "}
            ={" "}
            <EqFrac
              den={
                <>
                  p<sub className={EQ_SUB_CLEAR}>1</sub>
                </>
              }
              num={
                <>
                  p<sub className={EQ_SUB_CLEAR}>2</sub>
                </>
              }
            />
            <EqDot />
            <EqFrac
              den={
                <>
                  ρ<sub>2</sub>
                </>
              }
              num={
                <>
                  ρ<sub>1</sub>
                </>
              }
            />
          </span>
        </span>
      </>
    }
    label="Normal shock relations"
    spokenAs="M 2 squared equals gamma minus 1 times M 1 squared, plus 2, all over 2 gamma M 1 squared minus the quantity gamma minus 1. The pressure ratio equals 1 plus 2 gamma over gamma plus 1, times M 1 squared minus 1. The density ratio equals gamma plus 1 times M 1 squared over gamma minus 1 times M 1 squared plus 2. The temperature ratio equals the pressure ratio times rho 1 over rho 2."
    variables={[
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
            M<sub>2</sub>
          </>
        ),
        meaning: "Downstream Mach number",
      },
      {
        symbol: "1, 2",
        meaning:
          "Upstream state from the standard troposphere at geopotential altitude, and the state behind the shock",
      },
      { symbol: "γ", meaning: "Ratio of specific heats for dry air, 1.4" },
    ]}
  />
);

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
                idPrefix="shock-condition"
                label={GEOPOTENTIAL_ALTITUDE_LABEL}
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

            <ValidationErrorSummary
              errors={errors}
              idPrefix="shock-condition"
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
                Valid changes update the upstream and downstream states
                immediately.
              </p>
            </div>
          </form>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <CalculatorResultSection
            id="shock-condition-result"
            title="Shock conditions"
          >
            {result ? (
              <>
                <ReadoutGrid columns={2} title="Downstream conditions">
                  <div>
                    <dt className="orbix-label">Mach</dt>
                    <dd className="mt-1">
                      <output className="orbix-readout-lg" htmlFor={outputIds}>
                        <LabFigure>
                          {machFormatter.format(result.downstream.machNumber)}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
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
                </ReadoutGrid>

                <ReadoutGrid columns={3} title="Shock ratios">
                  <div>
                    <dt className="orbix-label">
                      Temperature ratio{" "}
                      <LabSymbol>
                        (T<sub className="lab-figure__sub">2</sub>/T
                        <sub className="lab-figure__sub">1</sub>)
                      </LabSymbol>
                    </dt>
                    <dd className="orbix-data mt-1">
                      <LabFigure>
                        {ratioFormatter.format(result.ratios.temperatureRatio)}
                      </LabFigure>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">
                      Pressure ratio{" "}
                      <LabSymbol>
                        (p<sub className="lab-figure__sub">2</sub>/p
                        <sub className="lab-figure__sub">1</sub>)
                      </LabSymbol>
                    </dt>
                    <dd className="orbix-data mt-1">
                      <LabFigure>
                        {ratioFormatter.format(result.ratios.pressureRatio)}
                      </LabFigure>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">
                      Density ratio{" "}
                      <LabSymbol>
                        (ρ<sub className="lab-figure__sub">2</sub>/ρ
                        <sub className="lab-figure__sub">1</sub>)
                      </LabSymbol>
                    </dt>
                    <dd className="orbix-data mt-1">
                      <LabFigure>
                        {ratioFormatter.format(result.ratios.densityRatio)}
                      </LabFigure>
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
                    <dt className="orbix-label">Mach</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        <LabFigure>
                          {machFormatter.format(result.upstream.machNumber)}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>
              </>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Enter a valid altitude and Mach number at or above one to
                restore the live shock state.
              </NotCalculated>
            )}
          </CalculatorResultSection>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Model assumptions
            </p>
            <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted @min-[36rem]/col:grid-cols-2">
              <li>Perfect gas approximation</li>
              <li>Dry air, γ = 1.4</li>
              <li>One-dimensional normal shock</li>
              <li>No boundary-layer effects</li>
              <li>No heat transfer</li>
              <li>No chemical reactions</li>
            </ul>
          </aside>
        </div>
      </div>
    </LabToolLayout>
  );
}
