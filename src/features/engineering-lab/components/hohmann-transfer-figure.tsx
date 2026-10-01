"use client";

import { buttonClass } from "@/components/ui/button-class";
import { formatFigure } from "@/components/ui/readout";
import {
  computeTransferModel,
  formatStretchFactor,
  TransferCanvas,
  transferCanvasMap,
} from "@/features/orbits";

const kilometres = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

interface HohmannTransferFigureProps {
  readonly finalAltitudeMetres: number;
  readonly initialAltitudeMetres: number;
  /** True when μ or the planet radius was changed from Earth's values. */
  readonly customConstants: boolean;
}

/**
 * The Hohmann tool's own drawing: the Transfer Explorer's canvas (v4 plan,
 * section 5), drawn for the two altitudes in the form. The canvas works
 * with Earth's constants only, so it steps aside when either optional
 * constant is set.
 */
export function HohmannTransferFigure({
  customConstants,
  finalAltitudeMetres,
  initialAltitudeMetres,
}: HohmannTransferFigureProps) {
  if (customConstants) {
    return (
      <p className="text-sm leading-6 text-muted">
        The drawing uses Earth&apos;s constants, so it is shown only while both
        optional constants are blank.
      </p>
    );
  }

  const model = computeTransferModel(
    initialAltitudeMetres,
    finalAltitudeMetres,
  );
  if (!model) return null;

  const map = transferCanvasMap(
    model.planetRadiusMetres,
    initialAltitudeMetres,
    finalAltitudeMetres,
  );
  const start = kilometres.format(initialAltitudeMetres / 1_000);
  const end = kilometres.format(finalAltitudeMetres / 1_000);
  const scale = map.toScale
    ? "Drawn to scale."
    : `Earth is to scale; heights above it are drawn ${formatStretchFactor(map.stretchFactor)} times taller.`;

  return (
    <figure className="m-0 min-w-0">
      <TransferCanvas
        className="mx-auto max-w-[28rem]"
        description={`Earth with a circular orbit at ${start} km and a circular orbit at ${end} km, joined by half an ellipse. Burn 1 is on the right and burn 2 on the left. ${scale}`}
        initialAltitudeMetres={initialAltitudeMetres}
        map={map}
        model={model}
        planetRadiusMetres={model.planetRadiusMetres}
        targetAltitudeMetres={finalAltitudeMetres}
        title={`Hohmann transfer from ${start} km to ${end} km`}
      />
      <figcaption className="mt-3 text-sm text-muted">
        {map.toScale ? (
          "Drawn to scale."
        ) : (
          <>
            Earth is to scale; heights above it are drawn{" "}
            <span className="font-mono">
              {formatFigure(formatStretchFactor(map.stretchFactor))}
            </span>{" "}
            times taller.
          </>
        )}{" "}
        <a
          className={buttonClass({ variant: "link" })}
          href="#transfer-explorer"
        >
          Drag the target orbit in the explorer above
        </a>
        .
      </figcaption>
    </figure>
  );
}
