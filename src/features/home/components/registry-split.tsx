import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/ui";
import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { getAircraftById } from "@/features/aircraft/data";
import {
  getAircraftVisual,
  type AircraftVisual,
} from "@/features/aircraft/data/aircraft-visuals";
import { formatAircraftMeasurement } from "@/features/aircraft/utils";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import { getRocketById } from "@/features/rockets/data";
import { getRocketVisual } from "@/features/rockets/data/rocket-visuals";
import { formatRocketMeasurement } from "@/features/rockets/utils";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import { VehicleRecordCard } from "@/features/vehicles/components/vehicle-record-card";

/**
 * The two registries as an asymmetric split (design v2, spec 9, Home).
 *
 * From 64rem the heading block and the large aircraft card (F-22, 16:10)
 * share the left seven columns, and the launch vehicle card (Saturn V, 3:4)
 * runs the full height of the section in the right five, so the rocket is
 * clearly the tall column. Both cards end on the same line, which puts their
 * spec rows side by side. From 48rem the cards sit 6/6 under the heading (a
 * 5-column rocket card is too narrow for its spec labels to stay on one line)
 * and the photo credit sits under the shorter aircraft card, beside the tall
 * rocket card, like an editorial caption. The caption row is 1fr so the
 * tall card's extra height lands there and the caption stays 24px under the
 * aircraft card. Below 48rem everything stacks.
 *
 * Each card is the shared `VehicleRecordCard` and opens its registry. The
 * spec row names the pictured vehicle and gives one figure for it from the
 * repository, through the same formatters the registries use. The credit
 * line names both photographs and points to /credits.
 */
const PICTURED_AIRCRAFT_ID = "f-22-raptor";
const PICTURED_ROCKET_ID = "saturn-v";

/** "Public domain (U.S. government work)" reads as "public domain". */
function shortLicense(license: AircraftVisual["license"]) {
  return license.startsWith("Public domain") ? "public domain" : license;
}

/**
 * "34.5 MN" as value and unit, so the card sets the unit muted at 0.7em
 * like every other figure. Mach is written before the number and stays
 * whole.
 */
function splitUnit(text: string) {
  if (text.startsWith("Mach")) return { value: text };
  const space = text.lastIndexOf(" ");
  return space === -1
    ? { value: text }
    : { unit: text.slice(space + 1), value: text.slice(0, space) };
}

export function RegistrySplit() {
  const aircraft = getAircraftById(PICTURED_AIRCRAFT_ID);
  const rocket = getRocketById(PICTURED_ROCKET_ID);
  const aircraftVisual = getAircraftVisual(PICTURED_AIRCRAFT_ID);
  const rocketVisual = getRocketVisual(PICTURED_ROCKET_ID);

  const credits = [
    aircraft && aircraftVisual
      ? `${aircraft.name}, ${aircraftVisual.credit}, ${shortLicense(aircraftVisual.license)}`
      : null,
    rocket && rocketVisual
      ? `${rocket.name}, ${rocketVisual.credit}, ${shortLicense(rocketVisual.license)}`
      : null,
  ].filter((credit): credit is string => credit !== null);

  return (
    <section aria-labelledby="home-registries-title" className="orbix-section">
      <Container>
        <div className="grid gap-6 md:grid-cols-12 md:grid-rows-[auto_auto_1fr] lg:grid-rows-none">
          <div className="md:col-span-12 lg:col-span-7">
            <Eyebrow>The registries</Eyebrow>
            <h2 className="orbix-h2 mt-4" id="home-registries-title">
              Aircraft and launch vehicles, on the record.
            </h2>
            <p className="mt-5 max-w-[52ch] text-pretty text-text-secondary">
              Each record keeps its published figures with their units and
              qualifiers, alongside propulsion, dimensions and engineering
              notes.
            </p>
          </div>

          {aircraft ? (
            <div
              className="md:col-span-6 md:row-start-2 md:self-start lg:col-span-7 lg:col-start-1 lg:row-start-2"
              data-division="aircraft"
            >
              <VehicleRecordCard
                classification="Aircraft registry"
                href="/aircraft"
                media={
                  <VehicleMediaFrame aspect="wide">
                    <AircraftImage
                      aircraft={aircraft}
                      decorative
                      fillContainer
                      sizes="(min-width: 1152px) 660px, (min-width: 1024px) 58vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </VehicleMediaFrame>
                }
                name="Aircraft"
                specs={[
                  { label: "Pictured", value: aircraft.name },
                  {
                    label: "Maximum speed",
                    ...splitUnit(
                      formatAircraftMeasurement(aircraft.performance.maxSpeed)
                        .value,
                    ),
                  },
                ]}
                summary="SR-71 to F-35: dimensions, engines, performance."
              />
            </div>
          ) : null}

          {rocket ? (
            <div
              className="md:col-span-6 md:row-span-2 md:row-start-2 md:self-start lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:self-stretch"
              data-division="space"
            >
              <VehicleRecordCard
                classification="Launch vehicle registry"
                href="/rockets"
                media={
                  <VehicleMediaFrame aspect="tall">
                    <RocketImage
                      decorative
                      fillContainer
                      rocket={rocket}
                      sizes="(min-width: 1152px) 470px, (min-width: 1024px) 42vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </VehicleMediaFrame>
                }
                name="Launch vehicles"
                specs={[
                  { label: "Pictured", value: rocket.name },
                  {
                    label: "Liftoff thrust",
                    ...splitUnit(
                      formatRocketMeasurement(rocket.performance.liftoffThrust)
                        .value,
                    ),
                  },
                ]}
                summary="Saturn V to Starship: stages, thrust, payload."
              />
            </div>
          ) : null}

          {credits.length > 0 ? (
            <p className="max-w-[80ch] text-sm text-pretty text-text-muted md:col-span-6 md:col-start-1 md:row-start-3 md:self-start lg:col-span-7 lg:row-start-3">
              Photos: {credits.join("; ")}. All sources on the{" "}
              <Link className="orbix-link" href="/credits">
                image credits page
              </Link>
              .
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
