import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { formatFigure } from "@/components/ui/readout";
import { cn } from "@/lib/cn";

/** One key figure on an entry. */
export interface VehicleSpec {
  /** Formatted, already-qualified value. Never fabricated or defaulted. */
  readonly value: ReactNode;
  readonly label: string;
  /**
   * Unit set after the value in muted text. Leave it out when `value`
   * already carries its unit.
   */
  readonly unit?: string;
  /**
   * The figure in the other unit system or the source's qualifier. Kept
   * for callers; a catalogue entry shows only the value and unit.
   */
  readonly secondary?: ReactNode;
}

/**
 * `default` is a registry entry. `compact` is a related-vehicle entry at
 * the end of a profile: the same entry with a smaller name.
 */
export type VehicleRecordCardVariant = "compact" | "default";

/**
 * The entry's arrangement (spec 6: open catalogue, no card chrome).
 *
 * - `stacked`: an open grid entry, the photograph as a hard-edged plate
 *   and the caption block under it on the ground.
 * - `row`: a catalogue row: thumbnail, name and one-line summary, two key
 *   figures right-aligned and an arrow. The list around it draws the rule
 *   between rows.
 * - `feature`, `feature-portrait`: v2 names, now drawn as `stacked`.
 */
export type VehicleRecordCardLayout =
  "feature" | "feature-portrait" | "row" | "stacked";

interface VehicleRecordCardProps {
  className?: string;
  /**
   * The classification line, sentence case. An array is joined into one
   * line with commas.
   */
  classification: string | readonly string[];
  /**
   * Longer description, shown in a row from 64rem when there is no
   * summary, clamped to two lines.
   */
  description?: string;
  /** Heading level for the name. Registries use 3; a list under an h3 uses 4. */
  headingLevel?: 3 | 4;
  href: string;
  layout?: VehicleRecordCardLayout;
  /** @deprecated v2 grid option; ignored. */
  leadRow?: boolean;
  /** Rendered as the entry's photograph, normally a `VehicleMediaFrame`. */
  media: ReactNode;
  /** @deprecated v2 grid option; ignored. */
  mediaStretch?: boolean;
  /**
   * The row thumbnail's shape: `landscape` (default) for a 16:10 airframe,
   * `portrait` for a 3:4 launch vehicle, set narrower so the row keeps
   * about the same height.
   */
  thumb?: "landscape" | "portrait";
  name: string;
  /**
   * A shorter visible name that `name` starts with, for a name that would
   * wrap ("Space Launch System" for "Space Launch System (SLS)"). The rest
   * of `name` stays in the heading for assistive technology.
   */
  shortName?: string;
  /** Key values; an entry shows the first two. */
  specs: readonly VehicleSpec[];
  /**
   * One factual line, shown whole. At most 31 characters
   * (`CARD_SUMMARY_MAX_LENGTH`, enforced by the visuals tests).
   */
  summary?: string;
  variant?: VehicleRecordCardVariant;
}

function classificationText(classification: string | readonly string[]) {
  if (typeof classification === "string") return classification;
  return classification
    .map((part, index) =>
      index === 0
        ? part
        : part.charAt(0).toLocaleLowerCase("en-US") + part.slice(1),
    )
    .join(", ");
}

/**
 * A registry entry (spec 6, 11): the photograph is the only rectangle; no
 * fill, no outline, no radius, no hover lift or zoom. Hover underlines the
 * name. The whole entry is one link, so each is one tab stop with no nested
 * controls. The name comes first in the source so the link's accessible
 * name starts with it; the classification is drawn above it with `order`.
 * Registry photographs are decorative (`alt=""`) because the entry text
 * already names the vehicle.
 */
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
  thumb = "landscape",
  variant = "default",
}: VehicleRecordCardProps) {
  const isRow = layout === "row";
  const isCompact = variant === "compact";
  const Heading = headingLevel === 4 ? "h4" : "h3";
  const nameRest =
    shortName && name.startsWith(shortName)
      ? name.slice(shortName.length)
      : undefined;
  const visibleSpecs = specs.slice(0, 2);

  const heading = (
    <div className="flex min-w-0 flex-col">
      <Heading className="orbix-vehicle-card__name mt-1">
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
        {classificationText(classification)}
      </p>
      {summary ? (
        <p className="mt-2 text-[0.9375rem] leading-normal text-muted">
          {summary}
        </p>
      ) : description ? (
        <p className="orbix-vehicle-card__description">{description}</p>
      ) : null}
    </div>
  );

  const specList =
    visibleSpecs.length > 0 ? (
      <dl
        className={cn(
          "grid grid-cols-2 gap-x-6 gap-y-3",
          isRow && "md:flex md:gap-x-8 md:justify-self-end",
          // A stacked entry in the two-across phone grid is about 8.5rem
          // wide: one figure to a line there.
          !isRow && "max-[30rem]:grid-cols-1",
        )}
      >
        {visibleSpecs.map((spec) => (
          <div
            className={cn(
              "min-w-0",
              isRow && "md:min-w-[7.5rem] md:text-right",
            )}
            key={spec.label}
          >
            <dt className="orbix-vehicle-card__spec-label">{spec.label}</dt>
            <dd className="orbix-vehicle-card__spec-value whitespace-nowrap">
              {formatFigure(spec.value)}
              {spec.unit ? (
                <span className="ml-[0.3em] text-[0.875em] text-muted">
                  {spec.unit}
                </span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    ) : null;

  if (isRow) {
    return (
      <article className={cn("h-full", className)}>
        <Link
          className={cn(
            // Positioned, so the visually hidden rest of a short name stays
            // inside the entry instead of widening the page.
            "orbix-vehicle-card group relative grid grid-cols-[var(--thumb)_minmax(0,1fr)] gap-x-5 gap-y-4 py-5",
            "md:grid-cols-[var(--thumb)_minmax(0,1fr)_auto_1.25rem] md:items-center md:gap-x-8",
            thumb === "portrait"
              ? "[--thumb:4.5rem] md:[--thumb:5.5rem]"
              : isCompact
                ? "[--thumb:6.5rem] sm:[--thumb:8rem]"
                : "[--thumb:6.5rem] sm:[--thumb:9rem] md:[--thumb:11rem]",
          )}
          data-layout={layout}
          data-variant={variant}
          href={href}
        >
          <div className="self-start sm:row-span-2 md:row-span-1 md:self-center">
            {media}
          </div>
          {heading}
          <div className="col-span-2 sm:col-span-1 sm:col-start-2 md:col-start-auto">
            {specList}
          </div>
          <ArrowRight
            aria-hidden="true"
            className="hidden text-muted transition-colors duration-(--motion-fast) group-hover:text-foreground md:block"
            size={20}
          />
        </Link>
      </article>
    );
  }

  return (
    <article className={cn("h-full", className)}>
      <Link
        className="orbix-vehicle-card relative gap-5"
        data-layout={layout}
        data-variant={variant}
        href={href}
      >
        <div className="flex-none">{media}</div>
        <div className="flex flex-1 flex-col gap-5 [&>dl]:mt-auto">
          {heading}
          {specList}
        </div>
      </Link>
    </article>
  );
}
