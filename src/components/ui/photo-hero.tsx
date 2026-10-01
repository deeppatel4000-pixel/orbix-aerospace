import Image from "next/image";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type { AccentDivision } from "@/config/divisions";
import { cn } from "@/lib/cn";

/**
 * One photograph and the facts needed to credit it. The aircraft and rocket
 * visual records (`AircraftVisual`, `RocketVisual`) satisfy this shape, so
 * they can be passed straight in.
 */
export interface VisualRecord {
  /** Plain description of what the photograph shows. */
  readonly alt: string;
  /** Photographer or agency, as the licence asks to be credited. */
  readonly credit: string;
  /** Licence name, for example "Public domain (U.S. government work)". */
  readonly license: string;
  /** Page stating the licence terms. The licence name links here if given. */
  readonly licenseUrl?: string;
  /** CSS `object-position` for the crop, for example `"50% 35%"`. */
  readonly objectPosition?: string;
  /** Human-readable file page for the original. */
  readonly sourceUrl: string;
  readonly src: string;
}

export type PhotoHeroProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "children"
> & {
  /**
   * Content under the hero text in the same column, normally a `SpecPanel`
   * with the key figures. Never set on the photograph.
   */
  aside?: ReactNode;
  /**
   * Catalogue caption: what the photograph shows, as a short phrase ("SR-71B
   * over the Sierra Nevada"). The credit, licence and source link always
   * follow it. Omitted, the photograph's `alt` text is printed instead, so
   * the plate always names its subject. Pass a shorter phrase when the alt
   * text is long.
   */
  caption?: ReactNode;
  /** Hero text: H1, lead, actions. Rendered in reading order. */
  children: ReactNode;
  /** Sets `data-division` on the hero, overriding the route's accent. */
  division?: AccentDivision;
  /**
   * Figure number printed before the caption in ink, for example `"1"`
   * renders "Fig. 1". Only for a page that numbers its figures.
   */
  figureNumber?: string;
  /**
   * `split` (default): from 64rem the text column on solid ground at the
   * left and the photograph as a hard-edged plate on the right, bleeding
   * to the viewport edge. `band`: the text, then the photograph as a
   * full-bleed band under it at every width. Below 64rem both stack as a
   * band.
   */
  layout?: "band" | "split";
  /**
   * Plate shape. `landscape` (default): 3:2 in the band, full height beside
   * the text. `portrait`: 4:5 in the band (capped at `min(70svh, 34rem)`)
   * and a 2:3 plate beside the text, for a launch vehicle that must be
   * shown whole.
   */
  plate?: "landscape" | "portrait";
  /** Load the photo with `priority` (the LCP image). Default true. */
  priority?: boolean;
  /** `sizes` for the photo. Defaults to the plate's widths. */
  sizes?: string;
  visual: VisualRecord;
  /** Align the text to the 84rem container instead of 72rem. */
  wide?: boolean;
};

const DEFAULT_SIZES: Record<"band" | "split", string> = {
  band: "100vw",
  split: "(min-width: 64rem) 50vw, 100vw",
};

/**
 * Photographic hero (spec 7): the H1, lead and actions on solid ground,
 * and the photograph as a hard-edged plate beside the text (from 64rem) or
 * below it (a full-bleed band), with a catalogue caption under the plate on
 * the ground. No scrim, no mask, no overlay, no text on the photograph.
 *
 * The caption always carries the credit, the licence (linked when a licence
 * page is known) and a link to the source file page, after the optional
 * figure number and description:
 * "Fig. 1  SR-71B over the Sierra Nevada. Photo: NASA. Public domain.
 * Source file."
 *
 * The heading comes first in the DOM, so the page's H1 is read before the
 * photograph. Crops are art-directed through `visual.objectPosition`,
 * which may be a CSS variable set per breakpoint.
 */
export function PhotoHero({
  aside,
  caption,
  children,
  className,
  division,
  figureNumber,
  layout = "split",
  plate,
  priority = true,
  sizes,
  visual,
  wide = false,
  ...props
}: PhotoHeroProps) {
  const licence = licenceLabel(visual.license);
  const shape = plate ?? "landscape";

  return (
    <section
      className={cn("orbix-photo-hero", className)}
      data-division={division}
      data-layout={layout}
      data-plate={shape}
      data-wide={wide ? "true" : undefined}
      {...props}
    >
      <div className="orbix-photo-hero__text">
        <div className="orbix-photo-hero__lede">{children}</div>
        {aside ? <div className="orbix-photo-hero__facts">{aside}</div> : null}
      </div>

      <figure className="orbix-photo-hero__figure">
        <div className="orbix-photo-hero__photo">
          <Image
            alt={visual.alt}
            className="orbix-photo-hero__img"
            fill
            priority={priority}
            sizes={sizes ?? DEFAULT_SIZES[layout]}
            src={visual.src}
            style={
              visual.objectPosition
                ? { objectPosition: visual.objectPosition }
                : undefined
            }
          />
        </div>
        <figcaption className="orbix-caption orbix-photo-hero__caption">
          {figureNumber ? (
            <span className="orbix-caption__number">Fig. {figureNumber}</span>
          ) : null}
          {caption ?? altCaption(visual.alt)}.{" "}
          {withStop(creditLine(visual.credit))}{" "}
          {visual.licenseUrl ? (
            <a
              aria-label={licence.isShortened ? licence.full : undefined}
              href={visual.licenseUrl}
              rel="noopener noreferrer license"
              title={licence.isShortened ? licence.full : undefined}
            >
              {licence.short}
            </a>
          ) : (
            <span>{licence.full}</span>
          )}
          .{" "}
          <a href={visual.sourceUrl} rel="noopener noreferrer">
            Source file
          </a>
          .
        </figcaption>
      </figure>
    </section>
  );
}

/**
 * The credit or licence as recorded, keeping "U.S." as the rest of the
 * site writes it.
 */
function plainCredit(text: string) {
  return text.trim();
}

/** The text with one closing full stop, never two ("U.S." stays "U.S."). */
function withStop(text: string) {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

/**
 * The alt text as a caption: one sentence, no closing full stop (the
 * caption adds its own).
 */
function altCaption(alt: string) {
  return alt.trim().replace(/[.\s]+$/, "");
}

/**
 * "Photo: NASA", but a credit that already names the photograph ("U.S. Air
 * Force photo by ...") is printed as it stands, so it never reads
 * "Photo: U.S. Air Force photo by".
 */
export function creditLine(credit: string) {
  const text = plainCredit(credit);
  return /\bphoto(graph)?\b/i.test(text) ? text : `Photo: ${text}`;
}

/**
 * Short visible licence name plus the full wording for the link's title
 * and accessible name. "Public domain (U.S. government work)" shows as
 * "Public domain"; other licences (for example "CC BY-SA 4.0") show whole.
 */
export function licenceLabel(license: string) {
  const full = plainCredit(license);
  const short = /^public domain/i.test(full) ? "Public domain" : full;
  return { full, isShortened: short !== full, short };
}
