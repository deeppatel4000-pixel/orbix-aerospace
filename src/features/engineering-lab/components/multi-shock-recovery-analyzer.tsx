"use client";

import { Button, Tag } from "@/components/ui";
import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  ChevronDown,
  AlertTriangle,
  Layers,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { analyzeMultiShockRecovery } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  focusFirstInvalidField,
  focusFirstInvalidFieldOnEnter,
  CalculatorResultSection,
  NotCalculated,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  MultiShockRecoveryAnalysis,
  MultiShockRecoveryInputs,
  ShockSequenceElement,
} from "@/features/engineering-lab/types";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";

const MAXIMUM_SHOCK_STAGES = 5;

type ShockStageType = ShockSequenceElement["type"];
type CommonField = "altitudeMeters" | "upstreamMach";

interface ShockStageFormValue {
  readonly deflectionAngleDegrees: string;
  readonly id: number;
  readonly type: ShockStageType;
}

interface MultiShockRecoveryFormValues {
  readonly altitudeMeters: string;
  readonly shocks: readonly ShockStageFormValue[];
  readonly upstreamMach: string;
}

interface ShockStageValidationError {
  readonly deflectionAngleDegrees?: string;
  readonly stage?: string;
}

interface MultiShockRecoveryValidationErrors {
  readonly altitudeMeters?: string;
  readonly sequence?: string;
  readonly shocks: Readonly<Record<number, ShockStageValidationError>>;
  readonly upstreamMach?: string;
}

interface MultiShockRecoveryViewState {
  readonly errors: MultiShockRecoveryValidationErrors;
  readonly result: MultiShockRecoveryAnalysis | null;
}

interface StageFailure {
  readonly index: number;
  readonly message: string;
  readonly stageId: number;
}

function createInitialFormValues(): MultiShockRecoveryFormValues {
  return {
    altitudeMeters: "",
    shocks: [
      { deflectionAngleDegrees: "8", id: 1, type: "oblique" },
      { deflectionAngleDegrees: "6", id: 2, type: "oblique" },
    ],
    upstreamMach: "3",
  };
}

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

function buildAnalysisInputs(
  values: MultiShockRecoveryFormValues,
  numberOfStages = values.shocks.length,
): MultiShockRecoveryInputs {
  const altitudeMeters = parseOptionalNumber(values.altitudeMeters);
  const optionalAltitude =
    altitudeMeters === undefined ? {} : { altitudeMeters };
  const shocks: ShockSequenceElement[] = values.shocks
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
    shocks,
    upstreamMach: parseRequiredNumber(values.upstreamMach),
  };
}

function locateStageFailure(
  values: MultiShockRecoveryFormValues,
): StageFailure | null {
  for (let index = 0; index < values.shocks.length; index += 1) {
    try {
      analyzeMultiShockRecovery(buildAnalysisInputs(values, index + 1));
    } catch (error) {
      if (error instanceof RangeError) {
        const stage = values.shocks[index];

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
  values: MultiShockRecoveryFormValues,
): MultiShockRecoveryViewState {
  try {
    return {
      errors: { shocks: {} },
      result: analyzeMultiShockRecovery(buildAnalysisInputs(values)),
    };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;

    const normalizedMessage = error.message.toLowerCase();

    if (normalizedMessage.includes("altitude")) {
      return {
        errors: { altitudeMeters: error.message, shocks: {} },
        result: null,
      };
    }

    if (normalizedMessage.includes("at least one shock")) {
      return {
        errors: { sequence: error.message, shocks: {} },
        result: null,
      };
    }

    const failure = locateStageFailure(values);

    if (!failure) {
      return {
        errors: { shocks: {}, upstreamMach: error.message },
        result: null,
      };
    }

    const isDeflectionError =
      normalizedMessage.includes("deflection") ||
      normalizedMessage.includes("attached");

    if (normalizedMessage.includes("mach number") && failure.index === 0) {
      return {
        errors: {
          shocks: isDeflectionError
            ? {
                [failure.stageId]: {
                  deflectionAngleDegrees: failure.message,
                },
              }
            : {},
          upstreamMach: error.message,
        },
        result: null,
      };
    }

    return {
      errors: {
        shocks: {
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
  values: MultiShockRecoveryFormValues,
  errors: MultiShockRecoveryValidationErrors,
): readonly (string | undefined)[] {
  const stageMessages = values.shocks.flatMap((shock, index) => {
    const stageErrors = errors.shocks[shock.id];

    return [stageErrors?.deflectionAngleDegrees, stageErrors?.stage].map(
      (message) => (message ? `Stage ${index + 1}: ${message}` : undefined),
    );
  });

  return [
    errors.altitudeMeters,
    errors.upstreamMach,
    errors.sequence,
    ...stageMessages,
  ];
}

export function MultiShockRecoveryAnalyzer() {
  const [values, setValues] = useState<MultiShockRecoveryFormValues>(() =>
    createInitialFormValues(),
  );
  const nextStageId = useRef(3);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);
  const validationMessages = collectValidationMessages(values, errors);
  const hasReachedStageLimit = values.shocks.length >= MAXIMUM_SHOCK_STAGES;
  const outputIds = [
    "multi-shock-recovery-upstreamMach",
    "multi-shock-recovery-altitudeMeters",
    ...values.shocks
      .filter((shock) => shock.type === "oblique")
      .map((shock) => `multi-shock-stage-${shock.id}-deflectionAngleDegrees`),
  ].join(" ");

  function updateCommonValue(field: CommonField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function updateShockType(stageId: number, type: ShockStageType) {
    setValues((current) => ({
      ...current,
      shocks: current.shocks.map((shock) =>
        shock.id === stageId ? { ...shock, type } : shock,
      ),
    }));
  }

  function updateDeflectionAngle(stageId: number, value: string) {
    setValues((current) => ({
      ...current,
      shocks: current.shocks.map((shock) =>
        shock.id === stageId
          ? { ...shock, deflectionAngleDegrees: value }
          : shock,
      ),
    }));
  }

  function addShockStage() {
    setValues((current) => {
      if (current.shocks.length >= MAXIMUM_SHOCK_STAGES) return current;

      const newStage: ShockStageFormValue = {
        deflectionAngleDegrees: "5",
        id: nextStageId.current,
        type: "oblique",
      };
      nextStageId.current += 1;

      return { ...current, shocks: [...current.shocks, newStage] };
    });
  }

  function removeShockStage(stageId: number) {
    setValues((current) => ({
      ...current,
      shocks: current.shocks.filter((shock) => shock.id !== stageId),
    }));
  }

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    focusFirstInvalidField(event.currentTarget);
  }

  function resetAnalyzer() {
    nextStageId.current = 3;
    setValues(createInitialFormValues());
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(25rem,1.05fr)] xl:gap-10">
      <div>
        <form
          noValidate
          onKeyDown={focusFirstInvalidFieldOnEnter}
          onSubmit={preventSubmission}
        >
          <fieldset>
            <legend className="text-base font-semibold text-foreground">
              Upstream conditions
            </legend>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <CalculatorNumberField
                error={errors.upstreamMach}
                field="upstreamMach"
                hint="Initial Mach number supplied to the first shock stage."
                idPrefix="multi-shock-recovery"
                label="Initial Mach number"
                onChange={updateCommonValue}
                unit="Mach"
                value={values.upstreamMach}
              />
              <CalculatorNumberField
                error={errors.altitudeMeters}
                field="altitudeMeters"
                hint={
                  "Optional compatibility check from 0 to " +
                  STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES.toLocaleString(
                    "en-US",
                  ) +
                  " metres. Leave blank to omit."
                }
                idPrefix="multi-shock-recovery"
                label="Altitude (optional)"
                onChange={updateCommonValue}
                unit="m"
                value={values.altitudeMeters}
              />
            </div>
          </fieldset>

          <section
            aria-labelledby="multi-shock-sequence-title"
            className="mt-8 border-t border-border pt-7"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="orbix-label">Ordered workflow</p>
                <h3
                  className="mt-1 text-lg font-semibold"
                  id="multi-shock-sequence-title"
                >
                  Shock sequence
                </h3>
              </div>
              <Button
                aria-describedby="multi-shock-stage-limit"
                variant="secondary"
                disabled={hasReachedStageLimit}
                onClick={addShockStage}
              >
                <Plus aria-hidden="true" size={16} />
                Add shock stage
              </Button>
            </div>

            <p
              aria-live="polite"
              className={
                "mt-3 text-xs leading-5 " +
                (hasReachedStageLimit ? "text-status-warning" : "text-muted")
              }
              id="multi-shock-stage-limit"
            >
              {hasReachedStageLimit
                ? "Maximum sequence length reached: five shock stages."
                : `${values.shocks.length} of ${MAXIMUM_SHOCK_STAGES} shock stages configured.`}
            </p>

            {values.shocks.length > 0 ? (
              <div className="mt-5 space-y-4">
                {values.shocks.map((shock, index) => {
                  const stageNumber = index + 1;
                  const stageError = errors.shocks[shock.id];
                  const stageErrorId = `multi-shock-stage-${shock.id}-error`;
                  const typeHintId = `multi-shock-stage-${shock.id}-type-hint`;
                  const typeInputId = `multi-shock-stage-${shock.id}-type`;

                  return (
                    <fieldset
                      aria-describedby={
                        stageError?.stage
                          ? `${typeHintId} ${stageErrorId}`
                          : typeHintId
                      }
                      className="rounded-md border border-border-subtle bg-surface-raised p-4 sm:p-6"
                      key={shock.id}
                    >
                      <legend className="sr-only">
                        Shock stage {stageNumber}
                      </legend>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="orbix-label">Sequence element</p>
                          <h4 className="mt-1 text-base font-semibold">
                            Stage {stageNumber}
                          </h4>
                        </div>
                        <Button
                          aria-label={`Remove shock stage ${stageNumber}`}
                          variant="secondary"
                          onClick={() => removeShockStage(shock.id)}
                        >
                          <Trash2 aria-hidden="true" size={15} />
                          Remove
                        </Button>
                      </div>

                      <div className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                          <label
                            className="orbix-field__label block"
                            htmlFor={typeInputId}
                          >
                            Shock type
                          </label>
                          <div className="orbix-field__control mt-2">
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
                              className="orbix-select"
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
                            <ChevronDown
                              aria-hidden="true"
                              className="orbix-field__icon orbix-field__icon--end"
                              size={16}
                            />
                          </div>
                          <p className="orbix-field__help mt-2" id={typeHintId}>
                            The stage receives the downstream Mach from the
                            preceding stage.
                          </p>
                        </div>

                        {shock.type === "oblique" ? (
                          <CalculatorNumberField
                            error={stageError?.deflectionAngleDegrees}
                            field="deflectionAngleDegrees"
                            hint="Positive turning angle that must permit an attached weak shock."
                            idPrefix={`multi-shock-stage-${shock.id}`}
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
                          className="mt-4 border-l-2 border-status-warning pl-3 text-sm leading-6 text-status-warning"
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
              <div className="mt-5 rounded-md border border-dashed border-border-strong p-4">
                <p className="text-sm font-semibold">No shock stages</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Add a normal or oblique shock stage to begin the sequence.
                </p>
              </div>
            )}
          </section>

          <ValidationErrorSummary errors={validationMessages} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-sm leading-6 text-muted">
              Valid sequence changes update cumulative recovery immediately.
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
          eyebrow="Sequential compression"
          icon={Layers}
          id="multi-shock-recovery-result"
          title="Multi-shock recovery"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="multi-shock-overall-title">
                <h4
                  className="text-sm font-semibold text-foreground"
                  id="multi-shock-overall-title"
                >
                  Overall performance
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="orbix-label">Number of shocks</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        {result.numberOfShocks}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Initial Mach</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={outputIds}>
                        {precisionFormatter.format(result.upstreamMach)}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Final Mach</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={outputIds}>
                        {precisionFormatter.format(result.finalMach)}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">
                      Total pressure recovery ratio
                    </dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={outputIds}>
                        {precisionFormatter.format(
                          result.totalPressureRecoveryRatio,
                        )}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Total pressure loss</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={outputIds}>
                        {percentageFormatter.format(
                          result.totalPressureLossPercentage,
                        )}
                        %
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="multi-shock-breakdown-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="text-sm font-semibold text-foreground"
                  id="multi-shock-breakdown-title"
                >
                  Stage breakdown
                </h4>
                <ol className="mt-4 space-y-4">
                  {result.shockResults.map((shock, index) => (
                    <li
                      className="rounded-md border border-border-subtle bg-surface-raised p-4"
                      key={values.shocks[index]?.id ?? index}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold">
                          Stage {index + 1}
                        </p>
                        <Tag>
                          {shock.shockType === "normal" ? "Normal" : "Oblique"}
                        </Tag>
                      </div>
                      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <dt className="orbix-label">Upstream Mach</dt>
                          <dd className="mt-1">
                            <output className="orbix-data" htmlFor={outputIds}>
                              {precisionFormatter.format(shock.upstreamMach)}
                            </output>
                          </dd>
                        </div>
                        <div>
                          <dt className="orbix-label">Downstream Mach</dt>
                          <dd className="mt-1">
                            <output className="orbix-data" htmlFor={outputIds}>
                              {precisionFormatter.format(shock.downstreamMach)}
                            </output>
                          </dd>
                        </div>
                        <div>
                          <dt className="orbix-label">
                            Individual recovery ratio
                          </dt>
                          <dd className="mt-1">
                            <output className="orbix-data" htmlFor={outputIds}>
                              {precisionFormatter.format(
                                shock.pressureRecoveryRatio,
                              )}
                            </output>
                          </dd>
                        </div>
                        <div>
                          <dt className="orbix-label">Cumulative recovery</dt>
                          <dd className="mt-1">
                            <output className="orbix-data" htmlFor={outputIds}>
                              {precisionFormatter.format(
                                shock.cumulativeRecoveryRatio,
                              )}
                            </output>
                          </dd>
                        </div>
                        {shock.shockType === "oblique" ? (
                          <>
                            <div>
                              <dt className="orbix-label">Shock angle β</dt>
                              <dd className="mt-1">
                                <output
                                  className="orbix-data"
                                  htmlFor={outputIds}
                                >
                                  {precisionFormatter.format(
                                    shock.shockAngleDegrees,
                                  )}
                                  °
                                </output>
                              </dd>
                            </div>
                            <div>
                              <dt className="orbix-label">
                                Normal Mach component
                              </dt>
                              <dd className="mt-1">
                                <output
                                  className="orbix-data"
                                  htmlFor={outputIds}
                                >
                                  {precisionFormatter.format(
                                    shock.normalMachComponent,
                                  )}
                                </output>
                              </dd>
                            </div>
                          </>
                        ) : null}
                      </dl>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          ) : (
            <NotCalculated invalid={validationMessages.some(Boolean)}>
              Configure a physically valid ordered shock sequence to restore the
              live recovery analysis.
            </NotCalculated>
          )}
        </CalculatorResultSection>

        <section className="rounded-md border border-border bg-surface p-4 sm:p-6">
          <h3 className="text-sm font-semibold">Staged compression context</h3>
          <div className="mt-3 space-y-2 text-sm leading-6 text-muted">
            <p>
              Multiple weak shocks can reduce total-pressure loss compared with
              one strong normal shock. Supersonic inlets use staged compression
              to distribute the flow turning across successive shocks.
            </p>
            <p>
              Every shock increases entropy and therefore reduces total
              pressure, so cumulative recovery decreases through the sequence.
            </p>
          </div>
        </section>

        <aside className="orbix-lab-note">
          <p className="orbix-lab-note__title">
            <AlertTriangle aria-hidden="true" size={17} />
            Engineering assumptions
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted sm:grid-cols-2">
            <li>Perfect gas approximation</li>
            <li>Constant gamma = 1.4</li>
            <li>Inviscid flow</li>
            <li>Adiabatic flow</li>
            <li>No boundary layer losses</li>
            <li>No heat transfer</li>
            <li>Weak attached oblique shocks only</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
