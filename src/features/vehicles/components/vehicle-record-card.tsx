import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * The shared vehicle discovery card.
 *
 * Aircraft and launch vehicles use ONE visual architecture and differ only in
 * what they put in the domain slots — the classification line, the media
 * aspect, and two key specifications. A shared schema is deliberately not
 * imposed on the specifications: showing an aircraft's service ceiling beside
 * a rocket's stage count in the same labelled row would force one domain to
 * carry the other's vocabulary.
 *
 * ## Reading order
 *
 * media -> classification -> name -> description -> key specs -> explore
 *
 * The name sits BELOW the media. It was previously absolutely positioned over
 * the bottom of the image, which is why long names collided with the subject
 * on short media boxes.
 *
 * ## Interaction
 *
 * The whole card is a single link. The visible "Open engineering profile" row
 * is styled text inside that same anchor rather than a second control, so
 * there is exactly one tab stop and one screen-reader announcement per card —
 * no nested interactive elements.
 */
export interface VehicleSpec {
  /** Formatted, already-qualified value. Never fabricated or defaulted. */
  readonly value: string;
  readonly label: string;
}

interface VehicleRecordCardProps {
  className?: string;
  /** Short classification line, e.g. roles or supported orbits. */
  classification: string;
  description: string;
  href: string;
  /** Rendered inside the canonical media frame. */
  media: ReactNode;
  name: string;
  specs: readonly VehicleSpec[];
}

export function VehicleRecordCard({
  className,
  classification,
  description,
  href,
  media,
  name,
  specs,
}: VehicleRecordCardProps) {
  return (
    <article className={cn("h-full", className)}>
      <Link className="orbix-vehicle-card group" href={href}>
        {media}

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p className="orbix-vehicle-card__classification">{classification}</p>
          <h3 className="orbix-vehicle-card__name">{name}</h3>

          <p className="mt-3 text-sm leading-6 text-muted">{description}</p>

          <dl className="orbix-vehicle-card__specs">
            {specs.map((spec) => (
              <div key={spec.label}>
                <dt className="orbix-vehicle-card__spec-label">{spec.label}</dt>
                {/* Values are the one place monospace earns its keep here:
                    they are machine-produced figures, and tabular numerals
                    keep them aligned between cards. */}
                <dd className="orbix-vehicle-card__spec-value">{spec.value}</dd>
              </div>
            ))}
          </dl>

          <span className="orbix-vehicle-card__cta">
            Open engineering profile
            <ArrowUpRight aria-hidden="true" size={15} />
          </span>
        </div>
      </Link>
    </article>
  );
}
