import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { ComparisonControls } from "@/features/compare/components/comparison-controls";
import { ComparisonEmptyState } from "@/features/compare/components/comparison-empty-state";
import { ComparisonTable } from "@/features/compare/components/comparison-table";
import type {
  ComparisonCategory,
  ComparisonOptions,
  ComparisonResult,
} from "@/features/compare/types";

interface ComparePageProps {
  category: ComparisonCategory;
  options: ComparisonOptions;
  result: ComparisonResult;
}

/**
 * `/compare` (design v3, spec 11): a typographic hero on solid ground, the
 * vehicle choice as open tiles of traced outlines whose checkbox is the
 * only boxed element,
 * then the comparison as an open table or a plain-text empty state. The
 * whole state lives in the URL, so a comparison can be bookmarked or shared.
 */
export function ComparePage({ category, options, result }: ComparePageProps) {
  const canCompare = result.vehicles.length >= 2;

  return (
    <>
      <header className="pt-12 pb-10 sm:pt-16 sm:pb-12 lg:pt-16 lg:pb-10">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end lg:gap-16">
            <h1 className="orbix-display text-foreground">Compare vehicles</h1>
            <p className="orbix-lead lg:pb-1">
              Two or three aircraft or launch vehicles side by side. Each kind
              is compared only with its own, since their published figures
              describe different things.
            </p>
          </div>
        </Container>
      </header>

      <section
        aria-labelledby="compare-selection-title"
        className="pb-14 sm:pb-16"
      >
        <Container>
          <ComparisonControls
            category={category}
            options={options}
            selectedIds={result.vehicles.map((vehicle) => vehicle.id)}
          />
        </Container>
      </section>

      <section
        aria-labelledby="compare-results-title"
        className="scroll-mt-20 pb-14 sm:pb-20"
        id="comparison-results"
      >
        {/* The rule above the spec sheet runs at the content width, like
            every section rule; only the header and footer rules bleed. */}
        <Container>
          <div className="border-t border-border-subtle pt-14 sm:pt-20">
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
              className="mt-14 flex flex-wrap gap-x-10 gap-y-2 lg:mt-20"
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
          </div>
        </Container>
      </section>
    </>
  );
}
