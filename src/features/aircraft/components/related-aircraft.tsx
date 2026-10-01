import { ButtonLink } from "@/components/ui/button-link";
import { AircraftCard } from "@/features/aircraft/components/aircraft-card";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { Aircraft } from "@/features/vehicles/types";

interface RelatedAircraftProps {
  /** Up to three other aircraft; never the current one. */
  aircraft: readonly Aircraft[];
}

/** Related vehicles (spec 11): up to three catalogue rows, then the registry. */
export function RelatedAircraft({ aircraft }: RelatedAircraftProps) {
  if (aircraft.length === 0) return null;

  return (
    <VehicleProfileSection
      className="pb-0 sm:pb-0"
      id="related-aircraft"
      title="Other aircraft"
    >
      <ul className="border-b border-border [&>li]:border-t [&>li]:border-border">
        {aircraft.map((item) => (
          <li key={item.id}>
            <AircraftCard
              aircraft={item}
              layout="row"
              media="none"
              variant="compact"
            />
          </li>
        ))}
      </ul>
      <ButtonLink
        arrow="right"
        className="mt-8"
        href="/aircraft"
        variant="tertiary"
      >
        Browse all aircraft
      </ButtonLink>
    </VehicleProfileSection>
  );
}
