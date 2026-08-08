import { Aperture, ScanLine } from "lucide-react";

import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { ProfileSection } from "@/features/aircraft/components/profile-section";
import type { Aircraft } from "@/features/vehicles/types";

interface AircraftVisualPanelProps {
  aircraft: Aircraft;
}

export function AircraftVisualPanel({ aircraft }: AircraftVisualPanelProps) {
  return (
    <ProfileSection
      description="The approved aircraft visual is presented as mission-dossier reference imagery."
      eyebrow="02 // Visual identification"
      id="aircraft-image"
      title="Aircraft Image"
    >
      <figure className="orbix-frame overflow-hidden border-tactical/25 bg-[#050908]">
        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/10] lg:aspect-[16/9]">
          <AircraftImage
            aircraft={aircraft}
            fillContainer
            imageClassName="saturate-[0.9] contrast-[1.05]"
            sizes="(max-width: 1023px) 100vw, 70vw"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(2,5,5,0.78)_100%)]"
          />
          <div
            aria-hidden="true"
            className="technical-grid absolute inset-0 opacity-20 mix-blend-screen"
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-5">
            <span className="border border-white/15 bg-black/55 px-2.5 py-1 font-mono text-[0.58rem] tracking-[0.14em] text-white/75 uppercase backdrop-blur-md">
              <Aperture aria-hidden="true" className="mr-2 inline" size={12} />
              Visual reference
            </span>
            <span className="border border-white/15 bg-black/55 px-2.5 py-1 font-mono text-[0.58rem] tracking-[0.14em] text-white/75 uppercase backdrop-blur-md">
              {aircraft.id}
            </span>
          </div>
        </div>
        <figcaption className="flex flex-col gap-3 border-t border-tactical/20 p-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <span>
            {aircraft.name} {"//"} Canonical profile imagery
          </span>
          <span className="flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.12em] text-tactical-amber uppercase">
            <ScanLine aria-hidden="true" size={13} /> Image indexed
          </span>
        </figcaption>
      </figure>
    </ProfileSection>
  );
}
