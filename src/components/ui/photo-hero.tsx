import Image from "next/image";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { RegistrationMarks } from "@/components/ui/registration-marks";
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
   * Optional panel anchored at the bottom right on desktop and stacked below
   * the text on smaller screens, normally a `SpecPanel`.
   */
  aside?: ReactNode;
  /** Hero text: eyebrow, H1, lead, actions. Rendered in reading order. */
  children: ReactNode;
  /** Sets `data-division` on the hero, overriding the route's accent. */
  division?: AccentDivision;
  /**
   * Fade and rise the direct children of the text block once on first
   * paint (spec 7). Off under reduced motion. Default true.
   */
  entrance?: boolean;
  /**
   * Shape of the framed plate below 48rem: `landscape` (4:3, default) or
   * `portrait` (4:5, capped at `min(70svh, 34rem)`) for a tall subject such
   * as a launch vehicle. No effect from 48rem, where the photo is
   * full-bleed.
   */
  plate?: "landscape" | "portrait";
  /**
   * Where the photo stands from 48rem: `behind` the text (default, the
   * full-bleed spec 8 hero) or on the `right`, for a tall subject such as a
   * launch vehicle. With `right` the photo plate starts at 56vw (48rem to
   * 64rem) or at the larger of 50% + 10rem and 46rem (from 64rem), its left
   * edge feathered into the page ground (no opaque fill behind it, so the
   * blueprint grid carries on under the feather), and only the bottom fade
   * is drawn over it: no text is set on the photograph. From 48rem to 64rem
   * the text and aside stop 2rem short of the plate.
   */
  placement?: "behind" | "right";
  /** Load the photo with `priority` (the LCP image). Default true. */
  priority?: boolean;
  /** `sizes` for the photo. Full-bleed by default. */
  sizes?: string;
  visual: VisualRecord;
  /** Use the 84rem container instead of 72rem. */
  wide?: boolean;
};

/**
 * Full-bleed photographic hero (spec 8) for the aircraft and rocket
 * registries, vehicle profiles and the home page.
 *
 * From 48rem the photo runs behind the content under a left-to-right
 * overlay and a bottom fade into the page, at `min(88svh, 60rem)` tall,
 * with the credit line at the bottom right. Below 48rem the photo sits
 * above the text at 4:3 (4:5 with `plate="portrait"`) with the credit
 * directly underneath, so text is
 * never set on a photograph on a phone.
 *
 * The credit is always visible: credit, licence (linked when a licence page
 * is known) and a link to the source file page. It is one inline run that
 * wraps like a sentence, right-aligned to the content edge on desktop.
 *
 * Below 48rem the photo is a framed plate inside the container gutter
 * (6px radius) and the registration marks (spec 6) sit 6px outside its
 * corners, in the gutter on the page ground, like crop marks outside the
 * trim. From 48rem the photo is full-bleed with no frame, so they are
 * hidden.
 */
export function PhotoHero({
  aside,
  children,
  className,
  division,
  entrance = true,
  placement = "behind",
  plate = "landscape",
  priority = true,
  sizes = "100vw",
  visual,
  wide = false,
  ...props
}: PhotoHeroProps) {
  const licence = licenceLabel(visual.license);

  return (
    <section
      className={cn("orbix-photo-hero", className)}
      data-division={division}
      data-placement={placement === "right" ? "right" : undefined}
      data-plate={plate === "portrait" ? "portrait" : undefined}
      {...props}
    >
      <figure className="orbix-photo-hero__figure">
        <div className="orbix-photo-hero__plate">
          <div className="orbix-photo-hero__frame">
            <Image
              alt={visual.alt}
              className="orbix-photo-hero__image"
              fill
              priority={priority}
              sizes={sizes}
              src={visual.src}
              style={
                visual.objectPosition
                  ? { objectPosition: visual.objectPosition }
                  : undefined
              }
            />
            <span aria-hidden="true" className="orbix-photo-hero__scrim" />
          </div>
          <RegistrationMarks className="orbix-photo-hero__marks" />
        </div>
        <figcaption className="orbix-photo-hero__credit">
          <Container className="orbix-photo-hero__credit-inner" wide={wide}>
            <span className="orbix-photo-hero__credit-item">
              Photo: {plainCredit(visual.credit)}
            </span>{" "}
            <span className="orbix-photo-hero__credit-item">
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
                licence.full
              )}
            </span>{" "}
            <span className="orbix-photo-hero__credit-item">
              <a href={visual.sourceUrl} rel="noopener noreferrer">
                Source file
              </a>
            </span>
          </Container>
        </figcaption>
      </figure>

      <Container
        className="orbix-photo-hero__body"
        data-has-aside={aside ? "true" : undefined}
        wide={wide}
      >
        <div
          className={cn("orbix-photo-hero__content", entrance && "orbix-rise")}
        >
          {children}
        </div>
        {aside ? <div className="orbix-photo-hero__aside">{aside}</div> : null}
      </Container>
    </section>
  );
}

/**
 * "U.S." set in B612 Mono reads as "U. S.", so the credit line uses "US".
 * The record itself keeps its wording.
 */
function plainCredit(text: string) {
  return text.replace(/U\.S\./g, "US");
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
