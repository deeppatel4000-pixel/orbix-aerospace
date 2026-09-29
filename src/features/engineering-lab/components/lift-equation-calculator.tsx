"use client";

import { Button, EquationBlock } from "@/components/ui";
import { useState, type FormEvent } from "react";

import { calculateLiftEquation } from "@/features/engineering-lab/calculators";
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

const toolEquation = (
  <EquationBlock
    equation={
      <>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            L = ½<EqDot />ρ<EqDot />V<sup className={EQ_SUP}>2</sup>
          </span>
          <wbr />
          <span className={EQ_TERM}>
            <EqDot />S<EqDot />C<sub>L</sub>
          </span>
        </span>
      </>
    }
    label="Steady lift force"
    spokenAs="Lift equals one half times rho times V squared times S times C L."
    variables={[
      { symbol: "L", meaning: "Lift force", unit: "N" },
      { symbol: "ρ", meaning: "Air density", unit: "kg/m³" },
      { symbol: "V", meaning: "Airspeed", unit: "m/s" },
      { symbol: "S", meaning: "Reference wing area", unit: "m²" },
      {
        symbol: (
          <>
            C<sub>L</sub>
          </>
        ),
        meaning: "Lift coefficient, dimensionless",
      },
    ]}
  />
);

/**
 * The result for the default inputs, shown on first load so the tool never
 * opens on an empty panel. The same calculation the form runs.
 */
const initialResult = calculateLiftEquation(parseFormValues(initialFormValues));

export function LiftEquationCalculator() {
  const [values, setValues] =
    useState<LiftEquationFormValues>(initialFormValues);
  const [errors, setErrors] = useState<LiftEquationValidationErrors>({});
  const [result, setResult] = useState<LiftEquationResult | null>(
    initialResult,
  );
  const [stale, setStale] = useState(false);

  function updateValue(field: LiftEquationField, value: string) {
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

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                className="whitespace-nowrap"
                variant="primary"
                type="submit"
              >
                Calculate lift
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
            id="lift-equation-result"
            stale={stale && result !== null}
            title="Lift at these conditions"
          >
            {result ? (
              <ReadoutGrid columns={1}>
                <div>
                  <dt className="orbix-label">Lift force</dt>
                  <dd>
                    <output
                      className="orbix-readout-lg"
                      htmlFor="lift-equation-airDensityKilogramsPerCubicMetre lift-equation-velocityMetresPerSecond lift-equation-wingAreaSquareMetres lift-equation-liftCoefficient"
                    >
                      <LabFigure unit="N">
                        {numberFormatter.format(result.liftForceNewtons)}
                      </LabFigure>
                    </output>
                  </dd>
                </div>
              </ReadoutGrid>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Validate the aerodynamic condition and run the calculation to
                produce a lift-force estimate.
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
                Air density, velocity, wing area, and lift coefficient must
                refer to the same flight condition and reference convention.
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
    </LabToolLayout>
  );
}
