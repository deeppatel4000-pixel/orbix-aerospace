"use client";

import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Calculator,
  Equal,
  Gauge,
  RotateCcw,
  Scale,
} from "lucide-react";

import {
  calculateThrustToWeightRatio,
  STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED,
  THRUST_TO_WEIGHT_AROUND_ONE_TOLERANCE,
} from "@/features/engineering-lab/calculators";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  ThrustToWeightField,
  ThrustToWeightInputs,
  ThrustToWeightRegime,
  ThrustToWeightResult,
  ThrustToWeightValidationErrors,
} from "@/features/engineering-lab/types";
import {
  hasThrustToWeightValidationErrors,
  validateThrustToWeightInputs,
} from "@/features/engineering-lab/utils";

interface ThrustToWeightFormValues {
  readonly massKg: string;
  readonly thrustNewtons: string;
}

interface Interpretation {
  description: string;
  icon: typeof ArrowDown;
  label: string;
  regime: ThrustToWeightRegime;
  threshold: string;
}

const initialFormValues: ThrustToWeightFormValues = {
  massKg: "10000",
  thrustNewtons: "196133",
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const ratioFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 2,
});

const interpretations: readonly Interpretation[] = [
  {
    description:
      "Weight exceeds thrust, so the vehicle cannot accelerate upward from rest in a vertical model.",
    icon: ArrowDown,
    label: "Below one",
    regime: "below-one",
    threshold: "TWR < 0.95",
  },
  {
    description:
      "Thrust approximately balances weight, leaving little ideal vertical acceleration margin.",
    icon: Equal,
    label: "Around one",
    regime: "around-one",
    threshold: "0.95 ≤ TWR ≤ 1.05",
  },
  {
    description:
      "Thrust exceeds weight, so upward acceleration is possible in the ideal vertical model.",
    icon: ArrowUp,
    label: "Above one",
    regime: "above-one",
    threshold: "TWR > 1.05",
  },
];

function parseFormValues(
  values: ThrustToWeightFormValues,
): ThrustToWeightInputs {
  function parseNumber(value: string) {
    return value.trim() === "" ? Number.NaN : Number(value);
  }

  return {
    massKg: parseNumber(values.massKg),
    thrustNewtons: parseNumber(values.thrustNewtons),
  };
}

export function ThrustToWeightCalculator() {
  const [values, setValues] =
    useState<ThrustToWeightFormValues>(initialFormValues);
  const [errors, setErrors] = useState<ThrustToWeightValidationErrors>({});
  const [result, setResult] = useState<ThrustToWeightResult | null>(null);

  function updateValue(field: ThrustToWeightField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const { [field]: removedError, ...remainingErrors } = current;
      void removedError;
      return remainingErrors;
    });
    setResult(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const inputs = parseFormValues(values);
    const validationErrors = validateThrustToWeightInputs(inputs);

    setErrors(validationErrors);

    if (hasThrustToWeightValidationErrors(validationErrors)) {
      setResult(null);
      return;
    }

    setResult(calculateThrustToWeightRatio(inputs));
  }

  function resetCalculator() {
    setValues(initialFormValues);
    setErrors({});
    setResult(null);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(22rem,1.05fr)] xl:gap-10">
      <div>
        <form noValidate onSubmit={handleSubmit}>
          <div className="grid gap-5">
            <CalculatorNumberField
              error={errors.thrustNewtons}
              field="thrustNewtons"
              hint="Total force produced along the modeled thrust axis."
              idPrefix="thrust-to-weight"
              label="Thrust"
              onChange={updateValue}
              unit="N"
              value={values.thrustNewtons}
            />
            <CalculatorNumberField
              error={errors.massKg}
              field="massKg"
              hint="Total instantaneous vehicle mass at the modeled condition."
              idPrefix="thrust-to-weight"
              label="Mass"
              onChange={updateValue}
              unit="kg"
              value={values.massKg}
            />
          </div>

          <ValidationErrorSummary errors={Object.values(errors)} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-background shadow-[0_12px_40px_rgb(87_215_255/0.18)] transition-colors hover:bg-foreground"
              type="submit"
            >
              <Calculator aria-hidden="true" size={16} />
              Calculate ratio
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent/60 hover:text-accent"
              onClick={resetCalculator}
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
          eyebrow="Force balance"
          icon={Gauge}
          id="thrust-to-weight-result"
          title="Thrust-to-weight ratio"
        >
          {result ? (
            <>
              <output
                className="block font-mono text-4xl font-semibold tracking-[-0.04em] text-accent sm:text-5xl"
                htmlFor="thrust-to-weight-thrustNewtons thrust-to-weight-massKg"
              >
                {ratioFormatter.format(result.thrustToWeightRatio)}
              </output>
              <dl className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted">Classification</dt>
                  <dd className="mt-1 text-sm font-semibold capitalize">
                    {result.regime.replace("-", " ")}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Weight force</dt>
                  <dd className="mt-1 font-mono text-sm font-semibold">
                    {numberFormatter.format(result.weightNewtons)} N
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">—</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Validate the inputs and run the calculation to produce a
                dimensionless thrust-to-weight ratio.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <section
          aria-labelledby="thrust-to-weight-interpretation-title"
          className="rounded-2xl border border-border bg-surface/55 p-5 sm:p-6"
        >
          <p className="orbix-label flex items-center gap-2 text-accent">
            <Scale aria-hidden="true" size={15} />
            Result interpretation
          </p>
          <h3 className="sr-only" id="thrust-to-weight-interpretation-title">
            Thrust-to-weight interpretation bands
          </h3>
          <ul className="mt-4 grid gap-3">
            {interpretations.map((interpretation) => {
              const Icon = interpretation.icon;
              const isActive = result?.regime === interpretation.regime;

              return (
                <li
                  className={
                    "rounded-xl border p-4 transition-colors " +
                    (isActive
                      ? "border-accent/45 bg-accent/8"
                      : "border-border bg-background/30")
                  }
                  key={interpretation.regime}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg " +
                        (isActive
                          ? "bg-accent/15 text-accent"
                          : "bg-surface text-muted")
                      }
                    >
                      <Icon aria-hidden="true" size={16} />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="text-sm font-semibold">
                          {interpretation.label}
                        </p>
                        <p className="font-mono text-[0.65rem] text-muted">
                          {interpretation.threshold}
                        </p>
                        {isActive ? (
                          <span className="font-mono text-[0.6rem] tracking-[0.1em] text-accent uppercase">
                            Current result
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-muted">
                        {interpretation.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-surface/55 p-5 sm:p-6">
          <p className="orbix-label flex items-center gap-2 text-accent">
            <Scale aria-hidden="true" size={15} />
            Equation model
          </p>
          <p
            aria-label="Thrust-to-weight ratio equals thrust divided by mass multiplied by standard gravity"
            className="orbix-lab-equation mt-4"
          >
            TWR = T / (m × g0)
          </p>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-mono text-xs text-accent">T</dt>
              <dd className="mt-1 text-muted">Thrust in newtons</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">m</dt>
              <dd className="mt-1 text-muted">
                Instantaneous mass in kilograms
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">g0</dt>
              <dd className="mt-1 text-muted">
                {STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED} m/s²
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">TWR</dt>
              <dd className="mt-1 text-muted">Dimensionless force ratio</dd>
            </div>
          </dl>
        </section>

        <aside className="orbix-lab-note">
          <p className="orbix-lab-note__title">
            <AlertTriangle aria-hidden="true" size={17} />
            Engineering notes
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-xs leading-5 text-muted">
            <li>
              Standard gravity is fixed at{" "}
              {STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED} m/s²; local
              gravitational acceleration may differ.
            </li>
            <li>
              The model uses instantaneous thrust and mass and excludes drag,
              pressure variation, steering, and transient engine behavior.
            </li>
            <li>
              “Around one” is defined as ±
              {THRUST_TO_WEIGHT_AROUND_ONE_TOLERANCE * 100}% for educational
              interpretation, not as a universal engineering threshold.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
