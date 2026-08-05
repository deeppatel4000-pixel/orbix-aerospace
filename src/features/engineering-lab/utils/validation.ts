import {
  STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES,
  atmosphereFields,
  ballisticCoefficientFields,
  dragEquationFields,
  dynamicPressureFields,
  escapeVelocityFields,
  flightConditionFields,
  hohmannTransferFields,
  isentropicFlowFields,
  liftEquationFields,
  machNumberFields,
  normalShockFields,
  obliqueShockFields,
  orbitalElementsFields,
  orbitalPlaneChangeFields,
  rocketEquationFields,
  stagnationHeatingFields,
  thrustToWeightFields,
  visVivaFields,
  type AtmosphereInputs,
  type AtmosphereValidationErrors,
  type BallisticCoefficientInputs,
  type BallisticCoefficientValidationErrors,
  type DragEquationInputs,
  type DragEquationValidationErrors,
  type DynamicPressureInputs,
  type DynamicPressureValidationErrors,
  type EscapeVelocityInputs,
  type EscapeVelocityValidationErrors,
  type FlightConditionInputs,
  type FlightConditionValidationErrors,
  type HohmannTransferInputs,
  type HohmannTransferValidationErrors,
  type IsentropicFlowInputs,
  type IsentropicFlowValidationErrors,
  type LiftEquationInputs,
  type LiftEquationValidationErrors,
  type MachNumberInputs,
  type MachNumberValidationErrors,
  type NormalShockInputs,
  type NormalShockValidationErrors,
  type ObliqueShockInputs,
  type ObliqueShockValidationErrors,
  type OrbitalElementsInputs,
  type OrbitalElementsValidationErrors,
  type OrbitalPlaneChangeInputs,
  type OrbitalPlaneChangeValidationErrors,
  type RocketEquationInputs,
  type RocketEquationValidationErrors,
  type StagnationHeatingInputs,
  type StagnationHeatingValidationErrors,
  type ThrustToWeightInputs,
  type ThrustToWeightValidationErrors,
  type VisVivaInputs,
  type VisVivaValidationErrors,
} from "@/features/engineering-lab/types";

function positiveNumberError(value: number, label: string): string | undefined {
  if (!Number.isFinite(value)) {
    return "Enter a finite number for " + label.toLowerCase() + ".";
  }

  if (value <= 0) {
    return label + " must be greater than zero.";
  }

  return undefined;
}

function nonNegativeNumberError(
  value: number,
  label: string,
): string | undefined {
  if (!Number.isFinite(value)) {
    return "Enter a finite number for " + label.toLowerCase() + ".";
  }

  if (value < 0) {
    return label + " must not be negative.";
  }

  return undefined;
}

function greaterThanOneNumberError(
  value: number,
  label: string,
): string | undefined {
  if (!Number.isFinite(value)) {
    return "Enter a finite number for " + label.toLowerCase() + ".";
  }

  if (value <= 1) {
    return label + " must be greater than one.";
  }

  return undefined;
}

function atLeastOneNumberError(
  value: number,
  label: string,
): string | undefined {
  if (!Number.isFinite(value)) {
    return "Enter a finite number for " + label.toLowerCase() + ".";
  }

  if (value < 1) {
    return label + " must be at least one.";
  }

  return undefined;
}

export function validateRocketEquationInputs(
  inputs: RocketEquationInputs,
): RocketEquationValidationErrors {
  const errors: Partial<Record<keyof RocketEquationInputs, string>> = {
    finalMassKg: positiveNumberError(inputs.finalMassKg, "Final mass"),
    initialMassKg: positiveNumberError(inputs.initialMassKg, "Initial mass"),
    specificImpulseSeconds: positiveNumberError(
      inputs.specificImpulseSeconds,
      "Specific impulse",
    ),
  };

  if (
    !errors.initialMassKg &&
    !errors.finalMassKg &&
    inputs.initialMassKg <= inputs.finalMassKg
  ) {
    errors.initialMassKg = "Initial mass must exceed final mass.";
  }

  return errors;
}

export function hasRocketEquationValidationErrors(
  errors: RocketEquationValidationErrors,
): boolean {
  return rocketEquationFields.some((field) => errors[field] !== undefined);
}

export function assertValidRocketEquationInputs(
  inputs: RocketEquationInputs,
): void {
  const errors = validateRocketEquationInputs(inputs);

  if (!hasRocketEquationValidationErrors(errors)) return;

  const message = rocketEquationFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateThrustToWeightInputs(
  inputs: ThrustToWeightInputs,
): ThrustToWeightValidationErrors {
  return {
    massKg: positiveNumberError(inputs.massKg, "Mass"),
    thrustNewtons: positiveNumberError(inputs.thrustNewtons, "Thrust"),
  };
}

export function hasThrustToWeightValidationErrors(
  errors: ThrustToWeightValidationErrors,
): boolean {
  return thrustToWeightFields.some((field) => errors[field] !== undefined);
}

export function assertValidThrustToWeightInputs(
  inputs: ThrustToWeightInputs,
): void {
  const errors = validateThrustToWeightInputs(inputs);

  if (!hasThrustToWeightValidationErrors(errors)) return;

  const message = thrustToWeightFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateDynamicPressureInputs(
  inputs: DynamicPressureInputs,
): DynamicPressureValidationErrors {
  return {
    airDensityKilogramsPerCubicMetre: positiveNumberError(
      inputs.airDensityKilogramsPerCubicMetre,
      "Air density",
    ),
    velocityMetresPerSecond: positiveNumberError(
      inputs.velocityMetresPerSecond,
      "Velocity",
    ),
  };
}

export function hasDynamicPressureValidationErrors(
  errors: DynamicPressureValidationErrors,
): boolean {
  return dynamicPressureFields.some((field) => errors[field] !== undefined);
}

export function assertValidDynamicPressureInputs(
  inputs: DynamicPressureInputs,
): void {
  const errors = validateDynamicPressureInputs(inputs);

  if (!hasDynamicPressureValidationErrors(errors)) return;

  const message = dynamicPressureFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateBallisticCoefficientInputs(
  inputs: BallisticCoefficientInputs,
): BallisticCoefficientValidationErrors {
  return {
    dragCoefficient: positiveNumberError(
      inputs.dragCoefficient,
      "Drag coefficient",
    ),
    referenceAreaSquareMetres: positiveNumberError(
      inputs.referenceAreaSquareMetres,
      "Reference area",
    ),
    vehicleMassKilograms: positiveNumberError(
      inputs.vehicleMassKilograms,
      "Vehicle mass",
    ),
  };
}

export function hasBallisticCoefficientValidationErrors(
  errors: BallisticCoefficientValidationErrors,
): boolean {
  return ballisticCoefficientFields.some(
    (field) => errors[field] !== undefined,
  );
}

export function assertValidBallisticCoefficientInputs(
  inputs: BallisticCoefficientInputs,
): void {
  const errors = validateBallisticCoefficientInputs(inputs);

  if (!hasBallisticCoefficientValidationErrors(errors)) return;

  const message = ballisticCoefficientFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateEscapeVelocityInputs(
  inputs: EscapeVelocityInputs,
): EscapeVelocityValidationErrors {
  return {
    gravitationalParameter:
      inputs.gravitationalParameter === undefined
        ? undefined
        : positiveNumberError(
            inputs.gravitationalParameter,
            "Gravitational parameter",
          ),
    orbitalRadiusMetres: positiveNumberError(
      inputs.orbitalRadiusMetres,
      "Orbital radius",
    ),
  };
}

export function hasEscapeVelocityValidationErrors(
  errors: EscapeVelocityValidationErrors,
): boolean {
  return escapeVelocityFields.some((field) => errors[field] !== undefined);
}

export function assertValidEscapeVelocityInputs(
  inputs: EscapeVelocityInputs,
): void {
  const errors = validateEscapeVelocityInputs(inputs);

  if (!hasEscapeVelocityValidationErrors(errors)) return;

  const message = escapeVelocityFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateHohmannTransferInputs(
  inputs: HohmannTransferInputs,
): HohmannTransferValidationErrors {
  const errors: Partial<Record<keyof HohmannTransferInputs, string>> = {
    finalOrbitRadiusMetres: positiveNumberError(
      inputs.finalOrbitRadiusMetres,
      "Final orbit radius",
    ),
    gravitationalParameter:
      inputs.gravitationalParameter === undefined
        ? undefined
        : positiveNumberError(
            inputs.gravitationalParameter,
            "Gravitational parameter",
          ),
    initialOrbitRadiusMetres: positiveNumberError(
      inputs.initialOrbitRadiusMetres,
      "Initial orbit radius",
    ),
  };

  if (
    !errors.initialOrbitRadiusMetres &&
    !errors.finalOrbitRadiusMetres &&
    inputs.initialOrbitRadiusMetres === inputs.finalOrbitRadiusMetres
  ) {
    errors.finalOrbitRadiusMetres =
      "Initial and final orbit radii must differ.";
  }

  return errors;
}

export function hasHohmannTransferValidationErrors(
  errors: HohmannTransferValidationErrors,
): boolean {
  return hohmannTransferFields.some((field) => errors[field] !== undefined);
}

export function assertValidHohmannTransferInputs(
  inputs: HohmannTransferInputs,
): void {
  const errors = validateHohmannTransferInputs(inputs);

  if (!hasHohmannTransferValidationErrors(errors)) return;

  const message = hohmannTransferFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateOrbitalElementsInputs(
  inputs: OrbitalElementsInputs,
): OrbitalElementsValidationErrors {
  return {
    altitudeMetres: nonNegativeNumberError(inputs.altitudeMetres, "Altitude"),
    gravitationalParameter:
      inputs.gravitationalParameter === undefined
        ? undefined
        : positiveNumberError(
            inputs.gravitationalParameter,
            "Gravitational parameter",
          ),
    planetRadiusMetres:
      inputs.planetRadiusMetres === undefined
        ? undefined
        : positiveNumberError(inputs.planetRadiusMetres, "Planet radius"),
  };
}

export function hasOrbitalElementsValidationErrors(
  errors: OrbitalElementsValidationErrors,
): boolean {
  return orbitalElementsFields.some((field) => errors[field] !== undefined);
}

export function assertValidOrbitalElementsInputs(
  inputs: OrbitalElementsInputs,
): void {
  const errors = validateOrbitalElementsInputs(inputs);

  if (!hasOrbitalElementsValidationErrors(errors)) return;

  const message = orbitalElementsFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateOrbitalPlaneChangeInputs(
  inputs: OrbitalPlaneChangeInputs,
): OrbitalPlaneChangeValidationErrors {
  return {
    inclinationChangeDegrees: nonNegativeNumberError(
      inputs.inclinationChangeDegrees,
      "Inclination change",
    ),
    orbitalVelocityMetresPerSecond: positiveNumberError(
      inputs.orbitalVelocityMetresPerSecond,
      "Orbital velocity",
    ),
  };
}

export function hasOrbitalPlaneChangeValidationErrors(
  errors: OrbitalPlaneChangeValidationErrors,
): boolean {
  return orbitalPlaneChangeFields.some((field) => errors[field] !== undefined);
}

export function assertValidOrbitalPlaneChangeInputs(
  inputs: OrbitalPlaneChangeInputs,
): void {
  const errors = validateOrbitalPlaneChangeInputs(inputs);

  if (!hasOrbitalPlaneChangeValidationErrors(errors)) return;

  const message = orbitalPlaneChangeFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateVisVivaInputs(
  inputs: VisVivaInputs,
): VisVivaValidationErrors {
  return {
    gravitationalParameter:
      inputs.gravitationalParameter === undefined
        ? undefined
        : positiveNumberError(
            inputs.gravitationalParameter,
            "Gravitational parameter",
          ),
    orbitalRadiusMetres: positiveNumberError(
      inputs.orbitalRadiusMetres,
      "Orbital radius",
    ),
    semiMajorAxisMetres: positiveNumberError(
      inputs.semiMajorAxisMetres,
      "Semi-major axis",
    ),
  };
}

export function hasVisVivaValidationErrors(
  errors: VisVivaValidationErrors,
): boolean {
  return visVivaFields.some((field) => errors[field] !== undefined);
}

export function assertValidVisVivaInputs(inputs: VisVivaInputs): void {
  const errors = validateVisVivaInputs(inputs);

  if (!hasVisVivaValidationErrors(errors)) return;

  const message = visVivaFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateStagnationHeatingInputs(
  inputs: StagnationHeatingInputs,
): StagnationHeatingValidationErrors {
  return {
    atmosphericDensityKilogramsPerCubicMetre: positiveNumberError(
      inputs.atmosphericDensityKilogramsPerCubicMetre,
      "Atmospheric density",
    ),
    heatingCoefficient:
      inputs.heatingCoefficient === undefined
        ? undefined
        : positiveNumberError(inputs.heatingCoefficient, "Heating coefficient"),
    noseRadiusMetres: positiveNumberError(
      inputs.noseRadiusMetres,
      "Nose radius",
    ),
    velocityMetresPerSecond: positiveNumberError(
      inputs.velocityMetresPerSecond,
      "Velocity",
    ),
  };
}

export function hasStagnationHeatingValidationErrors(
  errors: StagnationHeatingValidationErrors,
): boolean {
  return stagnationHeatingFields.some((field) => errors[field] !== undefined);
}

export function assertValidStagnationHeatingInputs(
  inputs: StagnationHeatingInputs,
): void {
  const errors = validateStagnationHeatingInputs(inputs);

  if (!hasStagnationHeatingValidationErrors(errors)) return;

  const message = stagnationHeatingFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateLiftEquationInputs(
  inputs: LiftEquationInputs,
): LiftEquationValidationErrors {
  const dynamicPressureErrors = validateDynamicPressureInputs(inputs);

  return {
    airDensityKilogramsPerCubicMetre:
      dynamicPressureErrors.airDensityKilogramsPerCubicMetre,
    liftCoefficient: positiveNumberError(
      inputs.liftCoefficient,
      "Lift coefficient",
    ),
    velocityMetresPerSecond: dynamicPressureErrors.velocityMetresPerSecond,
    wingAreaSquareMetres: positiveNumberError(
      inputs.wingAreaSquareMetres,
      "Wing area",
    ),
  };
}

export function hasLiftEquationValidationErrors(
  errors: LiftEquationValidationErrors,
): boolean {
  return liftEquationFields.some((field) => errors[field] !== undefined);
}

export function assertValidLiftEquationInputs(
  inputs: LiftEquationInputs,
): void {
  const errors = validateLiftEquationInputs(inputs);

  if (!hasLiftEquationValidationErrors(errors)) return;

  const message = liftEquationFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateDragEquationInputs(
  inputs: DragEquationInputs,
): DragEquationValidationErrors {
  const dynamicPressureErrors = validateDynamicPressureInputs(inputs);

  return {
    airDensityKilogramsPerCubicMetre:
      dynamicPressureErrors.airDensityKilogramsPerCubicMetre,
    dragCoefficient: positiveNumberError(
      inputs.dragCoefficient,
      "Drag coefficient",
    ),
    referenceAreaSquareMetres: positiveNumberError(
      inputs.referenceAreaSquareMetres,
      "Reference area",
    ),
    velocityMetresPerSecond: dynamicPressureErrors.velocityMetresPerSecond,
  };
}

export function hasDragEquationValidationErrors(
  errors: DragEquationValidationErrors,
): boolean {
  return dragEquationFields.some((field) => errors[field] !== undefined);
}

export function assertValidDragEquationInputs(
  inputs: DragEquationInputs,
): void {
  const errors = validateDragEquationInputs(inputs);

  if (!hasDragEquationValidationErrors(errors)) return;

  const message = dragEquationFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateAtmosphereInputs(
  inputs: AtmosphereInputs,
): AtmosphereValidationErrors {
  let altitudeError: string | undefined;

  if (!Number.isFinite(inputs.altitudeMetres)) {
    altitudeError = "Enter a finite number for altitude.";
  } else if (inputs.altitudeMetres < 0) {
    altitudeError = "Altitude must not be negative.";
  } else if (inputs.altitudeMetres > STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES) {
    altitudeError =
      "Altitude must not exceed " +
      STANDARD_ATMOSPHERE_MAX_ALTITUDE_METRES.toLocaleString("en-US") +
      " metres for this model.";
  }

  return { altitudeMetres: altitudeError };
}

export function hasAtmosphereValidationErrors(
  errors: AtmosphereValidationErrors,
): boolean {
  return atmosphereFields.some((field) => errors[field] !== undefined);
}

export function assertValidAtmosphereInputs(inputs: AtmosphereInputs): void {
  const errors = validateAtmosphereInputs(inputs);

  if (!hasAtmosphereValidationErrors(errors)) return;

  const message = atmosphereFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateMachNumberInputs(
  inputs: MachNumberInputs,
): MachNumberValidationErrors {
  return {
    speedOfSoundMetersPerSecond: positiveNumberError(
      inputs.speedOfSoundMetersPerSecond,
      "Speed of sound",
    ),
    velocityMetresPerSecond: nonNegativeNumberError(
      inputs.velocityMetresPerSecond,
      "Velocity",
    ),
  };
}

export function hasMachNumberValidationErrors(
  errors: MachNumberValidationErrors,
): boolean {
  return machNumberFields.some((field) => errors[field] !== undefined);
}

export function assertValidMachNumberInputs(inputs: MachNumberInputs): void {
  const errors = validateMachNumberInputs(inputs);

  if (!hasMachNumberValidationErrors(errors)) return;

  const message = machNumberFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateIsentropicFlowInputs(
  inputs: IsentropicFlowInputs,
): IsentropicFlowValidationErrors {
  return {
    gamma:
      inputs.gamma === undefined
        ? undefined
        : greaterThanOneNumberError(inputs.gamma, "Gamma"),
    machNumber: nonNegativeNumberError(inputs.machNumber, "Mach number"),
  };
}

export function hasIsentropicFlowValidationErrors(
  errors: IsentropicFlowValidationErrors,
): boolean {
  return isentropicFlowFields.some((field) => errors[field] !== undefined);
}

export function assertValidIsentropicFlowInputs(
  inputs: IsentropicFlowInputs,
): void {
  const errors = validateIsentropicFlowInputs(inputs);

  if (!hasIsentropicFlowValidationErrors(errors)) return;

  const message = isentropicFlowFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateNormalShockInputs(
  inputs: NormalShockInputs,
): NormalShockValidationErrors {
  return {
    gamma:
      inputs.gamma === undefined
        ? undefined
        : greaterThanOneNumberError(inputs.gamma, "Gamma"),
    machNumber: atLeastOneNumberError(inputs.machNumber, "Mach number"),
  };
}

export function hasNormalShockValidationErrors(
  errors: NormalShockValidationErrors,
): boolean {
  return normalShockFields.some((field) => errors[field] !== undefined);
}

export function assertValidNormalShockInputs(inputs: NormalShockInputs): void {
  const errors = validateNormalShockInputs(inputs);

  if (!hasNormalShockValidationErrors(errors)) return;

  const message = normalShockFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateObliqueShockInputs(
  inputs: ObliqueShockInputs,
): ObliqueShockValidationErrors {
  return {
    deflectionAngleDegrees: positiveNumberError(
      inputs.deflectionAngleDegrees,
      "Deflection angle",
    ),
    gamma:
      inputs.gamma === undefined
        ? undefined
        : greaterThanOneNumberError(inputs.gamma, "Gamma"),
    machNumber: greaterThanOneNumberError(inputs.machNumber, "Mach number"),
  };
}

export function hasObliqueShockValidationErrors(
  errors: ObliqueShockValidationErrors,
): boolean {
  return obliqueShockFields.some((field) => errors[field] !== undefined);
}

export function assertValidObliqueShockInputs(
  inputs: ObliqueShockInputs,
): void {
  const errors = validateObliqueShockInputs(inputs);

  if (!hasObliqueShockValidationErrors(errors)) return;

  const message = obliqueShockFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}

export function validateFlightConditionInputs(
  inputs: FlightConditionInputs,
): FlightConditionValidationErrors {
  const atmosphereErrors = validateAtmosphereInputs({
    altitudeMetres: inputs.altitudeMetres,
  });

  return {
    altitudeMetres: atmosphereErrors.altitudeMetres,
    dragCoefficient: positiveNumberError(
      inputs.dragCoefficient,
      "Drag coefficient",
    ),
    liftCoefficient: positiveNumberError(
      inputs.liftCoefficient,
      "Lift coefficient",
    ),
    velocityMetresPerSecond: positiveNumberError(
      inputs.velocityMetresPerSecond,
      "Velocity",
    ),
    wingAreaSquareMetres: positiveNumberError(
      inputs.wingAreaSquareMetres,
      "Wing area",
    ),
  };
}

export function hasFlightConditionValidationErrors(
  errors: FlightConditionValidationErrors,
): boolean {
  return flightConditionFields.some((field) => errors[field] !== undefined);
}

export function assertValidFlightConditionInputs(
  inputs: FlightConditionInputs,
): void {
  const errors = validateFlightConditionInputs(inputs);

  if (!hasFlightConditionValidationErrors(errors)) return;

  const message = flightConditionFields
    .map((field) => errors[field])
    .filter((error): error is string => error !== undefined)
    .join(" ");

  throw new RangeError(message);
}
