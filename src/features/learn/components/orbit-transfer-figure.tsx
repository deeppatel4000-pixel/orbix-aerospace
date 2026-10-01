"use client";

import {
  computeTransferModel,
  formatAltitudeKm,
  formatStretchFactor,
  TransferCanvas,
  transferCanvasMap,
} from "@/features/orbits";

/** The case the figure draws: a 200 km parking orbit to geostationary altitude. */
const START_ALTITUDE_METRES = 200_000;
const TARGET_ALTITUDE_METRES = 35_786_000;

/**
 * A still drawing of one Hohmann transfer, from the Transfer Explorer's
 * canvas with no drag handle and no craft. The interactive explorer lives
 * on the home page and in the Engineering Lab; this figure links there.
 */
export function OrbitTransferFigure() {
  const model = computeTransferModel(
    START_ALTITUDE_METRES,
    TARGET_ALTITUDE_METRES,
  );
  if (!model) return null;
  const map = transferCanvasMap(
    model.planetRadiusMetres,
    START_ALTITUDE_METRES,
    TARGET_ALTITUDE_METRES,
  );
  const start = formatAltitudeKm(START_ALTITUDE_METRES);
  const end = formatAltitudeKm(TARGET_ALTITUDE_METRES);
  const scale = map.toScale
    ? "Drawn to scale."
    : `Earth is to scale; heights above it are drawn ${formatStretchFactor(map.stretchFactor)} times taller.`;

  return (
    <TransferCanvas
      className="max-w-[28rem]"
      description={`Earth with a circular orbit at ${start} km and a circular orbit at ${end} km, joined by half an ellipse travelled counter-clockwise. Burn 1 is on the right at ${start} km and burn 2 on the left at ${end} km. ${scale}`}
      initialAltitudeMetres={START_ALTITUDE_METRES}
      map={map}
      model={model}
      planetRadiusMetres={model.planetRadiusMetres}
      targetAltitudeMetres={TARGET_ALTITUDE_METRES}
      title={`Hohmann transfer from ${start} km to ${end} km`}
    />
  );
}
