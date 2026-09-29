import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
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

function buildThumbnails(options: ComparisonOptions): ComparisonThumbnails {
  const pick = (visual: ReturnType<typeof getAircraftVisual>) =>
    visual
      ? {
          credit: visual.credit,
          license: visual.license,
          objectPosition: visual.objectPosition,
          src: visual.src,
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
        pick(getRocketVisual(option.id)),
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
      <header className="pt-12 pb-8 lg:pt-12 lg:pb-10">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end lg:gap-16">
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

          <nav
            aria-label="Related sections"
            className="mt-14 flex flex-wrap gap-x-10 gap-y-2 border-t border-border-subtle pt-5"
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
