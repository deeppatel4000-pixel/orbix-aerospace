import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * The vehicle card link (spec 10): a flat panel with the photograph on top,
 * the name as an `.orbix-h3`, one line of classification and a short list of
 * key values. The whole card is one link, so each card is one tab stop with
 * no nested controls. There is no "Explore" pseudo-button inside it.
 */
export interface VehicleSpec {
  /** Formatted, already-qualified value. Never fabricated or defaulted. */
  readonly value: ReactNode;
  readonly label: string;
}

/**
 * `default` is the registry card. `compact` is the related-vehicle card at
 * the end of a profile: same card, one key value, smaller title.
 */
export type VehicleRecordCardVariant = "compact" | "default";

interface VehicleRecordCardProps {
  className?: string;
  /** One line, for example the roles or the stage arrangement. */
  classification: string;
  /**
   * Deprecated and not rendered: the card shows name, classification and key
   * values only (spec 10). Accepted so existing callers keep compiling.
   */
  description?: string;
  /** Heading level for the name. Registries use 3; a list under an h3 uses 4. */
  headingLevel?: 3 | 4;
  href: string;
  /** Rendered at the top of the card, normally a `VehicleMediaFrame`. */
  media: ReactNode;
  name: string;
  specs: readonly VehicleSpec[];
  variant?: VehicleRecordCardVariant;
}

export function VehicleRecordCard({
  className,
  classification,
  headingLevel = 3,
  href,
  media,
  name,
  specs,
  variant = "default",
}: VehicleRecordCardProps) {
  const isCompact = variant === "compact";
  const visibleSpecs = isCompact ? specs.slice(0, 1) : specs;
  const Heading = headingLevel === 4 ? "h4" : "h3";

  return (
    <article className={cn("h-full", className)}>
      <Link className="orbix-vehicle-card" data-variant={variant} href={href}>
        <div className="border-b border-border">{media}</div>

        <div className={cn("flex flex-1 flex-col", isCompact ? "p-4" : "p-6")}>
          <Heading className="orbix-vehicle-card__name">{name}</Heading>
          <p className="orbix-vehicle-card__classification mt-1">
            {classification}
          </p>

          <dl className="mt-4 grid gap-2 border-t border-border-subtle pt-4">
            {visibleSpecs.map((spec) => (
              <div
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
                key={spec.label}
              >
                <dt className="orbix-vehicle-card__spec-label">{spec.label}</dt>
                <dd className="orbix-vehicle-card__spec-value mt-0 text-right">
                  {spec.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Link>
    </article>
  );
}
