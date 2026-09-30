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
 * registry and related-vehicle cards) its saturation is eased and its
 * contrast lifted slightly, like the other card photographs.
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
  /** Ease the saturation and lift the contrast slightly. */
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
        // The card photo filter's saturation and contrast only: the text
        // sits below the photograph, so a dimming scrim would only muddy
        // the sky.
        settle && "[&_img]:[filter:saturate(0.85)_contrast(1.05)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
