"use client";

import { Button, EquationBlock } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";
import { ChevronDown, CircleAlert } from "lucide-react";

import {
  analyzeMaterialTPSSizing,
  DEFAULT_TPS_MATERIAL_EFFICIENCY_FACTOR,
} from "@/features/engineering-lab/analysis";
import {
  EQ_LINE,
  EQ_TERM,
  CalculatorNumberField,
  focusFirstInvalidField,
  focusFirstInvalidFieldOnEnter,
  CalculatorResultSection,
  LAB_TOOL_SPLIT,
  GEOPOTENTIAL_ALTITUDE_HINT,
  INITIAL_GEOPOTENTIAL_ALTITUDE_LABEL,
  LabToolLayout,
  NotCalculated,
  ReadoutGrid,
  ValidationErrorSummary,
  LabFigure,
  EqDot,
  EQ_SUP,
} from "@/features/engineering-lab/components/shared";
import {
  getTPSMaterialById,
  listTPSMaterials,
} from "@/features/engineering-lab/materials";
import type {
  MaterialTPSSizingAnalysis,
  MaterialTPSSizingInputs,
} from "@/features/engineering-lab/types";

type MaterialTPSSizingField =
  | "dragCoefficient"
  | "initialAltitudeMeters"
  | "initialVelocityMetersPerSecond"
  | "materialId"
  | "noseRadiusMetres"
  | "referenceAreaSquareMetres"
  | "safetyFactor"
  | "vehicleMassKilograms";

interface MaterialTPSSizingFormValues {
  readonly dragCoefficient: string;
  readonly initialAltitudeMeters: string;
  readonly initialVelocityMetersPerSecond: string;
  readonly materialId: string;
  readonly noseRadiusMetres: string;
  readonly referenceAreaSquareMetres: string;
  readonly safetyFactor: string;
  readonly vehicleMassKilograms: string;
}

type MaterialTPSSizingValidationErrors = Readonly<
  Partial<Record<MaterialTPSSizingField | "form", string>>
>;

interface MaterialTPSSizingViewState {
  readonly errors: MaterialTPSSizingValidationErrors;
  readonly result: MaterialTPSSizingAnalysis | null;
}

const tpsMaterials = listTPSMaterials();

const initialFormValues: MaterialTPSSizingFormValues = {
  dragCoefficient: "1.5",
  initialAltitudeMeters: "1000",
  initialVelocityMetersPerSecond: "150",
  materialId: tpsMaterials[0]?.id ?? "",
  noseRadiusMetres: "1",
  referenceAreaSquareMetres: "12",
  safetyFactor: "1.5",
  vehicleMassKilograms: "5000",
};

const standardFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 2,
});

const preciseFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
  minimumFractionDigits: 3,
});

const integerFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const heatFluxFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function parseRequiredNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function buildAnalysisInputs(
  values: MaterialTPSSizingFormValues,
): MaterialTPSSizingInputs {
  return {
    dragCoefficient: parseRequiredNumber(values.dragCoefficient),
    initialAltitudeMeters: parseRequiredNumber(values.initialAltitudeMeters),
    initialVelocityMetersPerSecond: parseRequiredNumber(
      values.initialVelocityMetersPerSecond,
    ),
    materialId: values.materialId,
    noseRadiusMetres: parseRequiredNumber(values.noseRadiusMetres),
    referenceAreaSquareMetres: parseRequiredNumber(
      values.referenceAreaSquareMetres,
    ),
    safetyFactor: parseRequiredNumber(values.safetyFactor),
    vehicleMassKilograms: parseRequiredNumber(values.vehicleMassKilograms),
  };
}

function deriveViewState(
  values: MaterialTPSSizingFormValues,
): MaterialTPSSizingViewState {
  try {
    return {
      errors: {},
      result: analyzeMaterialTPSSizing(buildAnalysisInputs(values)),
    };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;

    const normalizedMessage = error.message.toLowerCase();
    const errors: Partial<Record<MaterialTPSSizingField | "form", string>> = {};

    if (normalizedMessage.includes("material id")) {
      errors.materialId = error.message;
    }

    if (normalizedMessage.includes("altitude")) {
      errors.initialAltitudeMeters = error.message;
    }

    if (normalizedMessage.includes("velocity")) {
      errors.initialVelocityMetersPerSecond = error.message;
    }

    if (normalizedMessage.includes("vehicle mass")) {
      errors.vehicleMassKilograms = error.message;
    }

    if (normalizedMessage.includes("drag coefficient")) {
      errors.dragCoefficient = error.message;
    }

    if (normalizedMessage.includes("reference area")) {
      errors.referenceAreaSquareMetres = error.message;
    }

    if (normalizedMessage.includes("nose radius")) {
      errors.noseRadiusMetres = error.message;
    }

    if (normalizedMessage.includes("safety factor")) {
      errors.safetyFactor = error.message;
    }

    if (Object.keys(errors).length === 0) {
      errors.form = error.message;
    }

    return { errors, result: null };
  }
}

const toolEquation = (
  <EquationBlock
    equation={
      <>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>q̇ = k</span>
          <wbr />
          <span className={EQ_TERM}>
            <EqDot />
            √(ρ/r<sub>n</sub>)
          </span>
          <wbr />
          <span className={EQ_TERM}>
            <EqDot />V<sup className={EQ_SUP}>3</sup>
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            Q = Σ q̇<sub>i</sub>
            <EqDot />
            Δt<sub>i</sub>
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            m<sub>A</sub> = n<EqDot />Q
          </span>
          <wbr />
          <span className={EQ_TERM}>
            /(η
            <EqDot />Q<sub>a</sub>)
          </span>
        </span>
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            t = m<sub>A</sub>/ρ<sub>m</sub>
          </span>
        </span>
      </>
    }
    label="Heat-load TPS sizing"
    spokenAs="Heat flux equals k times the square root of density over nose radius, times velocity cubed. heat load Q equals the sum of heat flux times time step. Areal mass m A equals safety factor n times Q over efficiency eta times allowable heat load Q a. Thickness t equals m A over material density."
    variables={[
      {
        symbol: "ρ, V",
        meaning:
          "Air density and velocity at each step of the entry trajectory",
      },
      {
        symbol: "k",
        meaning:
          "Heating coefficient; by default 1.83 × 10⁻⁴ in SI units, for Earth air",
      },
      {
        symbol: (
          <>
            r<sub>n</sub>
          </>
        ),
        meaning: "Nose radius",
        unit: "m",
      },
      {
        symbol: "Q",
        meaning: "Stagnation-point heat load, summed over the trajectory",
        unit: "MJ/m²",
      },
      { symbol: "n", meaning: "Safety factor" },
      { symbol: "η", meaning: "Material efficiency factor" },
      {
        symbol: (
          <>
            Q<sub>a</sub>
          </>
        ),
        meaning: "Allowable heat load of the material, per kg/m² of TPS",
        unit: "MJ/m²",
      },
      {
        symbol: (
          <>
            m<sub>A</sub>
          </>
        ),
        meaning: "Required TPS areal mass",
        unit: "kg/m²",
      },
      {
        symbol: (
          <>
            ρ<sub>m</sub>
          </>
        ),
        meaning: "Material density",
        unit: "kg/m³",
      },
      { symbol: "t", meaning: "Estimated TPS thickness", unit: "m" },
    ]}
  />
);

export function MaterialTPSSizingAnalyzer() {
  const [values, setValues] =
    useState<MaterialTPSSizingFormValues>(initialFormValues);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);
  const selectedMaterial = getTPSMaterialById(values.materialId);
  const reentryOutputIds =
    "material-tps-sizing-initialAltitudeMeters material-tps-sizing-initialVelocityMetersPerSecond material-tps-sizing-vehicleMassKilograms material-tps-sizing-dragCoefficient material-tps-sizing-referenceAreaSquareMetres material-tps-sizing-noseRadiusMetres";
  const allOutputIds =
    reentryOutputIds +
    " material-tps-sizing-materialId material-tps-sizing-safetyFactor";

  function updateValue(field: MaterialTPSSizingField, value: string) {
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
                Reentry inputs
              </legend>
              <div className="mt-4 grid gap-5 @min-[36rem]/col:grid-cols-2">
                <CalculatorNumberField
                  error={errors.initialAltitudeMeters}
                  field="initialAltitudeMeters"
                  hint={GEOPOTENTIAL_ALTITUDE_HINT}
                  idPrefix="material-tps-sizing"
                  label={INITIAL_GEOPOTENTIAL_ALTITUDE_LABEL}
                  onChange={updateValue}
                  unit="m"
                  value={values.initialAltitudeMeters}
                />
                <CalculatorNumberField
                  error={errors.initialVelocityMetersPerSecond}
                  field="initialVelocityMetersPerSecond"
                  hint="Positive initial velocity along the simplified descent path."
                  idPrefix="material-tps-sizing"
                  label="Initial velocity"
                  onChange={updateValue}
                  unit="m/s"
                  value={values.initialVelocityMetersPerSecond}
                />
                <CalculatorNumberField
                  error={errors.vehicleMassKilograms}
                  field="vehicleMassKilograms"
                  hint="Vehicle mass held constant throughout the trajectory."
                  idPrefix="material-tps-sizing"
                  label="Vehicle mass"
                  onChange={updateValue}
                  unit="kg"
                  value={values.vehicleMassKilograms}
                />
                <CalculatorNumberField
                  error={errors.dragCoefficient}
                  field="dragCoefficient"
                  hint="Positive dimensionless drag coefficient for the vehicle configuration."
                  idPrefix="material-tps-sizing"
                  label="Drag coefficient"
                  onChange={updateValue}
                  unit=""
                  value={values.dragCoefficient}
                />
                <CalculatorNumberField
                  error={errors.referenceAreaSquareMetres}
                  field="referenceAreaSquareMetres"
                  hint="Aerodynamic reference area; the existing analysis also uses it as the protected TPS coverage area."
                  idPrefix="material-tps-sizing"
                  label="Reference area"
                  onChange={updateValue}
                  unit="m²"
                  value={values.referenceAreaSquareMetres}
                />
                <CalculatorNumberField
                  error={errors.noseRadiusMetres}
                  field="noseRadiusMetres"
                  hint="Positive effective stagnation-point nose radius."
                  idPrefix="material-tps-sizing"
                  label="Nose radius"
                  onChange={updateValue}
                  unit="m"
                  value={values.noseRadiusMetres}
                />
              </div>
            </fieldset>

            <fieldset className="mt-10">
              <legend className="text-base font-semibold text-foreground">
                TPS sizing inputs
              </legend>
              <div className="mt-4 grid gap-5 @min-[36rem]/col:grid-cols-2">
                <div className="@min-[36rem]/col:col-span-2">
                  <label
                    className="orbix-field__label block"
                    htmlFor="material-tps-sizing-materialId"
                  >
                    TPS material
                  </label>
                  <div className="orbix-field__control mt-2">
                    <select
                      aria-describedby={
                        errors.materialId
                          ? "material-tps-sizing-materialId-hint material-tps-sizing-materialId-error"
                          : "material-tps-sizing-materialId-hint"
                      }
                      aria-errormessage={
                        errors.materialId
                          ? "material-tps-sizing-materialId-error"
                          : undefined
                      }
                      aria-invalid={Boolean(errors.materialId)}
                      className="orbix-select"
                      id="material-tps-sizing-materialId"
                      onChange={(event) =>
                        updateValue("materialId", event.target.value)
                      }
                      value={values.materialId}
                    >
                      {tpsMaterials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      aria-hidden="true"
                      className="orbix-field__icon orbix-field__icon--end"
                      size={16}
                    />
                  </div>
                  <p
                    className="orbix-field__help mt-2"
                    id="material-tps-sizing-materialId-hint"
                  >
                    Materials from the educational TPS catalog. Density, maximum
                    temperature and reuse status appear with the results.
                  </p>
                  {errors.materialId ? (
                    <p
                      className="orbix-field__error mt-1"
                      id="material-tps-sizing-materialId-error"
                    >
                      <CircleAlert
                        aria-hidden="true"
                        className="shrink-0"
                        size={14}
                      />
                      {errors.materialId}
                    </p>
                  ) : null}
                </div>

                <CalculatorNumberField
                  error={errors.safetyFactor}
                  field="safetyFactor"
                  hint="Positive multiplier applied by the existing TPS sizing analysis."
                  idPrefix="material-tps-sizing"
                  label="Safety factor"
                  onChange={updateValue}
                  unit="×"
                  value={values.safetyFactor}
                />
              </div>

              <ReadoutGrid columns={3}>
                <div>
                  <dt className="orbix-label">Allowable heat load</dt>
                  <dd>
                    <output
                      className="orbix-data mt-1 block"
                      htmlFor="material-tps-sizing-materialId"
                    >
                      {selectedMaterial ? (
                        <LabFigure unit="MJ/m²">
                          {standardFormatter.format(
                            selectedMaterial.allowableHeatLoadMegajoulesPerSquareMetre,
                          )}
                        </LabFigure>
                      ) : (
                        "No material selected"
                      )}
                    </output>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Resolved from the selected catalog material.
                    </p>
                  </dd>
                </div>
                <div>
                  <dt className="orbix-label">Material efficiency factor</dt>
                  <dd>
                    <output
                      className="orbix-data mt-1 block"
                      htmlFor="material-tps-sizing-materialId"
                    >
                      <LabFigure>
                        {standardFormatter.format(
                          DEFAULT_TPS_MATERIAL_EFFICIENCY_FACTOR,
                        )}
                      </LabFigure>
                    </output>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Current analysis default; not overridden by this workflow.
                    </p>
                  </dd>
                </div>
                <div>
                  <dt className="orbix-label">Reference TPS area</dt>
                  <dd>
                    <output
                      className="orbix-data mt-1 block"
                      htmlFor="material-tps-sizing-referenceAreaSquareMetres"
                    >
                      {values.referenceAreaSquareMetres ? (
                        <LabFigure unit="m²">
                          {values.referenceAreaSquareMetres}
                        </LabFigure>
                      ) : (
                        "Not entered"
                      )}
                    </output>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      Shared with the aerodynamic reference-area input.
                    </p>
                  </dd>
                </div>
              </ReadoutGrid>
            </fieldset>

            <ValidationErrorSummary
              errors={[
                errors.materialId,
                errors.initialAltitudeMeters,
                errors.initialVelocityMetersPerSecond,
                errors.vehicleMassKilograms,
                errors.dragCoefficient,
                errors.referenceAreaSquareMetres,
                errors.noseRadiusMetres,
                errors.safetyFactor,
                errors.form,
              ]}
            />

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <p className="min-w-0 flex-[1_1_16rem] text-sm leading-6 text-muted">
                Valid changes rerun material lookup, thermal history, and TPS
                sizing immediately.
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
            id="material-tps-sizing-result"
            title="TPS material selection analysis"
          >
            {result ? (
              <>
                <ReadoutGrid columns={3} title="Selected material">
                  <div>
                    <dt className="orbix-label">Material</dt>
                    <dd>
                      <output
                        className="lab-value-text"
                        htmlFor="material-tps-sizing-materialId"
                      >
                        {result.material.name}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Density</dt>
                    <dd>
                      <output
                        className="orbix-data"
                        htmlFor="material-tps-sizing-materialId"
                      >
                        <LabFigure unit="kg/m³">
                          {integerFormatter.format(
                            result.material.densityKilogramsPerCubicMetre,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Maximum temperature</dt>
                    <dd>
                      {result.material.maximumTemperatureKelvin ===
                      undefined ? (
                        <output
                          className="lab-value-text"
                          htmlFor="material-tps-sizing-materialId"
                        >
                          Unavailable
                        </output>
                      ) : (
                        <output
                          className="orbix-data"
                          htmlFor="material-tps-sizing-materialId"
                        >
                          <LabFigure unit="K">
                            {integerFormatter.format(
                              result.material.maximumTemperatureKelvin,
                            )}
                          </LabFigure>
                        </output>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Reusability</dt>
                    <dd>
                      <output
                        className="lab-value-text"
                        htmlFor="material-tps-sizing-materialId"
                      >
                        {result.material.reusable ? "Reusable" : "Single-use"}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">About</dt>
                    <dd className="text-sm leading-6 text-muted">
                      {result.material.description}
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={2} title="Thermal results">
                  <div>
                    <dt className="orbix-label">Peak heat flux</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={reentryOutputIds}>
                        <LabFigure unit="W/m²">
                          {heatFluxFormatter.format(
                            result.tpsSizing.peakHeatFlux
                              .heatFluxWattsPerSquareMetre,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Total heat load</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={reentryOutputIds}>
                        <LabFigure unit="MJ/m²">
                          {preciseFormatter.format(
                            result.tpsSizing.peakHeatLoad
                              .heatLoadMegajoulesPerSquareMetre,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={3} title="Peak heating point">
                  <div>
                    <dt className="orbix-label">Altitude</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={reentryOutputIds}>
                        <LabFigure unit="m">
                          {standardFormatter.format(
                            result.tpsSizing.peakHeatFlux.altitudeMeters,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Velocity</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={reentryOutputIds}>
                        <LabFigure unit="m/s">
                          {standardFormatter.format(
                            result.tpsSizing.peakHeatFlux
                              .velocityMetersPerSecond,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Elapsed time</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={reentryOutputIds}>
                        <LabFigure unit="s">
                          {standardFormatter.format(
                            result.tpsSizing.peakHeatFlux.timeSeconds,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>

                <ReadoutGrid columns={2} title="TPS sizing">
                  <div>
                    <dt className="orbix-label">Estimated thickness</dt>
                    <dd>
                      <output
                        className="orbix-readout-lg"
                        htmlFor={allOutputIds}
                      >
                        <LabFigure unit="mm">
                          {preciseFormatter.format(
                            result.tpsSizing.estimatedThickness.millimetres,
                          )}
                        </LabFigure>
                      </output>
                      <output
                        className="lab-figure-note"
                        htmlFor={allOutputIds}
                      >
                        <LabFigure unit="m">
                          {preciseFormatter.format(
                            result.tpsSizing.estimatedThickness.metres,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Estimated TPS mass</dt>
                    <dd>
                      <output
                        className="orbix-readout-lg"
                        htmlFor={allOutputIds}
                      >
                        <LabFigure unit="kg">
                          {preciseFormatter.format(
                            result.estimatedTPSMassForArea
                              .totalTPSMassKilograms,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Required areal density</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="kg/m²">
                          {preciseFormatter.format(
                            result.estimatedTPSMassForArea
                              .arealDensityKilogramsPerSquareMetre,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Safety margin</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="%">
                          {standardFormatter.format(
                            result.tpsSizing.safetyMargin.marginPercentage,
                          )}
                        </LabFigure>
                      </output>
                      <output
                        className="lab-figure-note"
                        htmlFor={allOutputIds}
                      >
                        <LabFigure unit="MJ/m²">
                          {preciseFormatter.format(
                            result.tpsSizing.safetyMargin
                              .heatLoadMarginMegajoulesPerSquareMetre,
                          )}
                        </LabFigure>{" "}
                        heat-load margin
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Margin classification</dt>
                    <dd>
                      <output className="lab-value-text" htmlFor={allOutputIds}>
                        {result.suitabilitySummary}
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>
              </>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Enter valid reentry, material, and safety inputs to resolve the
                thermal history and preliminary TPS estimate.
              </NotCalculated>
            )}
          </CalculatorResultSection>
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <section
            aria-labelledby="material-tps-sizing-comparison-title"
            className="border-t border-border pt-7"
          >
            <h3
              className="text-lg font-semibold"
              id="material-tps-sizing-comparison-title"
            >
              Material trade space
            </h3>
            <div className="mt-4 border-t border-border">
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Heat capacity
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  All else equal, higher allowable heat capacity reduces the
                  required areal density and resulting thickness.
                </p>
              </article>
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Density and mass
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Lower density reduces mass for a fixed volume. In this model,
                  areal density sets mass while material density sets thickness.
                </p>
              </article>
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  System tradeoff
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Material choice balances simplified thermal protection,
                  thickness, reuse behavior, and estimated vehicle mass.
                </p>
              </article>
            </div>
          </section>
          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Engineering assumptions
            </p>
            <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted @min-[36rem]/col:grid-cols-2">
              <li>Educational TPS sizing model only</li>
              <li>Material properties are simplified catalog estimates</li>
              <li>No ablation modeling</li>
              <li>No temperature-dependent properties</li>
              <li>No manufacturing constraints</li>
              <li>Not a certified spacecraft thermal-protection design</li>
            </ul>
          </aside>
        </div>
      </div>
    </LabToolLayout>
  );
}
