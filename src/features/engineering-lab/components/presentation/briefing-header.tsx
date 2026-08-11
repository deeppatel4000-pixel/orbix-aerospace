import { Activity, ShieldCheck } from "lucide-react";

import type { MissionPresetCategory } from "@/features/engineering-lab/types";

export interface BriefingHeaderProps {
  readonly category?: MissionPresetCategory;
  readonly missionName: string;
}

const categoryLabels: Readonly<Record<MissionPresetCategory, string>> = {
  "deep-space-concept": "Deep-space concept",
  "lunar-transfer": "Lunar transfer",
  "orbital-deployment": "Orbital deployment",
  "orbital-logistics": "Orbital logistics",
  "reentry-demonstration": "Reentry demonstration",
};

export function BriefingHeader({ category, missionName }: BriefingHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-white/10 px-5 py-8 sm:px-8 sm:py-10">
      <div
        aria-hidden="true"
        className="absolute top-8 right-[12%] h-1 w-1 rounded-full bg-white/70 shadow-[5rem_2rem_0_rgba(255,255,255,0.35),-9rem_5rem_0_rgba(118,214,210,0.5),13rem_7rem_0_rgba(255,255,255,0.25)] motion-safe:animate-pulse motion-reduce:animate-none"
      />
      <div
        aria-hidden="true"
        className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-accent/8 blur-3xl"
      />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[0.64rem] tracking-[0.22em] text-accent uppercase">
            <Activity aria-hidden="true" size={15} />
            Mission profile // Executive briefing
          </p>
          <h2 className="mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">
            {missionName}
          </h2>
          <p className="mt-4 font-mono text-[0.65rem] tracking-[0.15em] text-muted uppercase">
            {category ? categoryLabels[category] : "Custom educational mission"}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-accent/25 bg-accent/7 px-4 py-3">
            <p className="font-mono text-[0.56rem] tracking-[0.14em] text-muted uppercase">
              Status
            </p>
            <p
              aria-live="polite"
              className="mt-1 flex items-center gap-2 font-mono text-xs font-semibold tracking-[0.08em] text-accent uppercase"
              role="status"
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-accent motion-safe:animate-pulse motion-reduce:animate-none"
              />
              Simulation review
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-signal/20 bg-signal/5 px-4 py-3 text-signal">
            <ShieldCheck aria-hidden="true" size={16} />
            <span className="font-mono text-[0.61rem] tracking-[0.08em] uppercase">
              Educational mission
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
