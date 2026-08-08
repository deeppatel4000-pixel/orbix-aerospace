import { Crosshair, Radar } from "lucide-react";

import { ProfileSection } from "@/features/aircraft/components/profile-section";
import { formatAircraftRole } from "@/features/aircraft/utils";
import type { AircraftRole } from "@/features/vehicles/types";

interface MissionApplicationsProps {
  roles: readonly AircraftRole[];
}

export function MissionApplications({ roles }: MissionApplicationsProps) {
  return (
    <ProfileSection
      description="Mission applications reflect only the role classifications attached to this aircraft record."
      eyebrow="10 // Operational scope"
      id="mission-applications"
      title="Mission Applications"
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {roles.map((role, index) => (
          <li
            className="orbix-frame orbix-carbon border-tactical/25 bg-[#080d0c]/90 p-5 sm:p-6"
            key={role}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="flex h-10 w-10 items-center justify-center border border-tactical-amber/25 bg-tactical-amber/8 text-tactical-amber">
                {index % 2 === 0 ? (
                  <Crosshair aria-hidden="true" size={18} />
                ) : (
                  <Radar aria-hidden="true" size={18} />
                )}
              </span>
              <span className="font-mono text-[0.58rem] tracking-[0.14em] text-muted uppercase">
                Application {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="font-display mt-8 text-2xl font-semibold">
              {formatAircraftRole(role)}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Recorded mission-role classification within the ORBIX aircraft
              registry.
            </p>
          </li>
        ))}
      </ul>
    </ProfileSection>
  );
}
