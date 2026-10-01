"use client";

import { Button } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";

import { analyzeHohmannTransfer } from "@/features/engineering-lab/analysis";
import {
  EQ_LINE,
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
  EQ_SUP,
  LAB_GROUP,
  LAB_GROUP_LEGEND,
  EqFrac,
  EQ_PAREN,
  LabEquation,
} from "@/features/engineering-lab/components/shared";
import { HohmannTransferFigure } from "@/features/engineering-lab/components/hohmann-transfer-figure";
import {
  burnDecimals,
  formatAltitudeKm,
  formatDuration,
  formatSpeed,
} from "@/features/orbits/transfer-model";
import type {
  HohmannTransferAnalysisInputs,
  HohmannTransferAnalysisResult,
} from "@/features/engineering-lab/types";

type HohmannTransferField =
  | "initialAltitudeKm"
  | "finalAltitudeKm"
  | "gravitationalParameter"
  | "planetRadiusKm";

/** Altitudes and the planet radius are entered in km, as on the rest of the page. */
interface HohmannTransferFormValues {
  readonly finalAltitudeKm: string;
  readonly gravitationalParameter: string;
  readonly initialAltitudeKm: string;
  readonly planetRadiusKm: string;
}

type HohmannTransferValidationErrors = Readonly<
  Partial<Record<HohmannTransferField | "form", string>>
>;

interface HohmannTransferViewState {
  readonly errors: HohmannTransferValidationErrors;
  readonly result: HohmannTransferAnalysisResult | null;
}

const initialFormValues: HohmannTransferFormValues = {
  finalAltitudeKm: "35786",
  gravitationalParameter: "",
  initialAltitudeKm: "400",
  planetRadiusKm: "",
};

/** Speeds as the Transfer Explorer shows them; distances in whole km. */
function formatVelocity(metresPerSecond: number): string {
  return formatSpeed(metresPerSecond, burnDecimals(metresPerSecond));
}

/**
 * Both burns and the total share one decimals value, and the total is the
 * sum of the burns as shown, so the shown numbers always add up.
 */
export function transferDeltaVReadouts(
  transfer: HohmannTransferAnalysisResult["transfer"],
): { readonly first: string; readonly second: string; readonly total: string } {
  const decimals = Math.max(
    burnDecimals(transfer.firstBurnDeltaVMetresPerSecond),
    burnDecimals(transfer.secondBurnDeltaVMetresPerSecond),
  ) as 0 | 1;
  const shown = (value: number) => Number(value.toFixed(decimals));
  const first = shown(transfer.firstBurnDeltaVMetresPerSecond);
  const second = shown(transfer.secondBurnDeltaVMetresPerSecond);
  return {
    first: formatSpeed(first, decimals),
    second: formatSpeed(second, decimals),
    total: formatSpeed(first + second, decimals),
  };
}

function formatKm(metres: number): string {
  return formatAltitudeKm(metres);
}

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
    values.planetRadiusKm.trim() === ""
      ? undefined
      : Number(values.planetRadiusKm) * 1_000;

  return {
    ...(gravitationalParameter === undefined ? {} : { gravitationalParameter }),
    ...(planetRadiusMetres === undefined ? {} : { planetRadiusMetres }),
    finalAltitudeMetres: parseRequiredNumber(values.finalAltitudeKm) * 1_000,
    initialAltitudeMetres:
      parseRequiredNumber(values.initialAltitudeKm) * 1_000,
  };
}

function locateAltitudeError(
  inputs: HohmannTransferAnalysisInputs,
): "initialAltitudeKm" | "finalAltitudeKm" {
  try {
    analyzeHohmannTransfer({ ...inputs, finalAltitudeMetres: 0 });
  } catch (error) {
    if (
      error instanceof RangeError &&
      error.message.toLowerCase().includes("altitude")
    ) {
      return "initialAltitudeKm";
    }
  }

  return "finalAltitudeKm";
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
      errors.initialAltitudeKm = error.message;
      errors.finalAltitudeKm = error.message;
    } else if (normalizedMessage.includes("altitude")) {
      errors[locateAltitudeError(inputs)] = error.message;
    }

    if (normalizedMessage.includes("gravitational parameter")) {
      errors.gravitationalParameter = error.message;
    }

    if (normalizedMessage.includes("planet radius")) {
      errors.planetRadiusKm = error.message;
    }

    if (Object.keys(errors).length === 0) {
      errors.form = error.message;
    }

    return { errors, result: null };
  }
}

const toolEquation = (
  <LabEquation
    equation={
      <>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            a<sub>t</sub>
          </span>{" "}
          <span className={EQ_TERM}>
            ={" "}
            <EqFrac
              den="2"
              num={
                <>
                  r<sub>1</sub>+r<sub>2</sub>
                </>
              }
            />
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            v<sub>c</sub>(r)<sup className={EQ_SUP}>2</sup>
          </span>{" "}
          <span className={EQ_TERM}>
            = <EqFrac den="r" num="μ" />
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            v<sub>t</sub>(r)<sup className={EQ_SUP}>2</sup>
          </span>{" "}
          <span className={EQ_TERM}>
            = μ<span className={EQ_PAREN}>(</span>
            <EqFrac den="r" num="2" />
            {" − "}
            <EqFrac
              den={
                <>
                  a<sub>t</sub>
                </>
              }
              num="1"
            />
            <span className={EQ_PAREN}>)</span>
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            Δv<sub>1</sub>
          </span>{" "}
          <span className={EQ_TERM}>
            = |v<sub>t</sub>(r<sub>1</sub>)
          </span>
          <wbr />
          <span className={EQ_TERM}>
            −v<sub>c</sub>(r<sub>1</sub>)|
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            Δv<sub>2</sub>
          </span>{" "}
          <span className={EQ_TERM}>
            = |v<sub>c</sub>(r<sub>2</sub>)
          </span>
          <wbr />
          <span className={EQ_TERM}>
            −v<sub>t</sub>(r<sub>2</sub>)|
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>t</span>{" "}
          <span className={EQ_TERM}>= π</span>
          <span className={EQ_TERM}>
            <EqDot />
            √(a
            <EqSubSup sub="t" sup="3" />
            /μ)
          </span>
        </span>
      </>
    }
    label="Hohmann transfer"
    spokenAs="The transfer semi-major axis a t equals r 1 plus r 2 over 2. The circular speed squared at radius r is mu over r. The transfer-orbit speed squared at radius r is mu times 2 over r minus 1 over a t. Delta v 1 is the size of the transfer speed at r 1 minus the circular speed at r 1. Delta v 2 is the size of the circular speed at r 2 minus the transfer speed at r 2. Transfer time t equals pi times the square root of a t cubed over mu."
    variables={[
      {
        symbol: (
          <>
            r<sub>1</sub>, r<sub>2</sub>
          </>
        ),
        meaning:
          "Orbit radii: central-body radius plus altitude; Earth mean radius, 6,371,000 m, by default",
        unit: "m",
      },
      {
        symbol: (
          <>
            a<sub>t</sub>
          </>
        ),
        meaning: "Semi-major axis of the transfer ellipse",
        unit: "m",
      },
      {
        symbol: (
          <>
            v<sub>c</sub>(r)
          </>
        ),
        meaning: "Circular orbit speed at radius r",
        unit: "m/s",
      },
      {
        symbol: (
          <>
            v<sub>t</sub>(r)
          </>
        ),
        meaning: "Transfer orbit speed at radius r, from the vis-viva equation",
        unit: "m/s",
      },
      {
        symbol: "μ",
        meaning:
          "Gravitational parameter; Earth, 3.986004418 × 10¹⁴, by default",
        unit: "m³/s²",
      },
      {
        symbol: "t",
        meaning: "Transfer time, half the transfer orbit period",
        unit: "s",
      },
    ]}
  />
);

export function HohmannTransferAnalyzer() {
  const [values, setValues] =
    useState<HohmannTransferFormValues>(initialFormValues);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);
  const deltaV = result ? transferDeltaVReadouts(result.transfer) : null;
  const initialOrbitOutputIds =
    "hohmann-transfer-initialAltitudeKm hohmann-transfer-gravitationalParameter hohmann-transfer-planetRadiusKm";
  const finalOrbitOutputIds =
    "hohmann-transfer-finalAltitudeKm hohmann-transfer-gravitationalParameter hohmann-transfer-planetRadiusKm";
  const transferOutputIds =
    "hohmann-transfer-initialAltitudeKm hohmann-transfer-finalAltitudeKm hohmann-transfer-gravitationalParameter hohmann-transfer-planetRadiusKm";

  function updateValue(field: HohmannTransferField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    focusFirstInvalidField(event.currentTarget);
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  return (
    <LabToolLayout equation={toolEquation}>
      <div className={LAB_TOOL_SPLIT}>
        <div className="@container/col min-w-0">
          <form
            noValidate
            onKeyDown={focusFirstInvalidFieldOnEnter}
            onSubmit={preventSubmission}
          >
            <fieldset className={LAB_GROUP}>
              <legend className={LAB_GROUP_LEGEND}>Initial orbit</legend>
              <div className="mt-4 @min-[36rem]/col:w-[calc(50%-0.625rem)]">
                <CalculatorNumberField
                  error={errors.initialAltitudeKm}
                  field="initialAltitudeKm"
                  hint="Altitude above the modeled central body's reference radius."
                  idPrefix="hohmann-transfer"
                  label="Initial altitude"
                  onChange={updateValue}
                  unit="km"
                  value={values.initialAltitudeKm}
                />
              </div>
            </fieldset>

            <fieldset className={LAB_GROUP}>
              <legend className={LAB_GROUP_LEGEND}>Final orbit</legend>
              <div className="mt-4 @min-[36rem]/col:w-[calc(50%-0.625rem)]">
                <CalculatorNumberField
                  error={errors.finalAltitudeKm}
                  field="finalAltitudeKm"
                  hint="Target circular-orbit altitude above the same reference radius."
                  idPrefix="hohmann-transfer"
                  label="Final altitude"
                  onChange={updateValue}
                  unit="km"
                  value={values.finalAltitudeKm}
                />
              </div>
            </fieldset>

            <fieldset className={LAB_GROUP}>
              <legend className={LAB_GROUP_LEGEND}>
                Central-body constants
              </legend>
              <div className="mt-4 grid gap-5">
                <CalculatorNumberField
                  error={errors.gravitationalParameter}
                  field="gravitationalParameter"
                  hint="Optional. Leave blank to use Earth's standard gravitational parameter."
                  idPrefix="hohmann-transfer"
                  label="Gravitational parameter (optional)"
                  optional
                  onChange={updateValue}
                  unit="m³/s²"
                  value={values.gravitationalParameter}
                />
                <CalculatorNumberField
                  error={errors.planetRadiusKm}
                  field="planetRadiusKm"
                  hint="Optional. Leave blank to use Earth's mean radius."
                  idPrefix="hohmann-transfer"
                  label="Planet radius (optional)"
                  optional
                  onChange={updateValue}
                  unit="km"
                  value={values.planetRadiusKm}
                />
              </div>
            </fieldset>

            <ValidationErrorSummary
              errors={[
                errors.initialAltitudeKm,
                errors.finalAltitudeKm,
                errors.gravitationalParameter,
                errors.planetRadiusKm,
                errors.form,
              ]}
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
                Valid changes update the ideal transfer solution immediately.
              </p>
            </div>
          </form>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          {result ? (
            <HohmannTransferFigure
              customConstants={
                values.gravitationalParameter.trim() !== "" ||
                values.planetRadiusKm.trim() !== ""
              }
              finalAltitudeMetres={result.finalOrbit.altitudeMetres}
              initialAltitudeMetres={result.initialOrbit.altitudeMetres}
            />
          ) : null}
          <CalculatorResultSection
            id="hohmann-transfer-result"
            title="Hohmann transfer solution"
          >
            {result ? (
              <>
                <ReadoutGrid columns={2} title="Transfer orbit">
                  <div>
                    <dt className="orbix-label">
                      Total <LabSymbol>Δv</LabSymbol>
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-readout-lg"
                        htmlFor={transferOutputIds}
                      >
                        <LabFigure unit="m/s">{deltaV?.total}</LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Semi-major axis</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={transferOutputIds}
                      >
                        <LabFigure unit="km">
                          {formatKm(
                            result.transfer.transferSemiMajorAxisMetres,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">
                      First burn <LabSymbol>Δv</LabSymbol>
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={transferOutputIds}
                      >
                        <LabFigure unit="m/s">{deltaV?.first}</LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">
                      Second burn <LabSymbol>Δv</LabSymbol>
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={transferOutputIds}
                      >
                        <LabFigure unit="m/s">{deltaV?.second}</LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Transfer duration</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={transferOutputIds}
                      >
                        <LabFigure>
                          {formatDuration(result.transfer.transferTimeSeconds)}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={3} title="Initial orbit">
                  <div>
                    <dt className="orbix-label">Altitude</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={initialOrbitOutputIds}
                      >
                        <LabFigure unit="km">
                          {formatKm(result.initialOrbit.altitudeMetres)}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Orbital radius</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={initialOrbitOutputIds}
                      >
                        <LabFigure unit="km">
                          {formatKm(result.initialOrbit.orbitalRadiusMetres)}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Circular velocity</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={initialOrbitOutputIds}
                      >
                        <LabFigure unit="m/s">
                          {formatVelocity(
                            result.initialOrbit.circularVelocityMetresPerSecond,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={3} title="Final orbit">
                  <div>
                    <dt className="orbix-label">Altitude</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={finalOrbitOutputIds}
                      >
                        <LabFigure unit="km">
                          {formatKm(result.finalOrbit.altitudeMetres)}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Orbital radius</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={finalOrbitOutputIds}
                      >
                        <LabFigure unit="km">
                          {formatKm(result.finalOrbit.orbitalRadiusMetres)}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Circular velocity</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={finalOrbitOutputIds}
                      >
                        <LabFigure unit="m/s">
                          {formatVelocity(
                            result.finalOrbit.circularVelocityMetresPerSecond,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>
              </>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Enter two valid, different circular-orbit altitudes to resolve
                the ideal transfer.
              </NotCalculated>
            )}
          </CalculatorResultSection>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <section
            aria-labelledby="hohmann-transfer-explanation-title"
            className="border-t border-border pt-7"
          >
            <h3
              className="text-lg font-semibold"
              id="hohmann-transfer-explanation-title"
            >
              Two impulses, one transfer ellipse
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              The first burn puts the craft on an ellipse that touches both
              orbits. It coasts half way round, and the second burn makes the
              orbit circular at the new height. Total delta-v leaves out launch,
              drag, finite burns and course corrections.
            </p>
          </section>
          <p className="text-sm leading-6 text-muted">
            Assumes two-body gravity, circular orbits in one plane, instant
            burns, no drag and no gravity assists.
          </p>
        </div>
      </div>
    </LabToolLayout>
  );
}
