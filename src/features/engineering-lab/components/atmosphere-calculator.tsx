"use client";

import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Calculator,
  CloudSun,
  RotateCcw,
  Sigma,
} from "lucide-react";

import {
  calculateStandardAtmosphere,
  DRY_AIR_SPECIFIC_GAS_CONSTANT_JOULES_PER_KILOGRAM_KELVIN,
  RATIO_OF_SPECIFIC_HEATS_FOR_DRY_AIR,
  SEA_LEVEL_STANDARD_PRESSURE_PASCALS,
  SEA_LEVEL_STANDARD_TEMPERATURE_KELVIN,
  TROPOSPHERIC_LAPSE_RATE_KELVIN_PER_METRE,
} from "@/features/engineering-lab/calculators";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  AtmosphereField,
  AtmosphereInputs,
  AtmosphereResult,
  AtmosphereValidationErrors,
} from "@/features/engineering-lab/types";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";
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

export function AtmosphereCalculator() {
  const [values, setValues] = useState<AtmosphereFormValues>(initialFormValues);
  const [errors, setErrors] = useState<AtmosphereValidationErrors>({});
  const [result, setResult] = useState<AtmosphereResult | null>(null);

  function updateValue(field: AtmosphereField, value: string) {
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
    const validationErrors = validateAtmosphereInputs(inputs);

    setErrors(validationErrors);

    if (hasAtmosphereValidationErrors(validationErrors)) {
      setResult(null);
      return;
    }

    setResult(calculateStandardAtmosphere(inputs));
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
          <CalculatorNumberField
            error={errors.altitudeMetres}
            field="altitudeMetres"
            hint={`Geometric altitude from sea level, limited to ${STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES.toLocaleString("en-US")} metres.`}
            idPrefix="standard-atmosphere"
            label="Altitude"
            onChange={updateValue}
            unit="m"
            value={values.altitudeMetres}
          />

          <ValidationErrorSummary errors={Object.values(errors)} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-background shadow-[0_12px_40px_rgb(87_215_255/0.18)] transition-colors hover:bg-foreground"
              type="submit"
            >
              <Calculator aria-hidden="true" size={16} />
              Calculate atmosphere
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
          eyebrow="Modeled atmospheric state"
          icon={CloudSun}
          id="standard-atmosphere-result"
          title="Troposphere conditions"
        >
          {result ? (
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Temperature</dt>
                <dd className="mt-2">
                  <output
                    className="font-mono text-xl font-semibold text-accent"
                    htmlFor="standard-atmosphere-altitudeMetres"
                  >
                    {stateFormatter.format(result.temperatureKelvin)} K
                  </output>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Pressure</dt>
                <dd className="mt-2">
                  <output
                    className="font-mono text-xl font-semibold text-accent"
                    htmlFor="standard-atmosphere-altitudeMetres"
                  >
                    {stateFormatter.format(result.pressurePascals)} Pa
                  </output>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Density</dt>
                <dd className="mt-2">
                  <output
                    className="font-mono text-xl font-semibold text-accent"
                    htmlFor="standard-atmosphere-altitudeMetres"
                  >
                    {densityFormatter.format(
                      result.densityKilogramsPerCubicMetre,
                    )}{" "}
                    kg/m³
                  </output>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Speed of sound</dt>
                <dd className="mt-2">
                  <output
                    className="font-mono text-xl font-semibold text-accent"
                    htmlFor="standard-atmosphere-altitudeMetres"
                  >
                    {stateFormatter.format(result.speedOfSoundMetersPerSecond)}{" "}
                    m/s
                  </output>
                </dd>
              </div>
            </dl>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">—</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Validate an altitude and run the model to calculate temperature,
                pressure, density, and speed of sound.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <section className="rounded-2xl border border-border bg-surface/55 p-5 sm:p-6">
          <p className="orbix-label flex items-center gap-2 text-accent">
            <Sigma aria-hidden="true" size={15} />
            Equation model
          </p>
          <div className="mt-4 grid gap-2">
            <p
              aria-label="Temperature equals sea-level temperature minus lapse rate multiplied by altitude"
              className="orbix-lab-equation"
            >
              T = T0 − Lh
            </p>
            <p
              aria-label="Pressure equals sea-level pressure multiplied by temperature divided by sea-level temperature raised to standard gravity divided by the dry-air gas constant multiplied by lapse rate"
              className="orbix-lab-equation"
            >
              P = P0 × (T / T0)^(g / RL)
            </p>
            <p
              aria-label="Density equals pressure divided by the dry-air gas constant multiplied by temperature"
              className="orbix-lab-equation"
            >
              ρ = P / (RT)
            </p>
            <p
              aria-label="Speed of sound equals the square root of the ratio of specific heats multiplied by the dry-air gas constant multiplied by temperature"
              className="orbix-lab-equation"
            >
              a = √(γRT)
            </p>
          </div>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-mono text-xs text-accent">T0</dt>
              <dd className="mt-1 text-muted">
                {SEA_LEVEL_STANDARD_TEMPERATURE_KELVIN} K
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">P0</dt>
              <dd className="mt-1 text-muted">
                {SEA_LEVEL_STANDARD_PRESSURE_PASCALS.toLocaleString("en-US")} Pa
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">L</dt>
              <dd className="mt-1 text-muted">
                {TROPOSPHERIC_LAPSE_RATE_KELVIN_PER_METRE} K/m
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">R</dt>
              <dd className="mt-1 text-muted">
                {DRY_AIR_SPECIFIC_GAS_CONSTANT_JOULES_PER_KILOGRAM_KELVIN}{" "}
                J/(kg·K)
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs text-accent">γ</dt>
              <dd className="mt-1 text-muted">
                {RATIO_OF_SPECIFIC_HEATS_FOR_DRY_AIR}
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
              This model covers the constant-lapse-rate troposphere from sea
              level through 11,000 metres.
            </li>
            <li>
              It assumes dry, ideal air in hydrostatic equilibrium and does not
              model local weather, humidity, or temperature inversions.
            </li>
            <li>
              The pressure exponent uses the specific gas constant for dry air;
              this is equivalent to the universal-gas-constant form that
              includes molar mass.
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
