import Image from "next/image";
import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/button-link";
import { creditLine, licenceLabel } from "@/components/ui/photo-hero";
import {
  getSitePhoto,
  type SitePhotoSlot,
} from "@/features/vehicles/data/gallery";

import { OrbitTransferFigure } from "./orbit-transfer-figure";

/**
 * One figure for each pathway on /learn (spec v3 sections 6, 7 and 11; v4
 * plan sections 5 and 7). Three photographs come from the Learn slots of
 * the photo slot map, so no file here appears anywhere else on the site,
 * and each is shown whole at its own ratio: no zoom, frame, radius or fill.
 * The orbital pathway carries a still drawing of one Hohmann transfer from
 * the Transfer Explorer's canvas, linking to the interactive explorer in
 * the Engineering Lab, so the page does not repeat the home page's
 * explorer.
 *
 * One catalogue caption below each figure (spec 6): "Fig. 1  <caption>
 * Photo: <credit>. Public domain. Source file." in 14px muted Plex Sans,
 * the figure number in ink. Captions come from the photo records; none
 * states a vehicle figure the record does not hold.
 *
 * Below 640px the photographs bleed across the 16px page gutters, as a
 * band (spec 7); the caption stays in the text column.
 */

/** Pathways with a figure, in page order. Figures are numbered in it. */
const FIGURE_AREA_IDS = [
  "aerodynamics-flight-fundamentals",
  "propulsion-vehicle-performance",
  "high-speed-compressible-flow",
  "orbital-mechanics-mission-design",
] as const;

/** The pathway whose figure is the still transfer drawing. */
const ORBIT_FIGURE_AREA_ID = "orbital-mechanics-mission-design";

/**
 * Photo figures. `maxWidth` caps a portrait plate so it does not run
 * taller than a screen; `sizes` is the widest the plate is drawn (the
 * 8-column track is about 44.3rem at 1440, 62vw from 64rem, the full
 * width below), and each file is at least twice that, so it is never
 * enlarged at DPR 2.
 */
const PHOTO_FIGURES: Readonly<
  Record<
    string,
    { readonly maxWidth?: string; readonly sizes: string; slot: SitePhotoSlot }
  >
> = {
  "aerodynamics-flight-fundamentals": {
    sizes: "(min-width: 72rem) 45rem, (min-width: 64rem) 62vw, 100vw",
    slot: "learn-aerodynamics",
  },
  "high-speed-compressible-flow": {
    sizes: "(min-width: 72rem) 45rem, (min-width: 64rem) 62vw, 100vw",
    slot: "learn-compressible-flow",
  },
  "propulsion-vehicle-performance": {
    maxWidth: "28rem",
    sizes: "(min-width: 40rem) 28rem, 100vw",
    slot: "learn-propulsion",
  },
};

interface PathwayFigureProps {
  /** The pathway's `id`. */
  areaId: string;
}

export function PathwayFigure({ areaId }: PathwayFigureProps) {
  const figureIndex = (FIGURE_AREA_IDS as readonly string[]).indexOf(areaId);
  if (figureIndex === -1) return null;
  const captionId = `${areaId}-figure-caption`;
  const label = `Fig. ${figureIndex + 1}`;

  if (areaId === ORBIT_FIGURE_AREA_ID) {
    return (
      <figure aria-labelledby={captionId} className="m-0 mt-14">
        <OrbitTransferFigure />
        <Caption id={captionId} label={label}>
          A Hohmann transfer from a 200 km orbit to geostationary altitude,
          computed by the Engineering Lab&apos;s Hohmann analysis.{" "}
          <ButtonLink href="/engineering-lab#transfer-explorer" variant="link">
            Change the target orbit in the lab
          </ButtonLink>
          .
        </Caption>
      </figure>
    );
  }

  const config = PHOTO_FIGURES[areaId];
  if (!config) return null;
  const photo = getSitePhoto(config.slot);
  const licence = licenceLabel(photo.license);

  return (
    <figure
      aria-labelledby={captionId}
      className="m-0 mt-14"
      style={config.maxWidth ? { maxWidth: config.maxWidth } : undefined}
    >
      {/* A hard-edged plate at the file's own ratio (spec 3.2, 7). The
          tonal treatment matches the vehicle profile photographs. */}
      <div className="max-sm:-mx-4">
        <Image
          alt={photo.alt}
          className="block h-auto w-full rounded-none saturate-[0.9]"
          height={photo.height}
          sizes={config.sizes}
          src={photo.src}
          width={photo.width}
        />
      </div>
      <Caption id={captionId} label={label}>
        {photo.caption} {creditLine(photo.credit)}.{" "}
        <a
          aria-label={licence.isShortened ? licence.full : undefined}
          href={photo.licenseUrl}
          rel="noopener noreferrer license"
          title={licence.isShortened ? licence.full : undefined}
        >
          {licence.short}
        </a>
        .{" "}
        <a href={photo.sourceUrl} rel="noopener noreferrer">
          Source file
        </a>
        .
      </Caption>
    </figure>
  );
}

function Caption({
  children,
  id,
  label,
}: {
  children: ReactNode;
  id: string;
  label: string;
}) {
  return (
    <figcaption className="orbix-caption max-w-[38rem] text-pretty" id={id}>
      <span className="orbix-caption__number">{label}</span> {children}
    </figcaption>
  );
}
