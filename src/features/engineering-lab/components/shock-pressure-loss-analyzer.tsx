"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Gauge, RotateCcw } from "lucide-react";

import { analyzeShockPressureLoss } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
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
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  const outputIds =
    values.shockType === "normal"
      ? "shock-pressure-loss-altitudeMeters shock-pressure-loss-machNumber"
      : "shock-pressure-loss-altitudeMeters shock-pressure-loss-machNumber shock-pressure-loss-deflectionAngleDegrees";

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] xl:gap-10">
      <div>
        <form noValidate onSubmit={preventSubmission}>
          <fieldset aria-describedby="shock-pressure-loss-mode-hint">
            <legend className="text-sm font-semibold">Shock type</legend>
            <p
              className="mt-2 text-xs leading-5 text-muted"
              id="shock-pressure-loss-mode-hint"
            >
              Select the shock geometry used to evaluate stagnation-pressure
              recovery.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {shockTypeOptions.map((option) => {
                const isSelected = values.shockType === option.value;
                const optionId = "shock-pressure-loss-mode-" + option.value;

                return (
                  <label
                    className={
                      "flex min-h-20 cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors " +
                      (isSelected
                        ? "border-accent/70 bg-accent/8"
                        : "border-border bg-background/45 hover:border-accent/40")
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
                      <span className="mt-1 block text-xs leading-5 text-muted">
                        {option.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
                "Optional reference altitude from 0–" +
                STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES.toLocaleString(
                  "en-US",
                ) +
                " metres. Leave blank to omit."
              }
              idPrefix="shock-pressure-loss"
              label="Altitude (optional)"
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

          <ValidationErrorSummary errors={Object.values(errors)} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-muted">
              Valid inputs update total-pressure recovery immediately.
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
          eyebrow="Stagnation-pressure efficiency"
          icon={Gauge}
          id="shock-pressure-loss-result"
          title="Shock pressure recovery"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="shock-pressure-loss-summary-title">
                <h4
                  className="orbix-label text-accent"
                  id="shock-pressure-loss-summary-title"
                >
                  Shock summary
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Shock type</dt>
                    <dd className="mt-1">
                      <output
                        className="text-sm font-semibold"
                        htmlFor={outputIds}
                      >
                        {result.shockType === "normal"
                          ? "Normal shock"
                          : "Oblique shock"}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Upstream Mach</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={outputIds}
                      >
                        {precisionFormatter.format(result.upstreamMach)}
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              {result.shockType === "normal" ? (
                <section
                  aria-labelledby="normal-pressure-loss-results-title"
                  className="border-t border-border pt-5"
                >
                  <h4
                    className="orbix-label text-accent"
                    id="normal-pressure-loss-results-title"
                  >
                    Normal shock results
                  </h4>
                  <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted">Downstream Mach</dt>
                      <dd className="mt-1">
                        <output
                          className="font-mono text-lg font-semibold text-accent"
                          htmlFor={outputIds}
                        >
                          {precisionFormatter.format(result.downstreamMach)}
                        </output>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">
                        Total pressure recovery ratio
                      </dt>
                      <dd className="mt-1">
                        <output
                          className="font-mono text-lg font-semibold text-accent"
                          htmlFor={outputIds}
                        >
                          {precisionFormatter.format(
                            result.pressureRecoveryRatio,
                          )}
                        </output>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">
                        Total pressure loss
                      </dt>
                      <dd className="mt-1">
                        <output
                          className="font-mono text-lg font-semibold text-accent"
                          htmlFor={outputIds}
                        >
                          {percentageFormatter.format(
                            result.pressureLossPercentage,
                          )}
                          %
                        </output>
                      </dd>
                    </div>
                  </dl>
                </section>
              ) : (
                <>
                  <section
                    aria-labelledby="oblique-pressure-loss-geometry-title"
                    className="border-t border-border pt-5"
                  >
                    <h4
                      className="orbix-label text-accent"
                      id="oblique-pressure-loss-geometry-title"
                    >
                      Geometry
                    </h4>
                    <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                      <div>
                        <dt className="text-xs text-muted">Shock angle β</dt>
                        <dd className="mt-1">
                          <output
                            className="font-mono text-sm font-semibold"
                            htmlFor={outputIds}
                          >
                            {precisionFormatter.format(
                              result.shockAngleDegrees,
                            )}
                            °
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">
                          Deflection angle θ
                        </dt>
                        <dd className="mt-1">
                          <output
                            className="font-mono text-sm font-semibold"
                            htmlFor={outputIds}
                          >
                            {precisionFormatter.format(
                              Number(values.deflectionAngleDegrees),
                            )}
                            °
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">
                          Normal Mach component
                        </dt>
                        <dd className="mt-1">
                          <output
                            className="font-mono text-sm font-semibold"
                            htmlFor={outputIds}
                          >
                            {precisionFormatter.format(
                              result.normalMachComponent,
                            )}
                          </output>
                        </dd>
                      </div>
                    </dl>
                  </section>

                  <section
                    aria-labelledby="oblique-pressure-loss-results-title"
                    className="border-t border-border pt-5"
                  >
                    <h4
                      className="orbix-label text-accent"
                      id="oblique-pressure-loss-results-title"
                    >
                      Flow results
                    </h4>
                    <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-muted">Downstream Mach</dt>
                        <dd className="mt-1">
                          <output
                            className="font-mono text-lg font-semibold text-accent"
                            htmlFor={outputIds}
                          >
                            {precisionFormatter.format(result.downstreamMach)}
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">
                          Total pressure recovery ratio
                        </dt>
                        <dd className="mt-1">
                          <output
                            className="font-mono text-lg font-semibold text-accent"
                            htmlFor={outputIds}
                          >
                            {precisionFormatter.format(
                              result.pressureRecoveryRatio,
                            )}
                          </output>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted">
                          Total pressure loss
                        </dt>
                        <dd className="mt-1">
                          <output
                            className="font-mono text-lg font-semibold text-accent"
                            htmlFor={outputIds}
                          >
                            {percentageFormatter.format(
                              result.pressureLossPercentage,
                            )}
                            %
                          </output>
                        </dd>
                      </div>
                    </dl>
                  </section>
                </>
              )}
            </div>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">—</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Enter valid shock inputs to restore the live pressure-recovery
                analysis.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <section className="rounded-2xl border border-accent/20 bg-accent/5 p-5 sm:p-6">
          <h3 className="text-sm font-semibold">Pressure-loss context</h3>
          <p className="mt-3 text-xs leading-5 text-muted">
            Oblique shocks generally produce lower total-pressure losses than
            normal shocks at the same upstream Mach because only the velocity
            component normal to the shock is compressed. Loss increases rapidly
            with stronger shocks.
          </p>
        </section>

        <aside className="orbix-lab-note">
          <p className="orbix-lab-note__title">
            <AlertTriangle aria-hidden="true" size={17} />
            Engineering assumptions
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-xs leading-5 text-muted sm:grid-cols-2">
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
  );
}
