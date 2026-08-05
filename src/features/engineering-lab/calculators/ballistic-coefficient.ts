import type {
  BallisticCoefficientInputs,
  BallisticCoefficientResult,
} from "@/features/engineering-lab/types";
import { assertValidBallisticCoefficientInputs } from "@/features/engineering-lab/utils";

export function calculateBallisticCoefficient(
  inputs: BallisticCoefficientInputs,
): BallisticCoefficientResult {
  assertValidBallisticCoefficientInputs(inputs);

  const ballisticCoefficientKilogramsPerSquareMetre =
    inputs.vehicleMassKilograms /
    (inputs.dragCoefficient * inputs.referenceAreaSquareMetres);

  return {
    ballisticCoefficientKilogramsPerSquareMetre,
    inputs: {
      dragCoefficient: inputs.dragCoefficient,
      referenceAreaSquareMetres: inputs.referenceAreaSquareMetres,
      vehicleMassKilograms: inputs.vehicleMassKilograms,
    },
  };
}
