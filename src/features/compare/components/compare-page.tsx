import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { RegistrationMarks } from "@/components/ui/registration-marks";
import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import {
  ComparisonControls,
  type ComparisonThumbnails,
} from "@/features/compare/components/comparison-controls";
import { ComparisonEmptyState } from "@/features/compare/components/comparison-empty-state";
import { ComparisonTable } from "@/features/compare/components/comparison-table";
import type {
  ComparisonCategory,
  ComparisonOptions,
  ComparisonResult,
} from "@/features/compare/types";
import { getRocketVisual } from "@/features/rockets/data/rocket-visuals";

interface ComparePageProps {
  category: ComparisonCategory;
  options: ComparisonOptions;
  result: ComparisonResult;
}

/**
 * `object-position` for the 4:5 launch vehicle tiles from 64rem only. The
 * shared `objectPosition` frames the vehicles for the small side thumbnail;
 * in the taller five-across tile it put the SLS nose tip about 5px under
 * the photo edge. These keep at least 16px of sky above every nose.
 */
const rocketTilePositions: Readonly<Record<string, string>> = {
  "space-launch-system": "55% 0%",
};
const ROCKET_TILE_POSITION = "50% 15%";

function buildThumbnails(options: ComparisonOptions): ComparisonThumbnails {
  const pick = (
    visual: ReturnType<typeof getAircraftVisual>,
    wideTilePosition?: string,
  ) =>
    visual
      ? {
          credit: visual.credit,
          license: visual.license,
          objectPosition: visual.objectPosition,
          src: visual.src,
          wideTilePosition,
        }
      : undefined;

  return {
    aircraft: Object.fromEntries(
      options.aircraft.map((option) => [
        option.id,
        pick(getAircraftVisual(option.id)),
      ]),
    ),
    rockets: Object.fromEntries(
      options.rockets.map((option) => [
        option.id,
        pick(
          getRocketVisual(option.id),
          rocketTilePositions[option.id] ?? ROCKET_TILE_POSITION,
        ),
      ]),
    ),
  };
}

/**
 * `/compare` (design v2, spec 9): a typographic hero on the blueprint grid,
 * a category control and selectable vehicle tiles, then the comparison as a
 * spec sheet or an empty state. The whole state lives in the URL, so a
 * comparison can be bookmarked or shared.
 */
export function ComparePage({ category, options, result }: ComparePageProps) {
  const canCompare = result.vehicles.length >= 2;
  const thumbnails = buildThumbnails(options);

  return (
    <>
      {/* The minor blueprint grid is for hero sections only (spec 6). The
          registration marks frame the hero like a drawing sheet: their
          ticks sit on the container's text edges, so the eyebrow, the H1
          and the lead share the left edge of every section below. */}
      <header className="orbix-blueprint-minor relative py-4 sm:py-6 lg:py-5">
        <Container>
          <div className="relative grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end lg:gap-16 lg:py-7">
            <RegistrationMarks />
            <div>
              <Eyebrow>Published figures, side by side</Eyebrow>
              <h1 className="orbix-display mt-6 text-foreground">
                Compare <span className="orbix-accent-word">vehicles</span>
              </h1>
            </div>
            <p className="orbix-lead lg:pb-1">
              Put two or three aircraft, or two or three launch vehicles, side
              by side. Aircraft and launch vehicles are compared separately
              because their published figures describe different things.
            </p>
          </div>
        </Container>
      </header>

      <section
        aria-labelledby="compare-selection-title"
        className="border-t border-border-subtle pt-8 pb-14 sm:pt-12 sm:pb-16 lg:pt-8"
      >
        <Container>
          <ComparisonControls
            category={category}
            options={options}
            selectedIds={result.vehicles.map((vehicle) => vehicle.id)}
            thumbnails={thumbnails}
          />
        </Container>
      </section>

      <section
        aria-labelledby="compare-results-title"
        className="scroll-mt-20 border-t border-border-subtle py-14 sm:py-20"
        id="comparison-results"
      >
        <Container>
          <h2 className="orbix-h2 text-foreground" id="compare-results-title">
            Spec sheet
          </h2>

          <div className="mt-8">
            {canCompare ? (
              <ComparisonTable result={result} />
            ) : (
              <ComparisonEmptyState result={result} />
            )}
          </div>

          {/* Below 64rem the rules list above ends on its own hairline, so
              the links follow it without a second rule. */}
          <nav
            aria-label="Related sections"
            className="mt-10 flex flex-wrap gap-x-10 gap-y-2 lg:mt-14 lg:border-t lg:border-border-subtle lg:pt-5"
          >
            <ButtonLink
              arrow="right"
              href="/engineering-lab"
              variant="tertiary"
            >
              Open the Engineering Lab
            </ButtonLink>
            <ButtonLink arrow="right" href="/learn" variant="tertiary">
              Read the Learn pathways
            </ButtonLink>
          </nav>
        </Container>
      </section>
    </>
  );
}
