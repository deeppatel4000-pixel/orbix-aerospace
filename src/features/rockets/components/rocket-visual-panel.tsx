import { ImageIcon } from "lucide-react";

import { ProfileSection } from "@/features/rockets/components/profile-section";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import { getRocketVisual } from "@/features/rockets/data";
import type { Rocket } from "@/features/vehicles/types";

interface RocketVisualPanelProps {
  rocket: Rocket;
}

export function RocketVisualPanel({ rocket }: RocketVisualPanelProps) {
  const visual = getRocketVisual(rocket.id);

  return (
    <ProfileSection
      description="The approved vehicle image is presented at museum scale with its source record retained."
      eyebrow="02 // Vehicle spotlight"
      id="vehicle-image"
      title="Launch Complex View"
    >
      <figure className="orbix-frame overflow-hidden border-atmosphere/25 bg-[#040811]">
        <div className="relative isolate aspect-[4/5] overflow-hidden sm:aspect-[16/10] xl:aspect-[16/8]">
          <RocketImage
            className="absolute inset-0"
            fillContainer
            imageClassName="saturate-[0.92] contrast-[1.05]"
            rocket={rocket}
            sizes="(max-width: 1023px) 100vw, 72vw"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(2,5,10,0.86)_100%)]"
          />
          <div
            aria-hidden="true"
            className="technical-grid absolute inset-0 opacity-15 mix-blend-screen"
          />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-7">
            <div>
              <p className="font-mono text-[0.58rem] tracking-[0.16em] text-signal uppercase">
                Vehicle imagery // Canonical record
              </p>
              <p className="font-display mt-2 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                {rocket.name}
              </p>
            </div>
            <span className="flex items-center gap-2 self-start border border-white/15 bg-black/55 px-3 py-2 font-mono text-[0.56rem] tracking-[0.12em] text-white/75 uppercase backdrop-blur-md sm:self-auto">
              <ImageIcon aria-hidden="true" size={13} /> Approved image
            </span>
          </div>
        </div>
        <figcaption className="flex flex-col gap-2 border-t border-atmosphere/20 px-5 py-4 text-xs leading-5 text-muted sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <span>
            {visual?.alt ??
              `No approved image is available for ${rocket.name}.`}
          </span>
          <span className="font-mono text-[0.56rem] tracking-[0.12em] uppercase">
            Registry ID // {rocket.id}
          </span>
        </figcaption>
      </figure>
    </ProfileSection>
  );
}
