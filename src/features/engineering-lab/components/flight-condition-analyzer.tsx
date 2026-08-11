"use client";

import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Calculator,
  Gauge,
  GitBranch,
  RotateCcw,
} from "lucide-react";

import { analyzeFlightCondition } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
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

export function FlightConditionAnalyzer() {
  const [values, setValues] =
    useState<FlightConditionFormValues>(initialFormValues);
  const [errors, setErrors] = useState<FlightConditionValidationErrors>({});
  const [result, setResult] = useState<FlightConditionAnalysis | null>(null);

  function updateValue(field: FlightConditionField, value: string) {
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
    const validationErrors = validateFlightConditionInputs(inputs);

    setErrors(validationErrors);

    if (hasFlightConditionValidationErrors(validationErrors)) {
      setResult(null);
      return;
    }

    setResult(analyzeFlightCondition(inputs));
  }

  function resetAnalyzer() {
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
              error={errors.altitudeMetres}
              field="altitudeMetres"
              hint="Geometric altitude within the 0–11,000 metre atmosphere model."
              idPrefix="flight-condition"
              label="Altitude"
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
              unit="CL"
              value={values.liftCoefficient}
            />
            <CalculatorNumberField
              error={errors.dragCoefficient}
              field="dragCoefficient"
              hint="Dimensionless drag coefficient using the same reference area."
              idPrefix="flight-condition"
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
              Analyze condition
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent/60 hover:text-accent"
              onClick={resetAnalyzer}
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
          eyebrow="Integrated flight state"
          icon={Gauge}
          id="flight-condition-result"
          title="Flight analysis"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="flight-atmosphere-title">
                <h4
                  className="orbix-label text-accent"
                  id="flight-atmosphere-title"
                >
                  Atmosphere
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Temperature</dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">
                      {numberFormatter.format(
                        result.atmosphere.temperatureKelvin,
                      )}{" "}
                      K
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Pressure</dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">
                      {numberFormatter.format(
                        result.atmosphere.pressurePascals,
                      )}{" "}
                      Pa
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Density</dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">
                      {densityFormatter.format(
                        result.atmosphere.densityKilogramsPerCubicMetre,
                      )}{" "}
                      kg/m³
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Speed of sound</dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">
                      {numberFormatter.format(
                        result.atmosphere.speedOfSoundMetersPerSecond,
                      )}{" "}
                      m/s
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="flight-state-title"
                className="border-t border-border pt-5"
              >
                <h4 className="orbix-label text-accent" id="flight-state-title">
                  Flight
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Mach number</dt>
                    <dd className="mt-1 font-mono text-xl font-semibold text-accent">
                      {ratioFormatter.format(result.flight.machNumber)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Flow regime</dt>
                    <dd className="mt-1 text-sm font-semibold capitalize">
                      {result.flight.flowRegime}
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="flight-aerodynamics-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="flight-aerodynamics-title"
                >
                  Aerodynamics
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted">Dynamic pressure</dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">
                      {numberFormatter.format(
                        result.aerodynamics.dynamicPressurePascals,
                      )}{" "}
                      Pa
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Lift</dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">
                      {numberFormatter.format(
                        result.aerodynamics.liftForceNewtons,
                      )}{" "}
                      N
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Drag</dt>
                    <dd className="mt-1 font-mono text-sm font-semibold">
                      {numberFormatter.format(
                        result.aerodynamics.dragForceNewtons,
                      )}{" "}
                      N
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="flight-performance-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="flight-performance-title"
                >
                  Performance
                </h4>
                <p className="mt-2 text-xs text-muted">Lift-to-drag ratio</p>
                <output
                  className="mt-1 block font-mono text-4xl font-semibold tracking-[-0.04em] text-accent"
                  htmlFor="flight-condition-altitudeMetres flight-condition-velocityMetresPerSecond flight-condition-wingAreaSquareMetres flight-condition-liftCoefficient flight-condition-dragCoefficient"
                >
                  {ratioFormatter.format(result.performance.liftToDragRatio)}
                </output>
              </section>
            </div>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">—</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Validate the inputs and run the analysis to compose atmospheric,
                aerodynamic, and performance results.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <section className="rounded-2xl border border-border bg-surface/55 p-5 sm:p-6">
          <p className="orbix-label flex items-center gap-2 text-accent">
            <GitBranch aria-hidden="true" size={15} />
            Analysis flow
          </p>
          <ol className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
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
              <li
                className="rounded-xl border border-border bg-background/30 p-4"
                key={step}
              >
                <p className="font-mono text-[0.65rem] text-accent">{step}</p>
                <p className="mt-1 font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <aside className="orbix-lab-note">
          <p className="orbix-lab-note__title">
            <AlertTriangle aria-hidden="true" size={17} />
            Engineering notes
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-xs leading-5 text-muted">
            <li>
              The atmosphere model is limited to the standard troposphere from 0
              through 11,000 metres.
            </li>
            <li>
              Lift and drag coefficients must describe the same flight condition
              and use the supplied wing area as their reference area.
            </li>
            <li>
              Results are steady-state estimates and do not model turbulence,
              stall behavior, compressibility corrections, structural limits, or
              configuration effects not represented by the coefficients. Mach
              classification provides awareness; it does not correct the
              supplied coefficients.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
