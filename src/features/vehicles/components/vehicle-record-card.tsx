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
  /**
   * Unit set after the value in muted text, for a readout split into value
   * and unit. Leave it out when `value` already carries its unit.
   */
  readonly unit?: string;
  /**
   * The figure in the other unit system and the source's qualifier, under
   * the value. Shown only in the feature layouts from 48rem and in a
   * `leadRow` card from 64rem.
   */
  readonly secondary?: ReactNode;
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
 *   grid columns from 40rem: the photograph across the whole card at 2:1
 *   (an airframe is wide, so it stays whole), then from 48rem the text in
 *   two columns: the classification, name and description on the left and
 *   a 2x2 block of four figures on the right, on the card's bottom edge.
 * - `feature-portrait`: the wide first card of the launch vehicle registry,
 *   split in half from 40rem: the photograph on the left, at least 28rem
 *   tall (narrower than 3:4, so the crop only trims the sides and the
 *   whole vehicle stays in view), and the text on the right. From 48rem
 *   the text adds the description, and the four figures sit as a 2x2 block
 *   on the card's bottom edge; the description takes the spare height.
 *
 * The 2x2 block is a hairline compartment: a rule between the columns that
 * runs the full height of each row and a full-width rule between the rows.
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
  /**
   * A stacked registry card in the feature card's row. From 64rem it shows
   * four figures as a 2x2 block, like the feature card beside it, so both
   * cards end on the same baseline with their figures on the bottom edge.
   */
  leadRow?: boolean;
  /**
   * A stacked card whose photograph may take the spare height when its row
   * is taller (cropped at the sides only). For portrait launch vehicle
   * photographs, where a narrower crop keeps the whole vehicle in view. A
   * landscape airframe keeps its 16:10 frame and the card body takes the
   * spare height instead.
   */
  mediaStretch?: boolean;
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
   * layouts up to four from 48rem, as a 2x2 block (spec 8 asks for a
   * two-spec row; the wide first card has room for more of the record).
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
  leadRow = false,
  media,
  mediaStretch = false,
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
  const isLeadRow = leadRow && layout === "stacked" && !isCompact;
  // The launch vehicle feature card sets up to six figures as readouts,
  // three rows of two, so its text column reaches the height of the
  // portrait cards in its row with no empty band.
  const maxSpecs = isPortraitFeature ? 6 : isFeature || isLeadRow ? 4 : 2;
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
            isFeature && description && "md:hidden",
          )}
        >
          {summary}
        </p>
      ) : null}
      {summary && description && isFeature ? (
        <p
          className={cn(
            "mt-4 hidden max-w-[44ch] leading-7 text-pretty text-text-secondary md:block xl:text-lg",
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
   * Cells carry no margins, so the rule between the columns runs the full
   * height of its row and the rule between the rows the full width.
   * Figures past the first two show only in the feature layouts, from
   * 48rem.
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
            isFeature &&
              index < visibleSpecs.length - 2 &&
              visibleSpecs.length > 2 &&
              "md:pb-4",
            isLeadRow && index < 2 && visibleSpecs.length > 2 && "lg:pb-4",
            index >= 2 && "hidden border-t border-border-subtle",
            index >= 2 && (isLeadRow ? "lg:grid" : "md:grid"),
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
              isLandscapeFeature && "md:text-[1.25rem] md:leading-[1.1]",
              // The aircraft figure column is about 17rem at 1024px, too
              // narrow for "50,000+ ft" at 1.25rem.
              isLandscapeFeature && "lg:max-xl:text-[1.125rem]",
              // Readouts in the launch vehicle feature card: the largest
              // size at which "549,054 kg" still fits a half column.
              isPortraitFeature && "md:text-[1.5rem] md:leading-[1.05]",
            )}
          >
            {formatFigure(spec.value)}
            {spec.unit ? (
              <span className="ml-[0.3em] text-[0.875em] text-muted">
                {spec.unit}
              </span>
            ) : null}
            {spec.secondary && (isFeature || isLeadRow) ? (
              <span
                className={cn(
                  "mt-2 hidden font-mono text-xs leading-snug font-normal tracking-normal whitespace-normal text-muted",
                  isLeadRow ? "lg:block" : "md:block",
                )}
              >
                {formatFigure(spec.secondary)}
              </span>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );

  return (
    <article className={cn("h-full", className)}>
      <Link
        className={cn(
          // Positioned, so the visually hidden rest of a short name stays
          // inside the card (and inside a scrolling row of related cards)
          // instead of widening the page.
          "orbix-vehicle-card relative",
          isPortraitFeature && "sm:flex-row",
        )}
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
              mediaStretch &&
              "lg:flex-auto lg:[&>*]:h-full lg:[&>*]:max-w-full",
            // The aircraft feature photograph runs across the whole card
            // at 2:1, cropped only a little from the top and bottom.
            isLandscapeFeature && "sm:[&>*]:aspect-[2/1]",
            // The launch vehicle feature photograph fills the left half of
            // the card at the card's height, at least 28rem tall (32rem
            // from 64rem).
            isPortraitFeature &&
              "sm:min-h-[28rem] sm:w-1/2 sm:border-r sm:border-b-0 lg:min-h-[32rem] sm:[&>*]:aspect-auto sm:[&>*]:h-full",
          )}
        >
          {media}
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col gap-6 [&>dl]:mt-auto",
            isCompact ? "p-4" : "p-6",
            isFeature && "sm:min-w-0 xl:px-8 xl:pt-8",
            // Aircraft feature from 48rem: the heading and description on
            // the left, the 2x2 figures on the right, on the bottom edge.
            isLandscapeFeature &&
              "md:grid md:grid-cols-2 md:gap-8 md:[&>dl]:mt-0 md:[&>dl]:self-end",
          )}
        >
          {heading}
          {specList}
        </div>
      </Link>
    </article>
  );
}
