import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { listAircraft } from "@/features/aircraft/data";
import {
  formatAircraftMeasurement,
  formatAircraftRoles,
} from "@/features/aircraft/utils";
import { listRockets } from "@/features/rockets/data";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import {
  formatOrbitType,
  formatRocketMeasurement,
} from "@/features/rockets/utils";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import { VehicleRecordCard } from "@/features/vehicles/components/vehicle-record-card";
import { SectionHeading } from "@/features/home/components/section-heading";

/**
 * The vehicle registries, previewed on the homepage.
 *
 * The previous homepage never linked to `/aircraft` or `/rockets` at all —
 * four of its six calls to action pointed at `/engineering-lab` — so the
 * product's largest completed system was invisible from its front door.
 *
 * Cards are the finished `VehicleRecordCard` in its `compact` variant, not a
 * homepage-specific rebuild, so a visitor meets the same object here that they
 * will meet on the registries themselves.
 *
 * Four vehicles, not ten: one modern and one historic airframe, one modern and
 * one historic launch vehicle. That cross-section shows the breadth of the
 * registry without turning the homepage into the index.
 */
const FEATURED_AIRCRAFT = ["f-22-raptor", "sr-71-blackbird"] as const;
const FEATURED_ROCKETS = ["falcon-9", "saturn-v"] as const;

export function VehicleSystems() {
  const aircraft = listAircraft().filter((item) =>
    FEATURED_AIRCRAFT.includes(item.id as (typeof FEATURED_AIRCRAFT)[number]),
  );
  const rockets = listRockets().filter((item) =>
    FEATURED_ROCKETS.includes(item.id as (typeof FEATURED_ROCKETS)[number]),
  );

  return (
    <section
      aria-labelledby="vehicle-systems-title"
      className="border-b border-border-subtle py-20 sm:py-24 lg:py-28"
    >
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            description="Two registries of landmark vehicles, each documented from published engineering records with its sources and qualifiers kept intact."
            eyebrow="Vehicle systems"
            title="Aircraft and launch vehicles, on the record."
            titleId="vehicle-systems-title"
          />
          <div className="flex flex-wrap gap-3">
            <Link className="orbix-home-link" href="/aircraft">
              All aircraft <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
            <Link className="orbix-home-link" href="/rockets">
              All launch vehicles <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
          </div>
        </div>

        {/* Two rows, not one four-column mix. Aircraft use the landscape
            media frame and launch vehicles the portrait one, so putting all
            four in a single row would reproduce exactly the ragged,
            uneven-height grid the discovery phase removed. Each registry also
            keeps its own division accent. */}
        <div className="orbix-home-vehicles mt-14 flex flex-col gap-12">
          <div data-orbix-division="aircraft">
            <h3 className="orbix-profile-section__eyebrow">
              Aircraft registry
            </h3>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {aircraft.map((item) => (
                <VehicleRecordCard
                  classification={formatAircraftRoles(item.roles)}
                  description={item.description}
                  href={`/aircraft/${item.id}`}
                  key={item.id}
                  media={
                    <VehicleMediaFrame aspect="landscape">
                      <AircraftImage
                        aircraft={item}
                        fillContainer
                        imageClassName="saturate-[0.85]"
                        sizes="(max-width: 639px) 100vw, 45vw"
                      />
                    </VehicleMediaFrame>
                  }
                  name={item.name}
                  specs={[
                    {
                      label: "Maximum speed",
                      value: formatAircraftMeasurement(
                        item.performance.maxSpeed,
                      ).value,
                    },
                  ]}
                  variant="compact"
                />
              ))}
            </div>
          </div>

          <div data-orbix-division="space">
            <h3 className="orbix-profile-section__eyebrow">
              Launch vehicle registry
            </h3>
            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              {rockets.map((item) => (
                <VehicleRecordCard
                  classification={item.performance.supportedOrbits
                    .map(formatOrbitType)
                    .join(" · ")}
                  description={item.description}
                  href={`/rockets/${item.id}`}
                  key={item.id}
                  media={
                    <VehicleMediaFrame aspect="portrait">
                      <RocketImage
                        fillContainer
                        imageClassName="saturate-[0.85]"
                        rocket={item}
                        sizes="(max-width: 639px) 100vw, 45vw"
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
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
