import Image from "next/image";

import { getRocketVisual } from "@/features/rockets/data/rocket-visuals";
import type { Rocket } from "@/features/vehicles/types";
import { cn } from "@/lib/cn";

interface RocketImageProps {
  /**
   * Deprecated and ignored: cards no longer zoom on hover (spec 11). Kept so
   * existing callers compile.
   */
  animateOnHover?: boolean;
  className?: string;
  fillContainer?: boolean;
  imageClassName?: string;
  priority?: boolean;
  rocket: Pick<Rocket, "id" | "name">;
  sizes: string;
}

/**
 * The launch vehicle's photograph from `rocket-visuals.ts`, shown as taken.
 * When no photograph is recorded, a plain text panel says so.
 */
export function RocketImage({
  className,
  fillContainer = false,
  imageClassName,
  priority = false,
  rocket,
  sizes,
}: RocketImageProps) {
  const visual = getRocketVisual(rocket.id);

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
        alt={visual.alt}
        className={cn("object-cover", imageClassName)}
        fill
        fetchPriority={priority ? "high" : undefined}
        priority={priority}
        quality={priority ? 90 : 75}
        sizes={sizes}
        src={visual.src}
        style={{ objectPosition: visual.objectPosition }}
      />
    </div>
  );
}
