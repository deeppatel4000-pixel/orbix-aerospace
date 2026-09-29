import { ButtonLink } from "@/components/ui/button-link";
import { AircraftCard } from "@/features/aircraft/components/aircraft-card";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { Aircraft } from "@/features/vehicles/types";

interface RelatedAircraftProps {
  /** Up to three other aircraft; never the current one. */
  aircraft: readonly Aircraft[];
}

/** Related vehicles (spec 9): up to three card links, then the registry. */
export function RelatedAircraft({ aircraft }: RelatedAircraftProps) {
  if (aircraft.length === 0) return null;

  return (
    <VehicleProfileSection
      id="related-aircraft"
      layout="wide"
      title="Other aircraft"
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {aircraft.map((item) => (
          <li key={item.id}>
            <AircraftCard aircraft={item} variant="compact" />
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
