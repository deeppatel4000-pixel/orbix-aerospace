"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Flame,
  RotateCcw,
  Scale,
  Shield,
  Thermometer,
} from "lucide-react";

import {
  analyzeMaterialTPSSizing,
  DEFAULT_TPS_MATERIAL_EFFICIENCY_FACTOR,
} from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import {
  getTPSMaterialById,
  listTPSMaterials,
} from "@/features/engineering-lab/materials";
import type {
  MaterialTPSSizingAnalysis,
  MaterialTPSSizingInputs,
  TPSMaterial,
} from "@/features/engineering-lab/types";
import { STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES } from "@/features/engineering-lab/types";

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

function formatMaterialOption(material: TPSMaterial): string {
  const maximumTemperature =
    material.maximumTemperatureKelvin === undefined
      ? "temperature not specified"
      : integerFormatter.format(material.maximumTemperatureKelvin) + " K";
  const reuseStatus = material.reusable ? "reusable" : "single-use";

  return (
    material.name +
    " — " +
    integerFormatter.format(material.densityKilogramsPerCubicMetre) +
    " kg/m³ — " +
    maximumTemperature +
    " — " +
    reuseStatus
  );
}

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
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(24rem,1.1fr)] xl:gap-10">
      <div>
        <form noValidate onSubmit={preventSubmission}>
          <fieldset>
            <legend className="orbix-label text-accent">Reentry inputs</legend>
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
                idPrefix="material-tps-sizing"
                label="Initial altitude"
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
                unit="CD"
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

          <fieldset className="mt-8 border-t border-border pt-7">
            <legend className="orbix-label text-accent">
              TPS sizing inputs
            </legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  className="text-sm font-semibold"
                  htmlFor="material-tps-sizing-materialId"
                >
                  TPS material
                </label>
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
                  className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background/55 px-4 py-3 text-sm text-foreground transition-colors outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                  id="material-tps-sizing-materialId"
                  onChange={(event) =>
                    updateValue("materialId", event.target.value)
                  }
                  value={values.materialId}
                >
                  {tpsMaterials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {formatMaterialOption(material)}
                    </option>
                  ))}
                </select>
                <p
                  className="mt-2 text-xs leading-5 text-muted"
                  id="material-tps-sizing-materialId-hint"
                >
                  Options come directly from the educational TPS material
                  catalog and include density, maximum temperature, and reuse
                  status.
                </p>
                {errors.materialId ? (
                  <p
                    className="mt-1.5 text-xs leading-5 text-signal"
                    id="material-tps-sizing-materialId-error"
                  >
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

            <div className="mt-5 grid gap-3 rounded-2xl border border-border bg-background/35 p-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted">Allowable heat load</p>
                <output
                  className="mt-1 block font-mono text-sm font-semibold"
                  htmlFor="material-tps-sizing-materialId"
                >
                  {selectedMaterial
                    ? standardFormatter.format(
                        selectedMaterial.allowableHeatLoadMegajoulesPerSquareMetre,
                      )
                    : "—"}{" "}
                  MJ/m²
                </output>
                <p className="mt-1 text-[0.68rem] leading-4 text-muted">
                  Resolved from the selected catalog material.
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Material efficiency factor</p>
                <output
                  className="mt-1 block font-mono text-sm font-semibold"
                  htmlFor="material-tps-sizing-materialId"
                >
                  {standardFormatter.format(
                    DEFAULT_TPS_MATERIAL_EFFICIENCY_FACTOR,
                  )}
                </output>
                <p className="mt-1 text-[0.68rem] leading-4 text-muted">
                  Current analysis default; not overridden by this workflow.
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Reference TPS area</p>
                <output
                  className="mt-1 block font-mono text-sm font-semibold"
                  htmlFor="material-tps-sizing-referenceAreaSquareMetres"
                >
                  {values.referenceAreaSquareMetres || "—"} m²
                </output>
                <p className="mt-1 text-[0.68rem] leading-4 text-muted">
                  Shared with the aerodynamic reference-area input.
                </p>
              </div>
            </div>
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

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-muted">
              Valid changes rerun material lookup, thermal history, and TPS
              sizing immediately.
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
          aria-labelledby="material-tps-sizing-comparison-title"
          className="mt-8 border-t border-border pt-7"
        >
          <p className="orbix-label text-accent">Engineering comparison</p>
          <h3
            className="mt-1 text-lg font-semibold"
            id="material-tps-sizing-comparison-title"
          >
            Material trade space
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Flame aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Heat capacity</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                All else equal, higher allowable heat capacity reduces the
                required areal density and resulting thickness.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Scale aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">Density and mass</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                Lower density reduces mass for a fixed volume. In this model,
                areal density sets mass while material density sets thickness.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/40 p-4">
              <Shield aria-hidden="true" className="text-accent" size={18} />
              <h4 className="mt-3 text-sm font-semibold">System tradeoff</h4>
              <p className="mt-2 text-xs leading-5 text-muted">
                Material choice balances simplified thermal protection,
                thickness, reuse behavior, and estimated vehicle mass.
              </p>
            </article>
          </div>
        </section>
      </div>

      <div className="space-y-5">
        <CalculatorResultSection
          eyebrow="Catalog material + thermal history"
          icon={Shield}
          id="material-tps-sizing-result"
          title="TPS material selection analysis"
        >
          {result ? (
            <div className="space-y-6">
              <section aria-labelledby="material-tps-sizing-material-title">
                <h4
                  className="orbix-label text-accent"
                  id="material-tps-sizing-material-title"
                >
                  Selected material
                </h4>
                <output
                  className="mt-3 block text-xl font-semibold"
                  htmlFor="material-tps-sizing-materialId"
                >
                  {result.material.name}
                </output>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {result.material.description}
                </p>
                <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-muted">Density</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor="material-tps-sizing-materialId"
                      >
                        {integerFormatter.format(
                          result.material.densityKilogramsPerCubicMetre,
                        )}{" "}
                        kg/m³
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Maximum temperature</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor="material-tps-sizing-materialId"
                      >
                        {result.material.maximumTemperatureKelvin === undefined
                          ? "Unavailable"
                          : integerFormatter.format(
                              result.material.maximumTemperatureKelvin,
                            ) + " K"}
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Reusability</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-sm font-semibold"
                        htmlFor="material-tps-sizing-materialId"
                      >
                        {result.material.reusable ? "Reusable" : "Single-use"}
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="material-tps-sizing-thermal-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="material-tps-sizing-thermal-title"
                >
                  Thermal results
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">Peak heat flux</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={reentryOutputIds}
                      >
                        {heatFluxFormatter.format(
                          result.tpsSizing.peakHeatFlux
                            .heatFluxWattsPerSquareMetre,
                        )}{" "}
                        W/m²
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Total heat load</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={reentryOutputIds}
                      >
                        {preciseFormatter.format(
                          result.tpsSizing.peakHeatLoad
                            .heatLoadMegajoulesPerSquareMetre,
                        )}{" "}
                        MJ/m²
                      </output>
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted">
                      Peak heating location
                    </dt>
                    <dd className="mt-2 grid gap-3 rounded-xl border border-border bg-background/35 p-4 sm:grid-cols-3">
                      <output
                        className="font-mono text-xs"
                        htmlFor={reentryOutputIds}
                      >
                        {standardFormatter.format(
                          result.tpsSizing.peakHeatFlux.altitudeMeters,
                        )}{" "}
                        m altitude
                      </output>
                      <output
                        className="font-mono text-xs"
                        htmlFor={reentryOutputIds}
                      >
                        {standardFormatter.format(
                          result.tpsSizing.peakHeatFlux.velocityMetersPerSecond,
                        )}{" "}
                        m/s velocity
                      </output>
                      <output
                        className="font-mono text-xs"
                        htmlFor={reentryOutputIds}
                      >
                        {standardFormatter.format(
                          result.tpsSizing.peakHeatFlux.timeSeconds,
                        )}{" "}
                        s elapsed
                      </output>
                    </dd>
                  </div>
                </dl>
              </section>

              <section
                aria-labelledby="material-tps-sizing-sizing-title"
                className="border-t border-border pt-5"
              >
                <h4
                  className="orbix-label text-accent"
                  id="material-tps-sizing-sizing-title"
                >
                  TPS sizing
                </h4>
                <dl className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted">
                      Required areal density
                    </dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {preciseFormatter.format(
                          result.estimatedTPSMassForArea
                            .arealDensityKilogramsPerSquareMetre,
                        )}{" "}
                        kg/m²
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Estimated thickness</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {preciseFormatter.format(
                          result.tpsSizing.estimatedThickness.millimetres,
                        )}{" "}
                        mm
                      </output>
                    </dd>
                    <p className="mt-1 font-mono text-[0.68rem] text-muted">
                      {preciseFormatter.format(
                        result.tpsSizing.estimatedThickness.metres,
                      )}{" "}
                      m
                    </p>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Estimated TPS mass</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {preciseFormatter.format(
                          result.estimatedTPSMassForArea.totalTPSMassKilograms,
                        )}{" "}
                        kg
                      </output>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted">Safety margin</dt>
                    <dd className="mt-1">
                      <output
                        className="font-mono text-lg font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {standardFormatter.format(
                          result.tpsSizing.safetyMargin.marginPercentage,
                        )}
                        %
                      </output>
                    </dd>
                    <p className="mt-1 font-mono text-[0.68rem] text-muted">
                      {preciseFormatter.format(
                        result.tpsSizing.safetyMargin
                          .heatLoadMarginMegajoulesPerSquareMetre,
                      )}{" "}
                      MJ/m² heat-load margin
                    </p>
                  </div>
                  <div className="rounded-xl border border-accent/25 bg-accent/8 p-4 sm:col-span-2">
                    <dt className="flex items-center gap-2 text-xs text-muted">
                      <Thermometer
                        aria-hidden="true"
                        className="text-accent"
                        size={15}
                      />
                      Margin classification
                    </dt>
                    <dd className="mt-2">
                      <output
                        className="font-mono text-base font-semibold text-accent"
                        htmlFor={allOutputIds}
                      >
                        {result.suitabilitySummary}
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
                Enter valid reentry, material, and safety inputs to resolve the
                thermal history and preliminary TPS estimate.
              </p>
            </div>
          )}
        </CalculatorResultSection>

        <aside className="orbix-lab-note">
          <p className="orbix-lab-note__title">
            <AlertTriangle aria-hidden="true" size={17} />
            Engineering assumptions
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-xs leading-5 text-muted sm:grid-cols-2">
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
  );
}
