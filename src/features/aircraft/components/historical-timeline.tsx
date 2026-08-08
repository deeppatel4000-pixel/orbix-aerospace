import { CalendarClock, PlaneTakeoff } from "lucide-react";

import { ProfileSection } from "@/features/aircraft/components/profile-section";
import {
  formatAircraftVariantStatus,
  formatFirstFlight,
} from "@/features/aircraft/utils";
import type { Aircraft } from "@/features/vehicles/types";

interface HistoricalTimelineProps {
  aircraft: Aircraft;
}

export function HistoricalTimeline({ aircraft }: HistoricalTimelineProps) {
  return (
    <ProfileSection
      description="A source-bound chronology assembled from the program and variant dates recorded in the current dataset."
      eyebrow="09 // Program chronology"
      id="historical-timeline"
      title="Historical Timeline"
    >
      <ol className="relative space-y-5 before:absolute before:top-5 before:bottom-5 before:left-[1.35rem] before:w-px before:bg-gradient-to-b before:from-tactical-amber/60 before:via-tactical/40 before:to-transparent">
        <li className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4">
          <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-tactical-amber/45 bg-[#080d0c] text-tactical-amber">
            <PlaneTakeoff aria-hidden="true" size={17} />
          </span>
          <article className="orbix-frame border-tactical/25 bg-[#080d0c]/90 p-5 sm:p-6">
            <p className="font-mono text-[0.6rem] tracking-[0.14em] text-tactical-amber uppercase">
              {formatFirstFlight(aircraft.firstFlight)}
            </p>
            <h3 className="font-display mt-2 text-xl font-semibold">
              Program first flight
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {aircraft.name} entered its recorded flight-test chronology.
            </p>
          </article>
        </li>

        {aircraft.variants.map((variant) => (
          <li
            className="relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4"
            key={variant.id}
          >
            <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-tactical/35 bg-[#080d0c] text-muted">
              <CalendarClock aria-hidden="true" size={17} />
            </span>
            <article className="orbix-frame border-tactical/20 bg-[#080d0c]/80 p-5 sm:p-6">
              <p className="font-mono text-[0.6rem] tracking-[0.14em] text-muted uppercase">
                {variant.firstFlight
                  ? formatFirstFlight(variant.firstFlight)
                  : "Date not recorded"}
              </p>
              <h3 className="font-display mt-2 text-xl font-semibold">
                {variant.designation} {"//"} {variant.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Recorded status: {formatAircraftVariantStatus(variant.status)}.
              </p>
            </article>
          </li>
        ))}
      </ol>
    </ProfileSection>
  );
}
