"use client";

import { Button, Tag } from "@/components/ui";
import { useMemo, useState, type FormEvent } from "react";
import {
  CircleAlert,
  AlertTriangle,
  Award,
  RotateCcw,
  Scale,
  Shield,
  X,
} from "lucide-react";

import { analyzeTPSMaterialComparison } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  focusFirstInvalidField,
  focusFirstInvalidFieldOnEnter,
  CalculatorResultSection,
  NotCalculated,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import { listTPSMaterials } from "@/features/engineering-lab/materials";
import type {
  TPSMaterialComparisonAnalysis,
  TPSMaterialComparisonInputs,
} from "@/features/engineering-lab/types";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";

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
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(32rem,1.18fr)] xl:gap-10">
      <div>
        <form
          noValidate
          onKeyDown={focusFirstInvalidFieldOnEnter}
          onSubmit={preventSubmission}
        >
          <fieldset>
            <legend className="text-base font-semibold text-foreground">
              Shared reentry conditions
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <CalculatorNumberField
                error={errors.initialAltitudeMeters}
                field="initialAltitudeMeters"
                hint={
                  "Starting altitude from sea level through " +
                  STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES.toLocaleString(
                    "en-US",
                  ) +
                  " metres."
                }
                idPrefix="tps-material-comparison"
                label="Initial altitude"
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

          <fieldset className="mt-8 border-t border-border pt-7">
            <legend className="text-base font-semibold text-foreground">
              TPS design
            </legend>
            <div className="mt-5">
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
              Compare the complete catalog or pass a selected catalog subset to
              the existing comparison analysis.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-border-control bg-surface-input p-4 transition-colors hover:border-muted has-checked:border-accent has-checked:bg-surface-raised"
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
                    key={material.id}
                    onClick={() => removeMaterial(material.id)}
                    variant="secondary"
                  >
                    <X aria-hidden="true" size={16} />
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
              <RotateCcw aria-hidden="true" size={16} />
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

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-sm leading-6 text-muted">
              Valid changes rerun the complete catalog comparison immediately.
            </p>
            <Button
              className="shrink-0 whitespace-nowrap sm:ml-auto"
              variant="secondary"
              onClick={resetAnalyzer}
            >
              <RotateCcw aria-hidden="true" size={16} />
              Reset inputs
            </Button>
          </div>
        </form>

        <section
          aria-labelledby="tps-material-comparison-education-title"
          className="mt-8 border-t border-border pt-7"
        >
          <p className="orbix-label">Educational comparison</p>
          <h3
            className="mt-1 text-lg font-semibold"
            id="tps-material-comparison-education-title"
          >
            Reading the trade space
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <article className="rounded-md border border-border-subtle bg-surface-raised p-4">
              <Scale aria-hidden="true" className="text-muted" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Vehicle mass</h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                A lighter TPS estimate reduces the protected system mass carried
                by the vehicle.
              </p>
            </article>
            <article className="rounded-md border border-border-subtle bg-surface-raised p-4">
              <Shield aria-hidden="true" className="text-muted" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Layer thickness</h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                A thicker layer can add protective material and volume, but may
                also add mass and integration complexity.
              </p>
            </article>
            <article className="rounded-md border border-border-subtle bg-surface-raised p-4">
              <Award aria-hidden="true" className="text-muted" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Ranking priority</h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                Thermal margin is primary in this educational ranking, followed
                by lower mass and then lower thickness.
              </p>
            </article>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            Real spacecraft TPS selection requires many additional constraints,
            detailed thermal analysis, and qualification testing.
          </p>
        </section>
      </div>

      <div className="min-w-0 space-y-5">
        <CalculatorResultSection
          eyebrow="Catalog-wide ranked comparison"
          icon={Award}
          id="tps-material-comparison-result"
          title="TPS material comparison"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="tps-material-comparison-recommended-title">
                <h4
                  className="text-sm font-semibold text-foreground"
                  id="tps-material-comparison-recommended-title"
                >
                  Recommended material
                </h4>
                <output
                  className="mt-3 block text-2xl font-semibold"
                  htmlFor={allOutputIds}
                >
                  {result.recommendedMaterial.material.name}
                </output>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="orbix-label">Ranking score</dt>
                    <dd className="mt-1">
                      <output className="orbix-data-lg" htmlFor={allOutputIds}>
                        {standardFormatter.format(
                          result.recommendedMaterial.rankingScore,
                        )}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Thermal margin</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        {standardFormatter.format(
                          result.recommendedMaterial.heatLoadMargin
                            .marginPercentage,
                        )}
                        %,{" "}
                        {result.recommendedMaterial.marginClassification.toLowerCase()}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Estimated TPS mass</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        {preciseFormatter.format(
                          result.recommendedMaterial.estimatedTPSMass
                            .totalTPSMassKilograms,
                        )}{" "}
                        kg
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="orbix-label">Estimated thickness</dt>
                    <dd className="mt-1">
                      <output className="orbix-data" htmlFor={allOutputIds}>
                        {preciseFormatter.format(
                          result.recommendedMaterial.thickness.millimetres,
                        )}{" "}
                        mm
                      </output>
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 rounded-md border border-border-subtle bg-surface-raised p-4 text-sm leading-6 text-muted">
                  {result.recommendedMaterial.rankingLogic.description}
                </p>
              </section>

              <section
                aria-labelledby="tps-material-comparison-table-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="text-sm font-semibold text-foreground"
                  id="tps-material-comparison-table-title"
                >
                  Comparison table
                </h4>
                <div
                  aria-label="Scrollable TPS material comparison table"
                  className="orbix-table-wrap mt-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  role="region"
                  tabIndex={0}
                >
                  <table className="orbix-table w-full min-w-[44rem]">
                    <caption className="sr-only">
                      TPS materials ranked for the shared reentry scenario
                    </caption>
                    <thead className="bg-surface-raised">
                      <tr>
                        <th scope="col">Material</th>
                        <th scope="col">TPS Mass</th>
                        <th scope="col">Thickness</th>
                        <th scope="col">Heat Margin</th>
                        <th scope="col">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results.map((entry) => {
                        const recommended =
                          entry.material.id ===
                          result.recommendedMaterial.material.id;

                        return (
                          <tr
                            className={
                              recommended ? "bg-surface-raised" : undefined
                            }
                            key={entry.material.id}
                          >
                            <th scope="row">
                              {entry.material.name}
                              {recommended ? (
                                <Tag className="ml-2">Recommended</Tag>
                              ) : null}
                            </th>
                            <td className="orbix-num">
                              <output htmlFor={allOutputIds}>
                                {preciseFormatter.format(
                                  entry.estimatedTPSMass.totalTPSMassKilograms,
                                )}{" "}
                                kg
                              </output>
                            </td>
                            <td className="orbix-num">
                              <output htmlFor={allOutputIds}>
                                {preciseFormatter.format(
                                  entry.thickness.millimetres,
                                )}{" "}
                                mm
                              </output>
                            </td>
                            <td className="orbix-num">
                              <output htmlFor={allOutputIds}>
                                {standardFormatter.format(
                                  entry.heatLoadMargin.marginPercentage,
                                )}
                                %
                              </output>
                            </td>
                            <td className="orbix-num font-semibold">
                              <output htmlFor={allOutputIds}>
                                {standardFormatter.format(entry.rankingScore)}
                              </output>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section
                aria-labelledby="tps-material-comparison-details-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="text-sm font-semibold text-foreground"
                  id="tps-material-comparison-details-title"
                >
                  Material details
                </h4>
                <div className="mt-3 grid gap-4">
                  {result.results.map((entry) => (
                    <article
                      className="rounded-md border border-border-subtle bg-surface-raised p-4"
                      key={entry.material.id}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h5 className="font-semibold">{entry.material.name}</h5>
                        {entry.material.id ===
                        result.recommendedMaterial.material.id ? (
                          <Tag>Recommended</Tag>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {entry.material.description}
                      </p>
                      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div>
                          <dt className="orbix-label">Density</dt>
                          <dd className="mt-1 font-mono text-xs">
                            {integerFormatter.format(
                              entry.material.densityKilogramsPerCubicMetre,
                            )}{" "}
                            kg/m³
                          </dd>
                        </div>
                        <div>
                          <dt className="orbix-label">Maximum temperature</dt>
                          <dd className="mt-1 font-mono text-xs">
                            {entry.material.maximumTemperatureKelvin ===
                            undefined
                              ? "Unavailable"
                              : integerFormatter.format(
                                  entry.material.maximumTemperatureKelvin,
                                ) + " K"}
                          </dd>
                        </div>
                        <div>
                          <dt className="orbix-label">Reusability</dt>
                          <dd className="mt-1 font-mono text-xs">
                            {entry.material.reusable
                              ? "Reusable"
                              : "Single-use"}
                          </dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <NotCalculated invalid={Object.values(errors).some(Boolean)}>
              Enter valid shared conditions and select at least one material to
              generate the ranked comparison.
            </NotCalculated>
          )}
        </CalculatorResultSection>

        <aside className="orbix-lab-note">
          <p className="orbix-lab-note__title">
            <AlertTriangle aria-hidden="true" size={17} />
            Engineering assumptions
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm leading-6 text-muted sm:grid-cols-2">
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
  );
}
