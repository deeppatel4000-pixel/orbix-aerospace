import { RadioTower, Rocket } from "lucide-react";

import type { ShowcasePresentationPhase } from "./showcase-phase";

export interface ShowcaseStageProps {
  readonly insight?: string;
  readonly isPlaying: boolean;
  readonly phase: ShowcasePresentationPhase;
  readonly reducedMotion: boolean;
}

const markerPositions: Readonly<
  Record<ShowcasePresentationPhase["scene"], string>
> = {
  arrival: "left-[67%] top-[24%] rotate-[38deg]",
  entry: "left-[72%] top-[48%] rotate-[125deg]",
  launch: "left-[18%] top-[68%] -rotate-12",
  orbit: "left-[33%] top-[27%] rotate-[12deg]",
  review: "left-[48%] top-[42%] rotate-45",
  transfer: "left-[50%] top-[18%] rotate-[24deg]",
};

export function ShowcaseStage({
  insight,
  isPlaying,
  phase,
  reducedMotion,
}: ShowcaseStageProps) {
  return (
    <section
      aria-labelledby="showcase-current-phase-title"
      className="relative min-h-[30rem] overflow-hidden rounded-2xl border border-white/10 bg-surface"
      data-showcase-phase={phase.id}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,color-mix(in_srgb,var(--orbix-accent)_8%,transparent),transparent_35%),linear-gradient(color-mix(in_srgb,var(--orbix-text-primary)_2%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--orbix-text-primary)_2%,transparent)_1px,transparent_1px)] bg-[size:auto,34px_34px,34px_34px]"
      />
      <div
        aria-hidden="true"
        className="absolute top-[13%] left-[16%] h-1 w-1 rounded-full bg-white/70 shadow-[8rem_3rem_0_color-mix(in_srgb,var(--orbix-text-primary)_35%,transparent),19rem_-1rem_0_color-mix(in_srgb,var(--orbix-accent)_45%,transparent),29rem_6rem_0_color-mix(in_srgb,var(--orbix-text-primary)_30%,transparent),38rem_1rem_0_color-mix(in_srgb,var(--orbix-text-primary)_45%,transparent),45rem_9rem_0_color-mix(in_srgb,var(--orbix-accent)_30%,transparent)] motion-safe:animate-pulse motion-reduce:animate-none"
      />

      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20 bg-[radial-gradient(circle_at_36%_32%,color-mix(in_srgb,var(--orbix-accent)_35%,transparent),color-mix(in_srgb,var(--orbix-bg-elevated)_92%,transparent)_42%,var(--orbix-bg-page)_72%)] shadow-[0_0_55px_color-mix(in_srgb,var(--orbix-accent)_14%,transparent)] sm:h-56 sm:w-56"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 h-64 w-[82%] -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] rounded-[50%] border border-accent/20 sm:h-80"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 h-80 w-[64%] -translate-x-1/2 -translate-y-1/2 rotate-[28deg] rounded-[50%] border border-dashed border-white/10"
      />

      <div
        aria-hidden="true"
        className={
          "absolute z-10 flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 bg-surface text-accent shadow-[0_0_24px_color-mix(in_srgb,var(--orbix-accent)_30%,transparent)] transition-[top,left,transform] duration-700 motion-reduce:transition-none " +
          markerPositions[phase.scene] +
          (isPlaying && !reducedMotion ? " motion-safe:animate-pulse" : "")
        }
      >
        <Rocket size={18} />
      </div>

      <div className="absolute top-5 right-5 z-20 rounded-lg border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-sm">
        <p className="font-mono text-[0.52rem] tracking-[0.12em] text-muted uppercase">
          Presentation clock
        </p>
        <p className="mt-1 font-mono text-xs text-accent">
          PHASE LINK // {phase.id.toUpperCase()}
        </p>
      </div>

      <div className="absolute right-5 bottom-5 left-5 z-20 max-w-2xl rounded-xl border border-white/10 bg-surface/90 p-5 backdrop-blur-sm">
        <p className="flex items-center gap-2 font-mono text-[0.57rem] tracking-[0.14em] text-accent uppercase">
          <RadioTower aria-hidden="true" size={13} />
          Current presentation phase
        </p>
        <h3
          className="mt-2 text-2xl font-semibold"
          id="showcase-current-phase-title"
        >
          {phase.label}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted">{phase.description}</p>
        {insight ? (
          <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-muted">
            {insight}
          </p>
        ) : null}
      </div>
    </section>
  );
}
