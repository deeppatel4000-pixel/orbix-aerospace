import type {
  DragEquationInputs,
  DragEquationResult,
} from "@/features/engineering-lab/types";
import { assertValidDragEquationInputs } from "@/features/engineering-lab/utils";

import { calculateDynamicPressure } from "./aerodynamic";

export function calculateDragEquation(
  inputs: DragEquationInputs,
): DragEquationResult {
  assertValidDragEquationInputs(inputs);

  const { dynamicPressurePascals } = calculateDynamicPressure(inputs);
  const dragForceNewtons =
    dynamicPressurePascals *
    inputs.referenceAreaSquareMetres *
    inputs.dragCoefficient;

  return { dragForceNewtons };
}
