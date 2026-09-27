import Link from "next/link";

import { Container } from "@/components/layout/container";
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
 * `/compare` (spec 14): page intro, a selection form, then either the
 * comparison table or an empty state. The whole state lives in the URL, so a
 * comparison can be bookmarked or shared.
 */
export function ComparePage({ category, options, result }: ComparePageProps) {
  const canCompare = result.vehicles.length >= 2;

  return (
    <>
      <header className="border-b border-border pt-12 pb-8">
        <Container wide>
          <h1 className="orbix-h1 text-foreground">Compare vehicles</h1>
          <p className="orbix-lead mt-4">
            Put two or three aircraft or launch vehicles side by side. Values
            are shown as published, in their original units.
          </p>
        </Container>
      </header>

      <section aria-labelledby="compare-selection-title" className="py-12">
        <Container wide>
          <h2 className="orbix-h2 text-foreground" id="compare-selection-title">
            Choose vehicles
          </h2>
          <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
            Aircraft and launch vehicles are compared separately because their
            published figures describe different things.
          </p>

          <ComparisonControls
            category={category}
            options={options}
            selectedIds={result.vehicles.map((vehicle) => vehicle.id)}
          />
        </Container>
      </section>

      <section
        aria-labelledby="compare-results-title"
        className="border-t border-border py-12 sm:pb-16"
        id="comparison-results"
      >
        <Container wide>
          <h2 className="orbix-h2 text-foreground" id="compare-results-title">
            Comparison
          </h2>
          <p className="mt-2 max-w-[68ch] text-sm leading-6 text-muted">
            The table does not score vehicles or pick a winner. A value missing
            from the ORBIX dataset reads &ldquo;Not published&rdquo; and is
            never treated as zero. Bars under a figure show its size relative to
            the largest value in the same row, and only appear when every value
            in that row uses the same unit.
          </p>

          <div className="mt-6">
            {canCompare ? (
              <ComparisonTable result={result} />
            ) : (
              <ComparisonEmptyState
                category={category}
                vehicles={result.vehicles}
              />
            )}
          </div>

          <p className="mt-8 max-w-[68ch] text-sm leading-6 text-muted">
            To work with the numbers behind these figures, open the{" "}
            <Link className="orbix-link" href="/engineering-lab">
              Engineering Lab
            </Link>
            . For background on each quantity, read the{" "}
            <Link className="orbix-link" href="/learn">
              Learn pathways
            </Link>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
