import Image from "next/image";
import type { CSSProperties } from "react";

import { creditLine, licenceLabel } from "@/components/ui/photo-hero";
import {
  getVehicleGallery,
  type VehiclePhoto,
} from "@/features/vehicles/data/gallery";
import { cn } from "@/lib/cn";

import { VehicleProfileSection } from "./vehicle-profile-section";

/** The gallery's width from 64rem: the 72rem container less its gutters. */
const GALLERY_REM = 68;
/** The gap between photographs from 64rem, in rem. */
const GAP_REM = 3;

/** The text with one closing full stop. */
function withStop(text: string) {
  return /[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`;
}

function GalleryCaption({ photo }: { photo: VehiclePhoto }) {
  const licence = licenceLabel(photo.license);
  return (
    <figcaption className="orbix-caption mt-3">
      {withStop(photo.caption)} {withStop(creditLine(photo.credit))}{" "}
      <a
        aria-label={licence.isShortened ? licence.full : undefined}
        href={photo.licenseUrl}
        rel="noopener noreferrer license"
        title={licence.isShortened ? licence.full : undefined}
      >
        {licence.short}
      </a>
      .{" "}
      <a
        aria-label={`Source file: ${photo.title}`}
        href={photo.sourceUrl}
        rel="noopener noreferrer"
      >
        Source file
      </a>
      .
    </figcaption>
  );
}

type GalleryArrangement = "lead" | "row";

/**
 * How three photographs with a landscape among them sit from 64rem: the
 * first in one column, the other two stacked in the next (`lead`). A
 * lead's width share comes from the three aspect ratios (`leadShare`), so
 * it stands about as tall as the stack; it then fills the stack's full
 * height, cropped with object-fit: cover at its own `objectPosition`, so
 * both columns end together with only a small crop. Two photographs, or three
 * portraits, share one row at one height, each as wide as its proportions
 * ask (`row`).
 */
function arrangement(ratios: readonly number[]): GalleryArrangement {
  return ratios.length === 3 && ratios.some((ratio) => ratio > 1)
    ? "lead"
    : "row";
}

/**
 * In the `lead` arrangement, the lead's share of the gallery width that
 * makes it about as tall as the two photographs stacked beside it: with
 * aspect ratios r0 (lead), r1 and r2, the lead is r0 * (1/r1 + 1/r2) times
 * as wide as the stack. Clamped so neither column gets too narrow.
 */
export function leadShare(ratios: readonly number[]): number {
  const [lead = 1, first = 1, second = 1] = ratios;
  const widthRatio = Math.min(
    2.5,
    Math.max(0.8, lead * (1 / first + 1 / second)),
  );
  return widthRatio / (widthRatio + 1);
}

/** The `sizes` for each photograph, from its share of the gallery width. */
function photoSizes(
  ratios: readonly number[],
  layout: GalleryArrangement,
): string[] {
  const usable =
    GALLERY_REM - GAP_REM * (layout === "lead" ? 1 : ratios.length - 1);
  const lead = leadShare(ratios);
  const total = ratios.reduce((sum, ratio) => sum + ratio, 0);
  return ratios.map((ratio, index) => {
    const share =
      layout === "lead" ? (index === 0 ? lead : 1 - lead) : ratio / total;
    return `(min-width: 64rem) ${Math.ceil(usable * share)}rem, (min-width: 40rem) 50vw, 100vw`;
  });
}

/**
 * A profile's further photographs (v4 plan section 7): two or three views
 * the registry and hero do not show, each a hard-edged plate in its own
 * proportions with a catalogue caption under it, so nothing is cropped.
 * From 64rem the gallery runs the full container width (see
 * `arrangement` for how the photographs sit); from 40rem two to a row;
 * below that one column. Renders nothing when the vehicle has no further
 * photographs.
 */
export function VehicleGallery({ vehicleId }: { vehicleId: string }) {
  const photos = getVehicleGallery(vehicleId);
  if (photos.length === 0) return null;

  const ratios = photos.map((photo) => photo.width / photo.height);
  const layout = arrangement(ratios);
  const sizes = photoSizes(ratios, layout);
  const share = leadShare(ratios);

  return (
    <VehicleProfileSection
      // From 64rem the heading keeps the sections' left edge (the fourth
      // of twelve columns) while the photographs take all twelve.
      className="lg:grid lg:grid-cols-12 lg:gap-x-6 lg:[&>div]:col-span-12 lg:[&>h2]:col-span-9 lg:[&>h2]:col-start-4"
      id="photographs"
      title="Photographs"
    >
      <ul
        className={cn(
          "grid gap-x-6 gap-y-10 sm:grid-cols-2 sm:items-start lg:gap-x-12",
          layout === "lead" && "lg:items-stretch",
          layout === "row" && "lg:flex lg:items-start",
          layout === "lead" &&
            "lg:grid-cols-[minmax(0,var(--lead-share))_minmax(0,var(--stack-share))]",
        )}
        data-arrangement={layout}
        style={
          layout === "lead"
            ? ({
                "--lead-share": `${share}fr`,
                "--stack-share": `${1 - share}fr`,
              } as CSSProperties)
            : undefined
        }
      >
        {photos.map((photo, index) => {
          const fill = layout === "lead" && index === 0;
          return (
            <li
              className={cn(
                "min-w-0",
                layout === "row" && "lg:[flex:var(--ratio)_1_0%]",
                layout === "lead" && index === 0 && "lg:row-span-2",
                layout === "lead" && index > 0 && "lg:col-start-2",
              )}
              key={photo.id}
              style={
                layout === "row"
                  ? ({ "--ratio": ratios[index] } as CSSProperties)
                  : undefined
              }
            >
              <figure className={cn(fill && "lg:flex lg:h-full lg:flex-col")}>
                <div
                  className={cn(
                    fill && "lg:relative lg:min-h-[16rem] lg:flex-1",
                  )}
                >
                  <Image
                    alt={photo.alt}
                    className={cn(
                      "block h-auto w-full [filter:saturate(0.9)]",
                      fill &&
                        "lg:absolute lg:inset-0 lg:h-full lg:object-cover",
                    )}
                    height={photo.height}
                    sizes={sizes[index]}
                    src={photo.src}
                    style={
                      fill
                        ? { objectPosition: photo.objectPosition }
                        : undefined
                    }
                    width={photo.width}
                  />
                </div>
                <GalleryCaption photo={photo} />
              </figure>
            </li>
          );
        })}
      </ul>
    </VehicleProfileSection>
  );
}
