"use client";

import { Button, EquationBlock, formatFigure } from "@/components/ui";
import { useState, type FormEvent } from "react";

import { analyzeFlightCondition } from "@/features/engineering-lab/analysis";
import {
  EQ_LINE,
  EQ_TERM,
  CalculatorNumberField,
  focusFirstInvalidField,
  GEOPOTENTIAL_ALTITUDE_HINT,
  GEOPOTENTIAL_ALTITUDE_LABEL,
  CalculatorResultSection,
  LAB_TOOL_SPLIT,
  LabToolLayout,
  NotCalculated,
  ReadoutGrid,
  toSentenceCase,
  ValidationErrorSummary,
  LabFigure,
  LabValueText,
  EqDot,
  EqFrac,
  EQ_SUP,
} from "@/features/engineering-lab/components/shared";
import type {
  FlightConditionAnalysis,
  FlightConditionField,
  FlightConditionInputs,
  FlightConditionValidationErrors,
} from "@/features/engineering-lab/types";
import {
  hasFlightConditionValidationErrors,
  validateFlightConditionInputs,
} from "@/features/engineering-lab/utils";

interface FlightConditionFormValues {
  readonly altitudeMetres: string;
  readonly dragCoefficient: string;
  readonly liftCoefficient: string;
  readonly velocityMetresPerSecond: string;
  readonly wingAreaSquareMetres: string;
}

const initialFormValues: FlightConditionFormValues = {
  altitudeMetres: "5000",
  dragCoefficient: "0.03",
  liftCoefficient: "0.8",
  velocityMetresPerSecond: "100",
  wingAreaSquareMetres: "20",
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const densityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 5,
  minimumFractionDigits: 5,
});

const ratioFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function parseFormValues(
  values: FlightConditionFormValues,
): FlightConditionInputs {
  function parseNumber(value: string) {
    return value.trim() === "" ? Number.NaN : Number(value);
  }

  return {
    altitudeMetres: parseNumber(values.altitudeMetres),
    dragCoefficient: parseNumber(values.dragCoefficient),
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
            M = <EqFrac den="a" num="V" />
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            q = ½<EqDot />ρ<EqDot />V<sup className={EQ_SUP}>2</sup>
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            L = q<EqDot />S<EqDot />C<sub>L</sub>
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            D = q<EqDot />S<EqDot />C<sub>D</sub>
          </span>
        </span>
      </>
    }
    label="Flight condition"
    spokenAs="Mach number M equals V over a. Dynamic pressure q equals one half rho V squared. Lift L equals q S C L and drag D equals q S C D."
    variables={[
      {
        symbol: "a",
        meaning:
          "Speed of sound from the standard troposphere at geopotential altitude",
        unit: "m/s",
      },
      {
        symbol: "ρ",
        meaning:
          "Air density from the standard troposphere at geopotential altitude",
        unit: "kg/m³",
      },
      { symbol: "V", meaning: "Airspeed", unit: "m/s" },
      { symbol: "S", meaning: "Reference wing area", unit: "m²" },
      {
        symbol: (
          <>
            C<sub>L</sub>, C<sub>D</sub>
          </>
        ),
        meaning: "Lift and drag coefficients, dimensionless",
      },
    ]}
  />
);

/**
 * The result for the default inputs, shown on first load so the tool never
 * opens on an empty panel. The same calculation the form runs.
 */
const initialResult = analyzeFlightCondition(
  parseFormValues(initialFormValues),
);

export function FlightConditionAnalyzer() {
  const [values, setValues] =
    useState<FlightConditionFormValues>(initialFormValues);
  const [errors, setErrors] = useState<FlightConditionValidationErrors>({});
  const [result, setResult] = useState<FlightConditionAnalysis | null>(
    initialResult,
  );
  const [stale, setStale] = useState(false);

  function updateValue(field: FlightConditionField, value: string) {
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
    const validationErrors = validateFlightConditionInputs(inputs);

    setErrors(validationErrors);

    if (hasFlightConditionValidationErrors(validationErrors)) {
      focusFirstInvalidField(event.currentTarget);
      setResult(null);
      return;
    }

    setResult(analyzeFlightCondition(inputs));
  }

  function resetAnalyzer() {
    setStale(false);
    setValues(initialFormValues);
    setErrors({});
    setResult(initialResult);
  }

  return (
    <LabToolLayout equation={toolEquation}>
      <div className={LAB_TOOL_SPLIT}>
        <div className="@container/col min-w-0">
          <form noValidate onSubmit={handleSubmit}>
            <div className="grid gap-5 @min-[36rem]/col:grid-cols-2">
              <CalculatorNumberField
                error={errors.altitudeMetres}
                field="altitudeMetres"
                hint={GEOPOTENTIAL_ALTITUDE_HINT}
                idPrefix="flight-condition"
                label={GEOPOTENTIAL_ALTITUDE_LABEL}
                onChange={updateValue}
                unit="m"
                value={values.altitudeMetres}
              />
              <CalculatorNumberField
                error={errors.velocityMetresPerSecond}
                field="velocityMetresPerSecond"
                hint="Airspeed relative to the modeled atmosphere."
                idPrefix="flight-condition"
                label="Velocity"
                onChange={updateValue}
                unit="m/s"
                value={values.velocityMetresPerSecond}
              />
              <CalculatorNumberField
                error={errors.wingAreaSquareMetres}
                field="wingAreaSquareMetres"
                hint="Common reference area for both aerodynamic coefficients."
                idPrefix="flight-condition"
                label="Wing area"
                onChange={updateValue}
                unit="m²"
                value={values.wingAreaSquareMetres}
              />
              <CalculatorNumberField
                error={errors.liftCoefficient}
                field="liftCoefficient"
                hint="Dimensionless lift coefficient for this flight condition."
                idPrefix="flight-condition"
                label="Lift coefficient"
                onChange={updateValue}
                unit=""
                value={values.liftCoefficient}
              />
              <CalculatorNumberField
                error={errors.dragCoefficient}
                field="dragCoefficient"
                hint="Dimensionless drag coefficient using the same reference area."
                idPrefix="flight-condition"
                label="Drag coefficient"
                onChange={updateValue}
                unit=""
                value={values.dragCoefficient}
              />
            </div>

            <ValidationErrorSummary
              errors={errors}
              idPrefix="flight-condition"
            />

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                className="whitespace-nowrap"
                variant="primary"
                type="submit"
              >
                Analyze condition
              </Button>
              <Button
                className="whitespace-nowrap"
                variant="secondary"
                onClick={resetAnalyzer}
              >
                Reset inputs
              </Button>
            </div>
          </form>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <CalculatorResultSection
            id="flight-condition-result"
            stale={stale && result !== null}
            staleAction="Analyze"
            title="Flight analysis"
          >
            {result ? (
              <>
                <ReadoutGrid columns={2} title="Atmosphere">
                  <div>
                    <dt className="orbix-label">Temperature</dt>
                    <dd className="orbix-data mt-1">
                      <LabFigure unit="K">
                        {numberFormatter.format(
                          result.atmosphere.temperatureKelvin,
                        )}
                      </LabFigure>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Pressure</dt>
                    <dd className="orbix-data mt-1">
                      <LabFigure unit="Pa">
                        {numberFormatter.format(
                          result.atmosphere.pressurePascals,
                        )}
                      </LabFigure>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Density</dt>
                    <dd className="orbix-data mt-1">
                      <LabFigure unit="kg/m³">
                        {densityFormatter.format(
                          result.atmosphere.densityKilogramsPerCubicMetre,
                        )}
                      </LabFigure>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Speed of sound</dt>
                    <dd className="orbix-data mt-1">
                      <LabFigure unit="m/s">
                        {numberFormatter.format(
                          result.atmosphere.speedOfSoundMetersPerSecond,
                        )}
                      </LabFigure>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={2} title="Flight">
                  <div>
                    <dt className="orbix-label">Mach number</dt>
                    <dd className="orbix-readout-lg mt-1">
                      <LabFigure>
                        {ratioFormatter.format(result.flight.machNumber)}
                      </LabFigure>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Flow regime</dt>
                    <dd>
                      <LabValueText>
                        {toSentenceCase(result.flight.flowRegime)}
                      </LabValueText>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={3} title="Aerodynamics">
                  <div>
                    <dt className="orbix-label">Dynamic pressure</dt>
                    <dd className="orbix-data mt-1">
                      <LabFigure unit="Pa">
                        {numberFormatter.format(
                          result.aerodynamics.dynamicPressurePascals,
                        )}
                      </LabFigure>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Lift</dt>
                    <dd className="orbix-data mt-1">
                      <LabFigure unit="N">
                        {numberFormatter.format(
                          result.aerodynamics.liftForceNewtons,
                        )}
                      </LabFigure>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Drag</dt>
                    <dd className="orbix-data mt-1">
                      <LabFigure unit="N">
                        {numberFormatter.format(
                          result.aerodynamics.dragForceNewtons,
                        )}
                      </LabFigure>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid title="Performance">
                  <div>
                    <dt className="orbix-label">Lift-to-drag ratio</dt>
                    <dd>
                      <output
                        className="orbix-readout-lg"
                        htmlFor="flight-condition-altitudeMetres flight-condition-velocityMetresPerSecond flight-condition-wingAreaSquareMetres flight-condition-liftCoefficient flight-condition-dragCoefficient"
                      >
                        <LabFigure>
                          {ratioFormatter.format(
                            result.performance.liftToDragRatio,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>
              </>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Validate the inputs and run the analysis to compose atmospheric,
                aerodynamic, and performance results.
              </NotCalculated>
            )}
          </CalculatorResultSection>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <section
            aria-labelledby="flight-condition-flow-title"
            className="border-t border-border pt-3"
          >
            <h3
              className="text-sm font-medium text-foreground"
              id="flight-condition-flow-title"
            >
              Analysis flow
            </h3>
            <ol className="mt-4 grid gap-3 text-sm @min-[36rem]/col:grid-cols-2">
              {[
                [
                  "01",
                  "Atmosphere",
                  "Altitude determines temperature, pressure, density, and acoustic speed.",
                ],
                [
                  "02",
                  "Flow state",
                  "Density and velocity determine dynamic pressure; velocity and acoustic speed determine Mach.",
                ],
                [
                  "03",
                  "Forces",
                  "Shared flow state feeds the lift and drag modules.",
                ],
                [
                  "04",
                  "Performance",
                  "Returned forces determine lift-to-drag ratio.",
                ],
              ].map(([step, title, description]) => (
                <li className="border-t border-border pt-3" key={step}>
                  <p className="orbix-data text-accent">
                    {formatFigure(<>{step}</>)}
                  </p>
                  <p className="mt-1 font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Engineering notes
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted">
              <li>
                The atmosphere model is limited to the standard troposphere from
                0 through 11,000 metres.
              </li>
              <li>
                Lift and drag coefficients must describe the same flight
                condition and use the supplied wing area as their reference
                area.
              </li>
              <li>
                Results are steady-state estimates and do not model turbulence,
                stall behavior, compressibility corrections, structural limits,
                or configuration effects not represented by the coefficients.
                Mach classification provides awareness; it does not correct the
                supplied coefficients.
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </LabToolLayout>
  );
}
