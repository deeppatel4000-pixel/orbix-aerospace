import { EmptyState } from "@/components/ui/empty-state";
import type {
  MissionPreset,
  MissionProfileAnalysis,
  MissionReport,
} from "@/features/engineering-lab/types";

import { GalleryHeader } from "./gallery-header";
import { MissionCard } from "./mission-card";

export interface MissionGalleryProps {
  readonly analyses?: readonly MissionProfileAnalysis[];
  readonly missionControlHref?: string;
  readonly presets: readonly MissionPreset[];
  readonly reports?: readonly MissionReport[];
}

export function MissionGallery({
  analyses,
  missionControlHref,
  presets,
  reports,
}: MissionGalleryProps) {
  return (
    <section
      aria-labelledby="mission-gallery-title"
      className="min-w-0 text-foreground"
    >
      <GalleryHeader missionCount={presets.length} />

      {presets.length ? (
        <div className="grid gap-4 pt-4 md:grid-cols-2 xl:grid-cols-3">
          {presets.map((preset) => {
            const analysis = analyses?.find(
              (item) =>
                item.missionName === preset.missionProfileInputs.missionName,
            );
            const report = reports?.find(
              (item) =>
                item.missionSummary.missionName ===
                preset.missionProfileInputs.missionName,
            );

            return (
              <MissionCard
                analysis={analysis}
                key={preset.id}
                missionControlHref={missionControlHref}
                preset={preset}
                report={report}
              />
            );
          })}
        </div>
      ) : (
        <div className="pt-4">
          <EmptyState
            description="The archive has not received any existing mission preset objects. No replacement concepts were generated."
            title="No mission concepts available"
          />
        </div>
      )}

      <footer className="mt-6 border-t border-border-subtle pt-4 text-sm leading-6 text-muted">
        These cards show existing educational mission configurations and their
        supplied outputs only. They do not rank, recommend, or evaluate mission
        concepts.
      </footer>
    </section>
  );
}
