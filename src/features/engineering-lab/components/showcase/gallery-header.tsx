import { Archive, Radar } from "lucide-react";

export interface GalleryHeaderProps {
  readonly missionCount: number;
}

export function GalleryHeader({ missionCount }: GalleryHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-white/10 px-5 py-8 sm:px-8 sm:py-10">
      <div
        aria-hidden="true"
        className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-accent/7 blur-3xl"
      />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 font-mono text-[0.63rem] tracking-[0.21em] text-accent uppercase">
            <Archive aria-hidden="true" size={15} />
            ORBIX // Mission Discovery
          </p>
          <h2
            className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-5xl"
            id="mission-gallery-title"
          >
            ORBIX MISSION ARCHIVE
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#91a5aa] sm:text-lg">
            Explore engineered aerospace concepts through simulation, analysis,
            and visualization.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#07151a]/85 px-4 py-3">
          <Radar
            aria-hidden="true"
            className="text-accent motion-safe:animate-pulse motion-reduce:animate-none"
            size={17}
          />
          <div>
            <p className="font-mono text-[0.52rem] tracking-[0.11em] text-[#71868c] uppercase">
              Archive registry
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-[#d4dfe1]">
              <output>{missionCount}</output> educational concepts
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
