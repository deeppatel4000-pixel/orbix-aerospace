import Image from "next/image";

import { getRocketVisual } from "@/features/rockets/data/rocket-visuals";
import type { Rocket } from "@/features/vehicles/types";
import { cn } from "@/lib/cn";

interface RocketImageProps {
  animateOnHover?: boolean;
  className?: string;
  fillContainer?: boolean;
  imageClassName?: string;
  priority?: boolean;
  rocket: Pick<Rocket, "id" | "name">;
  sizes: string;
}

export function RocketImage({
  animateOnHover = false,
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
        aria-label={`No approved image is available for ${rocket.name}.`}
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
          "object-cover",
          animateOnHover &&
            "transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.025] motion-reduce:transition-none",
          imageClassName,
        )}
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
