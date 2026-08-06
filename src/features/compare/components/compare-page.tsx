import { Database, Scale, ShieldCheck } from "lucide-react";

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

export function ComparePage({ category, options, result }: ComparePageProps) {
  const categoryLabel =
    category === "aircraft" ? "aircraft" : "launch vehicles";
  const canCompare = result.vehicles.length >= 2;

  return (
    <>
      <header className="orbix-brand-glow relative isolate overflow-hidden border-b border-border/70 py-24 sm:py-32">
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_92%)] opacity-60"
        />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div className="max-w-4xl">
              <p className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
                <Scale aria-hidden="true" size={16} strokeWidth={1.7} />
                Engineering workspace // Comparison
              </p>
              <h1 className="font-display mt-6 text-5xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl">
                Comparison Engine
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted sm:text-xl">
                Place aerospace vehicles side by side while preserving the
                published units, qualifiers, configurations, and engineering
                context in the Orbix dataset.
              </p>
            </div>

            <aside className="orbix-premium-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Database aria-hidden="true" size={19} strokeWidth={1.7} />
                </span>
                <div>
                  <p className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                    Active registry
                  </p>
                  <p className="mt-1 text-sm font-semibold capitalize">
                    {categoryLabel}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                <span className="text-sm text-muted">Available profiles</span>
                <span className="font-mono text-2xl text-accent">
                  {options[category].length}
                </span>
              </div>
            </aside>
          </div>
        </Container>
      </header>

      <div>
        <section
          aria-labelledby="comparison-controls-title"
          className="py-16 sm:py-20"
        >
          <Container>
            <div className="mb-8 max-w-3xl">
              <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
                01 // Select profiles
              </p>
              <h2
                className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
                id="comparison-controls-title"
              >
                Configure the comparison
              </h2>
              <p className="mt-4 text-base leading-7 text-muted">
                Choose one vehicle category, then select up to three profiles.
                Aircraft and rockets remain separate because their engineering
                characteristics are not interchangeable.
              </p>
            </div>

            <ComparisonControls
              category={category}
              options={options}
              selectedIds={result.vehicles.map((vehicle) => vehicle.id)}
            />
          </Container>
        </section>

        <section
          aria-labelledby="comparison-results-title"
          className="border-t border-border py-16 sm:py-20"
        >
          <Container>
            <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">
                  02 // Engineering matrix
                </p>
                <h2
                  className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl"
                  id="comparison-results-title"
                >
                  Published characteristics
                </h2>
              </div>
              <div className="flex max-w-md items-start gap-3 rounded-xl border border-border bg-surface/55 p-4">
                <ShieldCheck
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-accent"
                  size={18}
                />
                <p className="text-xs leading-5 text-muted">
                  Values are displayed without scoring or inferred winners.
                  Unavailable data is never treated as zero.
                </p>
              </div>
            </div>

            {canCompare ? (
              <ComparisonTable result={result} />
            ) : (
              <ComparisonEmptyState
                category={category}
                vehicles={result.vehicles}
              />
            )}
          </Container>
        </section>
      </div>
    </>
  );
}
