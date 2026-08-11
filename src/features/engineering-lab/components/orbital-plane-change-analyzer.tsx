"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, CircleDot, Gauge, RotateCcw } from "lucide-react";

import { analyzeOrbitalPlaneChange } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  OrbitalPlaneChangeAnalysisInputs,
  OrbitalPlaneChangeAnalysisResult,
} from "@/features/engineering-lab/types";

type OrbitalPlaneChangeField =
  | "orbitalAltitudeMetres"
  | "inclinationChangeDegrees"
  | "planetRadiusMetres"
  | "gravitationalParameter";

interface OrbitalPlaneChangeFormValues {
  readonly gravitationalParameter: string;
  readonly inclinationChangeDegrees: string;
  readonly orbitalAltitudeMetres: string;
  readonly planetRadiusMetres: string;
}

type OrbitalPlaneChangeValidationErrors = Readonly<
  Partial<Record<OrbitalPlaneChangeField | "form", string>>
>;

interface OrbitalPlaneChangeViewState {
  readonly errors: OrbitalPlaneChangeValidationErrors;
  readonly orbitalAltitudeMetres: number | null;
  readonly result: OrbitalPlaneChangeAnalysisResult | null;
}

interface DeltaVPresentationBand {
  readonly description: string;
  readonly label: string;
}

const initialFormValues: OrbitalPlaneChangeFormValues = {
  gravitationalParameter: "",
  inclinationChangeDegrees: "28.5",
  orbitalAltitudeMetres: "400000",
  planetRadiusMetres: "",
};

const distanceFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const velocityFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
});

const angleFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
  minimumFractionDigits: 3,
});

function parseRequiredNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function buildAnalysisInputs(
  values: OrbitalPlaneChangeFormValues,
): OrbitalPlaneChangeAnalysisInputs {
  const gravitationalParameter =
    values.gravitationalParameter.trim() === ""
      ? undefined
      : Number(values.gravitationalParameter);
  const planetRadiusMetres =
    values.planetRadiusMetres.trim() === ""
      ? undefined
      : Number(values.planetRadiusMetres);

  return {
    ...(gravitationalParameter === undefined ? {} : { gravitationalParameter }),
    ...(planetRadiusMetres === undefined ? {} : { planetRadiusMetres }),
    inclinationChangeDegrees: parseRequiredNumber(
      values.inclinationChangeDegrees,
    ),
    orbitalAltitudeMetres: parseRequiredNumber(values.orbitalAltitudeMetres),
  };
}

function classifyEducationalDeltaVBand(
  deltaVMetresPerSecond: number,
): DeltaVPresentationBand {
  if (deltaVMetresPerSecond < 500) {
    return {
      description:
        "A comparatively small ideal velocity-change requirement within this educational display scale.",
      label: "Small delta-v",
    };
  }

  if (deltaVMetresPerSecond < 2_000) {
    return {
      description:
        "A substantial ideal maneuver that occupies a meaningful mission velocity budget.",
      label: "Moderate delta-v",
    };
  }

  return {
    description:
      "A very demanding ideal maneuver relative to common spacecraft velocity budgets.",
    label: "Large delta-v",
  };
}

function deriveViewState(
  values: OrbitalPlaneChangeFormValues,
): OrbitalPlaneChangeViewState {
  const inputs = buildAnalysisInputs(values);

  try {
    return {
      errors: {},
      orbitalAltitudeMetres: inputs.orbitalAltitudeMetres,
      result: analyzeOrbitalPlaneChange(inputs),
    };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;

    const normalizedMessage = error.message.toLowerCase();
    const errors: Partial<Record<OrbitalPlaneChangeField | "form", string>> =
      {};

    if (normalizedMessage.includes("altitude")) {
      errors.orbitalAltitudeMetres = error.message;
    }

    if (normalizedMessage.includes("inclination change")) {
      errors.inclinationChangeDegrees = error.message;
    }

    if (normalizedMessage.includes("planet radius")) {
      errors.planetRadiusMetres = error.message;
    }

    if (normalizedMessage.includes("gravitational parameter")) {
      errors.gravitationalParameter = error.message;
    }

    if (Object.keys(errors).length === 0) {
      errors.form = error.message;
    }

    return { errors, orbitalAltitudeMetres: null, result: null };
  }
}

export function OrbitalPlaneChangeAnalyzer() {
  const [values, setValues] =
    useState<OrbitalPlaneChangeFormValues>(initialFormValues);
  const { errors, orbitalAltitudeMetres, result } = useMemo(
    () => deriveViewState(values),
    [values],
  );
  const orbitOutputIds =
    "orbital-plane-change-orbitalAltitudeMetres orbital-plane-change-planetRadiusMetres orbital-plane-change-gravitationalParameter";
  const maneuverOutputIds =
    "orbital-plane-change-orbitalAltitudeMetres orbital-plane-change-inclinationChangeDegrees orbital-plane-change-planetRadiusMetres orbital-plane-change-gravitationalParameter";
  const presentationBand = result
    ? classifyEducationalDeltaVBand(result.deltaVMetresPerSecond)
    : null;

  function updateValue(field: OrbitalPlaneChangeField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(22rem,1.05fr)] xl:gap-10">
      <div>
        <form noValidate onSubmit={preventSubmission}>
          <fieldset>
            <legend className="orbix-label text-accent">
              Orbital maneuver
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <CalculatorNumberField
                error={errors.orbitalAltitudeMetres}
                field="orbitalAltitudeMetres"
                hint="Altitude above the reference planet surface."
                idPrefix="orbital-plane-change"
                label="Orbital altitude"
                onChange={updateValue}
                unit="m"
                value={values.orbitalAltitudeMetres}
              />
              <CalculatorNumberField
                error={errors.inclinationChangeDegrees}
                field="inclinationChangeDegrees"
                hint="Change in orbital plane angle."
                idPrefix="orbital-plane-change"
                label="Inclination change"
                onChange={updateValue}
                unit="deg"
                value={values.inclinationChangeDegrees}
              />
            </div>
          </fieldset>

          <fieldset className="mt-7 border-t border-border pt-7">
            <legend className="orbix-label text-accent">
              Central-body constants
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <CalculatorNumberField
                error={errors.planetRadiusMetres}
                field="planetRadiusMetres"
                hint="Optional. Leave blank to use Earth's mean radius."
                idPrefix="orbital-plane-change"
                label="Planet radius (optional)"
                onChange={updateValue}
                unit="m"
                value={values.planetRadiusMetres}
              />
              <CalculatorNumberField
                error={errors.gravitationalParameter}
                field="gravitationalParameter"
                hint="Optional. Leave blank to use Earth's standard gravitational parameter."
                idPrefix="orbital-plane-change"
                label="Gravitational parameter (optional)"
                onChange={updateValue}
                unit="m³/s²"
                value={values.gravitationalParameter}
              />
            </div>
          </fieldset>

          <ValidationErrorSummary
            errors={[
              errors.orbitalAltitudeMetres,
              errors.inclinationChangeDegrees,
              errors.planetRadiusMetres,
              errors.gravitationalParameter,
              errors.form,
            ]}
          />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-muted">
              Valid changes update the circular-orbit and maneuver results
              immediately.
            </p>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent/60 hover:text-accent sm:ml-auto"
              onClick={resetAnalyzer}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={16} />
              Reset example
            </button>
          </div>
        </form>

        <section
          aria-labelledby="orbital-plane-change-explanation-title"
          className="mt-8 border-t border-border pt-7"
        >
          <p className="orbix-label text-accent">Educational context</p>
          <h3
            className="mt-1 text-lg font-semibold"
            id="orbital-plane-change-explanation-title"
          >
            Why plane changes are expensive
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            A plane change redirects the spacecraft&apos;s velocity vector. When
            orbital speed is high, changing that direction requires a larger
            ideal velocity change, which is why mission designers often seek
            lower-speed locations for major inclination maneuvers.
          </p>
        </section>
      </div>

      <div className="space-y-5">
        <CalculatorResultSection
          eyebrow="Circular Orbit + Inclination"
          icon={CircleDot}
          id="orbital-plane-change-result"
          title="Orbital plane change"
        >
          {result && orbitalAltitudeMetres !== null ? (
            <div className="space-y-6">
              <section aria-labelledby="orbital-plane-change-orbit-title">
                <h4
                  className="orbix-label text-accent"
                  id="orbital-plane-change-orbit-title"
                >
                  Orbit
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted">Orbital altitude</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor="orbital-plane-change-orbitalAltitudeMetres"
                      >
                        {distanceFormatter.format(orbitalAltitudeMetres)} m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Orbital radius</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={orbitOutputIds}
                      >
                        {distanceFormatter.format(result.orbitalRadiusMetres)} m
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">
                      Circular orbital velocity
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold text-accent"
                        htmlFor={orbitOutputIds}
                      >
                        {velocityFormatter.format(
                          result.orbitalVelocityMetresPerSecond,
                        )}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="orbital-plane-change-maneuver-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="orbital-plane-change-maneuver-title"
                >
                  Plane change
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted">Inclination change</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={maneuverOutputIds}
                      >
                        {angleFormatter.format(result.inclinationChangeDegrees)}{" "}
                        deg
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Inclination change</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={maneuverOutputIds}
                      >
                        {angleFormatter.format(result.inclinationChangeRadians)}{" "}
                        rad
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Required delta-v</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={maneuverOutputIds}
                      >
                        {velocityFormatter.format(result.deltaVMetresPerSecond)}{" "}
                        m/s
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          ) : (
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">—</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Enter a valid orbital altitude and inclination change to resolve
                the circular-orbit state and ideal maneuver delta-v.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <CalculatorResultSection
          eyebrow="Educational Interpretation"
          icon={Gauge}
          id="orbital-plane-change-mission-context"
          title="Mission context"
        >
          {result && presentationBand ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs text-muted">
                  Educational delta-v classification
                </p>
                <output
                  className="mt-2 block text-lg font-semibold text-accent"
                  htmlFor={maneuverOutputIds}
                >
                  {presentationBand.label}
                </output>
                <p className="mt-2 text-xs leading-5 text-muted">
                  {presentationBand.description}
                </p>
              </div>
              <div className="border-t border-border pt-5">
                <h4 className="text-sm font-semibold">
                  Velocity and maneuver cost
                </h4>
                <p className="mt-2 text-xs leading-5 text-muted">
                  Plane-change delta-v rises with the orbital speed at the
                  maneuver point. This display band is educational context only
                  and does not determine mission feasibility.
                </p>
              </div>
            </div>
          ) : (
            <p className="py-3 text-sm leading-6 text-muted">
              A valid solution will add an educational delta-v band and mission
              interpretation.
            </p>
          )}
        </CalculatorResultSection>

        <aside className="orbix-lab-note">
          <p className="orbix-lab-note__title">
            <AlertTriangle aria-hidden="true" size={17} />
            Modeling assumptions
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-xs leading-5 text-muted sm:grid-cols-2">
            <li>Two-body gravity model</li>
            <li>Circular orbit at the maneuver point</li>
            <li>Instantaneous impulsive maneuver</li>
            <li>Pure plane change with no simultaneous altitude change</li>
            <li>No atmospheric drag</li>
            <li>No finite-burn losses</li>
            <li>No gravitational perturbations</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
