"use client";

import { useState, type FormEvent } from "react";
import { ChevronDown, CircleAlert, CircleCheck, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

import { MissionProfileAnalyzer } from "@/features/engineering-lab/components/mission-profile-analyzer";
import {
  CalculatorNumberField,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import {
  createCustomMissionProfile,
  type CustomMissionConfiguration,
} from "@/features/engineering-lab/missions";
import type {
  MissionPresetCategory,
  MissionProfileInputs,
} from "@/features/engineering-lab/types";

type NumericField =
  | "dragCoefficient"
  | "heatingCoefficient"
  | "inclinationChangeDegrees"
  | "initialAltitudeMeters"
  | "initialAltitudeMetres"
  | "initialFlightPathAngleDegrees"
  | "initialVelocityMetersPerSecond"
  | "massKilograms"
  | "noseRadiusMetres"
  | "referenceAreaSquareMetres"
  | "safetyFactor"
  | "targetAltitudeMetres";

type SystemField =
  | "enableOrbitalTransfer"
  | "enablePlaneChange"
  | "enableReentryAnalysis"
  | "enableVehicleComparison";

interface MissionScenarioFormValues extends Record<NumericField, string> {
  readonly category: MissionPresetCategory;
  readonly description: string;
  readonly enableOrbitalTransfer: boolean;
  readonly enablePlaneChange: boolean;
  readonly enableReentryAnalysis: boolean;
  readonly enableVehicleComparison: boolean;
  readonly missionName: string;
  readonly vehicleName: string;
}

interface GeneratedScenario {
  readonly category: MissionPresetCategory;
  readonly description: string;
  readonly profile: MissionProfileInputs;
}

export type MissionScenarioBuilderOutput = GeneratedScenario;

export interface MissionScenarioBuilderProps {
  readonly onScenarioCreated?: (output: MissionScenarioBuilderOutput) => void;
}

type IdentityErrors = Readonly<
  Partial<Record<"category" | "description" | "missionName" | "form", string>>
>;

const initialValues: MissionScenarioFormValues = {
  category: "orbital-logistics",
  description:
    "A configurable educational mission combining orbital and atmospheric systems.",
  dragCoefficient: "1.1",
  enableOrbitalTransfer: true,
  enablePlaneChange: true,
  enableReentryAnalysis: true,
  enableVehicleComparison: false,
  heatingCoefficient: "",
  inclinationChangeDegrees: "5",
  initialAltitudeMeters: "10000",
  initialAltitudeMetres: "200000",
  initialFlightPathAngleDegrees: "-6",
  initialVelocityMetersPerSecond: "1200",
  massKilograms: "6000",
  missionName: "Custom Mission Scenario",
  noseRadiusMetres: "1.2",
  referenceAreaSquareMetres: "14",
  safetyFactor: "1.5",
  targetAltitudeMetres: "400000",
  vehicleName: "Educational Reentry Vehicle",
};

const categoryOptions: ReadonlyArray<{
  label: string;
  value: MissionPresetCategory;
}> = [
  { label: "Orbital deployment", value: "orbital-deployment" },
  { label: "Orbital logistics", value: "orbital-logistics" },
  { label: "Reentry demonstration", value: "reentry-demonstration" },
  { label: "Lunar transfer", value: "lunar-transfer" },
  { label: "Deep-space concept", value: "deep-space-concept" },
];

function parseRequiredNumber(value: string) {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function parseOptionalNumber(value: string) {
  return value.trim() === "" ? undefined : Number(value);
}

function createConfiguration(
  values: MissionScenarioFormValues,
): CustomMissionConfiguration {
  return {
    identity: {
      category: values.category,
      description: values.description,
      missionName: values.missionName,
    },
    orbital: {
      inclinationChangeDegrees: parseRequiredNumber(
        values.inclinationChangeDegrees,
      ),
      initialAltitudeMetres: parseRequiredNumber(values.initialAltitudeMetres),
      targetAltitudeMetres: parseRequiredNumber(values.targetAltitudeMetres),
    },
    reentry: {
      initialAltitudeMeters: parseRequiredNumber(values.initialAltitudeMeters),
      ...(parseOptionalNumber(values.initialFlightPathAngleDegrees) ===
      undefined
        ? {}
        : {
            initialFlightPathAngleDegrees: parseOptionalNumber(
              values.initialFlightPathAngleDegrees,
            ),
          }),
      initialVelocityMetersPerSecond: parseRequiredNumber(
        values.initialVelocityMetersPerSecond,
      ),
    },
    systems: {
      enableOrbitalTransfer: values.enableOrbitalTransfer,
      enablePlaneChange: values.enablePlaneChange,
      enableReentryAnalysis: values.enableReentryAnalysis,
      enableVehicleComparison: values.enableVehicleComparison,
    },
    tps: {
      ...(parseOptionalNumber(values.heatingCoefficient) === undefined
        ? {}
        : {
            heatingCoefficient: parseOptionalNumber(values.heatingCoefficient),
          }),
      noseRadiusMetres: parseRequiredNumber(values.noseRadiusMetres),
      safetyFactor: parseRequiredNumber(values.safetyFactor),
    },
    vehicle: {
      dragCoefficient: parseRequiredNumber(values.dragCoefficient),
      massKilograms: parseRequiredNumber(values.massKilograms),
      referenceAreaSquareMetres: parseRequiredNumber(
        values.referenceAreaSquareMetres,
      ),
      vehicleName: values.vehicleName,
    },
  };
}

function mapIdentityError(error: RangeError): IdentityErrors {
  if (error.message.startsWith("Mission name")) {
    return { missionName: error.message };
  }
  if (error.message.startsWith("Mission description")) {
    return { description: error.message };
  }
  if (error.message.startsWith("Mission category")) {
    return { category: error.message };
  }
  return { form: error.message };
}

function OptionalNumberField({
  field,
  hint,
  label,
  onChange,
  unit,
  value,
}: {
  readonly field: "heatingCoefficient" | "initialFlightPathAngleDegrees";
  readonly hint: string;
  readonly label: string;
  readonly onChange: (field: NumericField, value: string) => void;
  readonly unit: string;
  readonly value: string;
}) {
  const id = `mission-scenario-${field}`;
  const hintId = `${id}-hint`;

  return (
    <div className="orbix-field">
      <label className="orbix-field__label" htmlFor={id}>
        {label} (optional)
      </label>
      <div className="orbix-field__control">
        <input
          aria-describedby={hintId}
          className="orbix-input"
          id={id}
          inputMode="decimal"
          onChange={(event) => onChange(field, event.target.value)}
          step="any"
          type="number"
          value={value}
        />
        <span aria-hidden="true" className="orbix-field__unit">
          {unit}
        </span>
      </div>
      <p className="orbix-field__help" id={hintId}>
        {hint}
      </p>
    </div>
  );
}

function formatCategoryLabel(category: MissionPresetCategory): string {
  return (
    categoryOptions.find((option) => option.value === category)?.label ??
    category
  );
}

function PanelHeading({ children }: { readonly children: string }) {
  return <legend className="text-foreground">{children}</legend>;
}

export function MissionScenarioBuilder({
  onScenarioCreated,
}: MissionScenarioBuilderProps = {}) {
  const [values, setValues] =
    useState<MissionScenarioFormValues>(initialValues);
  const [errors, setErrors] = useState<IdentityErrors>({});
  const [generatedScenario, setGeneratedScenario] =
    useState<GeneratedScenario | null>(null);
  const hasErrors = Object.values(errors).some(Boolean);
  const usesOrbit = values.enableOrbitalTransfer || values.enablePlaneChange;
  const usesVehicle =
    values.enableReentryAnalysis || values.enableVehicleComparison;

  function markConfigurationChanged() {
    setGeneratedScenario(null);
    setErrors({});
  }

  function updateNumericField(field: NumericField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    markConfigurationChanged();
  }

  function updateTextField(
    field: "description" | "missionName" | "vehicleName",
    value: string,
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    markConfigurationChanged();
  }

  function updateSystem(field: SystemField, checked: boolean) {
    setValues((current) => ({ ...current, [field]: checked }));
    markConfigurationChanged();
  }

  function analyzeScenario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const profile = createCustomMissionProfile(createConfiguration(values));
      setErrors({});
      const generated = {
        category: values.category,
        description: values.description,
        profile,
      } satisfies GeneratedScenario;
      setGeneratedScenario(generated);
      onScenarioCreated?.(generated);
    } catch (error) {
      setGeneratedScenario(null);
      setErrors(
        error instanceof RangeError
          ? mapIdentityError(error)
          : { form: "The mission scenario could not be created." },
      );
    }
  }

  function resetScenario() {
    setValues(initialValues);
    setErrors({});
    setGeneratedScenario(null);
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(18rem,0.88fr)]">
        <form
          aria-label="Custom mission scenario"
          className="space-y-8"
          noValidate
          onSubmit={analyzeScenario}
        >
          <fieldset className="orbix-fieldset border-t border-border-subtle pt-6 first:border-t-0 first:pt-0">
            <PanelHeading>Mission briefing</PanelHeading>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="orbix-field">
                <label
                  className="orbix-field__label"
                  htmlFor="mission-scenario-missionName"
                >
                  Mission name
                </label>
                <input
                  aria-describedby={
                    errors.missionName
                      ? "mission-scenario-missionName-hint mission-scenario-missionName-error"
                      : "mission-scenario-missionName-hint"
                  }
                  aria-errormessage={
                    errors.missionName
                      ? "mission-scenario-missionName-error"
                      : undefined
                  }
                  aria-invalid={Boolean(errors.missionName)}
                  className="orbix-input"
                  id="mission-scenario-missionName"
                  onChange={(event) =>
                    updateTextField("missionName", event.target.value)
                  }
                  required
                  type="text"
                  value={values.missionName}
                />
                <p
                  className="orbix-field__help"
                  id="mission-scenario-missionName-hint"
                >
                  Identifies this educational mission configuration.
                </p>
                {errors.missionName ? (
                  <p
                    className="orbix-field__error"
                    id="mission-scenario-missionName-error"
                  >
                    <CircleAlert aria-hidden="true" size={14} />
                    {errors.missionName}
                  </p>
                ) : null}
              </div>

              <div className="orbix-field">
                <label
                  className="orbix-field__label"
                  htmlFor="mission-scenario-category"
                >
                  Mission category
                </label>
                <div className="orbix-field__control">
                  <select
                    aria-describedby={
                      errors.category
                        ? "mission-scenario-category-hint mission-scenario-category-error"
                        : "mission-scenario-category-hint"
                    }
                    aria-errormessage={
                      errors.category
                        ? "mission-scenario-category-error"
                        : undefined
                    }
                    aria-invalid={Boolean(errors.category)}
                    className="orbix-select"
                    id="mission-scenario-category"
                    onChange={(event) => {
                      setValues((current) => ({
                        ...current,
                        category: event.target.value as MissionPresetCategory,
                      }));
                      markConfigurationChanged();
                    }}
                    value={values.category}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
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
                  className="orbix-field__help"
                  id="mission-scenario-category-hint"
                >
                  Organizes the briefing; it does not change engineering logic.
                </p>
                {errors.category ? (
                  <p
                    className="orbix-field__error"
                    id="mission-scenario-category-error"
                  >
                    <CircleAlert aria-hidden="true" size={14} />
                    {errors.category}
                  </p>
                ) : null}
              </div>

              <div className="orbix-field md:col-span-2">
                <label
                  className="orbix-field__label"
                  htmlFor="mission-scenario-description"
                >
                  Mission description
                </label>
                <textarea
                  aria-describedby={
                    errors.description
                      ? "mission-scenario-description-hint mission-scenario-description-error"
                      : "mission-scenario-description-hint"
                  }
                  aria-errormessage={
                    errors.description
                      ? "mission-scenario-description-error"
                      : undefined
                  }
                  aria-invalid={Boolean(errors.description)}
                  className="orbix-input h-auto min-h-28"
                  id="mission-scenario-description"
                  onChange={(event) =>
                    updateTextField("description", event.target.value)
                  }
                  required
                  value={values.description}
                />
                <p
                  className="orbix-field__help"
                  id="mission-scenario-description-hint"
                >
                  Summarizes the educational purpose of the scenario.
                </p>
                {errors.description ? (
                  <p
                    className="orbix-field__error"
                    id="mission-scenario-description-error"
                  >
                    <CircleAlert aria-hidden="true" size={14} />
                    {errors.description}
                  </p>
                ) : null}
              </div>
            </div>
          </fieldset>

          <fieldset className="orbix-fieldset border-t border-border-subtle pt-6 first:border-t-0 first:pt-0">
            <PanelHeading>Mission systems checklist</PanelHeading>
            <div className="grid gap-2 md:grid-cols-2">
              {[
                [
                  "enableOrbitalTransfer",
                  "Orbital transfer",
                  "mission-scenario-orbital-panel",
                ],
                [
                  "enablePlaneChange",
                  "Plane change",
                  "mission-scenario-orbital-panel",
                ],
                [
                  "enableReentryAnalysis",
                  "Reentry analysis",
                  "mission-scenario-reentry-panel",
                ],
                [
                  "enableVehicleComparison",
                  "Vehicle comparison",
                  "mission-scenario-vehicle-panel",
                ],
              ].map(([field, label, controls]) => (
                <label
                  className="orbix-check min-h-10 cursor-pointer text-sm text-foreground"
                  key={field}
                >
                  <input
                    aria-controls={controls}
                    checked={values[field as SystemField]}

                    onChange={(event) =>
                      updateSystem(field as SystemField, event.target.checked)
                    }
                    type="checkbox"
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>

          {usesOrbit ? (
            <fieldset
              className="orbix-fieldset border-t border-border-subtle pt-6"
              id="mission-scenario-orbital-panel"
            >
              <PanelHeading>Orbital parameters</PanelHeading>
              <div className="grid gap-6 md:grid-cols-2">
                <CalculatorNumberField
                  field="initialAltitudeMetres"
                  hint="Starting circular-orbit altitude."
                  idPrefix="mission-scenario"
                  label="Initial altitude"
                  onChange={updateNumericField}
                  unit="m"
                  value={values.initialAltitudeMetres}
                />
                <CalculatorNumberField
                  field="targetAltitudeMetres"
                  hint="Target circular-orbit altitude."
                  idPrefix="mission-scenario"
                  label="Target altitude"
                  onChange={updateNumericField}
                  unit="m"
                  value={values.targetAltitudeMetres}
                />
                <CalculatorNumberField
                  field="inclinationChangeDegrees"
                  hint="Requested change in orbital plane."
                  idPrefix="mission-scenario"
                  label="Inclination change"
                  onChange={updateNumericField}
                  unit="deg"
                  value={values.inclinationChangeDegrees}
                />
              </div>
            </fieldset>
          ) : null}

          {usesVehicle ? (
            <>
              <fieldset
                className="orbix-fieldset border-t border-border-subtle pt-6"
                id="mission-scenario-vehicle-panel"
              >
                <PanelHeading>Spacecraft configuration</PanelHeading>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="orbix-field">
                    <label
                      className="orbix-field__label"
                      htmlFor="mission-scenario-vehicleName"
                    >
                      Vehicle name
                    </label>
                    <input
                      aria-describedby="mission-scenario-vehicleName-hint"
                      className="orbix-input"
                      id="mission-scenario-vehicleName"
                      onChange={(event) =>
                        updateTextField("vehicleName", event.target.value)
                      }
                      required
                      type="text"
                      value={values.vehicleName}
                    />
                    <p
                      className="orbix-field__help"
                      id="mission-scenario-vehicleName-hint"
                    >
                      Labels the editable vehicle configuration.
                    </p>
                  </div>
                  <CalculatorNumberField
                    field="massKilograms"
                    hint="Constant vehicle mass used by existing reentry analyses."
                    idPrefix="mission-scenario"
                    label="Vehicle mass"
                    onChange={updateNumericField}
                    unit="kg"
                    value={values.massKilograms}
                  />
                  <CalculatorNumberField
                    field="referenceAreaSquareMetres"
                    hint="Aerodynamic reference area."
                    idPrefix="mission-scenario"
                    label="Reference area"
                    onChange={updateNumericField}
                    unit="m²"
                    value={values.referenceAreaSquareMetres}
                  />
                  <CalculatorNumberField
                    field="dragCoefficient"
                    hint="Dimensionless drag coefficient."
                    idPrefix="mission-scenario"
                    label="Drag coefficient"
                    onChange={updateNumericField}
                    unit=""
                    value={values.dragCoefficient}
                  />
                </div>
              </fieldset>

              <fieldset
                className="orbix-fieldset border-t border-border-subtle pt-6"
                id="mission-scenario-reentry-panel"
              >
                <PanelHeading>Reentry conditions</PanelHeading>
                <div className="grid gap-6 md:grid-cols-2">
                  <CalculatorNumberField
                    field="initialVelocityMetersPerSecond"
                    hint="Starting atmospheric-entry velocity."
                    idPrefix="mission-scenario"
                    label="Initial velocity"
                    onChange={updateNumericField}
                    unit="m/s"
                    value={values.initialVelocityMetersPerSecond}
                  />
                  <CalculatorNumberField
                    field="initialAltitudeMeters"
                    hint="Starting altitude within the current atmosphere model."
                    idPrefix="mission-scenario"
                    label="Reentry altitude"
                    onChange={updateNumericField}
                    unit="m"
                    value={values.initialAltitudeMeters}
                  />
                  <OptionalNumberField
                    field="initialFlightPathAngleDegrees"
                    hint="Optional descent angle; blank preserves analysis defaults."
                    label="Flight path angle"
                    onChange={updateNumericField}
                    unit="deg"
                    value={values.initialFlightPathAngleDegrees}
                  />
                </div>
              </fieldset>

              <fieldset className="orbix-fieldset border-t border-border-subtle pt-6 first:border-t-0 first:pt-0">
                <PanelHeading>Thermal protection inputs</PanelHeading>
                <div className="grid gap-6 md:grid-cols-2">
                  <CalculatorNumberField
                    field="safetyFactor"
                    hint="Safety factor passed to existing TPS workflows."
                    idPrefix="mission-scenario"
                    label="Safety factor"
                    onChange={updateNumericField}
                    unit="ratio"
                    value={values.safetyFactor}
                  />
                  <CalculatorNumberField
                    field="noseRadiusMetres"
                    hint="Vehicle nose radius used by existing heating analysis."
                    idPrefix="mission-scenario"
                    label="Nose radius"
                    onChange={updateNumericField}
                    unit="m"
                    value={values.noseRadiusMetres}
                  />
                  <OptionalNumberField
                    field="heatingCoefficient"
                    hint="Optional coefficient; blank preserves the calculator default."
                    label="Heating coefficient k (optional)"
                    onChange={updateNumericField}
                    unit="kg½/m"
                    value={values.heatingCoefficient}
                  />
                </div>
              </fieldset>
            </>
          ) : null}

          <ValidationErrorSummary errors={Object.values(errors)} />

          <div className="flex flex-wrap gap-3">
            <Button type="submit">Analyze mission</Button>
            <Button onClick={resetScenario} variant="ghost">
              <RotateCcw aria-hidden="true" size={16} />
              Reset scenario
            </Button>
          </div>
        </form>

        <aside className="h-fit rounded-md border border-border bg-surface p-4 sm:p-6 xl:sticky xl:top-[calc(57px+1.5rem)]">
          <h3 className="orbix-h3 text-foreground">What this builder does</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            This builder creates the existing mission-profile input object.
            Engineering calculations begin only inside the Mission Profile
            Analyzer, which runs below once you select Analyze mission.
          </p>
          <div
            aria-live="polite"
            className="mt-4 border-t border-border-subtle pt-4"
            role="status"
          >
            {generatedScenario ? (
              <p className="flex items-start gap-2 text-sm leading-6 text-status-success">
                <CircleCheck
                  aria-hidden="true"
                  className="mt-1 shrink-0"
                  size={16}
                />
                Mission profile created. Results are shown below, and the
                scenario can now be saved in the scenario library.
              </p>
            ) : hasErrors ? (
              <p className="flex items-start gap-2 text-sm leading-6 text-status-danger">
                <CircleAlert
                  aria-hidden="true"
                  className="mt-1 shrink-0"
                  size={16}
                />
                Not created. Check the inputs marked in the form.
              </p>
            ) : (
              <p className="text-sm leading-6 text-muted">
                Choose systems, review the inputs, then select Analyze mission.
              </p>
            )}
          </div>
          <dl className="mt-4 text-sm">
            <div className="flex items-center justify-between gap-4 border-t border-border-subtle py-2">
              <dt className="text-muted">Orbital systems</dt>
              <dd className="text-foreground">{usesOrbit ? "On" : "Off"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border-subtle py-2">
              <dt className="text-muted">Reentry analysis</dt>
              <dd className="text-foreground">
                {values.enableReentryAnalysis ? "On" : "Off"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-border-subtle py-2">
              <dt className="text-muted">Vehicle comparison</dt>
              <dd className="text-foreground">
                {values.enableVehicleComparison ? "On" : "Off"}
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      {generatedScenario ? (
        <section
          aria-labelledby="custom-mission-analysis-title"
          className="border-t border-border-subtle pt-8"
        >
          <div className="mb-6 max-w-[68ch]">
            <p className="orbix-label">
              {formatCategoryLabel(generatedScenario.category)}
            </p>
            <h3
              className="orbix-h3 mt-1 text-foreground"
              id="custom-mission-analysis-title"
            >
              Mission profile analyzer: {generatedScenario.profile.missionName}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {generatedScenario.description}
            </p>
          </div>
          <MissionProfileAnalyzer
            initialMissionProfile={generatedScenario.profile}
          />
        </section>
      ) : null}
    </div>
  );
}
