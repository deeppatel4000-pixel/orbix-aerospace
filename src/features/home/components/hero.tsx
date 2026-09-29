import { OrbixWordmark } from "@/components/brand/orbix-wordmark";
import { ButtonLink, PhotoHero } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { listAircraft } from "@/features/aircraft/data";
import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import { listRockets } from "@/features/rockets/data";

/**
 * Homepage hero (design v2, spec 9, Home).
 *
 * A full-bleed `PhotoHero` over NASA's SR-71B photograph, with the wordmark,
 * the site tagline as the display H1 (second half in the space accent), one
 * lead paragraph that says plainly what ORBIX is, and a primary plus a
 * tertiary action. The photograph, alt text and credit line all come from the
 * typed record in `aircraft-visuals.ts`, so the attribution travels with the
 * file.
 */
const HERO_AIRCRAFT_ID = "sr-71-blackbird";

export function Hero() {
  const vehicleCount = listAircraft().length + listRockets().length;
  const visual = getAircraftVisual(HERO_AIRCRAFT_ID);

  const content = (
    <>
      {/* The wordmark names the site; the tagline below is the page H1. */}
      <OrbixWordmark
        alt={siteConfig.wordmark}
        className="hidden w-[clamp(10rem,16vw,14rem)] md:block"
        priority
        sizes="(min-width: 1400px) 224px, (min-width: 768px) 16vw, 160px"
      />
      <h1 className="orbix-h1 text-text-primary md:mt-8" id="home-title">
        Aerospace engineering, explained with{" "}
        <span className="orbix-accent-word">real vehicles.</span>
      </h1>
      <p className="orbix-lead mt-6">
        ORBIX is an educational project about aircraft, launch vehicles and the
        engineering behind them. It has records of {vehicleCount} landmark
        vehicles, a side-by-side comparison, and calculators for orbital
        mechanics, compressible flow and atmospheric entry.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
        <ButtonLink arrow="right" href="/aircraft" size="lg" variant="primary">
          Browse the aircraft registry
        </ButtonLink>
        <ButtonLink arrow="right" href="/engineering-lab" variant="tertiary">
          Open the Engineering Lab
        </ButtonLink>
      </div>
    </>
  );

  if (!visual) {
    return (
      <section
        aria-labelledby="home-title"
        className="mx-auto w-full max-w-[72rem] px-4 py-24 sm:px-6 lg:px-8"
      >
        {content}
      </section>
    );
  }

  return (
    <PhotoHero aria-labelledby="home-title" visual={visual}>
      {content}
    </PhotoHero>
  );
}
