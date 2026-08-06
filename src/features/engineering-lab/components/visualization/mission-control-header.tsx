import { Activity, RadioTower, ShieldCheck } from "lucide-react";

import { OrbixWordmark } from "@/components/brand/orbix-wordmark";

import type {
  MissionPresetCategory,
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

export interface MissionControlHeaderProps {
  readonly currentWorkspace: string;
  readonly missionCategory?: MissionPresetCategory;
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
    <header className="relative z-10 overflow-hidden border-b border-accent/15 bg-[#030810]/92 p-5 backdrop-blur-xl sm:p-7">
      <div
        aria-hidden="true"
        className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-accent/7 blur-3xl"
      />
      <div className="relative grid gap-6 2xl:grid-cols-[minmax(0,1fr)_auto] 2xl:items-end">
        <div>
          <OrbixWordmark className="mb-4 h-9 w-36" />
          <p className="flex items-center gap-2 font-mono text-[0.64rem] tracking-[0.2em] text-accent uppercase">
            <Activity aria-hidden="true" size={15} />
            ORBIX // Mission Control
          </p>
          <p className="mt-5 font-mono text-[0.55rem] tracking-[0.14em] text-[#71878c] uppercase">
            Mission
          </p>
          <h2
            className="mt-1 max-w-4xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl"
            id="mission-control-dashboard-title"
          >
            {missionName}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#91a5aa]">
            {missionDescription}
          </p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-3 2xl:min-w-[35rem]">
          <div className="rounded-xl border border-white/10 bg-[#08171c]/90 px-4 py-3">
            <dt className="font-mono text-[0.54rem] tracking-[0.12em] text-[#71868c] uppercase">
              Category
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[#cbd8da]">
              {missionCategory
                ? categoryLabels[missionCategory]
                : "Not Reported"}
            </dd>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#08171c]/90 px-4 py-3">
            <dt className="flex items-center gap-2 font-mono text-[0.54rem] tracking-[0.12em] text-[#71868c] uppercase">
              <RadioTower aria-hidden="true" size={12} />
              Workspace
            </dt>
            <dd className="mt-1 text-sm font-semibold text-accent">
              {currentWorkspace}
            </dd>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-signal/20 bg-signal/5 px-4 py-3 text-signal">
            <ShieldCheck aria-hidden="true" size={16} />
            <div>
              <dt className="font-mono text-[0.52rem] tracking-[0.1em] uppercase">
                Educational mission
              </dt>
              <dd className="mt-1 font-mono text-[0.59rem] tracking-[0.06em] uppercase">
                Educational simulation
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </header>
  );
}
