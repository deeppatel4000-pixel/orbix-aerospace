"use client";

import { Button, EquationBlock } from "@/components/ui";
import { useState, type FormEvent } from "react";

import {
  calculateStandardAtmosphere,
  DRY_AIR_SPECIFIC_GAS_CONSTANT_JOULES_PER_KILOGRAM_KELVIN,
  RATIO_OF_SPECIFIC_HEATS_FOR_DRY_AIR,
  SEA_LEVEL_STANDARD_PRESSURE_PASCALS,
  SEA_LEVEL_STANDARD_TEMPERATURE_KELVIN,
  STANDARD_GRAVITY_METRES_PER_SECOND_SQUARED,
  TROPOSPHERIC_LAPSE_RATE_KELVIN_PER_METRE,
} from "@/features/engineering-lab/calculators";
import {
  EQ_LINE,
  EQ_SUP,
  EQ_TERM,
  CalculatorNumberField,
  focusFirstInvalidField,
  GEOPOTENTIAL_ALTITUDE_HINT,
  GEOPOTENTIAL_ALTITUDE_LABEL,
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
  AtmosphereField,
  AtmosphereInputs,
  AtmosphereResult,
  AtmosphereValidationErrors,
} from "@/features/engineering-lab/types";
import {
  hasAtmosphereValidationErrors,
  validateAtmosphereInputs,
} from "@/features/engineering-lab/utils";

interface AtmosphereFormValues {
  readonly altitudeMetres: string;
}

const initialFormValues: AtmosphereFormValues = {
  altitudeMetres: "5000",
};

const stateFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const densityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 5,
  minimumFractionDigits: 5,
});

function parseFormValues(values: AtmosphereFormValues): AtmosphereInputs {
  return {
    altitudeMetres:
      values.altitudeMetres.trim() === ""
        ? Number.NaN
        : Number(values.altitudeMetres),
  };
}

const toolEquation = (
  <EquationBlock
    equation={
      <>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            T = T<sub>0</sub>
          </span>{" "}
          <span className={EQ_TERM}>
            − L<EqDot />h
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            p = p<sub className={EQ_SUB_CLEAR}>0</sub>
          </span>
          <wbr />
          <span className={EQ_TERM}>
            <EqDot />
            (T/T<sub>0</sub>)
            <sup className={EQ_SUP}>
              g<sub className={EQ_SUB_CLEAR}>0</sub>/(R
              <EqDot />
              L)
            </sup>
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            ρ = p/(R
            <EqDot />
            T)
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            a = √(γ
            <EqDot />R<EqDot />
            T)
          </span>
        </span>
      </>
    }
    label="Troposphere, constant lapse rate"
    spokenAs="Temperature T equals T zero minus L times h. Pressure p equals p zero times T over T zero, raised to g zero over R L. Density rho equals p over R T. Speed of sound a equals the square root of gamma R T."
    variables={[
      { symbol: "h", meaning: "Geopotential altitude", unit: "m" },
      {
        symbol: (
          <>
            T<sub>0</sub>
          </>
        ),
        meaning: (
          <>Sea-level temperature, {SEA_LEVEL_STANDARD_TEMPERATURE_KELVIN}</>
        ),
        unit: "K",
      },
      {
        symbol: (
          <>
            p<sub className={EQ_SUB_CLEAR}>0</sub>
          </>
        ),
        meaning: (
          <>
            Sea-level pressure,{" "}
            {SEA_LEVEL_STANDARD_PRESSURE_PASCALS.toLocaleString("en-US")}
          </>
        ),
        unit: "Pa",
      },
      {
        symbol: "L",
        meaning: (
          <>
            Tropospheric lapse rate, {TROPOSPHERIC_LAPSE_RATE_KELVIN_PER_METRE}
          </>
        ),
        unit: "K/m",
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
        symbol: "R",
        meaning: (
          <>
            Specific gas constant for dry air,{" "}
            {DRY_AIR_SPECIFIC_GAS_CONSTANT_JOULES_PER_KILOGRAM_KELVIN}
          </>
        ),
        unit: "J/(kg·K)",
      },
      {
        symbol: "γ",
        meaning: (
          <>
            Ratio of specific heats for dry air,{" "}
            {RATIO_OF_SPECIFIC_HEATS_FOR_DRY_AIR}
          </>
        ),
      },
    ]}
  />
);

/**
 * The result for the default inputs, shown on first load so the tool never
 * opens on an empty panel. The same calculation the form runs.
 */
const initialResult = calculateStandardAtmosphere(
  parseFormValues(initialFormValues),
);

export function AtmosphereCalculator() {
  const [values, setValues] = useState<AtmosphereFormValues>(initialFormValues);
  const [errors, setErrors] = useState<AtmosphereValidationErrors>({});
  const [result, setResult] = useState<AtmosphereResult | null>(initialResult);
  const [stale, setStale] = useState(false);

  function updateValue(field: AtmosphereField, value: string) {
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
    const validationErrors = validateAtmosphereInputs(inputs);

    setErrors(validationErrors);

    if (hasAtmosphereValidationErrors(validationErrors)) {
      focusFirstInvalidField(event.currentTarget);
      setResult(null);
      return;
    }

    setResult(calculateStandardAtmosphere(inputs));
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
            <CalculatorNumberField
              error={errors.altitudeMetres}
              field="altitudeMetres"
              hint={GEOPOTENTIAL_ALTITUDE_HINT}
              idPrefix="standard-atmosphere"
              label={GEOPOTENTIAL_ALTITUDE_LABEL}
              onChange={updateValue}
              unit="m"
              value={values.altitudeMetres}
            />

            <ValidationErrorSummary
              errors={errors}
              idPrefix="standard-atmosphere"
            />

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                className="whitespace-nowrap"
                variant="primary"
                type="submit"
              >
                Calculate atmosphere
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
            id="standard-atmosphere-result"
            stale={stale && result !== null}
            title="Troposphere conditions"
          >
            {result ? (
              <ReadoutGrid columns={2}>
                <div>
                  <dt className="orbix-label">Temperature</dt>
                  <dd className="mt-2">
                    <output
                      className="orbix-readout-lg"
                      htmlFor="standard-atmosphere-altitudeMetres"
                    >
                      <LabFigure unit="K">
                        {stateFormatter.format(result.temperatureKelvin)}
                      </LabFigure>
                    </output>
                  </dd>
                </div>
                <div>
                  <dt className="orbix-label">Pressure</dt>
                  <dd className="mt-2">
                    <output
                      className="orbix-readout-lg"
                      htmlFor="standard-atmosphere-altitudeMetres"
                    >
                      <LabFigure unit="Pa">
                        {stateFormatter.format(result.pressurePascals)}
                      </LabFigure>
                    </output>
                  </dd>
                </div>
                <div>
                  <dt className="orbix-label">Density</dt>
                  <dd className="mt-2">
                    <output
                      className="orbix-readout-lg"
                      htmlFor="standard-atmosphere-altitudeMetres"
                    >
                      <LabFigure unit="kg/m³">
                        {densityFormatter.format(
                          result.densityKilogramsPerCubicMetre,
                        )}
                      </LabFigure>
                    </output>
                  </dd>
                </div>
                <div>
                  <dt className="orbix-label">Speed of sound</dt>
                  <dd className="mt-2">
                    <output
                      className="orbix-readout-lg"
                      htmlFor="standard-atmosphere-altitudeMetres"
                    >
                      <LabFigure unit="m/s">
                        {stateFormatter.format(
                          result.speedOfSoundMetersPerSecond,
                        )}
                      </LabFigure>
                    </output>
                  </dd>
                </div>
              </ReadoutGrid>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Validate an altitude and run the model to calculate temperature,
                pressure, density, and speed of sound.
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
                This model covers the constant-lapse-rate troposphere from sea
                level through 11,000 metres.
              </li>
              <li>
                It assumes dry, ideal air in hydrostatic equilibrium and does
                not model local weather, humidity, or temperature inversions.
              </li>
              <li>
                The pressure exponent uses the specific gas constant for dry
                air; this is equivalent to the universal-gas-constant form that
                includes molar mass.
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </LabToolLayout>
  );
}
