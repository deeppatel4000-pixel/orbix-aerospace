"use client";

import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Calculator,
  Gauge,
  RotateCcw,
  Sigma,
} from "lucide-react";

import {
  calculateRocketEquation,
  STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED,
} from "@/features/engineering-lab/calculators";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  RocketEquationField,
  RocketEquationInputs,
  RocketEquationResult,
  RocketEquationValidationErrors,
} from "@/features/engineering-lab/types";
import {
  hasRocketEquationValidationErrors,
  validateRocketEquationInputs,
} from "@/features/engineering-lab/utils";

interface RocketEquationFormValues {
  readonly finalMassKg: string;
  readonly initialMassKg: string;
  readonly specificImpulseSeconds: string;
}

const initialFormValues: RocketEquationFormValues = {
  finalMassKg: "100000",
  initialMassKg: "500000",
  specificImpulseSeconds: "350",
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function parseFormValues(
  values: RocketEquationFormValues,
): RocketEquationInputs {
  function parseNumber(value: string) {
    return value.trim() === "" ? Number.NaN : Number(value);
  }

  return {
    finalMassKg: parseNumber(values.finalMassKg),
    initialMassKg: parseNumber(values.initialMassKg),
    specificImpulseSeconds: parseNumber(values.specificImpulseSeconds),
  };
}

export function RocketEquationCalculator() {
  const [values, setValues] =
    useState<RocketEquationFormValues>(initialFormValues);
  const [errors, setErrors] = useState<RocketEquationValidationErrors>({});
  const [result, setResult] = useState<RocketEquationResult | null>(null);

  function updateValue(field: RocketEquationField, value: string) {
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
    const validationErrors = validateRocketEquationInputs(inputs);

    setErrors(validationErrors);

    if (hasRocketEquationValidationErrors(validationErrors)) {
      setResult(null);
      return;
    }

    setResult(calculateRocketEquation(inputs));
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
              error={errors.initialMassKg}
              field="initialMassKg"
              hint="Total vehicle mass before the modeled propellant burn."
              idPrefix="rocket-equation"
              label="Initial mass"
              onChange={updateValue}
              unit="kg"
              value={values.initialMassKg}
            />
            <CalculatorNumberField
              error={errors.finalMassKg}
              field="finalMassKg"
              hint="Vehicle mass after the modeled propellant has been expended."
              idPrefix="rocket-equation"
              label="Final mass"
              onChange={updateValue}
              unit="kg"
              value={values.finalMassKg}
            />
            <CalculatorNumberField
              error={errors.specificImpulseSeconds}
              field="specificImpulseSeconds"
              hint="A measure of propulsion efficiency expressed in seconds."
              idPrefix="rocket-equation"
              label="Specific impulse"
              onChange={updateValue}
              unit="s"
              value={values.specificImpulseSeconds}
            />
          </div>

          <ValidationErrorSummary errors={Object.values(errors)} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-background shadow-[0_12px_40px_rgb(87_215_255/0.18)] transition-colors hover:bg-foreground"
              type="submit"
            >
              <Calculator aria-hidden="true" size={16} />
              Calculate delta-v
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
          eyebrow="Computed performance"
          icon={Gauge}
          id="rocket-equation-result"
          title="Ideal delta-v"
        >
          {result ? (
            <>
              <output
                className="block font-mono text-4xl font-semibold tracking-[-0.04em] text-accent sm:text-5xl"
                htmlFor="rocket-equation-initialMassKg rocket-equation-finalMassKg rocket-equation-specificImpulseSeconds"
              >
                {numberFormatter.format(result.deltaVMetresPerSecond)} m/s
              </output>
              <dl className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted">Mass ratio</dt>
                  <dd className="mt-1 font-mono text-sm font-semibold">
                    {numberFormatter.format(result.massRatio)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">
                    Effective exhaust velocity
                  </dt>
                  <dd className="mt-1 font-mono text-sm font-semibold">
                    {numberFormatter.format(
                      result.effectiveExhaustVelocityMetresPerSecond,
                    )}{" "}
                    m/s
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">— m/s</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Validate the inputs and run the calculation to produce an ideal
                delta-v result.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <section className="rounded-2xl border border-border bg-surface/55 p-5 sm:p-6">
          <p className="orbix-label flex items-center gap-2 text-accent">
            <Sigma aria-hidden="true" size={15} />
            Equation model
          </p>
          <p
            aria-label="Delta v equals specific impulse multiplied by standard gravity multiplied by the natural logarithm of initial mass divided by final mass"
            className="orbix-lab-equation mt-4"
          >
            Δv = Isp × g0 × ln(m0 / mf)
          </p>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-mono text-xs text-accent">Δv</dt>
              <dd className="mt-1 text-muted">Ideal velocity change</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">Isp</dt>
              <dd className="mt-1 text-muted">Specific impulse in seconds</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">g0</dt>
              <dd className="mt-1 text-muted">
                {STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED} m/s²
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">ln</dt>
              <dd className="mt-1 text-muted">Natural logarithm</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">m0</dt>
              <dd className="mt-1 text-muted">Initial vehicle mass</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">mf</dt>
              <dd className="mt-1 text-muted">Final vehicle mass</dd>
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
              This is an ideal, one-dimensional model with constant specific
              impulse.
            </li>
            <li>
              Gravity, aerodynamic drag, steering losses, and finite burn time
              are excluded.
            </li>
            <li>
              Final mass should include dry structure, engines, residual
              propellant, and payload remaining after the burn.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
