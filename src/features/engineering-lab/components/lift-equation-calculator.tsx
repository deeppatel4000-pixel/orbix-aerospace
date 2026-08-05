"use client";

import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Calculator,
  Gauge,
  RotateCcw,
  Wind,
} from "lucide-react";

import { calculateLiftEquation } from "@/features/engineering-lab/calculators";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  LiftEquationField,
  LiftEquationInputs,
  LiftEquationResult,
  LiftEquationValidationErrors,
} from "@/features/engineering-lab/types";
import {
  hasLiftEquationValidationErrors,
  validateLiftEquationInputs,
} from "@/features/engineering-lab/utils";

interface LiftEquationFormValues {
  readonly airDensityKilogramsPerCubicMetre: string;
  readonly liftCoefficient: string;
  readonly velocityMetresPerSecond: string;
  readonly wingAreaSquareMetres: string;
}

const initialFormValues: LiftEquationFormValues = {
  airDensityKilogramsPerCubicMetre: "1.225",
  liftCoefficient: "0.8",
  velocityMetresPerSecond: "50",
  wingAreaSquareMetres: "20",
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function parseFormValues(values: LiftEquationFormValues): LiftEquationInputs {
  function parseNumber(value: string) {
    return value.trim() === "" ? Number.NaN : Number(value);
  }

  return {
    airDensityKilogramsPerCubicMetre: parseNumber(
      values.airDensityKilogramsPerCubicMetre,
    ),
    liftCoefficient: parseNumber(values.liftCoefficient),
    velocityMetresPerSecond: parseNumber(values.velocityMetresPerSecond),
    wingAreaSquareMetres: parseNumber(values.wingAreaSquareMetres),
  };
}

export function LiftEquationCalculator() {
  const [values, setValues] =
    useState<LiftEquationFormValues>(initialFormValues);
  const [errors, setErrors] = useState<LiftEquationValidationErrors>({});
  const [result, setResult] = useState<LiftEquationResult | null>(null);

  function updateValue(field: LiftEquationField, value: string) {
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
    const validationErrors = validateLiftEquationInputs(inputs);

    setErrors(validationErrors);

    if (hasLiftEquationValidationErrors(validationErrors)) {
      setResult(null);
      return;
    }

    setResult(calculateLiftEquation(inputs));
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
          <div className="grid gap-5 sm:grid-cols-2">
            <CalculatorNumberField
              error={errors.airDensityKilogramsPerCubicMetre}
              field="airDensityKilogramsPerCubicMetre"
              hint="Local atmospheric mass per unit volume."
              idPrefix="lift-equation"
              label="Air density"
              onChange={updateValue}
              unit="kg/m³"
              value={values.airDensityKilogramsPerCubicMetre}
            />
            <CalculatorNumberField
              error={errors.velocityMetresPerSecond}
              field="velocityMetresPerSecond"
              hint="Airspeed relative to the surrounding airflow."
              idPrefix="lift-equation"
              label="Velocity"
              onChange={updateValue}
              unit="m/s"
              value={values.velocityMetresPerSecond}
            />
            <CalculatorNumberField
              error={errors.wingAreaSquareMetres}
              field="wingAreaSquareMetres"
              hint="Reference planform area used for the coefficient."
              idPrefix="lift-equation"
              label="Wing area"
              onChange={updateValue}
              unit="m²"
              value={values.wingAreaSquareMetres}
            />
            <CalculatorNumberField
              error={errors.liftCoefficient}
              field="liftCoefficient"
              hint="Dimensionless coefficient for the modeled condition."
              idPrefix="lift-equation"
              label="Lift coefficient"
              onChange={updateValue}
              unit="CL"
              value={values.liftCoefficient}
            />
          </div>

          <ValidationErrorSummary errors={Object.values(errors)} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-background shadow-[0_12px_40px_rgb(87_215_255/0.18)] transition-colors hover:bg-foreground"
              type="submit"
            >
              <Calculator aria-hidden="true" size={16} />
              Calculate lift
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
          eyebrow="Computed aerodynamic force"
          icon={Gauge}
          id="lift-equation-result"
          title="Lift force"
        >
          {result ? (
            <output
              className="block font-mono text-4xl font-semibold tracking-[-0.04em] text-accent sm:text-5xl"
              htmlFor="lift-equation-airDensityKilogramsPerCubicMetre lift-equation-velocityMetresPerSecond lift-equation-wingAreaSquareMetres lift-equation-liftCoefficient"
            >
              {numberFormatter.format(result.liftForceNewtons)} N
            </output>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">— N</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Validate the aerodynamic condition and run the calculation to
                produce a lift-force estimate.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <section className="rounded-2xl border border-border bg-surface/55 p-5 sm:p-6">
          <p className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase">
            <Wind aria-hidden="true" size={15} />
            Equation model
          </p>
          <p
            aria-label="Lift equals one half multiplied by air density multiplied by velocity squared multiplied by wing area multiplied by lift coefficient"
            className="mt-4 overflow-x-auto rounded-xl border border-border bg-background/45 px-4 py-4 font-mono text-sm text-foreground"
          >
            L = 0.5 × ρ × V² × S × CL
          </p>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-mono text-xs text-accent">L</dt>
              <dd className="mt-1 text-muted">Lift force in newtons</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">ρ</dt>
              <dd className="mt-1 text-muted">Air density in kg/m³</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">V</dt>
              <dd className="mt-1 text-muted">Velocity in m/s</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">S</dt>
              <dd className="mt-1 text-muted">Reference wing area in m²</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">CL</dt>
              <dd className="mt-1 text-muted">
                Dimensionless lift coefficient
              </dd>
            </div>
          </dl>
        </section>

        <aside className="rounded-2xl border border-signal/25 bg-signal/6 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-signal">
            <AlertTriangle aria-hidden="true" size={17} />
            Engineering notes
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-xs leading-5 text-muted">
            <li>
              Air density, velocity, wing area, and lift coefficient must refer
              to the same flight condition and reference convention.
            </li>
            <li>
              Lift coefficient varies with angle of attack, airfoil geometry,
              Reynolds number, Mach number, and configuration.
            </li>
            <li>
              This steady-state estimate excludes unsteady, compressibility,
              interference, and three-dimensional flow effects not represented
              by the supplied coefficient.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
