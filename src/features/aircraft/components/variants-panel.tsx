import { GitBranch } from "lucide-react";

import { ProfileSection } from "@/features/aircraft/components/profile-section";
import {
  formatAircraftVariantStatus,
  formatFirstFlight,
} from "@/features/aircraft/utils";
import type { AircraftVariant } from "@/features/vehicles/types";

interface VariantsPanelProps {
  variants: readonly AircraftVariant[];
}

export function VariantsPanel({ variants }: VariantsPanelProps) {
  return (
    <ProfileSection
      description="Recorded aircraft variants and their available status, chronology, and configuration notes."
      eyebrow="08 // Configuration branches"
      id="variants"
      title="Variants"
    >
      <ul className="grid gap-4 xl:grid-cols-2">
        {variants.map((variant, index) => (
          <li
            className="orbix-frame border-tactical/25 bg-[#080d0c]/90 p-5 sm:p-6"
            key={variant.id}
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-tactical-amber/25 bg-tactical-amber/8 font-mono text-xs text-tactical-amber">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="border border-tactical-amber/25 px-2.5 py-1 font-mono text-[0.56rem] tracking-[0.1em] text-tactical-amber uppercase">
                {formatAircraftVariantStatus(variant.status)}
              </span>
            </div>
            <div className="mt-6 flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
              <GitBranch aria-hidden="true" size={13} /> {variant.id}
            </div>
            <h3 className="font-display mt-2 text-2xl font-semibold">
              {variant.designation}
            </h3>
            <p className="mt-2 text-sm font-medium">{variant.name}</p>
            <p className="mt-4 text-sm leading-6 text-muted">
              {variant.notes ?? "No additional variant note is recorded."}
            </p>
            <p className="mt-5 border-t border-tactical/20 pt-4 font-mono text-[0.58rem] tracking-[0.12em] text-muted uppercase">
              First flight //{" "}
              {variant.firstFlight
                ? formatFirstFlight(variant.firstFlight)
                : "Not recorded"}
            </p>
          </li>
        ))}
      </ul>
    </ProfileSection>
  );
}
