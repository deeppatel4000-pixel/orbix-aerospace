import Link from "next/link";
import type { ReactNode } from "react";

import { formatFigure } from "@/components/ui/readout";
import { cn } from "@/lib/cn";

/**
 * The vehicle card link (spec 8): a flat panel with the photograph, then the
 * classification line (B612 Mono caps, accent), the 28px condensed name 8px
 * below it, a one-line summary and a two-spec hairline row set as a readout
 * (mono caps label over the value).
 *
 * The whole card is one link, so each card is one tab stop with no nested
 * controls. The name comes first in the source so the link's accessible
 * name starts with it; the classification is drawn above it with `order`.
 * Registry photographs are decorative (`alt=""`) because the card text
 * already names the vehicle.
 */
export interface VehicleSpec {
  /** Formatted, already-qualified value. Never fabricated or defaulted. */
  readonly value: ReactNode;
  readonly label: string;
}

/**
 * `default` is the registry card. `compact` is the related-vehicle card at
 * the end of a profile: the same card and two-spec row with a smaller title.
 */
export type VehicleRecordCardVariant = "compact" | "default";

/**
 * The card's arrangement. Below 40rem every layout is `stacked`.
 *
 * - `stacked`: the photograph above the text.
 * - `feature`: the wide first card of the aircraft registry, spanning two
 *   grid columns from 40rem: the photograph on the left half of the card,
 *   cropped to the height of the card (from 64rem the standard cards in
 *   its row set it), and the text on the right. From 64rem the text adds
 *   the description and up to four figures.
 * - `feature-portrait`: the wide first card of the launch vehicle registry,
 *   split in half from 40rem: the photograph on the left, at least 28rem
 *   tall (narrower than 3:4, so the crop only trims the sides and the
 *   whole vehicle stays in view), and the text on the right. From 48rem the
 *   text adds the description and up to six figures.
 *
 * In both feature layouts the figures sit on the card's bottom edge as a
 * two-column hairline compartment (three rows of two for six figures),
 * level with the figure row of the stacked card beside them from 64rem.
 * Values are 1.25rem in the aircraft feature (at 1.5rem "50,000+ ft"
 * overflows its right compartment at 1440px) and 1.375rem in the launch
 * vehicle feature, whose taller card has room for larger figures.
 */
export type VehicleRecordCardLayout =
  "feature" | "feature-portrait" | "stacked";

interface VehicleRecordCardProps {
  className?: string;
  /**
   * The classification line. A string is one line, list items joined with
   * a slash; an array sets each part on its own line (for example the
   * stage arrangement over the reusability).
   */
  classification: string | readonly string[];
  /**
   * Longer description. Without `summary` it is clamped to two lines (cards
   * outside the registries). With `summary` it is shown whole, only in the
   * `feature` and `feature-portrait` layouts from 64rem.
   */
  description?: string;
  /** Heading level for the name. Registries use 3; a list under an h3 uses 4. */
  headingLevel?: 3 | 4;
  href: string;
  layout?: VehicleRecordCardLayout;
  /** Rendered as the card's photograph, normally a `VehicleMediaFrame`. */
  media: ReactNode;
  name: string;
  /**
   * A shorter visible name that `name` starts with, for a name that would
   * wrap in a card ("Space Launch System" for "Space Launch System (SLS)").
   * The rest of `name` stays in the heading for assistive technology.
   */
  shortName?: string;
  /**
   * Key values. Stacked and compact cards show the first two; the feature
   * layouts up to six from 64rem, two to a row (spec 8 asks for a two-spec
   * row; the wide first card has room for more of the record).
   * Keep full dates out of this row: it is set in B612 Mono.
   */
  specs: readonly VehicleSpec[];
  /**
   * One factual line, shown whole. Keep it to 31 characters or fewer
   * (`CARD_SUMMARY_MAX_LENGTH`, enforced by the visuals tests) so it sets on
   * one line in the narrowest card (223px of text at 320px).
   * Takes the place of `description` below 64rem when both are given.
   */
  summary?: string;
  variant?: VehicleRecordCardVariant;
}

/**
 * Comma lists look loose in tracked uppercase mono, so list items are
 * joined with a slash instead ("Air superiority / Multirole").
 */
function formatClassification(classification: string) {
  return classification.split(/\s*,\s*/).join(" / ");
}

export function VehicleRecordCard({
  className,
  classification,
  description,
  headingLevel = 3,
  href,
  layout = "stacked",
  media,
  name,
  shortName,
  specs,
  summary,
  variant = "default",
}: VehicleRecordCardProps) {
  const isCompact = variant === "compact";
  const isPortraitFeature = layout === "feature-portrait";
  const isLandscapeFeature = layout === "feature";
  const isFeature = isLandscapeFeature || isPortraitFeature;
  const maxSpecs = isFeature ? 6 : 2;
  const visibleSpecs = specs.slice(0, maxSpecs);
  const Heading = headingLevel === 4 ? "h4" : "h3";
  const nameRest =
    shortName && name.startsWith(shortName)
      ? name.slice(shortName.length)
      : undefined;

  const heading = (
    <div className="flex flex-col">
      <Heading
        className={cn(
          "orbix-vehicle-card__name",
          isFeature && "md:text-[2.25rem] lg:text-[3rem]",
        )}
      >
        {nameRest !== undefined ? (
          <>
            {shortName}
            <span className="sr-only">{nameRest}</span>
          </>
        ) : (
          name
        )}
      </Heading>
      <p className="orbix-vehicle-card__classification -order-1">
        {typeof classification === "string"
          ? formatClassification(classification)
          : classification.map((line) => (
              <span className="block" key={line}>
                {line}
              </span>
            ))}
      </p>
      {summary ? (
        // From 64rem the feature cards show the whole description
        // instead, which the summary would only repeat.
        <p
          className={cn(
            "mt-3 text-sm leading-normal text-text-secondary",
            isLandscapeFeature && description && "lg:hidden",
            isPortraitFeature && description && "md:hidden",
          )}
        >
          {summary}
        </p>
      ) : null}
      {summary && description && isFeature ? (
        <p
          className={cn(
            "mt-4 hidden max-w-[44ch] leading-7 text-pretty text-text-secondary lg:text-lg",
            isLandscapeFeature ? "lg:block" : "md:block",
          )}
        >
          {description}
        </p>
      ) : null}
      {!summary && description ? (
        <p className="orbix-vehicle-card__description">{description}</p>
      ) : null}
    </div>
  );

  /*
   * Two tracks per figure (label, value) through a subgrid, so the values
   * in a row share one baseline even when a label wraps: the labels sit on
   * the bottom of their track and the values start at the top of theirs.
   * Figures past the first two show only from 64rem, in the feature
   * layouts, as a 2x2 compartment.
   */
  const specList = (
    <dl
      className={cn(
        "grid border-t border-border-subtle",
        visibleSpecs.length === 1 ? "grid-cols-1" : "grid-cols-2",
      )}
    >
      {visibleSpecs.map((spec, index) => (
        <div
          className={cn(
            "row-span-2 grid min-w-0 grid-rows-subgrid gap-y-1 pt-4",
            index % 2 === 1 && "border-l border-border-subtle pl-4",
            index % 2 === 0 && visibleSpecs.length > 1 && "pr-4",
            index >= 2 && "mt-4 hidden border-t border-border-subtle",
            index >= 2 && (isPortraitFeature ? "md:grid" : "lg:grid"),
            isLandscapeFeature && "lg:pt-5",
            isPortraitFeature && "md:pt-5 xl:mt-5 xl:pt-6",
          )}
          key={spec.label}
        >
          {/* Tighter tracking below 80rem, where a 1024px three-column
              card is too narrow for "Liftoff thrust" at 0.12em. */}
          <dt className="orbix-vehicle-card__spec-label self-end max-xl:tracking-[0.08em]">
            {spec.label}
          </dt>
          <dd
            className={cn(
              "orbix-vehicle-card__spec-value mt-0 whitespace-nowrap",
              isLandscapeFeature && "lg:text-[1.25rem] lg:leading-[1.1]",
              isPortraitFeature &&
                "md:text-[1.25rem] md:leading-[1.1] xl:text-[1.375rem]",
            )}
          >
            {formatFigure(spec.value)}
          </dd>
        </div>
      ))}
    </dl>
  );

  return (
    <article className={cn("h-full", className)}>
      <Link
        className={cn("orbix-vehicle-card", isFeature && "sm:flex-row")}
        data-layout={layout}
        data-variant={variant}
        href={href}
      >
        <div
          className={cn(
            // The photograph keeps its card ratio (16:10 or 3:4) at least;
            // the spec row sits on the card's bottom edge.
            "flex-none border-b border-border",
            // A registry card in a row that a feature card makes taller
            // gives the spare height to its photograph (cropped further
            // at the sides) rather than to an empty band in the text.
            layout === "stacked" &&
              !isCompact &&
              "lg:flex-auto lg:[&>*]:h-full lg:[&>*]:max-w-full",
            // A feature photograph fills the left half of the card at the
            // card's height (58 percent left the aircraft figures too
            // narrow for "50,000+ ft"), at least 28rem tall for a rocket
            // (32rem from 64rem).
            isFeature &&
              "sm:w-1/2 sm:border-r sm:border-b-0 sm:[&>*]:aspect-auto sm:[&>*]:h-full",
            isPortraitFeature && "sm:min-h-[28rem] lg:min-h-[32rem]",
          )}
        >
          {media}
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col gap-6 [&>dl]:mt-auto",
            isCompact ? "p-4" : "p-6",
            // In a feature card the figures also sit on the bottom edge,
            // level with the neighbouring card's figure row.
            isFeature && "sm:min-w-0 lg:gap-8 xl:px-8 xl:pt-8",
          )}
        >
          {heading}
          {specList}
        </div>
      </Link>
    </article>
  );
}
