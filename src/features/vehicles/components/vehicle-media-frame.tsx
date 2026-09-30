import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * A fixed-ratio box for vehicle photographs.
 *
 * One ratio per use keeps every card in a row the same height:
 *
 *   `wide`      (16:10) for aircraft cards (spec 8).
 *   `tall`      (3:4)  for launch vehicle cards (spec 8): rockets are tall,
 *                      so the portrait frame shows the whole vehicle.
 *   `landscape` (16:9) for other cards, such as the home page records.
 *   `portrait`  (4:5)  for a launch vehicle shown on its own, such as the
 *                      profile figure, where a vertical subject needs the
 *                      height.
 *
 * Framing within the box comes from `objectPosition` in the visuals files.
 * By default the photograph is shown as taken. With `settle` (the
 * registry and related-vehicle cards) it is dimmed slightly and its last
 * quarter fades into the card ground, so a bright daylight sky sits with
 * the dark card body instead of above it.
 */
export type VehicleMediaAspect = "landscape" | "portrait" | "tall" | "wide";

const aspectClasses: Record<VehicleMediaAspect, string> = {
  landscape: "aspect-video",
  portrait: "aspect-[4/5]",
  tall: "aspect-[3/4]",
  wide: "aspect-[16/10]",
};

interface VehicleMediaFrameProps {
  aspect: VehicleMediaAspect;
  children: ReactNode;
  className?: string;
  /** Dim the photograph slightly and fade its bottom quarter to the card. */
  settle?: boolean;
}

export function VehicleMediaFrame({
  aspect,
  children,
  className,
  settle = false,
}: VehicleMediaFrameProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-surface-raised",
        aspectClasses[aspect],
        // Replaces the card photo filter with the same saturation and
        // contrast plus brightness 0.92.
        settle &&
          "[&_img]:[filter:saturate(0.85)_contrast(1.05)_brightness(0.92)]",
        className,
      )}
    >
      {children}
      {settle ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--orbix-surface)_70%,transparent))]"
        />
      ) : null}
    </div>
  );
}
