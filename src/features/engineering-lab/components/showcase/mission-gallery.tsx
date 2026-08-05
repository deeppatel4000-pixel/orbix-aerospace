import { Archive } from "lucide-react";

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
      className="technical-grid overflow-hidden rounded-3xl border border-white/12 bg-[#030a0e] text-[#e1eaeb] shadow-[0_30px_90px_rgba(0,0,0,0.24)]"
    >
      <GalleryHeader missionCount={presets.length} />

      {presets.length ? (
        <div className="grid gap-4 p-5 sm:p-8 md:grid-cols-2 xl:grid-cols-3">
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
        <div className="p-5 sm:p-8">
          <div className="rounded-2xl border border-dashed border-white/15 bg-black/10 px-6 py-14 text-center">
            <Archive
              aria-hidden="true"
              className="mx-auto text-[#60777d]"
              size={28}
            />
            <h3 className="mt-4 text-lg font-semibold">
              No mission concepts available
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#7f9499]">
              The archive has not received any existing mission preset objects.
              No replacement concepts were generated.
            </p>
          </div>
        </div>
      )}

      <footer className="border-t border-white/10 bg-[#040c10] px-5 py-4 text-xs leading-5 text-[#71868c] sm:px-8">
        Archive cards present existing educational mission configurations and
        supplied outputs only. They do not rank, recommend, or evaluate mission
        concepts.
      </footer>
    </section>
  );
}
