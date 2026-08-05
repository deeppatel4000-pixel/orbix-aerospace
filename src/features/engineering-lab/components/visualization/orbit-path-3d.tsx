import { memo } from "react";

import { SpacecraftMarker } from "./spacecraft-marker";

export interface OrbitPath3DProps {
  readonly finalAltitudeMetres?: number;
  readonly initialAltitudeMetres?: number;
  readonly transferAvailable: boolean;
}

const orbitFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export const OrbitPath3D = memo(function OrbitPath3D({
  finalAltitudeMetres,
  initialAltitudeMetres,
  transferAvailable,
}: OrbitPath3DProps) {
  return (
    <div
      aria-label="Three-dimensional orbital presentation paths"
      className="pointer-events-none absolute inset-0"
      role="img"
    >
      <div className="absolute inset-[21%] [transform:rotateX(66deg)_rotateZ(-12deg)] [transform-style:preserve-3d]">
        <div className="absolute inset-0 rounded-[50%] border border-[#72d6ce]/45 shadow-[0_0_18px_rgba(91,205,190,0.08)]" />
        <span className="absolute top-1/2 -left-3 -translate-y-1/2 rounded border border-accent/20 bg-[#071116]/90 px-2 py-1 font-mono text-[0.5rem] tracking-[0.08em] text-accent uppercase">
          Initial orbit
        </span>
      </div>

      <div className="absolute inset-[12%] [transform:rotateX(66deg)_rotateZ(-12deg)] [transform-style:preserve-3d]">
        <div className="absolute inset-0 rounded-[50%] border border-[#7597a0]/35" />
        <span className="absolute top-1/2 -right-3 -translate-y-1/2 rounded border border-white/10 bg-[#071116]/90 px-2 py-1 font-mono text-[0.5rem] tracking-[0.08em] text-[#9ab0b5] uppercase">
          Final orbit
        </span>
      </div>

      {transferAvailable ? (
        <div className="absolute inset-x-[12%] inset-y-[17%] [transform:rotateX(66deg)_rotateZ(-12deg)] [transform-style:preserve-3d]">
          <div className="absolute inset-0 rounded-[50%] border border-dashed border-signal/55 shadow-[0_0_20px_rgba(232,178,74,0.08)]" />
          <div
            className="absolute inset-0 motion-safe:animate-spin motion-reduce:transform-none"
            style={{ animationDuration: "18s" }}
          >
            <SpacecraftMarker
              className="absolute top-1/2 -right-4 -translate-y-1/2"
              phaseLabel="Transfer trajectory"
            />
          </div>
        </div>
      ) : null}

      <div className="absolute right-4 bottom-4 left-4 grid gap-2 sm:grid-cols-2">
        <p className="rounded-lg border border-white/10 bg-[#061015]/85 px-3 py-2 font-mono text-[0.58rem] text-[#8da3a8]">
          INITIAL ALT //{" "}
          <span className="text-[#dbe6e7]">
            {initialAltitudeMetres === undefined
              ? "Not reported"
              : `${orbitFormatter.format(initialAltitudeMetres)} m`}
          </span>
        </p>
        <p className="rounded-lg border border-white/10 bg-[#061015]/85 px-3 py-2 font-mono text-[0.58rem] text-[#8da3a8]">
          FINAL ALT //{" "}
          <span className="text-[#dbe6e7]">
            {finalAltitudeMetres === undefined
              ? "Not reported"
              : `${orbitFormatter.format(finalAltitudeMetres)} m`}
          </span>
        </p>
      </div>
    </div>
  );
});
