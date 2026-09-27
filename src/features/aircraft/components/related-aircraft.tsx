import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { AircraftCard } from "@/features/aircraft/components/aircraft-card";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { Aircraft } from "@/features/vehicles/types";

interface RelatedAircraftProps {
  /** Up to three other aircraft; never the current one. */
  aircraft: readonly Aircraft[];
}

/** Related vehicles (spec 14): up to three card links, then the registry. */
export function RelatedAircraft({ aircraft }: RelatedAircraftProps) {
  if (aircraft.length === 0) return null;

  return (
    <VehicleProfileSection id="related-aircraft" title="Other aircraft">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {aircraft.map((item) => (
          <li key={item.id}>
            <AircraftCard
              aircraft={item}
              sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 22rem"
              variant="compact"
            />
          </li>
        ))}
      </ul>
      <ButtonLink className="mt-6" href="/aircraft" variant="link">
        Browse all aircraft
        <ArrowRight aria-hidden="true" size={16} />
      </ButtonLink>
    </VehicleProfileSection>
  );
}
