import { describe, expect, it } from "vitest";

import {
  hasAtmosphereValidationErrors,
  hasDragEquationValidationErrors,
  hasDynamicPressureValidationErrors,
  hasFlightConditionValidationErrors,
  hasLiftEquationValidationErrors,
  hasMachNumberValidationErrors,
  hasRocketEquationValidationErrors,
  hasThrustToWeightValidationErrors,
  validateAtmosphereInputs,
  validateDragEquationInputs,
  validateDynamicPressureInputs,
  validateFlightConditionInputs,
  validateLiftEquationInputs,
  validateMachNumberInputs,
  validateRocketEquationInputs,
  validateThrustToWeightInputs,
} from "./validation";

describe("rocket equation validation", () => {
  it("returns field-level errors for invalid inputs", () => {
    const errors = validateRocketEquationInputs({
      finalMassKg: 0,
      initialMassKg: Number.NaN,
      specificImpulseSeconds: -1,
    });

    expect(errors.finalMassKg).toMatch(/greater than zero/);
    expect(errors.initialMassKg).toMatch(/finite number/);
    expect(errors.specificImpulseSeconds).toMatch(/greater than zero/);
    expect(hasRocketEquationValidationErrors(errors)).toBe(true);
  });

  it("rejects the equal-mass boundary", () => {
    const errors = validateRocketEquationInputs({
      finalMassKg: 1,
      initialMassKg: 1,
      specificImpulseSeconds: 1,
    });

    expect(errors.initialMassKg).toBe("Initial mass must exceed final mass.");
  });

  it("accepts finite positive inputs immediately beyond the mass boundary", () => {
    const errors = validateRocketEquationInputs({
      finalMassKg: 1,
      initialMassKg: 1 + Number.EPSILON,
      specificImpulseSeconds: Number.EPSILON,
    });

    expect(errors).toEqual({
      finalMassKg: undefined,
      initialMassKg: undefined,
      specificImpulseSeconds: undefined,
    });
    expect(hasRocketEquationValidationErrors(errors)).toBe(false);
  });
});

describe("thrust-to-weight validation", () => {
  it("returns field-level errors for invalid inputs", () => {
    const errors = validateThrustToWeightInputs({
      massKg: Number.POSITIVE_INFINITY,
      thrustNewtons: 0,
    });

    expect(errors.massKg).toMatch(/finite number/);
    expect(errors.thrustNewtons).toMatch(/greater than zero/);
    expect(hasThrustToWeightValidationErrors(errors)).toBe(true);
  });

  it("accepts finite positive boundary values", () => {
    const errors = validateThrustToWeightInputs({
      massKg: Number.EPSILON,
      thrustNewtons: Number.EPSILON,
    });

    expect(errors).toEqual({
      massKg: undefined,
      thrustNewtons: undefined,
    });
    expect(hasThrustToWeightValidationErrors(errors)).toBe(false);
  });
});

describe("lift equation validation", () => {
  it("returns field-level errors for invalid inputs", () => {
    const errors = validateLiftEquationInputs({
      airDensityKilogramsPerCubicMetre: Number.NaN,
      liftCoefficient: -1,
      velocityMetresPerSecond: Number.POSITIVE_INFINITY,
      wingAreaSquareMetres: 0,
    });

    expect(errors.airDensityKilogramsPerCubicMetre).toMatch(/finite number/);
    expect(errors.liftCoefficient).toMatch(/greater than zero/);
    expect(errors.velocityMetresPerSecond).toMatch(/finite number/);
    expect(errors.wingAreaSquareMetres).toMatch(/greater than zero/);
    expect(hasLiftEquationValidationErrors(errors)).toBe(true);
  });

  it("accepts finite positive inputs", () => {
    const errors = validateLiftEquationInputs({
      airDensityKilogramsPerCubicMetre: Number.EPSILON,
      liftCoefficient: Number.EPSILON,
      velocityMetresPerSecond: Number.EPSILON,
      wingAreaSquareMetres: Number.EPSILON,
    });

    expect(errors).toEqual({
      airDensityKilogramsPerCubicMetre: undefined,
      liftCoefficient: undefined,
      velocityMetresPerSecond: undefined,
      wingAreaSquareMetres: undefined,
    });
    expect(hasLiftEquationValidationErrors(errors)).toBe(false);
  });
});

describe("dynamic pressure validation", () => {
  it("returns field-level errors for invalid flow inputs", () => {
    const errors = validateDynamicPressureInputs({
      airDensityKilogramsPerCubicMetre: Number.NaN,
      velocityMetresPerSecond: 0,
    });

    expect(errors.airDensityKilogramsPerCubicMetre).toMatch(/finite number/);
    expect(errors.velocityMetresPerSecond).toMatch(/greater than zero/);
    expect(hasDynamicPressureValidationErrors(errors)).toBe(true);
  });

  it("accepts finite positive flow inputs", () => {
    const errors = validateDynamicPressureInputs({
      airDensityKilogramsPerCubicMetre: Number.EPSILON,
      velocityMetresPerSecond: Number.EPSILON,
    });

    expect(hasDynamicPressureValidationErrors(errors)).toBe(false);
  });
});

describe("drag equation validation", () => {
  it("returns field-level errors for invalid inputs", () => {
    const errors = validateDragEquationInputs({
      airDensityKilogramsPerCubicMetre: Number.NaN,
      dragCoefficient: -1,
      referenceAreaSquareMetres: 0,
      velocityMetresPerSecond: Number.POSITIVE_INFINITY,
    });

    expect(errors.airDensityKilogramsPerCubicMetre).toMatch(/finite number/);
    expect(errors.dragCoefficient).toMatch(/greater than zero/);
    expect(errors.referenceAreaSquareMetres).toMatch(/greater than zero/);
    expect(errors.velocityMetresPerSecond).toMatch(/finite number/);
    expect(hasDragEquationValidationErrors(errors)).toBe(true);
  });

  it("accepts finite positive inputs", () => {
    const errors = validateDragEquationInputs({
      airDensityKilogramsPerCubicMetre: Number.EPSILON,
      dragCoefficient: Number.EPSILON,
      referenceAreaSquareMetres: Number.EPSILON,
      velocityMetresPerSecond: Number.EPSILON,
    });

    expect(hasDragEquationValidationErrors(errors)).toBe(false);
  });
});

describe("standard atmosphere validation", () => {
  it("rejects negative, non-finite, and out-of-range altitudes", () => {
    expect(
      hasAtmosphereValidationErrors(
        validateAtmosphereInputs({ altitudeMetres: -1 }),
      ),
    ).toBe(true);
    expect(
      hasAtmosphereValidationErrors(
        validateAtmosphereInputs({ altitudeMetres: Number.NaN }),
      ),
    ).toBe(true);
    expect(
      hasAtmosphereValidationErrors(
        validateAtmosphereInputs({ altitudeMetres: 11_001 }),
      ),
    ).toBe(true);
  });

  it("accepts both model boundaries", () => {
    expect(
      hasAtmosphereValidationErrors(
        validateAtmosphereInputs({ altitudeMetres: 0 }),
      ),
    ).toBe(false);
    expect(
      hasAtmosphereValidationErrors(
        validateAtmosphereInputs({ altitudeMetres: 11_000 }),
      ),
    ).toBe(false);
  });
});

describe("flight condition validation", () => {
  it("returns field-level errors for an invalid combined condition", () => {
    const errors = validateFlightConditionInputs({
      altitudeMetres: -1,
      dragCoefficient: Number.NaN,
      liftCoefficient: 0,
      velocityMetresPerSecond: Number.POSITIVE_INFINITY,
      wingAreaSquareMetres: -1,
    });

    expect(errors.altitudeMetres).toMatch(/must not be negative/);
    expect(errors.dragCoefficient).toMatch(/finite number/);
    expect(errors.liftCoefficient).toMatch(/greater than zero/);
    expect(errors.velocityMetresPerSecond).toMatch(/finite number/);
    expect(errors.wingAreaSquareMetres).toMatch(/greater than zero/);
    expect(hasFlightConditionValidationErrors(errors)).toBe(true);
  });

  it("accepts a valid combined condition", () => {
    const errors = validateFlightConditionInputs({
      altitudeMetres: 5_000,
      dragCoefficient: 0.03,
      liftCoefficient: 0.8,
      velocityMetresPerSecond: 100,
      wingAreaSquareMetres: 20,
    });

    expect(hasFlightConditionValidationErrors(errors)).toBe(false);
  });
});

describe("Mach number validation", () => {
  it("rejects invalid velocity and speed-of-sound inputs", () => {
    const errors = validateMachNumberInputs({
      speedOfSoundMetersPerSecond: 0,
      velocityMetresPerSecond: Number.NaN,
    });

    expect(errors.speedOfSoundMetersPerSecond).toMatch(/greater than zero/);
    expect(errors.velocityMetresPerSecond).toMatch(/finite number/);
    expect(hasMachNumberValidationErrors(errors)).toBe(true);
  });

  it("accepts a stationary valid flow condition", () => {
    const errors = validateMachNumberInputs({
      speedOfSoundMetersPerSecond: 340,
      velocityMetresPerSecond: 0,
    });

    expect(hasMachNumberValidationErrors(errors)).toBe(false);
  });
});
