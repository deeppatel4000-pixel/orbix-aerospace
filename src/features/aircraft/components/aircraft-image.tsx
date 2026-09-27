import Image from "next/image";

import { cn } from "@/lib/cn";
import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import type { Aircraft } from "@/features/vehicles/types";

interface AircraftImageProps {
  aircraft: Pick<Aircraft, "id" | "name">;
  className?: string;
  fillContainer?: boolean;
  imageClassName?: string;
  priority?: boolean;
  sizes: string;
}

/**
 * The aircraft's photograph from `aircraft-visuals.ts`, shown as taken: no
 * hover zoom, no filters. When no photograph is recorded, a plain text panel
 * says so instead of a stand-in image.
 */
export function AircraftImage({
  aircraft,
  className,
  fillContainer = false,
  imageClassName,
  priority = false,
  sizes,
}: AircraftImageProps) {
  const visual = getAircraftVisual(aircraft.id);

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
        alt={visual.alt}
        className={cn("object-cover", imageClassName)}
        fill
        priority={priority}
        quality={priority ? 90 : 75}
        sizes={sizes}
        src={visual.src}
        style={{ objectPosition: visual.objectPosition }}
      />
    </div>
  );
}
