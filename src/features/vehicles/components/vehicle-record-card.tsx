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
 * The card's arrangement from 64rem. Below 64rem every layout is `stacked`.
 *
 * - `stacked`: the photograph above the text.
 * - `feature`: the wide first card of the aircraft registry, spanning two
 *   grid columns: the photograph on the left half of the card, cropped
 *   to the height of the grid row (the standard cards set it), and the
 *   text with up to four figures in a 2x2 compartment on the right.
 * - `feature-portrait`: the wide first card of the launch vehicle registry,
 *   split in half: the photograph on the left, as tall as the grid row
 *   (narrower than 3:4, so the crop only trims the sides and the whole
 *   vehicle stays in view), and the text with up to four figures in a 2x2
 *   compartment on the right.
 *
 * In both feature layouts the figures follow the description 2rem below
 * it instead of sinking to the card's bottom edge, as the same 2x2
 * hairline compartment: values at 1.25rem (line height 1.1) under the
 * 11px mono caps labels, so no figure outweighs the vehicle's name. At
 * 1.5rem "50,000+ ft" overflows the right compartment of the aircraft
 * feature at 1440px.
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
   * layouts up to four from 64rem (spec 8 asks for a two-spec row, so the
   * extra emphasis stops at a 2x2).
   * Keep full dates out of this row: it is set in B612 Mono.
   */
  specs: readonly VehicleSpec[];
  /**
   * One factual line, shown whole. Keep it to 34 characters or fewer
   * (`CARD_SUMMARY_MAX_LENGTH`, enforced by the visuals tests) so it sets on
   * one line in the narrowest card (about 240px of text at 320px).
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
  const isFeature = layout === "feature" || isPortraitFeature;
  const maxSpecs = isFeature ? 4 : 2;
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
          isFeature && "lg:text-[3rem]",
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
            isFeature && description && "lg:hidden",
          )}
        >
          {summary}
        </p>
      ) : null}
      {summary && description && isFeature ? (
        <p className="mt-4 hidden max-w-[44ch] text-lg leading-7 text-pretty text-text-secondary lg:block">
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
            index >= 2 && "lg:grid",
            isFeature && "lg:pt-5",
          )}
          key={spec.label}
        >
          <dt className="orbix-vehicle-card__spec-label self-end">
            {spec.label}
          </dt>
          <dd
            className={cn(
              "orbix-vehicle-card__spec-value mt-0 whitespace-nowrap",
              isFeature && "lg:text-[1.25rem] lg:leading-[1.1]",
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
        className={cn("orbix-vehicle-card", isFeature && "lg:flex-row")}
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
              "lg:flex-auto lg:[&>*]:h-full",
            // A feature photograph fills the left half of the card at the
            // row's height (at least 32rem for the portrait launch vehicle).
            isFeature &&
              "lg:w-1/2 lg:border-r lg:border-b-0 lg:[&>*]:aspect-auto lg:[&>*]:h-full",
            isPortraitFeature && "lg:min-h-[32rem]",
          )}
        >
          {media}
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col gap-6 [&>dl]:mt-auto",
            isCompact ? "p-4" : "p-6",
            // In a feature card the figures follow the description instead
            // of sinking to the bottom edge, so no gap opens between them.
            isFeature &&
              "lg:w-1/2 lg:min-w-0 lg:gap-8 lg:p-6 xl:p-8 lg:[&>dl]:mt-0",
          )}
        >
          {heading}
          {specList}
        </div>
      </Link>
    </article>
  );
}
