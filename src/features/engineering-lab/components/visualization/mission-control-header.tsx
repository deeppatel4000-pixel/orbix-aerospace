import { Activity, RadioTower, ShieldCheck, Waypoints } from "lucide-react";

import { OrbixWordmark } from "@/components/brand/orbix-wordmark";

import type {
  MissionPreset,
  MissionPresetCategory,
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

export interface MissionControlHeaderProps {
  readonly currentWorkspace: string;
  readonly missionCategory?: MissionPresetCategory;
  readonly missionPreset?: MissionPreset;
  readonly missionProfileAnalysis?: MissionProfileAnalysis | null;
  readonly missionReport?: MissionReport | null;
}

const categoryLabels: Readonly<Record<MissionPresetCategory, string>> = {
  "deep-space-concept": "Deep-space concept",
  "lunar-transfer": "Lunar transfer",
  "orbital-deployment": "Orbital deployment",
  "orbital-logistics": "Orbital logistics",
  "reentry-demonstration": "Reentry demonstration",
};

export function MissionControlHeader({
  currentWorkspace,
  missionCategory,
  missionPreset,
  missionProfileAnalysis,
  missionReport,
}: MissionControlHeaderProps) {
  const missionName =
    missionReport?.missionSummary.missionName ??
    missionProfileAnalysis?.missionName ??
    "Mission profile unavailable";
  const missionDescription =
    missionReport?.missionSummary.description ??
    "Load completed mission objects to activate the command-center workspace.";

  return (
    <header className="relative z-10 overflow-hidden border-b border-[#294451]/65 bg-[#02070d]/94 px-4 py-5 backdrop-blur-xl sm:px-6 sm:py-6 lg:px-8 lg:py-7">
      <div
        aria-hidden="true"
        className="absolute -top-28 right-[8%] h-72 w-72 rounded-full bg-accent/[0.065] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
      />
      <div className="relative grid gap-7 2xl:grid-cols-[minmax(0,1fr)_minmax(32rem,36rem)] 2xl:items-end">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <OrbixWordmark className="h-8 w-32 shrink-0 sm:h-9 sm:w-36" />
            <span
              aria-hidden="true"
              className="hidden h-7 w-px bg-white/10 sm:block"
            />
            <p className="flex items-center gap-2 font-mono text-[0.61rem] tracking-[0.19em] text-accent uppercase">
              <Activity aria-hidden="true" size={14} />
              ORBIX // Mission Control
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 font-mono text-[0.54rem] tracking-[0.16em] text-[#71878c] uppercase">
            <Waypoints aria-hidden="true" size={12} />
            Mission profile
          </div>
          <h2
            className="mt-2 max-w-4xl text-[clamp(1.8rem,4vw,3.2rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-[#eef6f7]"
            id="mission-control-dashboard-title"
          >
            {missionName}
          </h2>
          <p className="mt-4 max-w-[68ch] text-sm leading-6 text-[#91a5aa] sm:text-[0.95rem] sm:leading-7">
            {missionDescription}
          </p>
        </div>

        <dl className="grid overflow-hidden rounded-xl border border-[#294451]/70 bg-[#061116]/82 shadow-[inset_0_1px_rgba(255,255,255,0.025)] sm:grid-cols-2">
          <div className="min-w-0 border-b border-white/[0.07] px-4 py-4 sm:border-r">
            <dt className="font-mono text-[0.52rem] tracking-[0.15em] text-[#71868c] uppercase">
              Category
            </dt>
            <dd className="mt-2 truncate text-sm font-semibold text-[#d5e0e2]">
              {missionCategory
                ? categoryLabels[missionCategory]
                : "Not Reported"}
            </dd>
          </div>
          <div className="min-w-0 border-b border-white/[0.07] px-4 py-4">
            <dt className="font-mono text-[0.52rem] tracking-[0.15em] text-[#71868c] uppercase">
              Mission preset
            </dt>
            <dd className="mt-2 truncate text-sm font-semibold text-[#d5e0e2]">
              {missionPreset?.name ?? "Not Reported"}
            </dd>
          </div>
          <div className="min-w-0 border-b border-white/[0.07] px-4 py-4 sm:border-r sm:border-b-0">
            <dt className="flex items-center gap-2 font-mono text-[0.52rem] tracking-[0.15em] text-[#71868c] uppercase">
              <RadioTower aria-hidden="true" size={12} />
              Workspace
            </dt>
            <dd className="mt-2 truncate text-sm font-semibold text-accent">
              {currentWorkspace}
            </dd>
          </div>
          <div className="min-w-0 bg-signal/[0.035] px-4 py-4 text-signal">
            <dt className="flex items-center gap-2 font-mono text-[0.5rem] tracking-[0.13em] uppercase">
              <ShieldCheck aria-hidden="true" className="shrink-0" size={17} />
              Mission status
            </dt>
            <dd className="mt-2 truncate font-mono text-[0.59rem] tracking-[0.07em] uppercase">
              Educational simulation
            </dd>
          </div>
        </dl>
      </div>
    </header>
  );
}
