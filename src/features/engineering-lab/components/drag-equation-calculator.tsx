"use client";

import { Button } from "@/components/ui";
import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Calculator,
  Gauge,
  MoveRight,
  RotateCcw,
} from "lucide-react";

import { calculateDragEquation } from "@/features/engineering-lab/calculators";
import {
  CalculatorNumberField,
  focusFirstInvalidField,
  CalculatorResultSection,
  NotCalculated,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  DragEquationField,
  DragEquationInputs,
  DragEquationResult,
  DragEquationValidationErrors,
} from "@/features/engineering-lab/types";
import {
  hasDragEquationValidationErrors,
  validateDragEquationInputs,
} from "@/features/engineering-lab/utils";

interface DragEquationFormValues {
  readonly airDensityKilogramsPerCubicMetre: string;
  readonly dragCoefficient: string;
  readonly referenceAreaSquareMetres: string;
  readonly velocityMetresPerSecond: string;
}

const initialFormValues: DragEquationFormValues = {
  airDensityKilogramsPerCubicMetre: "1.225",
  dragCoefficient: "0.03",
  referenceAreaSquareMetres: "20",
  velocityMetresPerSecond: "50",
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function parseFormValues(values: DragEquationFormValues): DragEquationInputs {
  function parseNumber(value: string) {
    return value.trim() === "" ? Number.NaN : Number(value);
  }

  return {
    airDensityKilogramsPerCubicMetre: parseNumber(
      values.airDensityKilogramsPerCubicMetre,
    ),
    dragCoefficient: parseNumber(values.dragCoefficient),
    referenceAreaSquareMetres: parseNumber(values.referenceAreaSquareMetres),
    velocityMetresPerSecond: parseNumber(values.velocityMetresPerSecond),
  };
}

export function DragEquationCalculator() {
  const [values, setValues] =
    useState<DragEquationFormValues>(initialFormValues);
  const [errors, setErrors] = useState<DragEquationValidationErrors>({});
  const [result, setResult] = useState<DragEquationResult | null>(null);

  function updateValue(field: DragEquationField, value: string) {
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
    const validationErrors = validateDragEquationInputs(inputs);

    setErrors(validationErrors);

    if (hasDragEquationValidationErrors(validationErrors)) {
      focusFirstInvalidField(event.currentTarget);
      setResult(null);
      return;
    }

    setResult(calculateDragEquation(inputs));
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
              idPrefix="drag-equation"
              label="Air density"
              onChange={updateValue}
              unit="kg/m³"
              value={values.airDensityKilogramsPerCubicMetre}
            />
            <CalculatorNumberField
              error={errors.velocityMetresPerSecond}
              field="velocityMetresPerSecond"
              hint="Airspeed relative to the surrounding airflow."
              idPrefix="drag-equation"
              label="Velocity"
              onChange={updateValue}
              unit="m/s"
              value={values.velocityMetresPerSecond}
            />
            <CalculatorNumberField
              error={errors.referenceAreaSquareMetres}
              field="referenceAreaSquareMetres"
              hint="Reference area associated with the supplied coefficient."
              idPrefix="drag-equation"
              label="Reference area"
              onChange={updateValue}
              unit="m²"
              value={values.referenceAreaSquareMetres}
            />
            <CalculatorNumberField
              error={errors.dragCoefficient}
              field="dragCoefficient"
              hint="Dimensionless coefficient for the modeled condition."
              idPrefix="drag-equation"
              label="Drag coefficient"
              onChange={updateValue}
              unit="CD"
              value={values.dragCoefficient}
            />
          </div>

          <ValidationErrorSummary errors={errors} idPrefix="drag-equation" />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button variant="primary" type="submit">
              <Calculator aria-hidden="true" size={16} />
              Calculate drag
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
          id="drag-equation-result"
          title="Drag force"
        >
          {result ? (
            <output
              className="orbix-data-lg block"
              htmlFor="drag-equation-airDensityKilogramsPerCubicMetre drag-equation-velocityMetresPerSecond drag-equation-referenceAreaSquareMetres drag-equation-dragCoefficient"
            >
              {numberFormatter.format(result.dragForceNewtons)} N
            </output>
          ) : (
            <NotCalculated invalid={Object.values(errors).some(Boolean)}>
              Validate the aerodynamic condition and run the calculation to
              produce a drag-force estimate.
            </NotCalculated>
          )}
        </CalculatorResultSection>

        <section className="rounded-md border border-border bg-surface p-4 sm:p-6">
          <p className="orbix-label flex items-center gap-2">
            <MoveRight aria-hidden="true" size={15} />
            Equation model
          </p>
          <div className="mt-4 grid gap-3 font-mono text-sm text-foreground sm:grid-cols-2">
            <p
              aria-label="Drag equals dynamic pressure multiplied by reference area multiplied by drag coefficient"
              className="orbix-lab-equation"
            >
              D = q × S × CD
            </p>
            <p
              aria-label="Dynamic pressure equals one half multiplied by air density multiplied by velocity squared"
              className="orbix-lab-equation"
            >
              q = 0.5 × ρ × V²
            </p>
          </div>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="orbix-data text-foreground">D</dt>
              <dd className="mt-1 text-muted">Drag force in newtons</dd>
            </div>
            <div>
              <dt className="orbix-data text-foreground">q</dt>
              <dd className="mt-1 text-muted">Dynamic pressure in pascals</dd>
            </div>
            <div>
              <dt className="orbix-data text-foreground">S</dt>
              <dd className="mt-1 text-muted">Reference area in m²</dd>
            </div>
            <div>
              <dt className="orbix-data text-foreground">CD</dt>
              <dd className="mt-1 text-muted">
                Dimensionless drag coefficient
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
              Reference area and drag coefficient must use the same convention;
              frontal and planform reference areas are not interchangeable.
            </li>
            <li>
              Drag coefficient varies with Reynolds number, Mach number, angle
              of attack, surface condition, and vehicle configuration.
            </li>
            <li>
              This steady-state estimate excludes unsteady and interference
              effects not represented by the supplied coefficient.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
