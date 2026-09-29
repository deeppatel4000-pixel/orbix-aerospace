"use client";

import { Button, EquationBlock, formatFigure, Tag } from "@/components/ui";
import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Equal } from "lucide-react";

import {
  calculateThrustToWeightRatio,
  STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED,
  THRUST_TO_WEIGHT_AROUND_ONE_TOLERANCE,
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
  toSentenceCase,
  ValidationErrorSummary,
  LabFigure,
  LabValueText,
  EqDot,
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

const toolEquation = (
  <EquationBlock
    equation={
      <>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>TWR = T</span>
          <wbr />
          <span className={EQ_TERM}>
            /(m
            <EqDot />g<sub>0</sub>)
          </span>
        </span>
      </>
    }
    label="Force ratio at standard gravity"
    spokenAs="Thrust-to-weight ratio equals thrust over mass times g zero."
    variables={[
      { symbol: "T", meaning: "Thrust", unit: "N" },
      { symbol: "m", meaning: "Instantaneous vehicle mass", unit: "kg" },
      {
        symbol: (
          <>
            g<sub>0</sub>
          </>
        ),
        meaning: (
          <>Standard gravity, {STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED}</>
        ),
        unit: "m/s²",
      },
      { symbol: "TWR", meaning: "Thrust-to-weight ratio, dimensionless" },
    ]}
  />
);

/**
 * The result for the default inputs, shown on first load so the tool never
 * opens on an empty panel. The same calculation the form runs.
 */
const initialResult = calculateThrustToWeightRatio(
  parseFormValues(initialFormValues),
);

export function ThrustToWeightCalculator() {
  const [values, setValues] =
    useState<ThrustToWeightFormValues>(initialFormValues);
  const [errors, setErrors] = useState<ThrustToWeightValidationErrors>({});
  const [result, setResult] = useState<ThrustToWeightResult | null>(
    initialResult,
  );
  const [stale, setStale] = useState(false);

  function updateValue(field: ThrustToWeightField, value: string) {
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
    const validationErrors = validateThrustToWeightInputs(inputs);

    setErrors(validationErrors);

    if (hasThrustToWeightValidationErrors(validationErrors)) {
      focusFirstInvalidField(event.currentTarget);
      setResult(null);
      return;
    }

    setResult(calculateThrustToWeightRatio(inputs));
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

            <ValidationErrorSummary
              errors={errors}
              idPrefix="thrust-to-weight"
            />

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                className="whitespace-nowrap"
                variant="primary"
                type="submit"
              >
                Calculate ratio
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
            id="thrust-to-weight-result"
            stale={stale && result !== null}
            title="Thrust against weight"
          >
            {result ? (
              <ReadoutGrid columns={2}>
                <div>
                  <dt className="orbix-label">Thrust-to-weight ratio</dt>
                  <dd>
                    <output
                      className="orbix-readout-lg"
                      htmlFor="thrust-to-weight-thrustNewtons thrust-to-weight-massKg"
                    >
                      <LabFigure>
                        {ratioFormatter.format(result.thrustToWeightRatio)}
                      </LabFigure>
                    </output>
                  </dd>
                </div>
                <div>
                  <dt className="orbix-label">Weight force</dt>
                  <dd className="orbix-data">
                    <LabFigure unit="N">
                      {numberFormatter.format(result.weightNewtons)}
                    </LabFigure>
                  </dd>
                </div>
                <div>
                  <dt className="orbix-label">Classification</dt>
                  <dd>
                    <LabValueText>
                      {toSentenceCase(result.regime.replace("-", " "))}
                    </LabValueText>
                  </dd>
                </div>
              </ReadoutGrid>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Validate the inputs and run the calculation to produce a
                dimensionless thrust-to-weight ratio.
              </NotCalculated>
            )}
          </CalculatorResultSection>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <section
            aria-labelledby="thrust-to-weight-interpretation-title"
            className="border-t border-border pt-3"
          >
            <h3
              className="text-sm font-medium text-foreground"
              id="thrust-to-weight-interpretation-title"
            >
              Result interpretation
            </h3>
            <ul className="mt-4 border-t border-border">
              {interpretations.map((interpretation) => {
                const Icon = interpretation.icon;
                const isActive = result?.regime === interpretation.regime;

                return (
                  <li
                    className={
                      "border-b border-border px-3 py-4 transition-colors " +
                      (isActive ? "bg-surface-raised" : "")
                    }
                    key={interpretation.regime}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        aria-hidden="true"
                        className={
                          "mt-0.5 shrink-0 " +
                          (isActive ? "text-foreground" : "text-muted")
                        }
                        size={16}
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <p className="text-sm font-semibold">
                            {interpretation.label}
                          </p>
                          <p className="orbix-data text-muted">
                            {formatFigure(<>{interpretation.threshold}</>)}
                          </p>
                          {isActive ? <Tag>Current result</Tag> : null}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-muted">
                          {interpretation.description}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Engineering notes
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
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
    </LabToolLayout>
  );
}
