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
    "Load a completed mission to fill this workspace.";

  return (
    <header className="border-b border-border-subtle pb-4">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)] xl:items-start">
        <div className="min-w-0">
          <p className="orbix-label">Mission control</p>
          <h3
            className="orbix-h3 mt-1 text-foreground"
            id="mission-control-dashboard-title"
          >
            {missionName}
          </h3>
          <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
            {missionDescription}
          </p>
        </div>

        <dl className="grid gap-x-6 text-sm sm:grid-cols-2">
          <div className="min-w-0 border-t border-border-subtle py-2">
            <dt className="text-muted">Category</dt>
            <dd className="mt-0.5 text-foreground">
              {missionCategory
                ? categoryLabels[missionCategory]
                : "Not reported"}
            </dd>
          </div>
          <div className="min-w-0 border-t border-border-subtle py-2">
            <dt className="text-muted">Mission preset</dt>
            <dd className="mt-0.5 break-words text-foreground">
              {missionPreset?.name ?? "Not reported"}
            </dd>
          </div>
          <div className="min-w-0 border-t border-border-subtle py-2">
            <dt className="text-muted">Workspace</dt>
            <dd className="mt-0.5 text-foreground">{currentWorkspace}</dd>
          </div>
          <div className="min-w-0 border-t border-border-subtle py-2">
            <dt className="text-muted">Data</dt>
            <dd className="mt-0.5 text-foreground">Educational simulation</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}
