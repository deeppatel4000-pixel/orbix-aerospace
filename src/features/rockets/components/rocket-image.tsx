import Image from "next/image";
import type { CSSProperties } from "react";

import { getRocketVisual } from "@/features/rockets/data/rocket-visuals";
import type { Rocket } from "@/features/vehicles/types";
import { cn } from "@/lib/cn";

/** Which recorded crop an image uses. */
export type ImageFraming = "card" | "default";

interface RocketImageProps {
  className?: string;
  /**
   * Render with `alt=""` when the surrounding link or caption already
   * names the vehicle, as on registry cards.
   */
  decorative?: boolean;
  fillContainer?: boolean;
  /**
   * Which recorded crop to use: `default` (`objectPosition`) or `card`
   * (the registry card frame).
   */
  framing?: ImageFraming;
  imageClassName?: string;
  priority?: boolean;
  rocket: Pick<Rocket, "id" | "name">;
  sizes: string;
}

/**
 * The launch vehicle's photograph from `rocket-visuals.ts`, with the hero's
 * tonal treatment (spec 7: saturate 0.9 only) so cards and
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
          "grid place-items-center p-4",
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
          "object-cover [filter:saturate(0.9)]",
          // A fixed zoom for a photograph whose vehicle is small in the
          // frame. It never changes on hover (spec 10).
          cardScale !== undefined && "[transform:scale(var(--card-scale))]",
          imageClassName,
        )}
        fill
        fetchPriority={priority ? "high" : undefined}
        priority={priority}
        quality={priority ? 90 : 75}
        sizes={cardScale ? scaleSizes(sizes, cardScale) : sizes}
        src={visual.src}
        style={
          framing === "card"
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
