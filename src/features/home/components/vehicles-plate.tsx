import Image from "next/image";
import { Fragment } from "react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui";
import { creditLine, licenceLabel } from "@/components/ui/photo-hero";
import { listAircraft } from "@/features/aircraft/data";
import { listRockets } from "@/features/rockets/data";
import { getSitePhoto } from "@/features/vehicles/data/gallery";

/** The preloaded comparison (v4 plan section 4.4): SR-71, F-22, B-2. */
const COMPARE_IDS = ["sr-71-blackbird", "f-22-raptor", "b-2-spirit"] as const;

/**
 * The vehicles section (v4 plan section 4.4): one photo plate, used nowhere
 * else on the site (the `home-vehicles` slot of the photo slot map), with
 * its catalog caption on the ground, one sentence, and links to both
 * registries and a preloaded comparison. The vehicle counts and names come
 * from the registries.
 *
 * The plate is 3:2 and at most about 36rem wide (563 CSS px at 1440). The
 * photograph is scaled 1.8 times about the jet, which is small in the full
 * frame, so the drawn image is at most about 65rem (1,013 CSS px, 2,027
 * device px at DPR 2) and the 2880 px file is never enlarged. `sizes`
 * gives that drawn width, not the plate width.
 */
export function VehiclesPlate() {
  const photo = getSitePhoto("home-vehicles");
  const licence = licenceLabel(photo.license);
  const aircraft = listAircraft();
  const rocketCount = listRockets().length;
  const compareNames = COMPARE_IDS.map(
    (id) => aircraft.find((vehicle) => vehicle.id === id)?.name ?? id,
  );
  // Each name is kept on one line, so "B-2 Spirit" never breaks at the
  // hyphen on a phone.
  const compareLabel = (
    <>
      Compare{" "}
      {compareNames.map((name, index) => (
        <Fragment key={name}>
          {index === 0
            ? ""
            : index === compareNames.length - 1
              ? " and "
              : ", "}
          <span className="whitespace-nowrap">{name}</span>
        </Fragment>
      ))}
    </>
  );

  return (
    <section
      aria-labelledby="home-vehicles-title"
      className="border-t border-border-subtle"
    >
      <Container className="grid gap-10 py-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end lg:gap-x-14">
        <figure className="orbix-figure m-0 min-w-0">
          <div className="relative aspect-[3/2] overflow-hidden">
            <Image
              alt={photo.alt}
              className="origin-[51%_48%] scale-[1.8] object-cover saturate-[0.9]"
              fill
              sizes="(min-width: 72rem) 65rem, (min-width: 64rem) 94vw, 180vw"
              src={photo.src}
              style={{ objectPosition: photo.objectPosition }}
            />
          </div>
          <figcaption className="orbix-caption">
            {photo.caption} {creditLine(photo.credit)}.{" "}
            <a
              aria-label={licence.isShortened ? licence.full : undefined}
              href={photo.licenseUrl}
              rel="noopener noreferrer license"
              title={licence.isShortened ? licence.full : undefined}
            >
              {licence.short}
            </a>
            .{" "}
            <a href={photo.sourceUrl} rel="noopener noreferrer">
              Source file
            </a>
            .
          </figcaption>
        </figure>

        <div className="min-w-0 lg:pb-10">
          <h2 className="orbix-h2" id="home-vehicles-title">
            Aircraft and rockets
          </h2>
          <p className="mt-5 max-w-[44ch] text-pretty text-text-secondary">
            ORBIX has records of {aircraft.length} aircraft and {rocketCount}{" "}
            launch vehicles.
          </p>
          <ul className="mt-6 flex flex-col items-start gap-1">
            <li>
              <ButtonLink arrow="right" href="/aircraft" variant="tertiary">
                Aircraft
              </ButtonLink>
            </li>
            <li>
              <ButtonLink arrow="right" href="/rockets" variant="tertiary">
                Rockets
              </ButtonLink>
            </li>
            <li>
              <ButtonLink
                arrow="right"
                href={`/compare?category=aircraft&vehicles=${COMPARE_IDS.join(",")}`}
                variant="tertiary"
              >
                {compareLabel}
              </ButtonLink>
            </li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
