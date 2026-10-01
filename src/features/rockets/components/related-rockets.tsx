import { ButtonLink } from "@/components/ui/button-link";
import { RocketCard } from "@/features/rockets/components/rocket-card";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { Rocket } from "@/features/vehicles/types";

interface RelatedRocketsProps {
  /** Up to three other launch vehicles; never the current one. */
  rockets: readonly Rocket[];
}

/** Related vehicles (spec 11): up to three catalogue rows, then the registry. */
export function RelatedRockets({ rockets }: RelatedRocketsProps) {
  if (rockets.length === 0) return null;

  return (
    <VehicleProfileSection
      className="pb-0 sm:pb-0"
      id="related-rockets"
      title="Other launch vehicles"
    >
      <ul className="border-b border-border [&>li]:border-t [&>li]:border-border">
        {rockets.map((item) => (
          <li key={item.id}>
            <RocketCard
              layout="row"
              media="none"
              rocket={item}
              variant="compact"
            />
          </li>
        ))}
      </ul>
      <ButtonLink
        arrow="right"
        className="mt-8"
        href="/rockets"
        variant="tertiary"
      >
        Browse all launch vehicles
      </ButtonLink>
    </VehicleProfileSection>
  );
}
