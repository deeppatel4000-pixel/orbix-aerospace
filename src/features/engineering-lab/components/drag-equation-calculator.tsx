"use client";

import { Button, EquationBlock } from "@/components/ui";
import { useState, type FormEvent } from "react";

import { calculateDragEquation } from "@/features/engineering-lab/calculators";
import {
  EQ_LINE,
  EQ_TERM,
  CalculatorNumberField,
  focusFirstInvalidField,
  CalculatorResultSection,
  LAB_TOOL_SPLIT_STICKY,
  LabToolLayout,
  NotCalculated,
  ValidationErrorSummary,
  LabFigure,
  ReadoutGrid,
  EqDot,
  EQ_SUP,
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

const toolEquation = (
  <EquationBlock
    equation={
      <>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            D = q<EqDot />S<EqDot />C<sub>D</sub>
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            q = ½<EqDot />ρ<EqDot />V<sup className={EQ_SUP}>2</sup>
          </span>
        </span>
      </>
    }
    label="Steady drag force"
    spokenAs="Drag equals q times S times C D, where dynamic pressure q equals one half rho V squared."
    variables={[
      { symbol: "D", meaning: "Drag force", unit: "N" },
      { symbol: "q", meaning: "Dynamic pressure", unit: "Pa" },
      { symbol: "ρ", meaning: "Air density", unit: "kg/m³" },
      { symbol: "V", meaning: "Airspeed", unit: "m/s" },
      { symbol: "S", meaning: "Reference area", unit: "m²" },
      {
        symbol: (
          <>
            C<sub>D</sub>
          </>
        ),
        meaning: "Drag coefficient, dimensionless",
      },
    ]}
  />
);

/**
 * The result for the default inputs, shown on first load so the tool never
 * opens on an empty panel. The same calculation the form runs.
 */
const initialResult = calculateDragEquation(parseFormValues(initialFormValues));

export function DragEquationCalculator() {
  const [values, setValues] =
    useState<DragEquationFormValues>(initialFormValues);
  const [errors, setErrors] = useState<DragEquationValidationErrors>({});
  const [result, setResult] = useState<DragEquationResult | null>(
    initialResult,
  );
  const [stale, setStale] = useState(false);

  function updateValue(field: DragEquationField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const { [field]: removedError, ...remainingErrors } = current;
      void removedError;
      return remainingErrors;
    });
    setStale(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStale(false);

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
    setStale(false);
    setValues(initialFormValues);
    setErrors({});
    setResult(initialResult);
  }

  return (
    <LabToolLayout equation={toolEquation}>
      <div className={LAB_TOOL_SPLIT_STICKY}>
        <div className="@container/col min-w-0">
          <form noValidate onSubmit={handleSubmit}>
            <div className="grid gap-5 @min-[36rem]/col:grid-cols-2">
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
                unit=""
                value={values.dragCoefficient}
              />
            </div>

            <ValidationErrorSummary errors={errors} idPrefix="drag-equation" />

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                className="whitespace-nowrap"
                variant="primary"
                type="submit"
              >
                Calculate drag
              </Button>
              <Button
                className="whitespace-nowrap"
                variant="secondary"
                onClick={resetCalculator}
              >
                Reset inputs
              </Button>
            </div>
          </form>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <CalculatorResultSection
            id="drag-equation-result"
            stale={stale && result !== null}
            title="Drag at these conditions"
          >
            {result ? (
              <ReadoutGrid columns={1}>
                <div>
                  <dt className="orbix-label">Drag force</dt>
                  <dd>
                    <output
                      className="orbix-readout-lg"
                      htmlFor="drag-equation-airDensityKilogramsPerCubicMetre drag-equation-velocityMetresPerSecond drag-equation-referenceAreaSquareMetres drag-equation-dragCoefficient"
                    >
                      <LabFigure unit="N">
                        {numberFormatter.format(result.dragForceNewtons)}
                      </LabFigure>
                    </output>
                  </dd>
                </div>
              </ReadoutGrid>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Validate the aerodynamic condition and run the calculation to
                produce a drag-force estimate.
              </NotCalculated>
            )}
          </CalculatorResultSection>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Engineering notes
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
              <li>
                Reference area and drag coefficient must use the same
                convention; frontal and planform reference areas are not
                interchangeable.
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
    </LabToolLayout>
  );
}
