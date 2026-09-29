"use client";

import { Button, EquationBlock } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";

import { analyzeShockPressureLoss } from "@/features/engineering-lab/analysis";
import {
  EQ_CONT,
  EQ_LINE,
  EQ_SUP,
  EQ_TERM,
  CalculatorNumberField,
  focusFirstInvalidField,
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
} from "@/features/engineering-lab/components/shared";
import type {
  ShockPressureLossAnalysis,
  ShockPressureLossInputs,
} from "@/features/engineering-lab/types";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";

type ShockType = ShockPressureLossInputs["shockType"];

interface ShockPressureLossFormValues {
  readonly altitudeMeters: string;
  readonly deflectionAngleDegrees: string;
  readonly machNumber: string;
  readonly shockType: ShockType;
}

type ShockPressureLossField = Exclude<
  keyof ShockPressureLossFormValues,
  "shockType"
>;

type ShockPressureLossValidationErrors = Readonly<
  Partial<Record<ShockPressureLossField, string>>
>;

interface ShockPressureLossViewState {
  readonly errors: ShockPressureLossValidationErrors;
  readonly result: ShockPressureLossAnalysis | null;
}

const initialFormValues: ShockPressureLossFormValues = {
  altitudeMeters: "",
  deflectionAngleDegrees: "10",
  machNumber: "2",
  shockType: "normal",
};

const precisionFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
  minimumFractionDigits: 4,
});

const percentageFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function parseRequiredNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function parseOptionalNumber(value: string): number | undefined {
  return value.trim() === "" ? undefined : Number(value);
}

function identifyErrorField(
  message: string,
  shockType: ShockType,
): ShockPressureLossField {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("altitude")) return "altitudeMeters";

  if (
    shockType === "oblique" &&
    (normalizedMessage.includes("deflection") ||
      normalizedMessage.includes("attached"))
  ) {
    return "deflectionAngleDegrees";
  }

  return "machNumber";
}

function deriveViewState(
  values: ShockPressureLossFormValues,
): ShockPressureLossViewState {
  const altitudeMeters = parseOptionalNumber(values.altitudeMeters);
  const optionalAltitude =
    altitudeMeters === undefined ? {} : { altitudeMeters };
  const machNumber = parseRequiredNumber(values.machNumber);
  const inputs: ShockPressureLossInputs =
    values.shockType === "normal"
      ? {
          ...optionalAltitude,
          machNumber,
          shockType: "normal",
        }
      : {
          ...optionalAltitude,
          deflectionAngleDegrees: parseRequiredNumber(
            values.deflectionAngleDegrees,
          ),
          machNumber,
          shockType: "oblique",
        };

  try {
    return {
      errors: {},
      result: analyzeShockPressureLoss(inputs),
    };
  } catch (error) {
    if (error instanceof RangeError) {
      return {
        errors: {
          [identifyErrorField(error.message, values.shockType)]: error.message,
        },
        result: null,
      };
    }

    throw error;
  }
}

const shockTypeOptions: readonly {
  description: string;
  label: string;
  value: ShockType;
}[] = [
  {
    description: "Flow meets a shock perpendicular to its direction.",
    label: "Normal Shock",
    value: "normal",
  },
  {
    description: "Flow turns through an attached weak shock.",
    label: "Oblique Shock",
    value: "oblique",
  },
];

const toolEquation = (
  <EquationBlock
    equation={
      <>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            p<sub>t2</sub>/p<sub>t1</sub>
          </span>
        </span>
        <span className={EQ_CONT}>
          <span className={EQ_TERM}>
            = [(γ+1)M
            <EqSubSup sub="n" sup="2" />
          </span>
          <wbr />
          <span className={EQ_TERM}>
            /((γ−1)M
            <EqSubSup sub="n" sup="2" />
          </span>
          <wbr />
          <span className={EQ_TERM}>
            +2)]<sup className={EQ_SUP}>γ/(γ−1)</sup>
          </span>
        </span>
        <span className={EQ_CONT}>
          <span className={EQ_TERM}>
            <EqDot />
            [(γ+1)
          </span>
          <wbr />
          <span className={EQ_TERM}>
            /(2γM
            <EqSubSup sub="n" sup="2" />
          </span>
          <wbr />
          <span className={EQ_TERM}>
            −(γ−1))]<sup className={EQ_SUP}>1/(γ−1)</sup>
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>Loss</span>{" "}
          <span className={EQ_TERM}>
            = (1−p<sub>t2</sub>/p<sub>t1</sub>)
          </span>
          <wbr />
          <span className={EQ_TERM}>×100%</span>
        </span>
      </>
    }
    label="Total pressure recovery across a shock"
    spokenAs="The total pressure ratio across a shock equals gamma plus 1 times M n squared over gamma minus 1 times M n squared plus 2, raised to gamma over gamma minus 1, times gamma plus 1 over 2 gamma M n squared minus gamma minus 1, raised to 1 over gamma minus 1. The loss equals 1 minus that ratio, times 100 percent."
    variables={[
      {
        symbol: (
          <>
            M<sub>n</sub>
          </>
        ),
        meaning: (
          <>
            Normal Mach number: M<sub>1</sub> for a normal shock, M<sub>1</sub>{" "}
            sin β for an oblique shock
          </>
        ),
      },
      {
        symbol: (
          <>
            p<sub>t1</sub>, p<sub>t2</sub>
          </>
        ),
        meaning: "Total pressure before and after the shock",
        unit: "Pa",
      },
      { symbol: "γ", meaning: "Ratio of specific heats for dry air, 1.4" },
    ]}
  />
);

export function ShockPressureLossAnalyzer() {
  const [values, setValues] =
    useState<ShockPressureLossFormValues>(initialFormValues);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);

  function updateValue(field: ShockPressureLossField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function updateShockType(shockType: ShockType) {
    setValues((current) => ({ ...current, shockType }));
  }

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    focusFirstInvalidField(event.currentTarget);
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  const outputIds =
    values.shockType === "normal"
      ? "shock-pressure-loss-altitudeMeters shock-pressure-loss-machNumber"
      : "shock-pressure-loss-altitudeMeters shock-pressure-loss-machNumber shock-pressure-loss-deflectionAngleDegrees";

  return (
    <LabToolLayout equation={toolEquation}>
      <div className={LAB_TOOL_SPLIT}>
        <div className="@container/col min-w-0">
          <form
            noValidate
            onKeyDown={focusFirstInvalidFieldOnEnter}
            onSubmit={preventSubmission}
          >
            <fieldset aria-describedby="shock-pressure-loss-mode-hint">
              <legend className="text-sm font-semibold">Shock type</legend>
              <p
                className="orbix-field__help mt-2"
                id="shock-pressure-loss-mode-hint"
              >
                Select the shock geometry used to evaluate stagnation-pressure
                recovery.
              </p>
              <div className="mt-3 grid gap-3 @min-[36rem]/col:grid-cols-2">
                {shockTypeOptions.map((option) => {
                  const isSelected = values.shockType === option.value;
                  const optionId = "shock-pressure-loss-mode-" + option.value;

                  return (
                    <label
                      className={
                        "flex min-h-20 cursor-pointer items-start gap-3 rounded border p-4 transition-colors " +
                        (isSelected
                          ? "border-accent bg-surface-raised"
                          : "border-border-control bg-surface-input hover:border-muted")
                      }
                      htmlFor={optionId}
                      key={option.value}
                    >
                      <input
                        aria-describedby="shock-pressure-loss-mode-hint"
                        checked={isSelected}
                        className="mt-1 h-4 w-4 shrink-0 accent-accent"
                        id={optionId}
                        name="shock-pressure-loss-mode"
                        onChange={() => updateShockType(option.value)}
                        type="radio"
                        value={option.value}
                      />
                      <span>
                        <span className="block text-sm font-semibold">
                          {option.label}
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-muted">
                          {option.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-6 grid gap-5 @min-[36rem]/col:grid-cols-2">
              <CalculatorNumberField
                error={errors.machNumber}
                field="machNumber"
                hint={
                  values.shockType === "normal"
                    ? "Upstream Mach number; a normal shock requires Mach 1 or greater."
                    : "Supersonic upstream Mach number greater than one."
                }
                idPrefix="shock-pressure-loss"
                label="Upstream Mach number"
                onChange={updateValue}
                unit="Mach"
                value={values.machNumber}
              />
              <CalculatorNumberField
                error={errors.altitudeMeters}
                field="altitudeMeters"
                hint={
                  "Optional reference altitude from 0 to " +
                  STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES.toLocaleString(
                    "en-US",
                  ) +
                  " metres. Leave blank to omit."
                }
                idPrefix="shock-pressure-loss"
                label="Altitude (optional)"
                optional
                onChange={updateValue}
                unit="m"
                value={values.altitudeMeters}
              />
              {values.shockType === "oblique" ? (
                <CalculatorNumberField
                  error={errors.deflectionAngleDegrees}
                  field="deflectionAngleDegrees"
                  hint="Positive flow-turning angle that must permit an attached weak shock."
                  idPrefix="shock-pressure-loss"
                  label="Flow deflection angle"
                  onChange={updateValue}
                  unit="deg"
                  value={values.deflectionAngleDegrees}
                />
              ) : null}
            </div>

            <ValidationErrorSummary
              errors={errors}
              idPrefix="shock-pressure-loss"
            />

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <p className="min-w-0 flex-[1_1_16rem] text-sm leading-6 text-muted">
                Valid inputs update total-pressure recovery immediately.
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
            id="shock-pressure-loss-result"
            title="Shock pressure recovery"
          >
            {result ? (
              <>
                <ReadoutGrid columns={2} title="Shock summary">
                  <div>
                    <dt className="orbix-label">Shock type</dt>
                    <dd className="mt-1">
                      <output className="lab-value-text" htmlFor={outputIds}>
                        {result.shockType === "normal"
                          ? "Normal shock"
                          : "Oblique shock"}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Upstream Mach</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        <LabFigure>
                          {precisionFormatter.format(result.upstreamMach)}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                {result.shockType === "normal" ? (
                  <ReadoutGrid columns={2} title="Normal shock results">
                    <div>
                      <dt className="orbix-label">Downstream Mach</dt>
                      <dd className="mt-1">
                        <output
                          className="orbix-readout-lg"
                          htmlFor={outputIds}
                        >
                          <LabFigure>
                            {precisionFormatter.format(result.downstreamMach)}
                          </LabFigure>
                        </output>
                      </dd>
                    </div>
                    <div>
                      <dt className="orbix-label">
                        Total pressure recovery ratio
                      </dt>
                      <dd className="mt-1">
                        <output
                          className="orbix-readout-lg"
                          htmlFor={outputIds}
                        >
                          <LabFigure>
                            {precisionFormatter.format(
                              result.pressureRecoveryRatio,
                            )}
                          </LabFigure>
                        </output>
                      </dd>
                    </div>
                    <div>
                      <dt className="orbix-label">Total pressure loss</dt>
                      <dd className="mt-1">
                        <output className="orbix-data" htmlFor={outputIds}>
                          <LabFigure unit="%">
                            {percentageFormatter.format(
                              result.pressureLossPercentage,
                            )}
                          </LabFigure>
                        </output>
                      </dd>
                    </div>
                  </ReadoutGrid>
                ) : (
                  <>
                    <ReadoutGrid columns={3} title="Geometry">
                      <div>
                        <dt className="orbix-label">
                          Shock angle <LabSymbol>β</LabSymbol>
                        </dt>
                        <dd className="mt-1">
                          <output className="orbix-data" htmlFor={outputIds}>
                            <LabFigure unit="°">
                              {precisionFormatter.format(
                                result.shockAngleDegrees,
                              )}
                            </LabFigure>
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="orbix-label">
                          Deflection angle <LabSymbol>θ</LabSymbol>
                        </dt>
                        <dd className="mt-1">
                          <output className="orbix-data" htmlFor={outputIds}>
                            <LabFigure unit="°">
                              {precisionFormatter.format(
                                Number(values.deflectionAngleDegrees),
                              )}
                            </LabFigure>
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="orbix-label">Normal Mach component</dt>
                        <dd className="mt-1">
                          <output className="orbix-data" htmlFor={outputIds}>
                            <LabFigure>
                              {precisionFormatter.format(
                                result.normalMachComponent,
                              )}
                            </LabFigure>
                          </output>
                        </dd>
                      </div>
                    </ReadoutGrid>

                    <ReadoutGrid columns={2} title="Flow results">
                      <div>
                        <dt className="orbix-label">Downstream Mach</dt>
                        <dd className="mt-1">
                          <output
                            className="orbix-readout-lg"
                            htmlFor={outputIds}
                          >
                            <LabFigure>
                              {precisionFormatter.format(result.downstreamMach)}
                            </LabFigure>
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="orbix-label">
                          Total pressure recovery ratio
                        </dt>
                        <dd className="mt-1">
                          <output
                            className="orbix-readout-lg"
                            htmlFor={outputIds}
                          >
                            <LabFigure>
                              {precisionFormatter.format(
                                result.pressureRecoveryRatio,
                              )}
                            </LabFigure>
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="orbix-label">Total pressure loss</dt>
                        <dd className="mt-1">
                          <output className="orbix-data" htmlFor={outputIds}>
                            <LabFigure unit="%">
                              {percentageFormatter.format(
                                result.pressureLossPercentage,
                              )}
                            </LabFigure>
                          </output>
                        </dd>
                      </div>
                    </ReadoutGrid>
                  </>
                )}
              </>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Enter valid shock inputs to restore the live pressure-recovery
                analysis.
              </NotCalculated>
            )}
          </CalculatorResultSection>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <section className="border-t border-border pt-3">
            <h3 className="text-sm font-semibold">Pressure-loss context</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Oblique shocks generally produce lower total-pressure losses than
              normal shocks at the same upstream Mach because only the velocity
              component normal to the shock is compressed. Loss increases
              rapidly with stronger shocks.
            </p>
          </section>

          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Engineering assumptions
            </p>
            <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted @min-[36rem]/col:grid-cols-2">
              <li>Perfect gas approximation</li>
              <li>Constant gamma = 1.4</li>
              <li>Inviscid flow</li>
              <li>Adiabatic flow</li>
              <li>No boundary-layer effects</li>
              <li>No chemical reactions</li>
              <li>Weak attached oblique shock solution</li>
            </ul>
          </aside>
        </div>
      </div>
    </LabToolLayout>
  );
}
