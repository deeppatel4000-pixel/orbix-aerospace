import Image from "next/image";
import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";
import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import type { Aircraft } from "@/features/vehicles/types";

/** Which recorded crop an image uses. */
export type ImageFraming = "card" | "default" | "feature";

interface AircraftImageProps {
  aircraft: Pick<Aircraft, "id" | "name">;
  className?: string;
  /**
   * Render with `alt=""` when the surrounding link or caption already
   * names the vehicle, as on registry cards.
   */
  decorative?: boolean;
  fillContainer?: boolean;
  /**
   * Which recorded crop to use: `default` (`objectPosition`), `card` (the
   * registry card frame) or `feature` (the card crop, then the wide first
   * card's crop from 40rem).
   */
  framing?: ImageFraming;
  imageClassName?: string;
  priority?: boolean;
  sizes: string;
}

/**
 * The aircraft's photograph from `aircraft-visuals.ts`, with the hero's
 * tonal treatment (spec 7: saturate 0.9 only) so cards and
 * heroes read as one set of photographs. When no photograph is recorded, a
 * plain text panel says so instead of a stand-in image.
 */
export function AircraftImage({
  aircraft,
  className,
  decorative = false,
  fillContainer = false,
  framing = "default",
  imageClassName,
  priority = false,
  sizes,
}: AircraftImageProps) {
  const visual = getAircraftVisual(aircraft.id);

  if (!visual) {
    return (
      <div
        className={cn(
          "grid place-items-center p-4",
          fillContainer ? "absolute inset-0" : "relative",
          className,
        )}
      >
        <p className="text-sm text-muted">
          No photograph of the {aircraft.name} is available yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden",
        fillContainer ? "absolute inset-0" : "relative",
        className,
      )}
    >
      <Image
        alt={decorative ? "" : visual.alt}
        className={cn(
          "object-cover [filter:saturate(0.9)]",
          framing === "feature" &&
            "object-(--crop-card) sm:object-(--crop-feature)",
          imageClassName,
        )}
        fill
        priority={priority}
        quality={priority ? 90 : 75}
        sizes={sizes}
        src={visual.src}
        style={
          framing === "feature"
            ? ({
                "--crop-card": visual.cardObjectPosition,
                "--crop-feature": visual.featureObjectPosition,
              } as CSSProperties)
            : {
                objectPosition:
                  framing === "card"
                    ? visual.cardObjectPosition
                    : visual.objectPosition,
              }
        }
      />
    </div>
  );
}
