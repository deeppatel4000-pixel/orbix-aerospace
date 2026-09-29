"use client";

import { Button, DataTable, EquationBlock } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";
import { CircleAlert } from "lucide-react";

import { analyzeTPSMaterialComparison } from "@/features/engineering-lab/analysis";
import {
  EQ_LINE,
  EQ_TERM,
  CalculatorNumberField,
  focusFirstInvalidField,
  focusFirstInvalidFieldOnEnter,
  CalculatorResultSection,
  LAB_TOOL_STACK,
  GEOPOTENTIAL_ALTITUDE_HINT,
  INITIAL_GEOPOTENTIAL_ALTITUDE_LABEL,
  LabToolLayout,
  NotCalculated,
  ReadoutGrid,
  ValidationErrorSummary,
  LabFigure,
  LabValueText,
  EqDot,
  EQ_SUP,
} from "@/features/engineering-lab/components/shared";
import { listTPSMaterials } from "@/features/engineering-lab/materials";
import type {
  TPSMaterialComparisonAnalysis,
  TPSMaterialComparisonInputs,
} from "@/features/engineering-lab/types";

type TPSMaterialComparisonField =
  | "dragCoefficient"
  | "initialAltitudeMeters"
  | "initialVelocityMetersPerSecond"
  | "materialSelection"
  | "noseRadiusMetres"
  | "referenceAreaSquareMetres"
  | "safetyFactor"
  | "vehicleMassKilograms";

type MaterialSelectionMode = "all" | "subset";

interface TPSMaterialComparisonFormValues {
  readonly dragCoefficient: string;
  readonly initialAltitudeMeters: string;
  readonly initialVelocityMetersPerSecond: string;
  readonly noseRadiusMetres: string;
  readonly referenceAreaSquareMetres: string;
  readonly safetyFactor: string;
  readonly vehicleMassKilograms: string;
}

type TPSMaterialComparisonValidationErrors = Readonly<
  Partial<Record<TPSMaterialComparisonField | "form", string>>
>;

interface TPSMaterialComparisonViewState {
  readonly errors: TPSMaterialComparisonValidationErrors;
  readonly result: TPSMaterialComparisonAnalysis | null;
}

const tpsMaterials = listTPSMaterials();
const allMaterialIds = tpsMaterials.map((material) => material.id);

const initialFormValues: TPSMaterialComparisonFormValues = {
  dragCoefficient: "1.5",
  initialAltitudeMeters: "1000",
  initialVelocityMetersPerSecond: "150",
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

function parseRequiredNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function buildAnalysisInputs(
  values: TPSMaterialComparisonFormValues,
  selectionMode: MaterialSelectionMode,
  selectedMaterialIds: readonly string[],
): TPSMaterialComparisonInputs {
  const materialSubset =
    selectionMode === "subset" ? { materialIds: selectedMaterialIds } : {};

  return {
    ...materialSubset,
    dragCoefficient: parseRequiredNumber(values.dragCoefficient),
    initialAltitudeMeters: parseRequiredNumber(values.initialAltitudeMeters),
    initialVelocityMetersPerSecond: parseRequiredNumber(
      values.initialVelocityMetersPerSecond,
    ),
    noseRadiusMetres: parseRequiredNumber(values.noseRadiusMetres),
    referenceAreaSquareMetres: parseRequiredNumber(
      values.referenceAreaSquareMetres,
    ),
    safetyFactor: parseRequiredNumber(values.safetyFactor),
    vehicleMassKilograms: parseRequiredNumber(values.vehicleMassKilograms),
  };
}

function deriveViewState(
  values: TPSMaterialComparisonFormValues,
  selectionMode: MaterialSelectionMode,
  selectedMaterialIds: readonly string[],
): TPSMaterialComparisonViewState {
  try {
    return {
      errors: {},
      result: analyzeTPSMaterialComparison(
        buildAnalysisInputs(values, selectionMode, selectedMaterialIds),
      ),
    };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;

    const normalizedMessage = error.message.toLowerCase();
    const errors: Partial<Record<TPSMaterialComparisonField | "form", string>> =
      {};

    if (
      normalizedMessage.includes("material comparison") ||
      normalizedMessage.includes("material id")
    ) {
      errors.materialSelection = error.message;
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
        <span className={EQ_LINE}>
          <span className={EQ_TERM}>
            M<sub>TPS</sub> = m<sub>A</sub>
            <EqDot />A
          </span>
        </span>
      </>
    }
    label="Heat-load TPS sizing, per material"
    spokenAs="Heat flux equals k times the square root of density over nose radius, times velocity cubed. heat load Q equals the sum of heat flux times time step. Areal mass m A equals safety factor n times Q over efficiency eta times allowable heat load Q a. Thickness t equals m A over material density. TPS mass equals m A times the reference area."
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
      { symbol: "A", meaning: "Reference area", unit: "m²" },
    ]}
  />
);

export function TPSMaterialComparisonAnalyzer() {
  const [values, setValues] =
    useState<TPSMaterialComparisonFormValues>(initialFormValues);
  const [selectionMode, setSelectionMode] =
    useState<MaterialSelectionMode>("all");
  const [selectedMaterialIds, setSelectedMaterialIds] =
    useState<readonly string[]>(allMaterialIds);
  const { errors, result } = useMemo(
    () => deriveViewState(values, selectionMode, selectedMaterialIds),
    [selectedMaterialIds, selectionMode, values],
  );
  const displayedSelection =
    selectionMode === "all" ? allMaterialIds : selectedMaterialIds;
  const reentryOutputIds =
    "tps-material-comparison-initialAltitudeMeters tps-material-comparison-initialVelocityMetersPerSecond tps-material-comparison-vehicleMassKilograms tps-material-comparison-dragCoefficient tps-material-comparison-referenceAreaSquareMetres tps-material-comparison-noseRadiusMetres";
  const allOutputIds =
    reentryOutputIds +
    " tps-material-comparison-safetyFactor tps-material-comparison-mode-all tps-material-comparison-mode-subset";

  function updateValue(field: TPSMaterialComparisonField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function compareAllMaterials() {
    setSelectionMode("all");
    setSelectedMaterialIds(allMaterialIds);
  }

  function compareSubset() {
    setSelectionMode("subset");
  }

  function toggleMaterial(materialId: string, selected: boolean) {
    setSelectionMode("subset");
    setSelectedMaterialIds((current) =>
      selected
        ? Array.from(new Set([...current, materialId]))
        : current.filter((id) => id !== materialId),
    );
  }

  function removeMaterial(materialId: string) {
    toggleMaterial(materialId, false);
  }

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    focusFirstInvalidField(event.currentTarget);
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
    compareAllMaterials();
  }

  return (
    <LabToolLayout equation={toolEquation}>
      <div className={LAB_TOOL_STACK}>
        <div className="@container/col min-w-0">
          <form
            noValidate
            onKeyDown={focusFirstInvalidFieldOnEnter}
            onSubmit={preventSubmission}
          >
            <fieldset>
              <legend className="text-base font-semibold text-foreground">
                Shared reentry conditions
              </legend>
              <div className="mt-4 grid gap-5 @min-[36rem]/col:grid-cols-2">
                <CalculatorNumberField
                  error={errors.initialAltitudeMeters}
                  field="initialAltitudeMeters"
                  hint={GEOPOTENTIAL_ALTITUDE_HINT}
                  idPrefix="tps-material-comparison"
                  label={INITIAL_GEOPOTENTIAL_ALTITUDE_LABEL}
                  onChange={updateValue}
                  unit="m"
                  value={values.initialAltitudeMeters}
                />
                <CalculatorNumberField
                  error={errors.initialVelocityMetersPerSecond}
                  field="initialVelocityMetersPerSecond"
                  hint="Positive initial velocity used for every material case."
                  idPrefix="tps-material-comparison"
                  label="Initial velocity"
                  onChange={updateValue}
                  unit="m/s"
                  value={values.initialVelocityMetersPerSecond}
                />
                <CalculatorNumberField
                  error={errors.vehicleMassKilograms}
                  field="vehicleMassKilograms"
                  hint="Constant vehicle mass shared by all comparison candidates."
                  idPrefix="tps-material-comparison"
                  label="Vehicle mass"
                  onChange={updateValue}
                  unit="kg"
                  value={values.vehicleMassKilograms}
                />
                <CalculatorNumberField
                  error={errors.dragCoefficient}
                  field="dragCoefficient"
                  hint="Dimensionless drag coefficient shared by the reentry analyses."
                  idPrefix="tps-material-comparison"
                  label="Drag coefficient"
                  onChange={updateValue}
                  unit=""
                  value={values.dragCoefficient}
                />
                <CalculatorNumberField
                  error={errors.referenceAreaSquareMetres}
                  field="referenceAreaSquareMetres"
                  hint="Aerodynamic reference area and protected area used by the existing analysis."
                  idPrefix="tps-material-comparison"
                  label="Reference area"
                  onChange={updateValue}
                  unit="m²"
                  value={values.referenceAreaSquareMetres}
                />
                <CalculatorNumberField
                  error={errors.noseRadiusMetres}
                  field="noseRadiusMetres"
                  hint="Effective stagnation-point nose radius used by every case."
                  idPrefix="tps-material-comparison"
                  label="Nose radius"
                  onChange={updateValue}
                  unit="m"
                  value={values.noseRadiusMetres}
                />
              </div>
            </fieldset>

            <fieldset className="mt-10">
              <legend className="text-base font-semibold text-foreground">
                TPS design
              </legend>
              <div className="mt-4">
                <CalculatorNumberField
                  error={errors.safetyFactor}
                  field="safetyFactor"
                  hint="Positive heat-load multiplier applied equally to every material."
                  idPrefix="tps-material-comparison"
                  label="Safety factor"
                  onChange={updateValue}
                  unit="×"
                  value={values.safetyFactor}
                />
              </div>
            </fieldset>

            <fieldset
              aria-describedby={
                errors.materialSelection
                  ? "tps-material-comparison-selection-hint tps-material-comparison-selection-error"
                  : "tps-material-comparison-selection-hint"
              }
              aria-errormessage={
                errors.materialSelection
                  ? "tps-material-comparison-selection-error"
                  : undefined
              }
              aria-invalid={Boolean(errors.materialSelection)}
              className="mt-8 border-t border-border pt-7"
            >
              <legend className="text-base font-semibold text-foreground">
                Material selection
              </legend>
              <p
                className="mt-4 text-sm leading-6 text-muted"
                id="tps-material-comparison-selection-hint"
              >
                Compare the complete catalog or pass a selected catalog subset
                to the existing comparison analysis.
              </p>

              <div className="mt-4 grid gap-3 @min-[36rem]/col:grid-cols-2">
                <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded border border-border-control bg-surface-input px-4 py-3 text-sm font-medium transition-colors hover:border-muted has-checked:border-accent has-checked:bg-surface-raised">
                  <input
                    checked={selectionMode === "all"}
                    className="h-4 w-4 accent-current"
                    id="tps-material-comparison-mode-all"
                    name="tps-material-comparison-mode"
                    onChange={compareAllMaterials}
                    type="radio"
                    value="all"
                  />
                  Compare all materials
                </label>
                <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded border border-border-control bg-surface-input px-4 py-3 text-sm font-medium transition-colors hover:border-muted has-checked:border-accent has-checked:bg-surface-raised">
                  <input
                    checked={selectionMode === "subset"}
                    className="h-4 w-4 accent-current"
                    id="tps-material-comparison-mode-subset"
                    name="tps-material-comparison-mode"
                    onChange={compareSubset}
                    type="radio"
                    value="subset"
                  />
                  Compare selected subset
                </label>
              </div>

              <div className="mt-4 space-y-3">
                {tpsMaterials.map((material) => {
                  const checked =
                    selectionMode === "all" ||
                    selectedMaterialIds.includes(material.id);
                  const inputId =
                    "tps-material-comparison-material-" + material.id;

                  return (
                    <label
                      className="flex cursor-pointer items-start gap-3 rounded border border-border-control bg-surface-input p-4 transition-colors hover:border-muted has-checked:border-accent has-checked:bg-surface-raised"
                      htmlFor={inputId}
                      key={material.id}
                    >
                      <input
                        checked={checked}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-current"
                        id={inputId}
                        onChange={(event) =>
                          toggleMaterial(material.id, event.target.checked)
                        }
                        type="checkbox"
                      />
                      <span>
                        <span className="block text-sm font-semibold">
                          {material.name}
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-muted">
                          {integerFormatter.format(
                            material.densityKilogramsPerCubicMetre,
                          )}{" "}
                          kg/m³,{" "}
                          {material.maximumTemperatureKelvin === undefined
                            ? "temperature unavailable"
                            : integerFormatter.format(
                                material.maximumTemperatureKelvin,
                              ) + " K"}
                          , {material.reusable ? "reusable" : "single-use"}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {displayedSelection.map((materialId) => {
                  const material = tpsMaterials.find(
                    (candidate) => candidate.id === materialId,
                  );

                  if (!material) return null;

                  return (
                    <Button
                      className="max-w-full"
                      key={material.id}
                      onClick={() => removeMaterial(material.id)}
                      variant="secondary"
                    >
                      Remove {material.name}
                    </Button>
                  );
                })}
                {displayedSelection.length === 0 ? (
                  <span className="orbix-field__error">
                    No materials selected
                  </span>
                ) : null}
              </div>

              {errors.materialSelection ? (
                <p
                  className="orbix-field__error mt-3"
                  id="tps-material-comparison-selection-error"
                >
                  <CircleAlert
                    aria-hidden="true"
                    className="shrink-0"
                    size={14}
                  />
                  {errors.materialSelection}
                </p>
              ) : null}

              <Button
                className="mt-4"
                variant="secondary"
                onClick={compareAllMaterials}
              >
                Reset to all materials
              </Button>
            </fieldset>

            <ValidationErrorSummary
              errors={[
                errors.initialAltitudeMeters,
                errors.initialVelocityMetersPerSecond,
                errors.vehicleMassKilograms,
                errors.dragCoefficient,
                errors.referenceAreaSquareMetres,
                errors.noseRadiusMetres,
                errors.safetyFactor,
                errors.materialSelection,
                errors.form,
              ]}
            />

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <p className="min-w-0 flex-[1_1_16rem] text-sm leading-6 text-muted">
                Valid changes rerun the complete catalog comparison immediately.
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
            id="tps-material-comparison-result"
            title="TPS material comparison"
          >
            {result ? (
              <>
                <ReadoutGrid columns={2} title="Recommended material">
                  <div>
                    <dt className="orbix-label">Ranking score</dt>
                    <dd>
                      <output
                        className="orbix-readout-lg"
                        htmlFor={allOutputIds}
                      >
                        <LabFigure>
                          {standardFormatter.format(
                            result.recommendedMaterial.rankingScore,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Material</dt>
                    <dd>
                      <output className="lab-value-text" htmlFor={allOutputIds}>
                        {result.recommendedMaterial.material.name}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Thermal margin</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="%">
                          {standardFormatter.format(
                            result.recommendedMaterial.heatLoadMargin
                              .marginPercentage,
                          )}
                        </LabFigure>
                      </output>
                      <output
                        className="lab-figure-note"
                        htmlFor={allOutputIds}
                      >
                        {result.recommendedMaterial.marginClassification}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Estimated TPS mass</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="kg">
                          {preciseFormatter.format(
                            result.recommendedMaterial.estimatedTPSMass
                              .totalTPSMassKilograms,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Estimated thickness</dt>
                    <dd>
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        <LabFigure unit="mm">
                          {preciseFormatter.format(
                            result.recommendedMaterial.thickness.millimetres,
                          )}
                        </LabFigure>
                      </output>
                    </dd>
                  </div>
                </ReadoutGrid>
                <p className="text-sm leading-6 text-muted">
                  {result.recommendedMaterial.rankingLogic.description}
                </p>

                {result.results.map((entry) => (
                  <ReadoutGrid
                    columns={3}
                    key={entry.material.id}
                    title={
                      entry.material.id ===
                      result.recommendedMaterial.material.id
                        ? entry.material.name + ", recommended"
                        : entry.material.name
                    }
                  >
                    <div>
                      <dt className="orbix-label">Density</dt>
                      <dd className="orbix-data">
                        <LabFigure unit="kg/m³">
                          {integerFormatter.format(
                            entry.material.densityKilogramsPerCubicMetre,
                          )}
                        </LabFigure>
                      </dd>
                    </div>
                    <div>
                      <dt className="orbix-label">Maximum temperature</dt>
                      <dd>
                        {entry.material.maximumTemperatureKelvin ===
                        undefined ? (
                          <LabValueText>Unavailable</LabValueText>
                        ) : (
                          <span className="orbix-data">
                            <LabFigure unit="K">
                              {integerFormatter.format(
                                entry.material.maximumTemperatureKelvin,
                              )}
                            </LabFigure>
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="orbix-label">Reusability</dt>
                      <dd>
                        <LabValueText>
                          {entry.material.reusable ? "Reusable" : "Single-use"}
                        </LabValueText>
                      </dd>
                    </div>
                    <div>
                      <dt className="orbix-label">About</dt>
                      <dd className="text-sm leading-6 text-muted">
                        {entry.material.description}
                      </dd>
                    </div>
                  </ReadoutGrid>
                ))}
              </>
            ) : (
              <NotCalculated invalid={Object.values(errors).some(Boolean)}>
                Enter valid shared conditions and select at least one material
                to generate the ranked comparison.
              </NotCalculated>
            )}
          </CalculatorResultSection>

          {result ? (
            <DataTable
              caption="TPS materials ranked for the shared reentry scenario"
              columns={[
                {
                  key: "material",
                  header: "Material",
                  cell: (entry) =>
                    entry.material.id === result.recommendedMaterial.material.id
                      ? entry.material.name + ", recommended"
                      : entry.material.name,
                },
                {
                  key: "mass",
                  header: "TPS mass",
                  unit: "kg",
                  numeric: true,
                  cell: (entry) => (
                    <output htmlFor={allOutputIds}>
                      {preciseFormatter.format(
                        entry.estimatedTPSMass.totalTPSMassKilograms,
                      )}
                    </output>
                  ),
                },
                {
                  key: "thickness",
                  header: "Thickness",
                  unit: "mm",
                  numeric: true,
                  cell: (entry) => (
                    <output htmlFor={allOutputIds}>
                      {preciseFormatter.format(entry.thickness.millimetres)}
                    </output>
                  ),
                },
                {
                  key: "margin",
                  header: "Heat margin",
                  unit: "%",
                  numeric: true,
                  cell: (entry) => (
                    <output htmlFor={allOutputIds}>
                      {standardFormatter.format(
                        entry.heatLoadMargin.marginPercentage,
                      )}
                    </output>
                  ),
                },
                {
                  key: "score",
                  header: "Score",
                  numeric: true,
                  cell: (entry) => (
                    <output htmlFor={allOutputIds}>
                      {standardFormatter.format(entry.rankingScore)}
                    </output>
                  ),
                },
              ]}
              getRowKey={(entry) => entry.material.id}
              rows={result.results}
            />
          ) : null}
        </div>

        <div className="@container/col min-w-0 space-y-5">
          <section
            aria-labelledby="tps-material-comparison-education-title"
            className="border-t border-border pt-7"
          >
            <h3
              className="text-lg font-semibold"
              id="tps-material-comparison-education-title"
            >
              Reading the trade space
            </h3>
            <div className="mt-4 border-t border-border">
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Vehicle mass
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  A lighter TPS estimate reduces the protected system mass
                  carried by the vehicle.
                </p>
              </article>
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Layer thickness
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  A thicker layer can add protective material and volume, but
                  may also add mass and integration complexity.
                </p>
              </article>
              <article className="border-b border-border py-4">
                <h4 className="text-sm font-semibold text-foreground">
                  Ranking priority
                </h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Thermal margin is primary in this educational ranking,
                  followed by lower mass and then lower thickness.
                </p>
              </article>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              Real spacecraft TPS selection requires many additional
              constraints, detailed thermal analysis, and qualification testing.
            </p>
          </section>
          <aside className="orbix-lab-note">
            <p className="orbix-lab-note__title font-medium">
              Engineering assumptions
            </p>
            <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted @min-[36rem]/col:grid-cols-2">
              <li>Material properties are simplified educational estimates</li>
              <li>Ranking is not spacecraft certification</li>
              <li>Manufacturing and cost are excluded</li>
              <li>Attachment methods and degradation are excluded</li>
              <li>Real selection requires testing</li>
              <li>Detailed thermal analysis remains necessary</li>
            </ul>
          </aside>
        </div>
      </div>
    </LabToolLayout>
  );
}
