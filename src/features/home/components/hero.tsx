import { ButtonLink, PhotoHero } from "@/components/ui";
import { listAircraft } from "@/features/aircraft/data";
import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import { listRockets } from "@/features/rockets/data";

/**
 * Homepage hero (design v3, spec 7 and 11, Home).
 *
 * The H1, a one-sentence lead and two actions on solid ground, then NASA's
 * SR-71B photograph as a full-bleed, hard-edged band with a catalogue
 * caption under it. Nothing is set on the photograph. The photograph, alt
 * text and credit come from the typed record in `aircraft-visuals.ts`, so
 * the attribution travels with the file.
 *
 * Crop: the airframe runs from about 9 percent (left fin tip) to 77 percent
 * (nose) of the frame height. From 64rem the band is 16:9 rather than the
 * default 21:9, which keeps the whole airframe in frame apart from the tip
 * of the upper fin, cut hard at the top edge. Below that the 3:2 band shows
 * the aircraft whole.
 */
const HERO_AIRCRAFT_ID = "sr-71-blackbird";

export function Hero() {
  const vehicleCount = listAircraft().length + listRockets().length;
  const visual = getAircraftVisual(HERO_AIRCRAFT_ID);

  // From 64rem an asymmetric lockup: the H1 runs across the full text
  // measure, so it sets in two lines ("Aerospace engineering, / explained
  // with real vehicles."), and the lead and actions share one row under it.
  // That keeps the text block short and brings the photograph up into the
  // first screen (the band starts about 450px down at 1440 by 900). The
  // hero's 46rem lede cap is lifted for this ([&>div>div]:max-w-none).
  const content = (
    <>
      <h1 className="orbix-h1 max-w-[12em]" id="home-title">
        Aerospace engineering, explained with real vehicles.
      </h1>
      <div className="mt-6 grid gap-8 lg:mt-8 lg:grid-cols-12 lg:items-end lg:gap-6">
        <p className="orbix-lead lg:col-span-6">
          Records of {vehicleCount} aircraft and launch vehicles, a side-by-side
          comparison, and calculators for orbital mechanics, compressible flow
          and atmospheric entry.
        </p>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 lg:col-span-6 lg:justify-end">
          <ButtonLink
            arrow="right"
            href="/aircraft"
            size="lg"
            variant="primary"
          >
            Browse the aircraft registry
          </ButtonLink>
          <ButtonLink arrow="right" href="/engineering-lab" variant="tertiary">
            Open the Engineering Lab
          </ButtonLink>
        </div>
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
    <PhotoHero
      aria-labelledby="home-title"
      caption="SR-71B Blackbird over the Sierra Nevada"
      className="[&>div>div]:max-w-none lg:[&>figure>div]:aspect-video lg:[&>figure>div]:max-h-none"
      layout="band"
      visual={{ ...visual, objectPosition: "50% 40%" }}
    >
      {content}
    </PhotoHero>
  );
}
