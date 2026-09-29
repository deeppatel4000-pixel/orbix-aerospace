"use client";

import { Button, EquationBlock } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";

import { analyzeOrbitalPlaneChange } from "@/features/engineering-lab/analysis";
import {
  EQ_LINE,
  EQ_TERM,
  CalculatorNumberField,
  focusFirstInvalidField,
  focusFirstInvalidFieldOnEnter,
  CalculatorResultSection,
  LAB_TOOL_SPLIT,
  LabToolLayout,
  NotCalculated,
  ReadoutGrid,
  ValidationErrorSummary,
  LabFigure,
  EqDot,
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

const toolEquation = (
  <EquationBlock
    equation={
      <>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>v = √(μ/r)</span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>Δv = 2v</span>
          <wbr />
          <span className={EQ_TERM}>
            <EqDot />
            sin(Δi/2)
          </span>
        </span>
      </>
    }
    label="Impulsive plane change"
    spokenAs="Circular velocity v equals the square root of mu over r. Delta v equals 2 v times the sine of half the inclination change."
    variables={[
      {
        symbol: "r",
        meaning:
          "Orbit radius: central-body radius plus altitude; Earth mean radius, 6,371,000 m, by default",
        unit: "m",
      },
      {
        symbol: "μ",
        meaning:
          "Gravitational parameter; Earth, 3.986004418 × 10¹⁴, by default",
        unit: "m³/s²",
      },
      { symbol: "v", meaning: "Circular orbital velocity", unit: "m/s" },
      { symbol: "Δi", meaning: "Inclination change", unit: "deg" },
    ]}
  />
);

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
    focusFirstInvalidField(event.currentTarget);
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  return (
    <LabToolLayout equation={toolEquation}>
      <div className={LAB_TOOL_SPLIT}>
        <div className="@container/col min-w-0">
          <form
            noValidate
            onKeyDown={focusFirstInvalidFieldOnEnter}
            onSubmit={preventSubmission}
          >
            <fieldset>
              <legend className="text-base font-semibold text-foreground">
                Orbital maneuver
              </legend>
              <div className="mt-4 grid gap-5 @min-[36rem]/col:grid-cols-2">
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

            <fieldset className="mt-10">
              <legend className="text-base font-semibold text-foreground">
                Central-body constants
              </legend>
              <div className="mt-4 grid gap-5 @min-[36rem]/col:grid-cols-2">
                <CalculatorNumberField
                  error={errors.planetRadiusMetres}
                  field="planetRadiusMetres"
                  hint="Optional. Leave blank to use Earth's mean radius."
                  idPrefix="orbital-plane-change"
                  label="Planet radius (optional)"
                  optional
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
                  optional
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

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <p className="min-w-0 flex-[1_1_16rem] text-sm leading-6 text-muted">
                Valid changes update the circular-orbit and maneuver results
                immediately.
              </p>
              <Button
                className="shrink-0 whitespace-nowrap"
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
            id="orbital-plane-change-result"
            title="Orbital plane change"
          >
            {result && orbitalAltitudeMetres !== null ? (
              <>
                <ReadoutGrid columns={3} title="Orbit">
                  <div>
                    <dt className="orbix-label">Orbital altitude</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor="orbital-plane-change-orbitalAltitudeMetres"
                      >
                        <LabFigure unit="m">
                          {distanceFormatter.format(orbitalAltitudeMetres)}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Orbital radius</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={orbitOutputIds}>
                        <LabFigure unit="m">
                          {distanceFormatter.format(result.orbitalRadiusMetres)}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Circular orbital velocity</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={orbitOutputIds}>
                        <LabFigure unit="m/s">
                          {velocityFormatter.format(
                            result.orbitalVelocityMetresPerSecond,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={3} title="Plane change">
                  <div>
                    <dt className="orbix-label">Required delta-v</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-readout-lg"
                        htmlFor={maneuverOutputIds}
                      >
                        <LabFigure unit="m/s">
                          {velocityFormatter.format(
                            result.deltaVMetresPerSecond,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Inclination change, degrees</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={maneuverOutputIds}
                      >
                        <LabFigure unit="deg">
                          {angleFormatter.format(
                            result.inclinationChangeDegrees,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Inclination change, radians</dt>
                    <dd className="mt-1">
                      <output
                        className="orbix-data"
                        htmlFor={maneuverOutputIds}
                      >
                        <LabFigure unit="rad">
                          {angleFormatter.format(
                            result.inclinationChangeRadians,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>
              </>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Enter a valid orbital altitude and inclination change to resolve
                the circular-orbit state and ideal maneuver delta-v.
              </NotCalculated>
            )}
          </CalculatorResultSection>

          <CalculatorResultSection
            id="orbital-plane-change-mission-context"
            title="Mission context"
          >
            {result && presentationBand ? (
              <>
                <ReadoutGrid columns={1}>
                  <div>
                    <dt className="orbix-label">
                      Educational delta-v classification
                    </dt>
                    <dd>
                      <output
                        className="lab-value-text"
                        htmlFor={maneuverOutputIds}
                      >
                        {presentationBand.label}
                      </output>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {presentationBand.description}
                      </p>
                    </dd>
                  </div>
                </ReadoutGrid>
                <div className="border-t border-border pt-5">
                  <h4 className="text-sm font-semibold">
                    Velocity and maneuver cost
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Plane-change delta-v rises with the orbital speed at the
                    maneuver point. This display band is educational context
                    only and does not determine mission feasibility.
                  </p>
                </div>
              </>
            ) : (
              <NotCalculated>
                A valid solution will add an educational delta-v band and
                mission interpretation.
              </NotCalculated>
            )}
          </CalculatorResultSection>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <section
            aria-labelledby="orbital-plane-change-explanation-title"
            className="border-t border-border pt-7"
          >
            <h3
              className="text-lg font-semibold"
              id="orbital-plane-change-explanation-title"
            >
              Why plane changes are expensive
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              A plane change redirects the spacecraft&apos;s velocity vector.
              When orbital speed is high, changing that direction requires a
              larger ideal velocity change, which is why mission designers often
              seek lower-speed locations for major inclination maneuvers.
            </p>
          </section>
          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Modeling assumptions
            </p>
            <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted @min-[36rem]/col:grid-cols-2">
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
    </LabToolLayout>
  );
}
