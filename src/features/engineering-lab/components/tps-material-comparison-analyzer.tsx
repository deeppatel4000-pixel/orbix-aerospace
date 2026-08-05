"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
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
  CalculatorResultSection,
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
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
    compareAllMaterials();
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(32rem,1.18fr)] xl:gap-10">
      <div>
        <form noValidate onSubmit={preventSubmission}>
          <fieldset>
            <legend className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
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
                unit="CD"
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
            <legend className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
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
            <legend className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
              Material selection
            </legend>
            <p
              className="mt-4 text-xs leading-5 text-muted"
              id="tps-material-comparison-selection-hint"
            >
              Compare the complete catalog or pass a selected catalog subset to
              the existing comparison analysis.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/45 px-4 py-3 text-sm font-semibold transition-colors has-checked:border-accent/55 has-checked:bg-accent/7">
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
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/45 px-4 py-3 text-sm font-semibold transition-colors has-checked:border-accent/55 has-checked:bg-accent/7">
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
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background/35 p-4 transition-colors has-checked:border-accent/40"
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
                      <span className="mt-1 block text-xs leading-5 text-muted">
                        {integerFormatter.format(
                          material.densityKilogramsPerCubicMetre,
                        )}{" "}
                        kg/m³ ·{" "}
                        {material.maximumTemperatureKelvin === undefined
                          ? "temperature unavailable"
                          : integerFormatter.format(
                              material.maximumTemperatureKelvin,
                            ) + " K"}{" "}
                        · {material.reusable ? "reusable" : "single-use"}
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
                  <span
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 py-1.5 pr-1.5 pl-3 text-xs"
                    key={material.id}
                  >
                    {material.name}
                    <button
                      aria-label={"Remove " + material.name}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-signal/10 hover:text-signal"
                      onClick={() => removeMaterial(material.id)}
                      type="button"
                    >
                      <X aria-hidden="true" size={14} />
                    </button>
                  </span>
                );
              })}
              {displayedSelection.length === 0 ? (
                <span className="text-xs text-signal">
                  No materials selected
                </span>
              ) : null}
            </div>

            {errors.materialSelection ? (
              <p
                className="mt-3 text-xs leading-5 text-signal"
                id="tps-material-comparison-selection-error"
              >
                {errors.materialSelection}
              </p>
            ) : null}

            <button
              className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-surface/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-accent/60 hover:text-accent"
              onClick={compareAllMaterials}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={16} />
              Reset to all materials
            </button>
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
            <p className="text-xs leading-5 text-muted">
              Valid changes rerun the complete catalog comparison immediately.
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
          aria-labelledby="tps-material-comparison-education-title"
          className="mt-8 border-t border-border pt-7"
        >
          <p className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
            Educational comparison
          </p>
          <h3
            className="mt-1 text-lg font-semibold"
            id="tps-material-comparison-education-title"
          >
            Reading the trade space
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Scale aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Vehicle mass</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                A lighter TPS estimate reduces the protected system mass carried
                by the vehicle.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Shield aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Layer thickness</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                A thicker layer can add protective material and volume, but may
                also add mass and integration complexity.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Award aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Ranking priority</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                Thermal margin is primary in this educational ranking, followed
                by lower mass and then lower thickness.
              </p>
            </article>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">
            Real spacecraft TPS selection requires many additional constraints,
            detailed thermal analysis, and qualification testing.
          </p>
        </section>
      </div>

      <div className="space-y-5">
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
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
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
                    <dt className="text-xs text-muted">Ranking score</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {standardFormatter.format(
                          result.recommendedMaterial.rankingScore,
                        )}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Thermal margin</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={allOutputIds}
                      >
                        {standardFormatter.format(
                          result.recommendedMaterial.heatLoadMargin
                            .marginPercentage,
                        )}
                        % · {result.recommendedMaterial.marginClassification}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Estimated TPS mass</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={allOutputIds}
                      >
                        {preciseFormatter.format(
                          result.recommendedMaterial.estimatedTPSMass
                            .totalTPSMassKilograms,
                        )}{" "}
                        kg
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Estimated thickness</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor={allOutputIds}
                      >
                        {preciseFormatter.format(
                          result.recommendedMaterial.thickness.millimetres,
                        )}{" "}
                        mm
                      </output>
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 rounded-xl border border-accent/25 bg-accent/7 p-4 text-xs leading-5 text-muted">
                  {result.recommendedMaterial.rankingLogic.description}
                </p>
              </section>

              <section
                aria-labelledby="tps-material-comparison-table-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="tps-material-comparison-table-title"
                >
                  Comparison table
                </h4>
                <div
                  aria-label="Scrollable TPS material comparison table"
                  className="mt-3 overflow-x-auto rounded-xl border border-border outline-none focus:ring-2 focus:ring-accent/25"
                  role="region"
                  tabIndex={0}
                >
                  <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
                    <caption className="sr-only">
                      TPS materials ranked for the shared reentry scenario
                    </caption>
                    <thead className="bg-surface/85">
                      <tr>
                        <th className="px-4 py-3 font-semibold" scope="col">
                          Material
                        </th>
                        <th className="px-4 py-3 font-semibold" scope="col">
                          TPS Mass
                        </th>
                        <th className="px-4 py-3 font-semibold" scope="col">
                          Thickness
                        </th>
                        <th className="px-4 py-3 font-semibold" scope="col">
                          Heat Margin
                        </th>
                        <th className="px-4 py-3 font-semibold" scope="col">
                          Score
                        </th>
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
                              recommended
                                ? "border-t border-accent/30 bg-accent/7"
                                : "border-t border-border"
                            }
                            key={entry.material.id}
                          >
                            <th className="px-4 py-3 font-semibold" scope="row">
                              {entry.material.name}
                              {recommended ? (
                                <span className="ml-2 rounded-full bg-accent/12 px-2 py-0.5 font-mono text-[0.62rem] tracking-wide text-accent uppercase">
                                  Recommended
                                </span>
                              ) : null}
                            </th>
                            <td className="px-4 py-3 font-mono">
                              <output htmlFor={allOutputIds}>
                                {preciseFormatter.format(
                                  entry.estimatedTPSMass.totalTPSMassKilograms,
                                )}{" "}
                                kg
                              </output>
                            </td>
                            <td className="px-4 py-3 font-mono">
                              <output htmlFor={allOutputIds}>
                                {preciseFormatter.format(
                                  entry.thickness.millimetres,
                                )}{" "}
                                mm
                              </output>
                            </td>
                            <td className="px-4 py-3 font-mono">
                              <output htmlFor={allOutputIds}>
                                {standardFormatter.format(
                                  entry.heatLoadMargin.marginPercentage,
                                )}
                                %
                              </output>
                            </td>
                            <td className="px-4 py-3 font-mono font-semibold text-accent">
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
                  className="font-mono text-[0.65rem] tracking-[0.14em] text-accent uppercase"
                  id="tps-material-comparison-details-title"
                >
                  Material details
                </h4>
                <div className="mt-3 grid gap-4">
                  {result.results.map((entry) => (
                    <article
                      className="rounded-xl border border-border bg-background/35 p-4"
                      key={entry.material.id}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h5 className="font-semibold">{entry.material.name}</h5>
                        {entry.material.id ===
                        result.recommendedMaterial.material.id ? (
                          <span className="rounded-full bg-accent/12 px-2.5 py-1 font-mono text-[0.62rem] tracking-wide text-accent uppercase">
                            Recommended
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted">
                        {entry.material.description}
                      </p>
                      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div>
                          <dt className="text-[0.68rem] text-muted">Density</dt>
                          <dd className="mt-1 font-mono text-xs">
                            {integerFormatter.format(
                              entry.material.densityKilogramsPerCubicMetre,
                            )}{" "}
                            kg/m³
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[0.68rem] text-muted">
                            Maximum temperature
                          </dt>
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
                          <dt className="text-[0.68rem] text-muted">
                            Reusability
                          </dt>
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
            <div className="py-5">
              <p className="font-mono text-3xl text-muted">—</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                Enter valid shared conditions and select at least one material
                to generate the ranked comparison.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <aside className="rounded-2xl border border-signal/25 bg-signal/6 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-signal">
            <AlertTriangle aria-hidden="true" size={17} />
            Engineering assumptions
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-xs leading-5 text-muted sm:grid-cols-2">
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
