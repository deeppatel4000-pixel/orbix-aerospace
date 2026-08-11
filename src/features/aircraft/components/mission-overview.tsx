import { Crosshair, Plane } from "lucide-react";

import { ProfileSection } from "@/features/aircraft/components/profile-section";
import { formatAircraftRole } from "@/features/aircraft/utils";
import type { Aircraft } from "@/features/vehicles/types";

interface MissionOverviewProps {
  aircraft: Aircraft;
}

export function MissionOverview({ aircraft }: MissionOverviewProps) {
  return (
    <ProfileSection
      description="The aircraft's recorded mission purpose and program context, presented without extending the source dataset."
      eyebrow="Mission dossier"
      mode="editorial"
      id="mission-overview"
      title="Mission Overview"
    >
      <div className="orbix-frame overflow-hidden border-tactical/25 bg-[#080d0c]/90">
        <div className="orbix-carbon border-b border-tactical/20 p-6 sm:p-8">
          <div className="flex items-center gap-3 font-mono text-[0.62rem] tracking-[0.16em] text-tactical-amber uppercase">
            <Crosshair aria-hidden="true" size={15} />
            Mission statement
          </div>
          <p className="font-display mt-5 max-w-4xl text-2xl leading-9 font-medium tracking-[-0.025em] sm:text-3xl sm:leading-10">
            {aircraft.description}
          </p>
        </div>

        <div className="grid gap-px bg-tactical/20 sm:grid-cols-[0.75fr_1.25fr]">
          <div className="bg-[#0a100f] p-5 sm:p-6">
            <p className="flex items-center gap-2 font-mono text-[0.6rem] tracking-[0.14em] text-muted uppercase">
              <Plane aria-hidden="true" size={14} /> Aircraft class
            </p>
            <p className="mt-3 text-sm font-medium">Military aircraft</p>
          </div>
          <div className="bg-[#0a100f] p-5 sm:p-6">
            <p className="font-mono text-[0.6rem] tracking-[0.14em] text-muted uppercase">
              Recorded mission applications
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {aircraft.roles.map((role) => (
                <li
                  className="border border-tactical-amber/25 bg-tactical-amber/8 px-3 py-1.5 text-xs text-tactical-amber"
                  key={role}
                >
                  {formatAircraftRole(role)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </ProfileSection>
  );
}
