"use client";

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
  CalculatorResultSection,
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

          <ValidationErrorSummary errors={Object.values(errors)} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-background shadow-[0_12px_40px_rgb(87_215_255/0.18)] transition-colors hover:bg-foreground"
              type="submit"
            >
              <Calculator aria-hidden="true" size={16} />
              Calculate drag
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
          id="drag-equation-result"
          title="Drag force"
        >
          {result ? (
            <output
              className="block font-mono text-4xl font-semibold tracking-[-0.04em] text-accent sm:text-5xl"
              htmlFor="drag-equation-airDensityKilogramsPerCubicMetre drag-equation-velocityMetresPerSecond drag-equation-referenceAreaSquareMetres drag-equation-dragCoefficient"
            >
              {numberFormatter.format(result.dragForceNewtons)} N
            </output>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">— N</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Validate the aerodynamic condition and run the calculation to
                produce a drag-force estimate.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <section className="rounded-2xl border border-border bg-surface/55 p-5 sm:p-6">
          <p className="orbix-label flex items-center gap-2 text-accent">
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
              <dt className="font-mono text-xs text-accent">D</dt>
              <dd className="mt-1 text-muted">Drag force in newtons</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">q</dt>
              <dd className="mt-1 text-muted">Dynamic pressure in pascals</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">S</dt>
              <dd className="mt-1 text-muted">Reference area in m²</dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">CD</dt>
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
          <ul className="mt-4 list-disc space-y-2 pl-5 text-xs leading-5 text-muted">
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
