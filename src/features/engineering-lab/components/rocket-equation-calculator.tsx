"use client";

import { Button, EquationBlock } from "@/components/ui";
import { useState, type FormEvent } from "react";

import {
  calculateRocketEquation,
  STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED,
} from "@/features/engineering-lab/calculators";
import {
  EQ_LINE,
  EQ_TERM,
  CalculatorNumberField,
  focusFirstInvalidField,
  CalculatorResultSection,
  LAB_TOOL_SPLIT_STICKY,
  LabToolLayout,
  NotCalculated,
  ReadoutGrid,
  ValidationErrorSummary,
  LabFigure,
  EqDot,
  EQ_SUB_CLEAR,
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

// `lab-equation--one-line`: the rocket equation is the lab's signature
// relation and stays on one line down to 320px, where 20px is about 20px
// too wide for its block, so it may step down to 17px there.
const toolEquation = (
  <EquationBlock
    className="lab-equation--one-line"
    equation={
      <>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            Δv = I<sub>sp</sub>
            <EqDot />g<sub className={EQ_SUB_CLEAR}>0</sub>
          </span>
          <wbr />
          <span className={EQ_TERM}>
            <EqDot />
            ln(m<sub>0</sub>/m<sub>f</sub>)
          </span>
        </span>
      </>
    }
    label="Ideal velocity change"
    spokenAs="Delta v equals I s p times g zero times the natural log of m zero over m f."
    variables={[
      { symbol: "Δv", meaning: "Ideal velocity change", unit: "m/s" },
      {
        symbol: (
          <>
            I<sub>sp</sub>
          </>
        ),
        meaning: "Specific impulse",
        unit: "s",
      },
      {
        symbol: (
          <>
            g<sub className={EQ_SUB_CLEAR}>0</sub>
          </>
        ),
        meaning: (
          <>Standard gravity, {STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED}</>
        ),
        unit: "m/s²",
      },
      {
        symbol: (
          <>
            m<sub>0</sub>
          </>
        ),
        meaning: "Initial vehicle mass",
        unit: "kg",
      },
      {
        symbol: (
          <>
            m<sub>f</sub>
          </>
        ),
        meaning: "Final vehicle mass",
        unit: "kg",
      },
    ]}
  />
);

/**
 * The result for the default inputs, shown on first load so the tool never
 * opens on an empty panel. The same calculation the form runs.
 */
const initialResult = calculateRocketEquation(
  parseFormValues(initialFormValues),
);

export function RocketEquationCalculator() {
  const [values, setValues] =
    useState<RocketEquationFormValues>(initialFormValues);
  const [errors, setErrors] = useState<RocketEquationValidationErrors>({});
  const [result, setResult] = useState<RocketEquationResult | null>(
    initialResult,
  );
  const [stale, setStale] = useState(false);

  function updateValue(field: RocketEquationField, value: string) {
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
    const validationErrors = validateRocketEquationInputs(inputs);

    setErrors(validationErrors);

    if (hasRocketEquationValidationErrors(validationErrors)) {
      focusFirstInvalidField(event.currentTarget);
      setResult(null);
      return;
    }

    setResult(calculateRocketEquation(inputs));
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

            <ValidationErrorSummary
              errors={errors}
              idPrefix="rocket-equation"
            />

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                className="whitespace-nowrap"
                variant="primary"
                type="submit"
              >
                Calculate delta-v
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
            id="rocket-equation-result"
            stale={stale && result !== null}
            title="Ideal burn"
          >
            {result ? (
              <ReadoutGrid>
                <div>
                  <dt className="orbix-label">Delta-v</dt>
                  <dd>
                    <output
                      className="orbix-readout-lg"
                      htmlFor="rocket-equation-initialMassKg rocket-equation-finalMassKg rocket-equation-specificImpulseSeconds"
                    >
                      <LabFigure unit="m/s">
                        {numberFormatter.format(result.deltaVMetresPerSecond)}
                      </LabFigure>
                    </output>
                  </dd>
                </div>
                <div>
                  <dt className="orbix-label">Mass ratio</dt>
                  <dd className="orbix-data mt-1">
                    <LabFigure>
                      {numberFormatter.format(result.massRatio)}
                    </LabFigure>
                  </dd>
                </div>
                <div>
                  <dt className="orbix-label">Effective exhaust velocity</dt>
                  <dd className="orbix-data mt-1">
                    <LabFigure unit="m/s">
                      {numberFormatter.format(
                        result.effectiveExhaustVelocityMetresPerSecond,
                      )}
                    </LabFigure>
                  </dd>
                </div>
              </ReadoutGrid>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Validate the inputs and run the calculation to produce an ideal
                delta-v result.
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
    </LabToolLayout>
  );
}
