import { ButtonLink } from "@/components/ui/button-link";
import { RocketCard } from "@/features/rockets/components/rocket-card";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { Rocket } from "@/features/vehicles/types";

interface RelatedRocketsProps {
  /** Up to three other launch vehicles; never the current one. */
  rockets: readonly Rocket[];
}

/** Related vehicles (spec 9): up to three card links, then the registry. */
export function RelatedRockets({ rockets }: RelatedRocketsProps) {
  if (rockets.length === 0) return null;

  return (
    <VehicleProfileSection
      // The layout's bottom padding (6rem from 40rem) is the only space
      // between the last link and the footer.
      className="pb-0 sm:pb-0"
      id="related-rockets"
      layout="wide"
      title="Other launch vehicles"
    >
      {/*
       * Below 48rem one row of 16rem cards that scrolls sideways and snaps,
       * the next card showing at the edge: three full-width cards stacked
       * after the profile were about 2,100px of scroll on a phone. Each
       * card is a link, so tabbing to one scrolls it into view. Three
       * columns from 48rem.
       */}
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:snap-none md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
        {rockets.map((item) => (
          <li className="w-64 flex-none snap-start md:w-auto" key={item.id}>
            <RocketCard rocket={item} variant="compact" />
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
