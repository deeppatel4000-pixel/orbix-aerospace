import { memo } from "react";
import { Flame, Rocket } from "lucide-react";

export interface SpacecraftMarkerProps {
  readonly animated?: boolean;
  readonly className?: string;
  readonly phaseLabel: string;
  readonly thermalActive?: boolean;
}

export const SpacecraftMarker = memo(function SpacecraftMarker({
  animated = true,
  className = "",
  phaseLabel,
  thermalActive = false,
}: SpacecraftMarkerProps) {
  return (
    <div
      aria-label={`Spacecraft marker: ${phaseLabel}`}
      className={`relative flex h-9 w-9 items-center justify-center rounded-full border border-accent/50 bg-[#07151a] text-accent shadow-[0_0_20px_rgba(91,205,190,0.42)] ${animated ? "motion-safe:animate-pulse motion-reduce:animate-none" : ""} ${className}`}
      role="img"
    >
      {thermalActive ? (
        <span className="absolute -inset-2 rounded-full bg-signal/18 blur-md motion-safe:animate-pulse motion-reduce:animate-none" />
      ) : null}
      <Rocket
        aria-hidden="true"
        className="relative rotate-45"
        size={17}
        strokeWidth={1.8}
      />
      {thermalActive ? (
        <Flame
          aria-hidden="true"
          className="absolute -right-1 -bottom-1 text-signal"
          size={11}
          fill="currentColor"
        />
      ) : null}
      <span className="sr-only">{phaseLabel}</span>
    </div>
  );
});
