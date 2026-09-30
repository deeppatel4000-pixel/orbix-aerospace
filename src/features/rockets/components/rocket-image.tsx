import Image from "next/image";
import type { CSSProperties } from "react";

import { getRocketVisual } from "@/features/rockets/data/rocket-visuals";
import type { Rocket } from "@/features/vehicles/types";
import { cn } from "@/lib/cn";

/** Which recorded crop an image uses. */
export type ImageFraming = "card" | "default" | "feature";

interface RocketImageProps {
  /**
   * Deprecated and ignored: cards no longer zoom on hover (spec 11). Kept so
   * existing callers compile.
   */
  animateOnHover?: boolean;
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
  rocket: Pick<Rocket, "id" | "name">;
  sizes: string;
}

/**
 * The launch vehicle's photograph from `rocket-visuals.ts`, with the hero's
 * tonal treatment (spec 8: saturate 0.85, contrast 1.05) so cards and
 * heroes read as one set of photographs.
 * When no photograph is recorded, a plain text panel says so.
 */
export function RocketImage({
  className,
  decorative = false,
  fillContainer = false,
  framing = "default",
  imageClassName,
  priority = false,
  rocket,
  sizes,
}: RocketImageProps) {
  const visual = getRocketVisual(rocket.id);
  const cardScale =
    framing === "card" && visual?.cardScale ? visual.cardScale : undefined;

  if (!visual) {
    return (
      <div
        className={cn(
          "grid place-items-center bg-surface-raised p-4",
          fillContainer ? "absolute inset-0" : "relative",
          className,
        )}
      >
        <p className="text-sm text-muted">
          No photograph of {rocket.name} is available yet.
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
          "object-cover [filter:saturate(0.85)_contrast(1.05)]",
          framing === "feature" &&
            "object-(--crop-card) sm:object-(--crop-feature)",
          // A zoomed card crop: the zoom and the card's hover zoom (spec 7,
          // scale 1.03 from `.orbix-vehicle-card:hover img`) multiply, so
          // the photograph still responds to hover.
          cardScale !== undefined &&
            "[transform:scale(calc(var(--card-scale)*var(--card-hover,1)))] [.orbix-vehicle-card:hover_&]:[--card-hover:1.03]",
          imageClassName,
        )}
        fill
        fetchPriority={priority ? "high" : undefined}
        priority={priority}
        quality={priority ? 90 : 75}
        sizes={cardScale ? scaleSizes(sizes, cardScale) : sizes}
        src={visual.src}
        style={
          framing === "feature"
            ? ({
                "--crop-card": visual.cardObjectPosition,
                "--crop-feature": visual.featureObjectPosition,
              } as CSSProperties)
            : framing === "card"
              ? {
                  objectPosition: visual.cardObjectPosition,
                  ...(cardScale
                    ? ({
                        "--card-scale": cardScale,
                        transformOrigin: visual.cardScaleOrigin,
                      } as CSSProperties)
                    : {}),
                }
              : { objectPosition: visual.objectPosition }
        }
      />
    </div>
  );
}

/**
 * `sizes` for a photograph shown `scale` times larger than its frame: each
 * slot width multiplied, so the browser picks a file with enough pixels
 * for the zoomed crop instead of upscaling the frame-sized one.
 */
export function scaleSizes(sizes: string, scale: number) {
  return sizes
    .split(",")
    .map((entry) => {
      const trimmed = entry.trim();
      const split = trimmed.lastIndexOf(" ");
      const condition = split === -1 ? "" : `${trimmed.slice(0, split)} `;
      const length = split === -1 ? trimmed : trimmed.slice(split + 1);
      return `${condition}calc(${length} * ${scale})`;
    })
    .join(", ");
}
