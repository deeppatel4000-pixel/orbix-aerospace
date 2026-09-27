import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui";
import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { listAircraft } from "@/features/aircraft/data";
import {
  formatAircraftMeasurement,
  formatAircraftRoles,
} from "@/features/aircraft/utils";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import { listRockets } from "@/features/rockets/data";
import {
  formatOrbitType,
  formatRocketMeasurement,
} from "@/features/rockets/utils";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import { VehicleRecordCard } from "@/features/vehicles/components/vehicle-record-card";

/**
 * "Featured records" (spec 14, Home, step 4).
 *
 * Three record cards using the shared `VehicleRecordCard`, so a visitor meets
 * the same object here as on the registries. The section heading and registry
 * links sit in their own column beside the cards from 1280px, rather than a
 * centred heading over a row of cards.
 *
 * Saturn V is left out because it already appears as the intro photograph.
 * All three cards use the landscape frame so the row shares one media height.
 */
const FEATURED_AIRCRAFT = ["f-22-raptor", "b-2-spirit"] as const;
const FEATURED_ROCKETS = ["space-launch-system"] as const;

const CARD_SIZES = "(min-width: 1280px) 240px, (min-width: 640px) 30vw, 100vw";

export function FeaturedRecords() {
  const aircraft = FEATURED_AIRCRAFT.flatMap((id) =>
    listAircraft().filter((item) => item.id === id),
  );
  const rockets = FEATURED_ROCKETS.flatMap((id) =>
    listRockets().filter((item) => item.id === id),
  );

  return (
    <section aria-labelledby="home-featured-title">
      <Container className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <h2 className="orbix-h2" id="home-featured-title">
            Featured records
          </h2>
          <p className="mt-3 max-w-[60ch] text-text-secondary">
            Two aircraft and one launch vehicle from the registries. Each card
            opens the full record with specifications, propulsion and
            engineering notes.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <ButtonLink href="/aircraft" variant="link">
              All aircraft
              <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
            <ButtonLink href="/rockets" variant="link">
              All launch vehicles
              <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
          </div>
        </div>

        <ul className="grid gap-6 sm:grid-cols-3 xl:col-span-8">
          {aircraft.map((item) => (
            <li key={item.id}>
              <VehicleRecordCard
                classification={formatAircraftRoles(item.roles)}
                description={item.description}
                href={`/aircraft/${item.id}`}
                media={
                  <VehicleMediaFrame aspect="landscape">
                    <AircraftImage
                      aircraft={item}
                      fillContainer
                      sizes={CARD_SIZES}
                    />
                  </VehicleMediaFrame>
                }
                name={item.name}
                specs={[
                  {
                    label: "Maximum speed",
                    value: formatAircraftMeasurement(item.performance.maxSpeed)
                      .value,
                  },
                ]}
                variant="compact"
              />
            </li>
          ))}
          {rockets.map((item) => (
            <li key={item.id}>
              <VehicleRecordCard
                classification={item.performance.supportedOrbits
                  .map(formatOrbitType)
                  .join(", ")}
                description={item.description}
                href={`/rockets/${item.id}`}
                media={
                  <VehicleMediaFrame aspect="landscape">
                    <RocketImage
                      fillContainer
                      rocket={item}
                      sizes={CARD_SIZES}
                    />
                  </VehicleMediaFrame>
                }
                name={item.name}
                specs={[
                  {
                    label: "Liftoff thrust",
                    value: formatRocketMeasurement(
                      item.performance.liftoffThrust,
                    ).value,
                  },
                ]}
                variant="compact"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
