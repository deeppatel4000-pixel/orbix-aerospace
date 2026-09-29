import Image from "next/image";

import { licenceLabel } from "@/components/ui/photo-hero";
import { cn } from "@/lib/cn";

import type { VehicleImageCredit } from "./vehicle-figure";

export interface VehiclePhotographRecord extends VehicleImageCredit {
  readonly alt: string;
  readonly height: number;
  readonly src: string;
  readonly width: number;
}

interface VehiclePhotographProps {
  className?: string;
  /**
   * Optional crop: a fixed aspect ratio (for example `"3 / 2"`) and an
   * `object-position`. Use it where the hero above already shows the whole
   * frame, so the figure reads as a second view rather than a repeat.
   * Without it the photograph is shown whole at its own aspect ratio.
   */
  crop?: { readonly aspectRatio: string; readonly objectPosition: string };
  /** The vehicle's name, used to make the source link descriptive. */
  name: string;
  /** `sizes` for the image. */
  sizes: string;
  visual: VehiclePhotographRecord;
}

/** "U.S." set in B612 Mono reads as "U. S.", as in the hero credit. */
function plainCredit(text: string) {
  return text.replace(/U\.S\./g, "US");
}

const SEPARATOR = (
  <span aria-hidden="true" className="text-(--orbix-border-control)">
    {" / "}
  </span>
);

/**
 * The profile photograph shown large once (spec 9): the whole frame,
 * uncropped at its own aspect ratio unless a `crop` is given, with the hero's tonal treatment
 * (saturate 0.85, contrast 1.05), as a 6px framed plate with no card
 * around it. The caption matches the `PhotoHero` credit line: B612 Mono
 * 11px in the muted colour, "Photo: credit / licence / Source file", the
 * licence linked to its terms and the source link to the file page.
 */
export function VehiclePhotograph({
  className,
  crop,
  name,
  sizes,
  visual,
}: VehiclePhotographProps) {
  const credit = visual.credit?.trim();
  const licence = visual.license ? licenceLabel(visual.license) : undefined;

  return (
    <figure className={cn("m-0", className)}>
      {crop ? (
        <div
          className="relative w-full overflow-hidden rounded-(--radius-photo)"
          style={{ aspectRatio: crop.aspectRatio }}
        >
          <Image
            alt={visual.alt}
            className="object-cover [filter:saturate(0.85)_contrast(1.05)]"
            fill
            sizes={sizes}
            src={visual.src}
            style={{ objectPosition: crop.objectPosition }}
          />
        </div>
      ) : (
        <Image
          alt={visual.alt}
          className="block h-auto w-full rounded-(--radius-photo) [filter:saturate(0.85)_contrast(1.05)]"
          height={visual.height}
          sizes={sizes}
          src={visual.src}
          width={visual.width}
        />
      )}
      <figcaption className="mt-3 font-mono text-(length:--text-micro) leading-[1.6] tracking-[0.02em] text-muted [&_a]:text-text-secondary [&_a]:underline [&_a]:decoration-(--orbix-border-control) [&_a]:underline-offset-[3px] [&_a:hover]:text-foreground [&_a:hover]:decoration-current">
        {credit ? <>Photo: {plainCredit(credit)}</> : null}
        {credit && licence ? SEPARATOR : null}
        {licence ? (
          visual.licenseUrl ? (
            <a
              aria-label={licence.isShortened ? licence.full : undefined}
              href={visual.licenseUrl}
              rel="noopener noreferrer license"
              title={licence.isShortened ? licence.full : undefined}
            >
              {licence.short}
            </a>
          ) : (
            licence.full
          )
        ) : null}
        {credit || licence ? SEPARATOR : null}
        <a href={visual.sourceUrl} rel="noopener noreferrer">
          Source file<span className="sr-only"> of the {name} photograph</span>
        </a>
      </figcaption>
    </figure>
  );
}
