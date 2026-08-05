"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  Gauge,
  Layers,
  Orbit,
  Plane,
  RotateCcw,
  Shield,
} from "lucide-react";

import { analyzeMissionProfile } from "@/features/engineering-lab/analysis";
import {
  CalculatorNumberField,
  CalculatorResultSection,
  ValidationErrorSummary,
} from "@/features/engineering-lab/components/shared";
import type {
  DeltaVBudgetInputs,
  HohmannTransferAnalysisInputs,
  MissionProfileAnalysis,
  MissionProfileInputs,
  OrbitalPlaneChangeAnalysisInputs,
  VehicleReentryComparisonInputs,
  VehicleReentryConfiguration,
  VehicleReentryEvaluationInputs,
} from "@/features/engineering-lab/types";

type MissionProfileField =
  | "alternativeDragCoefficient"
  | "alternativeMassKilograms"
  | "alternativeNoseRadiusMetres"
  | "alternativeReferenceAreaSquareMetres"
  | "alternativeVehicleName"
  | "finalAltitudeMetres"
  | "gravitationalParameter"
  | "heatingCoefficient"
  | "inclinationChangeDegrees"
  | "initialAltitudeMeters"
  | "initialAltitudeMetres"
  | "initialFlightPathAngleDegrees"
  | "initialVelocityMetersPerSecond"
  | "missionName"
  | "orbitalAltitudeMetres"
  | "planetRadiusMetres"
  | "primaryDragCoefficient"
  | "primaryMassKilograms"
  | "primaryNoseRadiusMetres"
  | "primaryReferenceAreaSquareMetres"
  | "primaryVehicleName"
  | "safetyFactor"
  | "timestepSeconds";

type MissionProfileToggle =
  | "includeDeltaVBudget"
  | "includeHohmannTransfer"
  | "includeOrbitalPlaneChange"
  | "includeVehicleComparison"
  | "includeVehicleReentryEvaluation";

interface MissionProfileFormValues {
  readonly additionalComparisonVehicles: readonly VehicleReentryConfiguration[];
  readonly alternativeDragCoefficient: string;
  readonly alternativeMassKilograms: string;
  readonly alternativeNoseRadiusMetres: string;
  readonly alternativeReferenceAreaSquareMetres: string;
  readonly alternativeVehicleName: string;
  readonly comparisonVehicleCount: number;
  readonly deltaVBudgetMissionName: string;
  readonly finalAltitudeMetres: string;
  readonly gravitationalParameter: string;
  readonly heatingCoefficient: string;
  readonly inclinationChangeDegrees: string;
  readonly includeDeltaVBudget: boolean;
  readonly includeHohmannTransfer: boolean;
  readonly includeOrbitalPlaneChange: boolean;
  readonly includeVehicleComparison: boolean;
  readonly includeVehicleReentryEvaluation: boolean;
  readonly initialAltitudeMeters: string;
  readonly initialAltitudeMetres: string;
  readonly initialFlightPathAngleDegrees: string;
  readonly initialVelocityMetersPerSecond: string;
  readonly missionName: string;
  readonly orbitalAltitudeMetres: string;
  readonly planetRadiusMetres: string;
  readonly preservedManeuvers: DeltaVBudgetInputs["maneuvers"];
  readonly primaryDragCoefficient: string;
  readonly primaryMassKilograms: string;
  readonly primaryNoseRadiusMetres: string;
  readonly primaryReferenceAreaSquareMetres: string;
  readonly primaryVehicleName: string;
  readonly safetyFactor: string;
  readonly timestepSeconds: string;
}

export interface MissionProfileAnalyzerProps {
  readonly initialMissionProfile?: MissionProfileInputs;
}

type MissionProfileValidationErrors = Readonly<
  Partial<Record<MissionProfileField | "form", string>>
>;

interface MissionProfileViewState {
  readonly errors: MissionProfileValidationErrors;
  readonly result: MissionProfileAnalysis | null;
}

interface OptionalNumberFieldProps {
  readonly error?: string;
  readonly field:
    | "gravitationalParameter"
    | "heatingCoefficient"
    | "initialFlightPathAngleDegrees"
    | "planetRadiusMetres"
    | "timestepSeconds";
  readonly hint: string;
  readonly label: string;
  readonly onChange: (field: MissionProfileField, value: string) => void;
  readonly unit: string;
  readonly value: string;
}

const initialFormValues: MissionProfileFormValues = {
  additionalComparisonVehicles: [],
  alternativeDragCoefficient: "1.3",
  alternativeMassKilograms: "3600",
  alternativeNoseRadiusMetres: "0.8",
  alternativeReferenceAreaSquareMetres: "9",
  alternativeVehicleName: "Compact Vehicle",
  comparisonVehicleCount: 2,
  deltaVBudgetMissionName: "Integrated Orbital Reentry Mission",
  finalAltitudeMetres: "35786000",
  gravitationalParameter: "",
  heatingCoefficient: "",
  inclinationChangeDegrees: "10",
  includeDeltaVBudget: true,
  includeHohmannTransfer: true,
  includeOrbitalPlaneChange: true,
  includeVehicleComparison: true,
  includeVehicleReentryEvaluation: true,
  initialAltitudeMeters: "1000",
  initialAltitudeMetres: "400000",
  initialFlightPathAngleDegrees: "",
  initialVelocityMetersPerSecond: "150",
  missionName: "Integrated Orbital Reentry Mission",
  orbitalAltitudeMetres: "35786000",
  planetRadiusMetres: "",
  preservedManeuvers: undefined,
  primaryDragCoefficient: "1.5",
  primaryMassKilograms: "5000",
  primaryNoseRadiusMetres: "1",
  primaryReferenceAreaSquareMetres: "12",
  primaryVehicleName: "Reference Reentry Vehicle",
  safetyFactor: "1.5",
  timestepSeconds: "",
};

function toFormValue(value: number | undefined, fallback: string): string {
  return value === undefined ? fallback : String(value);
}

function createFormValues(
  missionProfile?: MissionProfileInputs,
): MissionProfileFormValues {
  if (missionProfile === undefined) return initialFormValues;

  const deltaVBudget = missionProfile.deltaVBudget;
  const hohmannTransfer = deltaVBudget?.hohmannTransfer;
  const orbitalPlaneChange = deltaVBudget?.orbitalPlaneChange;
  const vehicleEvaluation = missionProfile.vehicleReentryEvaluation;
  const vehicleComparison = missionProfile.vehicleComparison;
  const sharedReentryInputs = vehicleEvaluation ?? vehicleComparison;
  const primaryVehicle =
    vehicleEvaluation?.vehicle ?? vehicleComparison?.vehicles[0];
  const alternativeVehicle = vehicleComparison?.vehicles[1];

  return {
    additionalComparisonVehicles: vehicleComparison?.vehicles.slice(2) ?? [],
    alternativeDragCoefficient: toFormValue(
      alternativeVehicle?.dragCoefficient,
      initialFormValues.alternativeDragCoefficient,
    ),
    alternativeMassKilograms: toFormValue(
      alternativeVehicle?.massKilograms,
      initialFormValues.alternativeMassKilograms,
    ),
    alternativeNoseRadiusMetres: toFormValue(
      alternativeVehicle?.noseRadiusMetres,
      initialFormValues.alternativeNoseRadiusMetres,
    ),
    alternativeReferenceAreaSquareMetres: toFormValue(
      alternativeVehicle?.referenceAreaSquareMetres,
      initialFormValues.alternativeReferenceAreaSquareMetres,
    ),
    alternativeVehicleName:
      alternativeVehicle?.vehicleName ??
      initialFormValues.alternativeVehicleName,
    comparisonVehicleCount: vehicleComparison?.vehicles.length ?? 2,
    deltaVBudgetMissionName:
      deltaVBudget?.missionName ?? missionProfile.missionName,
    finalAltitudeMetres: toFormValue(
      hohmannTransfer?.finalAltitudeMetres,
      initialFormValues.finalAltitudeMetres,
    ),
    gravitationalParameter: toFormValue(
      hohmannTransfer?.gravitationalParameter ??
        orbitalPlaneChange?.gravitationalParameter,
      "",
    ),
    heatingCoefficient: toFormValue(
      sharedReentryInputs?.heatingCoefficient,
      "",
    ),
    inclinationChangeDegrees: toFormValue(
      orbitalPlaneChange?.inclinationChangeDegrees,
      initialFormValues.inclinationChangeDegrees,
    ),
    includeDeltaVBudget: deltaVBudget !== undefined,
    includeHohmannTransfer: hohmannTransfer !== undefined,
    includeOrbitalPlaneChange: orbitalPlaneChange !== undefined,
    includeVehicleComparison: vehicleComparison !== undefined,
    includeVehicleReentryEvaluation: vehicleEvaluation !== undefined,
    initialAltitudeMeters: toFormValue(
      sharedReentryInputs?.initialAltitudeMeters,
      initialFormValues.initialAltitudeMeters,
    ),
    initialAltitudeMetres: toFormValue(
      hohmannTransfer?.initialAltitudeMetres,
      initialFormValues.initialAltitudeMetres,
    ),
    initialFlightPathAngleDegrees: toFormValue(
      sharedReentryInputs?.initialFlightPathAngleDegrees,
      "",
    ),
    initialVelocityMetersPerSecond: toFormValue(
      sharedReentryInputs?.initialVelocityMetersPerSecond,
      initialFormValues.initialVelocityMetersPerSecond,
    ),
    missionName: missionProfile.missionName,
    orbitalAltitudeMetres: toFormValue(
      orbitalPlaneChange?.orbitalAltitudeMetres,
      initialFormValues.orbitalAltitudeMetres,
    ),
    planetRadiusMetres: toFormValue(
      hohmannTransfer?.planetRadiusMetres ??
        orbitalPlaneChange?.planetRadiusMetres,
      "",
    ),
    preservedManeuvers: deltaVBudget?.maneuvers,
    primaryDragCoefficient: toFormValue(
      primaryVehicle?.dragCoefficient,
      initialFormValues.primaryDragCoefficient,
    ),
    primaryMassKilograms: toFormValue(
      primaryVehicle?.massKilograms,
      initialFormValues.primaryMassKilograms,
    ),
    primaryNoseRadiusMetres: toFormValue(
      primaryVehicle?.noseRadiusMetres,
      initialFormValues.primaryNoseRadiusMetres,
    ),
    primaryReferenceAreaSquareMetres: toFormValue(
      primaryVehicle?.referenceAreaSquareMetres,
      initialFormValues.primaryReferenceAreaSquareMetres,
    ),
    primaryVehicleName:
      primaryVehicle?.vehicleName ?? initialFormValues.primaryVehicleName,
    safetyFactor: toFormValue(
      sharedReentryInputs?.safetyFactor,
      initialFormValues.safetyFactor,
    ),
    timestepSeconds: toFormValue(sharedReentryInputs?.timestepSeconds, ""),
  };
}

const standardFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 2,
});

const preciseFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
  minimumFractionDigits: 3,
});

const heatFluxFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function parseRequiredNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value);
}

function parseOptionalNumber(value: string): number | undefined {
  return value.trim() === "" ? undefined : Number(value);
}

function buildHohmannTransferInputs(
  values: MissionProfileFormValues,
): HohmannTransferAnalysisInputs {
  const gravitationalParameter = parseOptionalNumber(
    values.gravitationalParameter,
  );
  const planetRadiusMetres = parseOptionalNumber(values.planetRadiusMetres);

  return {
    ...(gravitationalParameter === undefined ? {} : { gravitationalParameter }),
    ...(planetRadiusMetres === undefined ? {} : { planetRadiusMetres }),
    finalAltitudeMetres: parseRequiredNumber(values.finalAltitudeMetres),
    initialAltitudeMetres: parseRequiredNumber(values.initialAltitudeMetres),
  };
}

function buildOrbitalPlaneChangeInputs(
  values: MissionProfileFormValues,
): OrbitalPlaneChangeAnalysisInputs {
  const gravitationalParameter = parseOptionalNumber(
    values.gravitationalParameter,
  );
  const planetRadiusMetres = parseOptionalNumber(values.planetRadiusMetres);

  return {
    ...(gravitationalParameter === undefined ? {} : { gravitationalParameter }),
    ...(planetRadiusMetres === undefined ? {} : { planetRadiusMetres }),
    inclinationChangeDegrees: parseRequiredNumber(
      values.inclinationChangeDegrees,
    ),
    orbitalAltitudeMetres: parseRequiredNumber(values.orbitalAltitudeMetres),
  };
}

function buildDeltaVBudgetInputs(
  values: MissionProfileFormValues,
): DeltaVBudgetInputs {
  return {
    ...(values.includeHohmannTransfer
      ? { hohmannTransfer: buildHohmannTransferInputs(values) }
      : {}),
    ...(values.preservedManeuvers === undefined
      ? {}
      : { maneuvers: values.preservedManeuvers }),
    missionName: values.deltaVBudgetMissionName,
    ...(values.includeOrbitalPlaneChange
      ? { orbitalPlaneChange: buildOrbitalPlaneChangeInputs(values) }
      : {}),
  };
}

function buildConfiguredComparisonVehicles(
  values: MissionProfileFormValues,
): readonly VehicleReentryConfiguration[] {
  if (values.comparisonVehicleCount === 0) return [];

  const vehicles = [buildPrimaryVehicle(values)];

  if (values.comparisonVehicleCount > 1) {
    vehicles.push(buildAlternativeVehicle(values));
  }

  return [
    ...vehicles,
    ...values.additionalComparisonVehicles.slice(
      0,
      Math.max(0, values.comparisonVehicleCount - 2),
    ),
  ];
}

function buildPrimaryVehicle(
  values: MissionProfileFormValues,
): VehicleReentryConfiguration {
  return {
    dragCoefficient: parseRequiredNumber(values.primaryDragCoefficient),
    massKilograms: parseRequiredNumber(values.primaryMassKilograms),
    noseRadiusMetres: parseRequiredNumber(values.primaryNoseRadiusMetres),
    referenceAreaSquareMetres: parseRequiredNumber(
      values.primaryReferenceAreaSquareMetres,
    ),
    vehicleName: values.primaryVehicleName,
  };
}

function buildAlternativeVehicle(
  values: MissionProfileFormValues,
): VehicleReentryConfiguration {
  return {
    dragCoefficient: parseRequiredNumber(values.alternativeDragCoefficient),
    massKilograms: parseRequiredNumber(values.alternativeMassKilograms),
    noseRadiusMetres: parseRequiredNumber(values.alternativeNoseRadiusMetres),
    referenceAreaSquareMetres: parseRequiredNumber(
      values.alternativeReferenceAreaSquareMetres,
    ),
    vehicleName: values.alternativeVehicleName,
  };
}

function buildSharedReentryInputs(values: MissionProfileFormValues) {
  const heatingCoefficient = parseOptionalNumber(values.heatingCoefficient);
  const initialFlightPathAngleDegrees = parseOptionalNumber(
    values.initialFlightPathAngleDegrees,
  );
  const timestepSeconds = parseOptionalNumber(values.timestepSeconds);

  return {
    ...(heatingCoefficient === undefined ? {} : { heatingCoefficient }),
    ...(initialFlightPathAngleDegrees === undefined
      ? {}
      : { initialFlightPathAngleDegrees }),
    ...(timestepSeconds === undefined ? {} : { timestepSeconds }),
    initialAltitudeMeters: parseRequiredNumber(values.initialAltitudeMeters),
    initialVelocityMetersPerSecond: parseRequiredNumber(
      values.initialVelocityMetersPerSecond,
    ),
    safetyFactor: parseRequiredNumber(values.safetyFactor),
  };
}

function buildVehicleEvaluationInputs(
  values: MissionProfileFormValues,
): VehicleReentryEvaluationInputs {
  return {
    ...buildSharedReentryInputs(values),
    vehicle: buildPrimaryVehicle(values),
  };
}

function buildVehicleComparisonInputs(
  values: MissionProfileFormValues,
  vehicles: readonly VehicleReentryConfiguration[] = buildConfiguredComparisonVehicles(
    values,
  ),
): VehicleReentryComparisonInputs {
  return {
    ...buildSharedReentryInputs(values),
    vehicles,
  };
}

function buildAnalysisInputs(
  values: MissionProfileFormValues,
): MissionProfileInputs {
  return {
    ...(values.includeDeltaVBudget
      ? { deltaVBudget: buildDeltaVBudgetInputs(values) }
      : {}),
    missionName: values.missionName,
    ...(values.includeVehicleComparison
      ? { vehicleComparison: buildVehicleComparisonInputs(values) }
      : {}),
    ...(values.includeVehicleReentryEvaluation
      ? { vehicleReentryEvaluation: buildVehicleEvaluationInputs(values) }
      : {}),
  };
}

function captureRangeError(operation: () => unknown): RangeError | null {
  try {
    operation();
  } catch (error) {
    if (error instanceof RangeError) return error;
    throw error;
  }

  return null;
}

function getDeltaVBudgetError(
  values: MissionProfileFormValues,
): RangeError | null {
  if (!values.includeDeltaVBudget) return null;

  return captureRangeError(() =>
    analyzeMissionProfile({
      deltaVBudget: buildDeltaVBudgetInputs(values),
      missionName: values.missionName,
    }),
  );
}

function getVehicleEvaluationError(
  values: MissionProfileFormValues,
): RangeError | null {
  if (!values.includeVehicleReentryEvaluation) return null;

  return captureRangeError(() =>
    analyzeMissionProfile({
      missionName: values.missionName,
      vehicleReentryEvaluation: buildVehicleEvaluationInputs(values),
    }),
  );
}

function getVehicleComparisonError(
  values: MissionProfileFormValues,
  vehicles?: readonly VehicleReentryConfiguration[],
): RangeError | null {
  if (!values.includeVehicleComparison) return null;

  return captureRangeError(() =>
    analyzeMissionProfile({
      missionName: values.missionName,
      vehicleComparison: buildVehicleComparisonInputs(values, vehicles),
    }),
  );
}

function locateHohmannAltitudeError(
  values: MissionProfileFormValues,
): "initialAltitudeMetres" | "finalAltitudeMetres" {
  const inputs = buildHohmannTransferInputs(values);
  const probeError = captureRangeError(() =>
    analyzeMissionProfile({
      deltaVBudget: {
        hohmannTransfer: { ...inputs, finalAltitudeMetres: 0 },
        missionName: values.missionName,
      },
      missionName: values.missionName,
    }),
  );

  return probeError?.message.toLowerCase().includes("altitude")
    ? "initialAltitudeMetres"
    : "finalAltitudeMetres";
}

function mapDeltaVBudgetError(
  values: MissionProfileFormValues,
  error: RangeError,
): MissionProfileValidationErrors {
  const message = error.message.toLowerCase();

  if (message.includes("gravitational parameter")) {
    return { gravitationalParameter: error.message };
  }
  if (message.includes("planet radius")) {
    return { planetRadiusMetres: error.message };
  }
  if (message.includes("inclination change")) {
    return { inclinationChangeDegrees: error.message };
  }
  if (message.includes("initial and final orbit radii")) {
    return {
      finalAltitudeMetres: error.message,
      initialAltitudeMetres: error.message,
    };
  }
  if (message.includes("altitude")) {
    if (values.includeHohmannTransfer) {
      const hohmannError = captureRangeError(() =>
        analyzeMissionProfile({
          deltaVBudget: {
            hohmannTransfer: buildHohmannTransferInputs(values),
            missionName: values.missionName,
          },
          missionName: values.missionName,
        }),
      );

      if (hohmannError) {
        return { [locateHohmannAltitudeError(values)]: error.message };
      }
    }

    return { orbitalAltitudeMetres: error.message };
  }

  return { form: error.message };
}

function mapSharedReentryError(
  error: RangeError,
): MissionProfileValidationErrors | null {
  const message = error.message.toLowerCase();

  if (message.includes("flight path angle")) {
    return { initialFlightPathAngleDegrees: error.message };
  }
  if (message.includes("time step")) {
    return { timestepSeconds: error.message };
  }
  if (message.includes("heating coefficient")) {
    return { heatingCoefficient: error.message };
  }
  if (message.includes("safety factor")) {
    return { safetyFactor: error.message };
  }
  if (message.includes("altitude")) {
    return { initialAltitudeMeters: error.message };
  }
  if (message.includes("velocity")) {
    return { initialVelocityMetersPerSecond: error.message };
  }

  return null;
}

function mapVehicleError(
  error: RangeError,
  vehicle: "primary" | "alternative",
): MissionProfileValidationErrors {
  const message = error.message.toLowerCase();

  if (message.includes("vehicle name")) {
    return {
      [vehicle === "primary" ? "primaryVehicleName" : "alternativeVehicleName"]:
        error.message,
    };
  }
  if (message.includes("vehicle mass")) {
    return {
      [vehicle === "primary"
        ? "primaryMassKilograms"
        : "alternativeMassKilograms"]: error.message,
    };
  }
  if (message.includes("drag coefficient")) {
    return {
      [vehicle === "primary"
        ? "primaryDragCoefficient"
        : "alternativeDragCoefficient"]: error.message,
    };
  }
  if (message.includes("reference area")) {
    return {
      [vehicle === "primary"
        ? "primaryReferenceAreaSquareMetres"
        : "alternativeReferenceAreaSquareMetres"]: error.message,
    };
  }
  if (message.includes("nose radius")) {
    return {
      [vehicle === "primary"
        ? "primaryNoseRadiusMetres"
        : "alternativeNoseRadiusMetres"]: error.message,
    };
  }

  return { form: error.message };
}

function mapComparisonError(
  values: MissionProfileFormValues,
  error: RangeError,
): MissionProfileValidationErrors {
  const sharedError = mapSharedReentryError(error);

  if (sharedError) return sharedError;

  const primaryError = getVehicleComparisonError(values, [
    buildPrimaryVehicle(values),
  ]);

  return mapVehicleError(error, primaryError ? "primary" : "alternative");
}

function deriveViewState(
  values: MissionProfileFormValues,
): MissionProfileViewState {
  try {
    return {
      errors: {},
      result: analyzeMissionProfile(buildAnalysisInputs(values)),
    };
  } catch (error) {
    if (!(error instanceof RangeError)) throw error;

    if (error.message.toLowerCase().includes("mission name")) {
      return { errors: { missionName: error.message }, result: null };
    }

    const deltaVBudgetError = getDeltaVBudgetError(values);
    if (deltaVBudgetError) {
      return {
        errors: mapDeltaVBudgetError(values, deltaVBudgetError),
        result: null,
      };
    }

    const vehicleEvaluationError = getVehicleEvaluationError(values);
    if (vehicleEvaluationError) {
      return {
        errors:
          mapSharedReentryError(vehicleEvaluationError) ??
          mapVehicleError(vehicleEvaluationError, "primary"),
        result: null,
      };
    }

    const vehicleComparisonError = getVehicleComparisonError(values);
    if (vehicleComparisonError) {
      return {
        errors: mapComparisonError(values, vehicleComparisonError),
        result: null,
      };
    }

    return { errors: { form: error.message }, result: null };
  }
}

function OptionalNumberField({
  error,
  field,
  hint,
  label,
  onChange,
  unit,
  value,
}: OptionalNumberFieldProps) {
  const inputId = "mission-profile-" + field;
  const hintId = inputId + "-hint";
  const errorId = inputId + "-error";

  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative mt-2">
        <input
          aria-describedby={error ? hintId + " " + errorId : hintId}
          aria-errormessage={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className="min-h-12 w-full rounded-xl border border-border bg-background/55 px-4 py-3 pr-20 font-mono text-base text-foreground transition-colors outline-none placeholder:text-muted/55 focus:border-accent focus:ring-2 focus:ring-accent/15"
          id={inputId}
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
      {error ? (
        <p className="mt-1.5 text-xs leading-5 text-signal" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface VehicleFieldsProps {
  readonly errors: MissionProfileValidationErrors;
  readonly idPrefix: "mission-profile-primary" | "mission-profile-alternative";
  readonly label: string;
  readonly nameField: "primaryVehicleName" | "alternativeVehicleName";
  readonly onChange: (field: MissionProfileField, value: string) => void;
  readonly values: MissionProfileFormValues;
  readonly vehicle: "primary" | "alternative";
}

function VehicleFields({
  errors,
  idPrefix,
  label,
  nameField,
  onChange,
  values,
  vehicle,
}: VehicleFieldsProps) {
  const prefix = vehicle === "primary" ? "primary" : "alternative";
  const nameId = idPrefix + "-" + nameField;
  const nameError = errors[nameField];
  const nameHintId = nameId + "-hint";
  const nameErrorId = nameId + "-error";
  const massField = (prefix + "MassKilograms") as
    "primaryMassKilograms" | "alternativeMassKilograms";
  const dragField = (prefix + "DragCoefficient") as
    "primaryDragCoefficient" | "alternativeDragCoefficient";
  const areaField = (prefix + "ReferenceAreaSquareMetres") as
    "primaryReferenceAreaSquareMetres" | "alternativeReferenceAreaSquareMetres";
  const noseField = (prefix + "NoseRadiusMetres") as
    "primaryNoseRadiusMetres" | "alternativeNoseRadiusMetres";

  return (
    <fieldset className="rounded-2xl border border-border bg-background/30 p-4 sm:p-5">
      <legend className="px-2 font-mono text-[0.65rem] tracking-[0.13em] text-accent uppercase">
        {label}
      </legend>
      <div>
        <label className="text-sm font-semibold" htmlFor={nameId}>
          Vehicle name
        </label>
        <input
          aria-describedby={
            nameError ? nameHintId + " " + nameErrorId : nameHintId
          }
          aria-errormessage={nameError ? nameErrorId : undefined}
          aria-invalid={Boolean(nameError)}
          className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background/55 px-4 py-3 text-base text-foreground transition-colors outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
          id={nameId}
          onChange={(event) => onChange(nameField, event.target.value)}
          required
          type="text"
          value={values[nameField]}
        />
        <p className="mt-2 text-xs leading-5 text-muted" id={nameHintId}>
          Identifies this caller-supplied vehicle configuration.
        </p>
        {nameError ? (
          <p className="mt-1.5 text-xs leading-5 text-signal" id={nameErrorId}>
            {nameError}
          </p>
        ) : null}
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <CalculatorNumberField
          error={errors[massField]}
          field={massField}
          hint="Constant vehicle mass used by the reentry analyses."
          idPrefix={idPrefix}
          label="Mass"
          onChange={onChange}
          unit="kg"
          value={values[massField]}
        />
        <CalculatorNumberField
          error={errors[dragField]}
          field={dragField}
          hint="Dimensionless aerodynamic drag coefficient."
          idPrefix={idPrefix}
          label="Drag coefficient"
          onChange={onChange}
          unit="CD"
          value={values[dragField]}
        />
        <CalculatorNumberField
          error={errors[areaField]}
          field={areaField}
          hint="Reference area used for drag and TPS mass estimates."
          idPrefix={idPrefix}
          label="Reference area"
          onChange={onChange}
          unit="m²"
          value={values[areaField]}
        />
        <CalculatorNumberField
          error={errors[noseField]}
          field={noseField}
          hint="Effective stagnation-point nose radius."
          idPrefix={idPrefix}
          label="Nose radius"
          onChange={onChange}
          unit="m"
          value={values[noseField]}
        />
      </div>
    </fieldset>
  );
}

export function MissionProfileAnalyzer({
  initialMissionProfile,
}: MissionProfileAnalyzerProps = {}) {
  const [values, setValues] = useState<MissionProfileFormValues>(() =>
    createFormValues(initialMissionProfile),
  );

  useEffect(() => {
    if (initialMissionProfile !== undefined) {
      setValues(createFormValues(initialMissionProfile));
    }
  }, [initialMissionProfile]);
  const { errors, result } = useMemo(() => deriveViewState(values), [values]);
  const reentryEnabled =
    values.includeVehicleReentryEvaluation || values.includeVehicleComparison;
  const systemsResolved = result
    ? [
        result.missionSummaryState.hasDeltaVBudget ? "Delta-v budget" : null,
        result.missionSummaryState.hasVehicleReentryEvaluation
          ? "Vehicle evaluation"
          : null,
        result.missionSummaryState.hasVehicleComparison
          ? "Vehicle comparison"
          : null,
      ].filter((system): system is string => system !== null)
    : [];
  const deltaVBudget = result?.sourceAnalyses.deltaVBudget;
  const selectedComparisonVehicle = result?.selectedVehicleRecommendation;
  const vehicleEvaluation = result?.sourceAnalyses.vehicleReentryEvaluation;
  const selectedVehicleName =
    selectedComparisonVehicle?.vehicleName ??
    vehicleEvaluation?.vehicle.vehicleName;
  const flightSummary =
    selectedComparisonVehicle?.trajectorySummary ??
    vehicleEvaluation?.summary.flight;
  const peakDeceleration =
    selectedComparisonVehicle?.peakDeceleration ??
    vehicleEvaluation?.summary.dynamics.peakDeceleration;
  const peakHeatFluxWattsPerSquareMetre =
    selectedComparisonVehicle?.peakHeating.heatFluxWattsPerSquareMetre ??
    vehicleEvaluation?.summary.thermal.peakHeatFluxWattsPerSquareMetre;
  const tpsThickness =
    selectedComparisonVehicle?.tpsThickness ??
    vehicleEvaluation?.summary.tps.requiredThickness;
  const tpsMassKilograms =
    selectedComparisonVehicle?.tpsMassKilograms ??
    vehicleEvaluation?.summary.tps.estimatedTPSMassKilograms;
  const thermalMargin =
    selectedComparisonVehicle?.thermalMargin ??
    vehicleEvaluation?.summary.tps.thermalMargin;
  const missionOutputIds = "mission-profile-missionName";
  const deltaOutputIds =
    "mission-profile-initialAltitudeMetres mission-profile-finalAltitudeMetres mission-profile-orbitalAltitudeMetres mission-profile-inclinationChangeDegrees mission-profile-gravitationalParameter mission-profile-planetRadiusMetres";
  const reentryOutputIds =
    "mission-profile-initialAltitudeMeters mission-profile-initialVelocityMetersPerSecond mission-profile-safetyFactor mission-profile-timestepSeconds mission-profile-initialFlightPathAngleDegrees mission-profile-heatingCoefficient";
  const primaryVehicleOutputIds =
    "mission-profile-primary-primaryVehicleName mission-profile-primary-primaryMassKilograms mission-profile-primary-primaryDragCoefficient mission-profile-primary-primaryReferenceAreaSquareMetres mission-profile-primary-primaryNoseRadiusMetres";
  const alternativeVehicleOutputIds =
    "mission-profile-alternative-alternativeVehicleName mission-profile-alternative-alternativeMassKilograms mission-profile-alternative-alternativeDragCoefficient mission-profile-alternative-alternativeReferenceAreaSquareMetres mission-profile-alternative-alternativeNoseRadiusMetres";
  const allOutputIds = [
    missionOutputIds,
    deltaOutputIds,
    reentryOutputIds,
    primaryVehicleOutputIds,
    alternativeVehicleOutputIds,
  ].join(" ");

  function updateValue(field: MissionProfileField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function updateToggle(field: MissionProfileToggle, checked: boolean) {
    setValues((current) => ({ ...current, [field]: checked }));
  }

  function preventSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function resetAnalyzer() {
    setValues(initialFormValues);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(34rem,1.1fr)] xl:gap-10">
      <div>
        <form noValidate onSubmit={preventSubmission}>
          <fieldset>
            <legend className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
              Mission identity
            </legend>
            <div className="mt-5">
              <label
                className="text-sm font-semibold"
                htmlFor="mission-profile-missionName"
              >
                Mission name
              </label>
              <input
                aria-describedby={
                  errors.missionName
                    ? "mission-profile-missionName-hint mission-profile-missionName-error"
                    : "mission-profile-missionName-hint"
                }
                aria-errormessage={
                  errors.missionName
                    ? "mission-profile-missionName-error"
                    : undefined
                }
                aria-invalid={Boolean(errors.missionName)}
                className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background/55 px-4 py-3 text-base text-foreground transition-colors outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
                id="mission-profile-missionName"
                onChange={(event) =>
                  updateValue("missionName", event.target.value)
                }
                required
                type="text"
                value={values.missionName}
              />
              <p
                className="mt-2 text-xs leading-5 text-muted"
                id="mission-profile-missionName-hint"
              >
                Identifies the integrated educational mission profile.
              </p>
              {errors.missionName ? (
                <p
                  className="mt-1.5 text-xs leading-5 text-signal"
                  id="mission-profile-missionName-error"
                >
                  {errors.missionName}
                </p>
              ) : null}
            </div>
          </fieldset>

          <fieldset className="mt-7 border-t border-border pt-7">
            <legend className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
              Optional systems
            </legend>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                {
                  checked: values.includeDeltaVBudget,
                  controls: "mission-profile-delta-system",
                  field: "includeDeltaVBudget" as const,
                  label: "Delta-v budget",
                },
                {
                  checked: values.includeVehicleReentryEvaluation,
                  controls: "mission-profile-reentry-system",
                  field: "includeVehicleReentryEvaluation" as const,
                  label: "Vehicle evaluation",
                },
                {
                  checked: values.includeVehicleComparison,
                  controls: "mission-profile-reentry-system",
                  field: "includeVehicleComparison" as const,
                  label: "Vehicle comparison",
                },
              ].map((system) => (
                <label
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-3 text-sm font-semibold transition-colors hover:border-accent/50"
                  key={system.field}
                >
                  <input
                    aria-controls={system.controls}
                    checked={system.checked}
                    className="h-4 w-4 accent-accent"
                    onChange={(event) =>
                      updateToggle(system.field, event.target.checked)
                    }
                    type="checkbox"
                  />
                  {system.label}
                </label>
              ))}
            </div>
          </fieldset>

          {values.includeDeltaVBudget ? (
            <fieldset
              className="mt-7 border-t border-border pt-7"
              id="mission-profile-delta-system"
            >
              <legend className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
                Delta-v budget
              </legend>
              <div className="mt-5 flex flex-wrap gap-3">
                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm font-semibold">
                  <input
                    aria-controls="mission-profile-hohmann-inputs"
                    checked={values.includeHohmannTransfer}
                    className="h-4 w-4 accent-accent"
                    onChange={(event) =>
                      updateToggle(
                        "includeHohmannTransfer",
                        event.target.checked,
                      )
                    }
                    type="checkbox"
                  />
                  Hohmann transfer
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/40 px-4 py-2.5 text-sm font-semibold">
                  <input
                    aria-controls="mission-profile-plane-change-inputs"
                    checked={values.includeOrbitalPlaneChange}
                    className="h-4 w-4 accent-accent"
                    onChange={(event) =>
                      updateToggle(
                        "includeOrbitalPlaneChange",
                        event.target.checked,
                      )
                    }
                    type="checkbox"
                  />
                  Orbital plane change
                </label>
              </div>

              {values.includeHohmannTransfer ? (
                <div
                  className="mt-5 grid gap-5 sm:grid-cols-2"
                  id="mission-profile-hohmann-inputs"
                >
                  <CalculatorNumberField
                    error={errors.initialAltitudeMetres}
                    field="initialAltitudeMetres"
                    hint="Initial circular-orbit altitude."
                    idPrefix="mission-profile"
                    label="Initial orbit altitude"
                    onChange={updateValue}
                    unit="m"
                    value={values.initialAltitudeMetres}
                  />
                  <CalculatorNumberField
                    error={errors.finalAltitudeMetres}
                    field="finalAltitudeMetres"
                    hint="Destination circular-orbit altitude."
                    idPrefix="mission-profile"
                    label="Final orbit altitude"
                    onChange={updateValue}
                    unit="m"
                    value={values.finalAltitudeMetres}
                  />
                </div>
              ) : null}

              {values.includeOrbitalPlaneChange ? (
                <div
                  className="mt-5 grid gap-5 sm:grid-cols-2"
                  id="mission-profile-plane-change-inputs"
                >
                  <CalculatorNumberField
                    error={errors.orbitalAltitudeMetres}
                    field="orbitalAltitudeMetres"
                    hint="Circular-orbit altitude where the plane change occurs."
                    idPrefix="mission-profile"
                    label="Plane-change altitude"
                    onChange={updateValue}
                    unit="m"
                    value={values.orbitalAltitudeMetres}
                  />
                  <CalculatorNumberField
                    error={errors.inclinationChangeDegrees}
                    field="inclinationChangeDegrees"
                    hint="Required change in orbital inclination."
                    idPrefix="mission-profile"
                    label="Inclination change"
                    onChange={updateValue}
                    unit="deg"
                    value={values.inclinationChangeDegrees}
                  />
                </div>
              ) : null}

              {values.includeHohmannTransfer ||
              values.includeOrbitalPlaneChange ? (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <OptionalNumberField
                    error={errors.gravitationalParameter}
                    field="gravitationalParameter"
                    hint="Leave blank to use Earth's default gravitational parameter."
                    label="Gravitational parameter (optional)"
                    onChange={updateValue}
                    unit="m³/s²"
                    value={values.gravitationalParameter}
                  />
                  <OptionalNumberField
                    error={errors.planetRadiusMetres}
                    field="planetRadiusMetres"
                    hint="Leave blank to use Earth's mean radius."
                    label="Planet radius (optional)"
                    onChange={updateValue}
                    unit="m"
                    value={values.planetRadiusMetres}
                  />
                </div>
              ) : null}
            </fieldset>
          ) : null}

          {reentryEnabled ? (
            <div
              className="mt-7 space-y-6 border-t border-border pt-7"
              id="mission-profile-reentry-system"
            >
              <fieldset>
                <legend className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
                  Shared reentry scenario
                </legend>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <CalculatorNumberField
                    error={errors.initialAltitudeMeters}
                    field="initialAltitudeMeters"
                    hint="Starting altitude within the current atmosphere model."
                    idPrefix="mission-profile"
                    label="Initial altitude"
                    onChange={updateValue}
                    unit="m"
                    value={values.initialAltitudeMeters}
                  />
                  <CalculatorNumberField
                    error={errors.initialVelocityMetersPerSecond}
                    field="initialVelocityMetersPerSecond"
                    hint="Initial vehicle speed for the reentry workflow."
                    idPrefix="mission-profile"
                    label="Initial velocity"
                    onChange={updateValue}
                    unit="m/s"
                    value={values.initialVelocityMetersPerSecond}
                  />
                  <CalculatorNumberField
                    error={errors.safetyFactor}
                    field="safetyFactor"
                    hint="TPS sizing multiplier passed to the existing analysis."
                    idPrefix="mission-profile"
                    label="TPS safety factor"
                    onChange={updateValue}
                    unit="×"
                    value={values.safetyFactor}
                  />
                  <OptionalNumberField
                    error={errors.timestepSeconds}
                    field="timestepSeconds"
                    hint="Leave blank to preserve the trajectory default."
                    label="Time step (optional)"
                    onChange={updateValue}
                    unit="s"
                    value={values.timestepSeconds}
                  />
                  <OptionalNumberField
                    error={errors.initialFlightPathAngleDegrees}
                    field="initialFlightPathAngleDegrees"
                    hint="Leave blank to preserve the trajectory default."
                    label="Flight-path angle (optional)"
                    onChange={updateValue}
                    unit="deg"
                    value={values.initialFlightPathAngleDegrees}
                  />
                  <OptionalNumberField
                    error={errors.heatingCoefficient}
                    field="heatingCoefficient"
                    hint="Leave blank to preserve the heating-model default."
                    label="Heating coefficient (optional)"
                    onChange={updateValue}
                    unit="k"
                    value={values.heatingCoefficient}
                  />
                </div>
              </fieldset>

              <VehicleFields
                errors={errors}
                idPrefix="mission-profile-primary"
                label="Primary vehicle"
                nameField="primaryVehicleName"
                onChange={updateValue}
                values={values}
                vehicle="primary"
              />

              {values.includeVehicleComparison ? (
                <VehicleFields
                  errors={errors}
                  idPrefix="mission-profile-alternative"
                  label="Comparison vehicle"
                  nameField="alternativeVehicleName"
                  onChange={updateValue}
                  values={values}
                  vehicle="alternative"
                />
              ) : null}
            </div>
          ) : null}

          <ValidationErrorSummary errors={[...Object.values(errors)]} />

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-xs leading-5 text-muted">
              Valid changes update the integrated mission profile immediately.
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
          aria-labelledby="mission-profile-explanation-title"
          className="mt-8 border-t border-border pt-7"
        >
          <p className="font-mono text-[0.68rem] tracking-[0.15em] text-accent uppercase">
            Educational integration
          </p>
          <h3
            className="mt-1 text-lg font-semibold"
            id="mission-profile-explanation-title"
          >
            One profile, multiple engineering disciplines
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            The mission profile composes existing orbital transfers, vehicle
            reentry evaluation, thermal protection selection, and delta-v
            budgeting. Each source analysis remains independent and retains
            ownership of its equations, assumptions, and validation.
          </p>
          <p className="mt-3 text-xs leading-5 text-muted">
            This integration is educational and does not determine mission
            feasibility, flight readiness, or certification status.
          </p>
        </section>
      </div>

      <div className="space-y-5">
        <CalculatorResultSection
          eyebrow="Mission // Integrated systems"
          icon={Layers}
          id="mission-profile-overview-result"
          title="Mission overview"
        >
          {result ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted">Mission name</dt>
                <dd className="mt-1">
                  <output
                    className="text-lg font-semibold"
                    htmlFor={missionOutputIds}
                  >
                    {result.missionName}
                  </output>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Integrated analyses</dt>
                <dd className="mt-1">
                  <output
                    className="font-mono text-lg font-semibold"
                    htmlFor={allOutputIds}
                  >
                    {result.missionSummaryState.analysesResolved}
                  </output>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted">Systems resolved</dt>
                <dd className="mt-2">
                  <output htmlFor={allOutputIds}>
                    {systemsResolved.length > 0 ? (
                      <span className="flex flex-wrap gap-2">
                        {systemsResolved.map((system) => (
                          <span
                            className="rounded-full border border-accent/30 bg-accent/7 px-3 py-1 text-xs font-semibold text-accent"
                            key={system}
                          >
                            {system}
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="text-sm text-muted">
                        Mission identity only
                      </span>
                    )}
                  </output>
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm leading-6 text-muted">
              Enter a valid mission configuration to resolve the profile.
            </p>
          )}
        </CalculatorResultSection>

        <CalculatorResultSection
          eyebrow="Mission // Velocity budget"
          icon={Orbit}
          id="mission-profile-delta-v-result"
          title="Delta-v summary"
        >
          {deltaVBudget ? (
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted">Total mission delta-v</dt>
                <dd className="mt-1">
                  <output
                    className="font-mono text-lg font-semibold"
                    htmlFor={deltaOutputIds}
                  >
                    {standardFormatter.format(
                      deltaVBudget.totalDeltaVMetresPerSecond,
                    )}{" "}
                    m/s
                  </output>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Maneuver count</dt>
                <dd className="mt-1">
                  <output
                    className="font-mono text-lg font-semibold"
                    htmlFor={deltaOutputIds}
                  >
                    {deltaVBudget.numberOfManeuvers}
                  </output>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Largest contributor</dt>
                <dd className="mt-1">
                  <output
                    className="text-sm font-semibold"
                    htmlFor={deltaOutputIds}
                  >
                    {deltaVBudget.largestDeltaVContributor
                      ? deltaVBudget.largestDeltaVContributor.name +
                        " · " +
                        standardFormatter.format(
                          deltaVBudget.largestDeltaVContributor
                            .deltaVMetresPerSecond,
                        ) +
                        " m/s"
                      : "No maneuvers"}
                  </output>
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm leading-6 text-muted">
              Enable the delta-v budget to integrate orbital maneuver costs.
            </p>
          )}
        </CalculatorResultSection>

        <CalculatorResultSection
          eyebrow="Mission // Vehicle performance"
          icon={Plane}
          id="mission-profile-vehicle-result"
          title="Selected vehicle"
        >
          {selectedVehicleName && flightSummary && peakDeceleration ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs text-muted">
                  {selectedComparisonVehicle
                    ? "Comparison recommendation"
                    : "Evaluated vehicle"}
                </p>
                <output
                  className="mt-1 block text-xl font-semibold"
                  htmlFor={allOutputIds}
                >
                  {selectedVehicleName}
                </output>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted">Final velocity</dt>
                  <dd className="mt-1">
                    <output
                      className="font-mono text-sm font-semibold"
                      htmlFor={reentryOutputIds + " " + primaryVehicleOutputIds}
                    >
                      {standardFormatter.format(
                        flightSummary.finalState.velocityMetersPerSecond,
                      )}{" "}
                      m/s
                    </output>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Reentry duration</dt>
                  <dd className="mt-1">
                    <output
                      className="font-mono text-sm font-semibold"
                      htmlFor={reentryOutputIds + " " + primaryVehicleOutputIds}
                    >
                      {standardFormatter.format(
                        flightSummary.reentryDurationSeconds,
                      )}{" "}
                      s
                    </output>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Peak deceleration</dt>
                  <dd className="mt-1">
                    <output
                      className="font-mono text-sm font-semibold"
                      htmlFor={allOutputIds}
                    >
                      {standardFormatter.format(
                        peakDeceleration.decelerationMetersPerSecondSquared,
                      )}{" "}
                      m/s² ·{" "}
                      {standardFormatter.format(
                        peakDeceleration.decelerationGs,
                      )}{" "}
                      g
                    </output>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Peak heat flux</dt>
                  <dd className="mt-1">
                    <output
                      className="font-mono text-sm font-semibold"
                      htmlFor={allOutputIds}
                    >
                      {peakHeatFluxWattsPerSquareMetre === undefined
                        ? "Unavailable"
                        : heatFluxFormatter.format(
                            peakHeatFluxWattsPerSquareMetre,
                          ) + " W/m²"}
                    </output>
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted">
              Enable vehicle evaluation or comparison to inspect reentry
              performance.
            </p>
          )}
        </CalculatorResultSection>

        <CalculatorResultSection
          eyebrow="Mission // Thermal protection"
          icon={Shield}
          id="mission-profile-tps-result"
          title="TPS recommendation"
        >
          {result?.tpsRecommendation &&
          tpsThickness &&
          tpsMassKilograms !== undefined &&
          thermalMargin ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs text-muted">Recommended material</p>
                <output
                  className="mt-1 block text-xl font-semibold"
                  htmlFor={allOutputIds}
                >
                  {result.tpsRecommendation.name}
                </output>
                <p className="mt-2 text-xs leading-5 text-muted">
                  {result.tpsRecommendation.description}
                </p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-muted">Required thickness</dt>
                  <dd className="mt-1">
                    <output
                      className="font-mono text-sm font-semibold"
                      htmlFor={allOutputIds}
                    >
                      {preciseFormatter.format(tpsThickness.millimetres)} mm
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
                      {preciseFormatter.format(tpsMassKilograms)} kg
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
                      {standardFormatter.format(thermalMargin.marginPercentage)}
                      %
                    </output>
                    <p className="mt-1 text-xs text-accent">
                      {thermalMargin.classification}
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted">
              Enable a vehicle system to resolve the educational TPS material
              recommendation.
            </p>
          )}
        </CalculatorResultSection>

        <aside className="rounded-2xl border border-signal/25 bg-signal/6 p-5 sm:p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-signal">
            <AlertTriangle aria-hidden="true" size={17} />
            Modeling boundary
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-xs leading-5 text-muted sm:grid-cols-2">
            <li>Educational mission integration only</li>
            <li>No mission-feasibility determination</li>
            <li>Source-analysis assumptions remain in force</li>
            <li>No guidance, operations, or contingency planning</li>
            <li>No certified vehicle or TPS qualification data</li>
            <li>No coupling beyond existing analysis outputs</li>
          </ul>
          <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-muted">
            <Gauge aria-hidden="true" size={15} />
            Use the individual laboratory modules to inspect each source model
            in detail.
          </p>
        </aside>
      </div>
    </div>
  );
}
