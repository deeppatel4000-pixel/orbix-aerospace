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
        aria-label={`No approved image is available for ${aircraft.name}.`}
        className={cn(
          "technical-grid grid place-items-center bg-background/80",
          fillContainer ? "absolute inset-0" : "relative",
          className,
        )}
        role="img"
      >
        <span className="font-mono text-xs tracking-[0.14em] text-muted uppercase">
          Visual not available
        </span>
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
        className={cn(
          "object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.025] motion-reduce:transition-none",
          imageClassName,
        )}
        fill
        priority={priority}
        quality={90}
        sizes={sizes}
        src={visual.src}
        style={{ objectPosition: visual.objectPosition }}
      />
    </div>
  );
}
