import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button-link";
import { RocketCard } from "@/features/rockets/components/rocket-card";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { Rocket } from "@/features/vehicles/types";

interface RelatedRocketsProps {
  /** Up to three other launch vehicles; never the current one. */
  rockets: readonly Rocket[];
}

/** Related vehicles (spec 14): up to three card links, then the registry. */
export function RelatedRockets({ rockets }: RelatedRocketsProps) {
  if (rockets.length === 0) return null;

  return (
    <VehicleProfileSection id="related-rockets" title="Other launch vehicles">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rockets.map((item) => (
          <li key={item.id}>
            <RocketCard rocket={item} variant="compact" />
          </li>
        ))}
      </ul>
      <ButtonLink className="mt-6" href="/rockets" variant="link">
        Browse all launch vehicles
        <ArrowRight aria-hidden="true" size={16} />
      </ButtonLink>
    </VehicleProfileSection>
  );
}
