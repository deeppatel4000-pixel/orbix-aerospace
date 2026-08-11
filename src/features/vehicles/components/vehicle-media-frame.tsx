import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * The canonical media frame for vehicle discovery cards.
 *
 * ## The problem this solves
 *
 * Card media used to be sized per vehicle by a `cardTreatment` value
 * ("flagship" | "standard" | "wide"), each mapping to a different responsive
 * aspect ratio, while the grid gave cards five different column spans. The two
 * multiplied: measured at 1440px, aircraft media rendered at aspect ratios of
 * 1.60, 1.33, 2.00, 2.00 and 2.00, and card heights spread 227px; rockets
 * spread 317px. The B-2 and Saturn V media boxes were only 242px tall.
 *
 * That was a framing failure, not an asset failure. The source images are
 * usable; they were being forced into inconsistent boxes. Saturn V in
 * particular is a portrait image (0.80) that was being cropped by
 * `object-cover` into a 2.00 letterbox — which is why launch vehicles appeared
 * sliced through the middle.
 *
 * ## The contract
 *
 * One fixed aspect ratio per domain, applied to every card in that domain, so
 * every row shares a media height and the grid stops laddering:
 *
 *   `landscape` (16:10) — aircraft, photographed in flight across the frame.
 *   `portrait`  (4:5)   — launch vehicles, which are vertical subjects. Their
 *                         sources measure 0.67-1.00, so a 0.80 frame crops
 *                         least.
 *
 * This is one system with a documented domain variant, not two card systems.
 * Per-vehicle framing stays where it already lived — the `objectPosition` in
 * `aircraft-visuals.ts` / `rocket-visuals.ts`, which is presentation metadata
 * held separately from factual vehicle data. No new metadata was introduced
 * and no vehicle data was touched.
 *
 * ## Why a wrapper rather than a change to AircraftImage/RocketImage
 *
 * Those two components have seven consumers each, including vehicle profiles
 * and the homepage, all of which are out of scope for this phase. Framing
 * lives here instead, so the image components keep their existing behaviour
 * everywhere else untouched.
 */
export type VehicleMediaAspect = "landscape" | "portrait";

const aspectClasses: Record<VehicleMediaAspect, string> = {
  landscape: "aspect-[16/10]",
  portrait: "aspect-[4/5]",
};

interface VehicleMediaFrameProps {
  aspect: VehicleMediaAspect;
  children: ReactNode;
  className?: string;
}

export function VehicleMediaFrame({
  aspect,
  children,
  className,
}: VehicleMediaFrameProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-border",
        // The ground shows through wherever a subject does not fill the
        // frame, so imagery sits on the interface rather than on a bright
        // rectangle of its own.
        "bg-surface",
        aspectClasses[aspect],
        className,
      )}
    >
      {children}
      {/* Tonal integration.
          The source photography is bright daylight material — saturated blue
          skies — dropped onto a near-black ground, which made each card read
          as a glowing rectangle rather than part of the interface. A modest
          desaturation and a single low scrim settle the image into the card
          without darkening the subject into illegibility. This replaces a
          stacked gradient plus a `technical-grid` overlay in
          mix-blend-screen. */}
      <div aria-hidden="true" className="absolute inset-0 bg-background/12" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-surface via-surface/60 to-transparent"
      />
    </div>
  );
}
