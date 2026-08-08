import { ArrowLeft, GitCompareArrows } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import type { Aircraft } from "@/features/vehicles/types";

interface AircraftProfileCtaProps {
  aircraft: Aircraft;
}

export function AircraftProfileCta({ aircraft }: AircraftProfileCtaProps) {
  return (
    <section
      aria-labelledby="aircraft-dossier-next-step"
      className="border-t border-tactical/25 py-16 sm:py-20"
    >
      <div className="orbix-frame orbix-carbon relative overflow-hidden border-tactical/30 bg-[#080d0c]/90 p-7 sm:p-10">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-tactical-amber/8 blur-3xl"
        />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="font-mono text-[0.62rem] tracking-[0.18em] text-tactical-amber uppercase">
              Dossier review complete
            </p>
            <h2
              className="font-display mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl"
              id="aircraft-dossier-next-step"
            >
              Continue the aircraft study.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              Return to the aircraft registry or place {aircraft.name} into the
              existing ORBIX comparison workflow.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/aircraft" variant="secondary">
              <ArrowLeft aria-hidden="true" size={16} /> Back to Explorer
            </ButtonLink>
            <ButtonLink
              href={`/compare?category=aircraft&vehicles=${aircraft.id}`}
            >
              <GitCompareArrows aria-hidden="true" size={16} /> Compare aircraft
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
