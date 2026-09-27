"use client";

import { Button } from "@/components/ui";
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
  focusFirstInvalidField,
  CalculatorResultSection,
  NotCalculated,
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
      focusFirstInvalidField(event.currentTarget);
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
              unit=""
              value={values.liftCoefficient}
            />
          </div>

          <ValidationErrorSummary errors={errors} idPrefix="lift-equation" />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" type="submit">
              <Calculator aria-hidden="true" size={16} />
              Calculate lift
            </Button>
            <Button variant="secondary" onClick={resetCalculator}>
              <RotateCcw aria-hidden="true" size={16} />
              Reset inputs
            </Button>
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
              className="orbix-data-lg block"
              htmlFor="lift-equation-airDensityKilogramsPerCubicMetre lift-equation-velocityMetresPerSecond lift-equation-wingAreaSquareMetres lift-equation-liftCoefficient"
            >
              {numberFormatter.format(result.liftForceNewtons)} N
            </output>
          ) : (
            <NotCalculated invalid={Object.values(errors).some(Boolean)}>
              Validate the aerodynamic condition and run the calculation to
              produce a lift-force estimate.
            </NotCalculated>
          )}
        </CalculatorResultSection>

        <section className="rounded-md border border-border bg-surface p-4 sm:p-6">
          <p className="orbix-label flex items-center gap-2">
            <Wind aria-hidden="true" size={15} />
            Equation model
          </p>
          <p
            aria-label="Lift equals one half multiplied by air density multiplied by velocity squared multiplied by wing area multiplied by lift coefficient"
            className="orbix-lab-equation mt-4"
          >
            L = 0.5 × ρ × V² × S × CL
          </p>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="orbix-data text-foreground">L</dt>
              <dd className="mt-1 text-muted">Lift force in newtons</dd>
            </div>
            <div>
              <dt className="orbix-data text-foreground">ρ</dt>
              <dd className="mt-1 text-muted">Air density in kg/m³</dd>
            </div>
            <div>
              <dt className="orbix-data text-foreground">V</dt>
              <dd className="mt-1 text-muted">Velocity in m/s</dd>
            </div>
            <div>
              <dt className="orbix-data text-foreground">S</dt>
              <dd className="mt-1 text-muted">Reference wing area in m²</dd>
            </div>
            <div>
              <dt className="orbix-data text-foreground">CL</dt>
              <dd className="mt-1 text-muted">
                Dimensionless lift coefficient
              </dd>
            </div>
          </dl>
        </section>

        <aside className="orbix-lab-note">
          <p className="orbix-lab-note__title">
            <AlertTriangle aria-hidden="true" size={17} />
            Engineering notes
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
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
