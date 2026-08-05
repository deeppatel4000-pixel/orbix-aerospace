"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { AlertTriangle, Plus, RotateCcw, Trash2, Wind } from "lucide-react";

import { analyzeInletCompression } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  InletCompressionAnalysis,
  InletCompressionInputs,
  ShockSequenceElement,
} from "@/features/engineering-lab/types";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";

const MAXIMUM_EXTERNAL_SHOCK_STAGES = 5;

type ShockStageType = ShockSequenceElement["type"];
type CommonField = "altitudeMeters" | "gamma" | "initialMach";

interface ExternalShockStageFormValue {
  readonly deflectionAngleDegrees: string;
  readonly id: number;
  readonly type: ShockStageType;
}

interface InletCompressionFormValues {
  readonly altitudeMeters: string;
  readonly externalShocks: readonly ExternalShockStageFormValue[];
  readonly gamma: string;
  readonly initialMach: string;
}

interface ExternalShockStageValidationError {
  readonly deflectionAngleDegrees?: string;
  readonly stage?: string;
}

interface InletCompressionValidationErrors {
  readonly altitudeMeters?: string;
  readonly externalShocks: Readonly<
    Record<number, ExternalShockStageValidationError>
  >;
  readonly gamma?: string;
  readonly initialMach?: string;
  readonly sequence?: string;
  readonly terminalShock?: string;
}

interface InletCompressionViewState {
  readonly errors: InletCompressionValidationErrors;
  readonly result: InletCompressionAnalysis | null;
}

interface StageFailure {
  readonly index: number;
  readonly message: string;
  readonly stageId: number;
}

function createInitialFormValues(): InletCompressionFormValues {
  return {
    altitudeMeters: "",
    externalShocks: [
      { deflectionAngleDegrees: "8", id: 1, type: "oblique" },
      { deflectionAngleDegrees: "6", id: 2, type: "oblique" },
    ],
    gamma: "",
    initialMach: "3",
  };
}

const precisionFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
  minimumFractionDigits: 4,
});

const altitudeFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

function parseRequiredNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function parseOptionalNumber(value: string): number | undefined {
  return value.trim() === "" ? undefined : Number(value);
}

function buildAnalysisInputs(
  values: InletCompressionFormValues,
  numberOfStages = values.externalShocks.length,
): InletCompressionInputs {
  const altitudeMeters = parseOptionalNumber(values.altitudeMeters);
  const gamma = parseOptionalNumber(values.gamma);
  const optionalAltitude =
    altitudeMeters === undefined ? {} : { altitudeMeters };
  const optionalGamma = gamma === undefined ? {} : { gamma };
  const externalShocks: ShockSequenceElement[] = values.externalShocks
    .slice(0, numberOfStages)
    .map((shock) =>
      shock.type === "normal"
        ? { type: "normal" }
        : {
            deflectionAngleDegrees: parseRequiredNumber(
              shock.deflectionAngleDegrees,
            ),
            type: "oblique",
          },
    );

  return {
    ...optionalAltitude,
    ...optionalGamma,
    externalShocks,
    initialMach: parseRequiredNumber(values.initialMach),
  };
}

function locateExternalStageFailure(
  values: InletCompressionFormValues,
): StageFailure | null {
  for (let index = 0; index < values.externalShocks.length; index += 1) {
    try {
      analyzeInletCompression(buildAnalysisInputs(values, index + 1));
    } catch (error) {
      if (error instanceof RangeError) {
        if (error.message.toLowerCase().includes("terminal normal shock")) {
          continue;
        }

        const stage = values.externalShocks[index];

        if (!stage) return null;

        return {
          index,
          message: error.message,
          stageId: stage.id,
        };
      }

      throw error;
    }
  }

  return null;
}

function deriveViewState(
  values: InletCompressionFormValues,
): InletCompressionViewState {
  try {
    return {
      errors: { externalShocks: {} },
      result: analyzeInletCompression(buildAnalysisInputs(values)),
    };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;

    const normalizedMessage = error.message.toLowerCase();

    if (normalizedMessage.includes("altitude")) {
      return {
        errors: { altitudeMeters: error.message, externalShocks: {} },
        result: null,
      };
    }

    if (normalizedMessage.includes("gamma")) {
      return {
        errors: { externalShocks: {}, gamma: error.message },
        result: null,
      };
    }

    if (normalizedMessage.includes("at least one shock")) {
      return {
        errors: { externalShocks: {}, sequence: error.message },
        result: null,
      };
    }

    if (normalizedMessage.includes("terminal normal shock")) {
      return {
        errors: { externalShocks: {}, terminalShock: error.message },
        result: null,
      };
    }

    const failure = locateExternalStageFailure(values);

    if (!failure) {
      return {
        errors: { externalShocks: {}, initialMach: error.message },
        result: null,
      };
    }

    const isDeflectionError =
      normalizedMessage.includes("deflection") ||
      normalizedMessage.includes("attached");

    if (normalizedMessage.includes("mach number") && failure.index === 0) {
      return {
        errors: {
          externalShocks: isDeflectionError
            ? {
                [failure.stageId]: {
                  deflectionAngleDegrees: failure.message,
                },
              }
            : {},
          initialMach: error.message,
        },
        result: null,
      };
    }

    return {
      errors: {
        externalShocks: {
          [failure.stageId]: isDeflectionError
            ? { deflectionAngleDegrees: failure.message }
            : { stage: failure.message },
        },
      },
      result: null,
    };
  }
}

function collectValidationMessages(
  values: InletCompressionFormValues,
  errors: InletCompressionValidationErrors,
): readonly (string | undefined)[] {
  const stageMessages = values.externalShocks.flatMap((shock, index) => {
    const stageErrors = errors.externalShocks[shock.id];

    return [stageErrors?.deflectionAngleDegrees, stageErrors?.stage].map(
      (message) => (message ? `Stage ${index + 1}: ${message}` : undefined),
    );
  });

  return [
    errors.altitudeMeters,
    errors.gamma,
    errors.initialMach,
    errors.sequence,
    errors.terminalShock,
    ...stageMessages,
  ];
}

export function InletCompressionAnalyzer() {
  const [values, setValues] = useState<InletCompressionFormValues>(() =>
    createInitialFormValues(),
  );
  const nextStageId = useRef(3);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);
  const validationMessages = collectValidationMessages(values, errors);
  const hasReachedStageLimit =
    values.externalShocks.length >= MAXIMUM_EXTERNAL_SHOCK_STAGES;
  const outputIds = [
    "inlet-compression-initialMach",
    "inlet-compression-altitudeMeters",
    "inlet-compression-gamma",
    ...values.externalShocks
      .filter((shock) => shock.type === "oblique")
      .map(
        (shock) => `inlet-compression-stage-${shock.id}-deflectionAngleDegrees`,
      ),
  ].join(" ");

  function updateCommonValue(field: CommonField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function updateShockType(stageId: number, type: ShockStageType) {
    setValues((current) => ({
      ...current,
      externalShocks: current.externalShocks.map((shock) =>
        shock.id === stageId ? { ...shock, type } : shock,
      ),
    }));
  }

  function updateDeflectionAngle(stageId: number, value: string) {
    setValues((current) => ({
      ...current,
      externalShocks: current.externalShocks.map((shock) =>
        shock.id === stageId
          ? { ...shock, deflectionAngleDegrees: value }
          : shock,
      ),
    }));
  }

  function addShockStage() {
    setValues((current) => {
      if (current.externalShocks.length >= MAXIMUM_EXTERNAL_SHOCK_STAGES) {
        return current;
      }

      const newStage: ExternalShockStageFormValue = {
        deflectionAngleDegrees: "5",
        id: nextStageId.current,
        type: "oblique",
      };
      nextStageId.current += 1;

      return {
        ...current,
        externalShocks: [...current.externalShocks, newStage],
      };
    });
  }

  function removeShockStage(stageId: number) {
    setValues((current) => ({
      ...current,
      externalShocks: current.externalShocks.filter(
        (shock) => shock.id !== stageId,
      ),
    }));
  }

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function resetAnalyzer() {
    nextStageId.current = 3;
    setValues(createInitialFormValues());
  }

  const displayedAltitude =
    values.altitudeMeters.trim() === ""
      ? "Not specified"
      : altitudeFormatter.format(Number(values.altitudeMeters)) + " m";

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(25rem,1.05fr)] xl:gap-10">
      <div>
        <form noValidate onSubmit={preventSubmission}>
          <fieldset>
            <legend className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
              Inlet entry conditions
            </legend>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <CalculatorNumberField
                error={errors.initialMach}
                field="initialMach"
                hint="Supersonic Mach number entering the first external compression stage."
                idPrefix="inlet-compression"
                label="Initial Mach number"
                onChange={updateCommonValue}
                unit="Mach"
                value={values.initialMach}
              />
              <CalculatorNumberField
                error={errors.altitudeMeters}
                field="altitudeMeters"
                hint={
                  "Optional compatibility check from 0–" +
                  STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES.toLocaleString(
                    "en-US",
                  ) +
                  " metres. Leave blank to omit."
                }
                idPrefix="inlet-compression"
                label="Altitude (optional)"
                onChange={updateCommonValue}
                unit="m"
                value={values.altitudeMeters}
              />
              <CalculatorNumberField
                error={errors.gamma}
                field="gamma"
                hint="Optional ratio of specific heats greater than one. Leave blank to use 1.4."
                idPrefix="inlet-compression"
                label="Gamma (optional)"
                onChange={updateCommonValue}
                unit="gamma"
                value={values.gamma}
              />
            </div>
          </fieldset>

          <section
            aria-labelledby="inlet-external-sequence-title"
            className="mt-8 border-t border-border pt-7"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
                  External compression
                </p>
                <h3
                  className="mt-1 text-lg font-semibold"
                  id="inlet-external-sequence-title"
                >
                  Shock sequence
                </h3>
              </div>
              <button
                aria-describedby="inlet-compression-stage-limit"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent/45 bg-accent/8 px-4 py-2.5 text-sm font-semibold text-accent transition-colors hover:border-accent hover:bg-accent/12 disabled:cursor-not-allowed disabled:border-border disabled:bg-surface/50 disabled:text-muted"
                disabled={hasReachedStageLimit}
                onClick={addShockStage}
                type="button"
              >
                <Plus aria-hidden="true" size={16} />
                Add external stage
              </button>
            </div>

            <p
              aria-live="polite"
              className={
                "mt-3 text-xs leading-5 " +
                (hasReachedStageLimit ? "text-signal" : "text-muted")
              }
              id="inlet-compression-stage-limit"
            >
              {hasReachedStageLimit
                ? "Maximum sequence length reached: five external shock stages."
                : `${values.externalShocks.length} of ${MAXIMUM_EXTERNAL_SHOCK_STAGES} external shock stages configured.`}
            </p>

            {values.externalShocks.length > 0 ? (
              <div className="mt-5 space-y-4">
                {values.externalShocks.map((shock, index) => {
                  const stageNumber = index + 1;
                  const stageError = errors.externalShocks[shock.id];
                  const stageErrorId = `inlet-compression-stage-${shock.id}-error`;
                  const typeHintId = `inlet-compression-stage-${shock.id}-type-hint`;
                  const typeInputId = `inlet-compression-stage-${shock.id}-type`;

                  return (
                    <fieldset
                      aria-describedby={
                        stageError?.stage
                          ? `${typeHintId} ${stageErrorId}`
                          : typeHintId
                      }
                      className="rounded-2xl border border-border bg-background/40 p-4 sm:p-5"
                      key={shock.id}
                    >
                      <legend className="sr-only">
                        External shock stage {stageNumber}
                      </legend>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-mono text-[0.64rem] tracking-[0.14em] text-muted uppercase">
                            External compression
                          </p>
                          <h4 className="mt-1 text-base font-semibold">
                            Stage {stageNumber}
                          </h4>
                        </div>
                        <button
                          aria-label={`Remove external shock stage ${stageNumber}`}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border px-3.5 py-2 text-xs font-semibold text-muted transition-colors hover:border-signal/50 hover:text-signal"
                          onClick={() => removeShockStage(shock.id)}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" size={15} />
                          Remove
                        </button>
                      </div>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                          <label
                            className="text-sm font-semibold"
                            htmlFor={typeInputId}
                          >
                            Shock type
                          </label>
                          <select
                            aria-describedby={
                              stageError?.stage
                                ? `${typeHintId} ${stageErrorId}`
                                : typeHintId
                            }
                            aria-errormessage={
                              stageError?.stage ? stageErrorId : undefined
                            }
                            aria-invalid={Boolean(stageError?.stage)}
                            className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background/55 px-4 py-3 text-sm text-foreground transition-colors outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                            id={typeInputId}
                            onChange={(event) =>
                              updateShockType(
                                shock.id,
                                event.target.value as ShockStageType,
                              )
                            }
                            value={shock.type}
                          >
                            <option value="normal">Normal shock</option>
                            <option value="oblique">Oblique shock</option>
                          </select>
                          <p
                            className="mt-2 text-xs leading-5 text-muted"
                            id={typeHintId}
                          >
                            Each stage receives the preceding downstream Mach.
                          </p>
                        </div>

                        {shock.type === "oblique" ? (
                          <CalculatorNumberField
                            error={stageError?.deflectionAngleDegrees}
                            field="deflectionAngleDegrees"
                            hint="Positive turning angle that must permit an attached weak shock."
                            idPrefix={`inlet-compression-stage-${shock.id}`}
                            label="Deflection angle"
                            onChange={(_field, value) =>
                              updateDeflectionAngle(shock.id, value)
                            }
                            unit="deg"
                            value={shock.deflectionAngleDegrees}
                          />
                        ) : null}
                      </div>

                      {stageError?.stage ? (
                        <p
                          className="mt-4 rounded-xl border border-signal/35 bg-signal/8 p-3 text-xs leading-5 text-signal"
                          id={stageErrorId}
                          role="alert"
                        >
                          {stageError.stage}
                        </p>
                      ) : null}
                    </fieldset>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-border p-5 text-center">
                <p className="text-sm font-semibold">
                  No external shock stages
                </p>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Add an external compression stage before applying the terminal
                  normal shock.
                </p>
              </div>
            )}

            {errors.terminalShock ? (
              <p
                className="mt-4 rounded-xl border border-signal/35 bg-signal/8 p-3 text-xs leading-5 text-signal"
                id="inlet-compression-terminal-error"
                role="alert"
              >
                {errors.terminalShock}
              </p>
            ) : null}
          </section>

          <ValidationErrorSummary errors={validationMessages} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-muted">
              Valid changes update the complete inlet workflow immediately.
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
          eyebrow="Supersonic inlet workflow"
          icon={Wind}
          id="inlet-compression-result"
          title="Inlet compression analysis"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="inlet-initial-flow-title">
                <h4
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="inlet-initial-flow-title"
                >
                  Initial flow
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Mach number</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={outputIds}
                      >
                        {precisionFormatter.format(result.initialMach)}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Altitude</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={outputIds}
                      >
                        {displayedAltitude}
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="inlet-external-results-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="inlet-external-results-title"
                >
                  External compression
                </h4>
                <ol className="mt-4 space-y-4">
                  {result.externalShockStages.map((shock, index) => (
                    <li
                      className="rounded-xl border border-border bg-background/35 p-4"
                      key={values.externalShocks[index]?.id ?? index}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold">
                          Stage {index + 1}
                        </p>
                        <span className="rounded-full border border-accent/25 bg-accent/8 px-2.5 py-1 font-mono text-[0.62rem] tracking-[0.1em] text-accent uppercase">
                          {shock.shockType === "normal" ? "Normal" : "Oblique"}
                        </span>
                      </div>
                      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-muted">Upstream Mach</dt>
                          <dd className="mt-1">
                            <output
                              className="font-mono text-sm font-semibold"
                              htmlFor={outputIds}
                            >
                              {precisionFormatter.format(shock.upstreamMach)}
                            </output>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted">
                            Downstream Mach
                          </dt>
                          <dd className="mt-1">
                            <output
                              className="font-mono text-sm font-semibold"
                              htmlFor={outputIds}
                            >
                              {precisionFormatter.format(shock.downstreamMach)}
                            </output>
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-muted">
                            Individual pressure recovery
                          </dt>
                          <dd className="mt-1">
                            <output
                              className="font-mono text-sm font-semibold text-accent"
                              htmlFor={outputIds}
                            >
                              {precisionFormatter.format(
                                shock.pressureRecoveryRatio,
                              )}
                            </output>
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ol>
              </section>

              <section
                aria-labelledby="inlet-terminal-shock-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="inlet-terminal-shock-title"
                >
                  Terminal normal shock
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Upstream Mach</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={outputIds}
                      >
                        {precisionFormatter.format(
                          result.terminalShock.upstreamMach,
                        )}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Downstream Mach</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={outputIds}
                      >
                        {precisionFormatter.format(
                          result.terminalShock.downstreamMach,
                        )}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Pressure recovery</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={outputIds}
                      >
                        {precisionFormatter.format(
                          result.terminalShockPressureRecoveryRatio,
                        )}
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="inlet-complete-performance-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="inlet-complete-performance-title"
                >
                  Complete inlet performance
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">
                      Overall pressure recovery
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={outputIds}
                      >
                        {precisionFormatter.format(
                          result.overallPressureRecoveryRatio,
                        )}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">
                      Total pressure loss (ratio)
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={outputIds}
                      >
                        1 −{" "}
                        {precisionFormatter.format(
                          result.overallPressureRecoveryRatio,
                        )}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Final exit Mach</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={outputIds}
                      >
                        {precisionFormatter.format(result.finalExitMach)}
                      </output>
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs leading-5 text-muted">
                  Pressure loss is displayed as the exact complement of the
                  analysis-layer recovery ratio; the interface does not
                  recalculate inlet physics.
                </p>
              </section>
            </div>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">—</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Configure valid external compression that remains supersonic
                before the terminal normal shock.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <aside className="rounded-2xl border border-signal/25 bg-signal/6 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-signal">
            <AlertTriangle aria-hidden="true" size={17} />
            Engineering assumptions
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-xs leading-5 text-muted sm:grid-cols-2">
            <li>Ideal gas flow</li>
            <li>Perfectly controlled shock sequence</li>
            <li>No boundary-layer losses</li>
            <li>No viscous losses</li>
            <li>No shock interaction losses</li>
            <li>No inlet geometry modeling</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
