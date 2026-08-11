"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, RotateCcw, Send } from "lucide-react";

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
    <div>
      <label className="text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          aria-describedby={hintId}
          className="min-h-12 w-full rounded-xl border border-border bg-background/55 px-4 py-3 pr-20 font-mono text-base text-foreground transition-colors outline-none placeholder:text-muted/55 focus:border-accent focus:ring-2 focus:ring-accent/15"
          id={id}
          inputMode="decimal"
          onChange={(event) => onChange(field, event.target.value)}
          step="any"
          type="number"
          value={value}
        />
        <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-mono text-xs text-muted">
          {unit}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted" id={hintId}>
        {hint}
      </p>
    </div>
  );
}

function PanelHeading({ children }: { readonly children: string }) {
  return <legend className="orbix-label text-accent">{children}</legend>;
}

export function MissionScenarioBuilder({
  onScenarioCreated,
}: MissionScenarioBuilderProps = {}) {
  const [values, setValues] =
    useState<MissionScenarioFormValues>(initialValues);
  const [errors, setErrors] = useState<IdentityErrors>({});
  const [generatedScenario, setGeneratedScenario] =
    useState<GeneratedScenario | null>(null);
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
    <div className="space-y-10">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_minmax(18rem,0.88fr)]">
        <form
          aria-label="Custom mission scenario"
          className="space-y-8"
          noValidate
          onSubmit={analyzeScenario}
        >
          <fieldset className="rounded-2xl border border-border bg-background/35 p-5 sm:p-6">
            <PanelHeading>Mission briefing</PanelHeading>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  className="text-sm font-semibold"
                  htmlFor="mission-scenario-missionName"
                >
                  Mission name
                </label>
                <input
                  aria-describedby="mission-scenario-missionName-hint"
                  aria-errormessage={
                    errors.missionName
                      ? "mission-scenario-missionName-error"
                      : undefined
                  }
                  aria-invalid={Boolean(errors.missionName)}
                  className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background/55 px-4 py-3 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                  id="mission-scenario-missionName"
                  onChange={(event) =>
                    updateTextField("missionName", event.target.value)
                  }
                  required
                  type="text"
                  value={values.missionName}
                />
                <p
                  className="mt-2 text-xs leading-5 text-muted"
                  id="mission-scenario-missionName-hint"
                >
                  Identifies this educational mission configuration.
                </p>
                {errors.missionName ? (
                  <p
                    className="mt-1.5 text-xs text-signal"
                    id="mission-scenario-missionName-error"
                  >
                    {errors.missionName}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  className="text-sm font-semibold"
                  htmlFor="mission-scenario-category"
                >
                  Mission category
                </label>
                <select
                  aria-describedby="mission-scenario-category-hint"
                  aria-errormessage={
                    errors.category
                      ? "mission-scenario-category-error"
                      : undefined
                  }
                  aria-invalid={Boolean(errors.category)}
                  className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background/55 px-4 py-3 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
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
                <p
                  className="mt-2 text-xs leading-5 text-muted"
                  id="mission-scenario-category-hint"
                >
                  Organizes the briefing; it does not change engineering logic.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label
                  className="text-sm font-semibold"
                  htmlFor="mission-scenario-description"
                >
                  Mission description
                </label>
                <textarea
                  aria-describedby="mission-scenario-description-hint"
                  aria-errormessage={
                    errors.description
                      ? "mission-scenario-description-error"
                      : undefined
                  }
                  aria-invalid={Boolean(errors.description)}
                  className="mt-2 min-h-28 w-full rounded-xl border border-border bg-background/55 px-4 py-3 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                  id="mission-scenario-description"
                  onChange={(event) =>
                    updateTextField("description", event.target.value)
                  }
                  required
                  value={values.description}
                />
                <p
                  className="mt-2 text-xs leading-5 text-muted"
                  id="mission-scenario-description-hint"
                >
                  Summarizes the educational purpose of the scenario.
                </p>
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-2xl border border-border bg-background/35 p-5 sm:p-6">
            <PanelHeading>Mission systems checklist</PanelHeading>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/45 px-4 py-3 text-sm font-semibold transition-colors focus-within:border-accent hover:border-accent/50"
                  key={field}
                >
                  <input
                    aria-controls={controls}
                    checked={values[field as SystemField]}
                    className="h-4 w-4 accent-accent"
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
              className="rounded-2xl border border-border bg-background/35 p-5 sm:p-6"
              id="mission-scenario-orbital-panel"
            >
              <PanelHeading>Orbital parameters</PanelHeading>
              <div className="mt-5 grid gap-5 sm:grid-cols-3">
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
                className="rounded-2xl border border-border bg-background/35 p-5 sm:p-6"
                id="mission-scenario-vehicle-panel"
              >
                <PanelHeading>Spacecraft configuration</PanelHeading>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      className="text-sm font-semibold"
                      htmlFor="mission-scenario-vehicleName"
                    >
                      Vehicle name
                    </label>
                    <input
                      aria-describedby="mission-scenario-vehicleName-hint"
                      className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background/55 px-4 py-3 text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                      id="mission-scenario-vehicleName"
                      onChange={(event) =>
                        updateTextField("vehicleName", event.target.value)
                      }
                      required
                      type="text"
                      value={values.vehicleName}
                    />
                    <p
                      className="mt-2 text-xs leading-5 text-muted"
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
                    unit="CD"
                    value={values.dragCoefficient}
                  />
                </div>
              </fieldset>

              <fieldset
                className="rounded-2xl border border-border bg-background/35 p-5 sm:p-6"
                id="mission-scenario-reentry-panel"
              >
                <PanelHeading>Reentry conditions</PanelHeading>
                <div className="mt-5 grid gap-5 sm:grid-cols-3">
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

              <fieldset className="rounded-2xl border border-border bg-background/35 p-5 sm:p-6">
                <PanelHeading>Thermal protection inputs</PanelHeading>
                <div className="mt-5 grid gap-5 sm:grid-cols-3">
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
                    label="Heating coefficient"
                    onChange={updateNumericField}
                    unit="k"
                    value={values.heatingCoefficient}
                  />
                </div>
              </fieldset>
            </>
          ) : null}

          <ValidationErrorSummary errors={Object.values(errors)} />

          <div className="flex flex-wrap gap-3">
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              type="submit"
            >
              <Send aria-hidden="true" size={16} />
              Analyze Mission
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={resetScenario}
              type="button"
            >
              <RotateCcw aria-hidden="true" size={16} />
              Reset scenario
            </button>
          </div>
        </form>

        <aside className="h-fit rounded-2xl border border-accent/25 bg-accent/5 p-5 sm:p-6 xl:sticky xl:top-24">
          <p className="orbix-label text-accent">Scenario assembly status</p>
          <h3 className="mt-3 text-xl font-semibold">Mission input pipeline</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            This workstation creates the existing mission-profile input object.
            Engineering calculations begin only inside the Mission Profile
            Analyzer after the scenario is loaded.
          </p>
          <div
            aria-live="polite"
            className="mt-5 rounded-xl border border-border bg-background/45 p-4"
            role="status"
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2
                aria-hidden="true"
                className="text-accent"
                size={16}
              />
              {generatedScenario
                ? "Mission profile loaded"
                : "Configuration ready"}
            </div>
            <p className="mt-2 text-xs leading-5 text-muted">
              {generatedScenario
                ? "The existing analyzer now owns validation and all engineering outputs."
                : "Choose systems, review inputs, then analyze the mission."}
            </p>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3">
              <dt className="text-muted">Orbital systems</dt>
              <dd className="font-mono">{usesOrbit ? "Enabled" : "Off"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3">
              <dt className="text-muted">Reentry analysis</dt>
              <dd className="font-mono">
                {values.enableReentryAnalysis ? "Enabled" : "Off"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted">Vehicle comparison</dt>
              <dd className="font-mono">
                {values.enableVehicleComparison ? "Enabled" : "Off"}
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      {generatedScenario ? (
        <section
          aria-labelledby="custom-mission-analysis-title"
          className="border-t border-border pt-10"
        >
          <div className="mb-7 max-w-3xl">
            <p className="orbix-label text-accent">
              Loaded profile //{" "}
              {generatedScenario.category.replaceAll("-", " ")}
            </p>
            <h3
              className="mt-3 text-2xl font-semibold"
              id="custom-mission-analysis-title"
            >
              Existing Mission Profile Analyzer
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted">
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
