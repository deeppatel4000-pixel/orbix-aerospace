import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/features/home/components/section-heading";

/**
 * Engineering and analysis: `/compare` and `/engineering-lab`.
 *
 * This is the section that separates ORBIX from a vehicle catalogue, so it
 * names real capabilities only. Every calculator listed below exists in
 * `src/features/engineering-lab/calculators/` with its own unit tests — no
 * CFD, no live telemetry, no simulation, no AI analysis.
 *
 * Rendered as two editorial columns on the page ground rather than tiled
 * cards: the two destinations are different kinds of work, not two items in a
 * grid.
 */
const CAPABILITIES = [
  {
    body: "Place vehicles side by side with published units, qualifiers and configurations preserved. Unavailable data is never treated as zero.",
    href: "/compare",
    label: "Open the comparison engine",
    title: "Compare published characteristics",
  },
  {
    body: "Work directly with the governing equations — lift, drag, Mach number, standard atmosphere, thrust-to-weight, Hohmann transfer — using explicit units and stated assumptions.",
    href: "/engineering-lab",
    label: "Open the Engineering Laboratory",
    title: "Run the engineering analysis",
  },
] as const;

export function AnalysisPreview() {
  return (
    <section
      aria-labelledby="analysis-preview-title"
      className="border-b border-border-subtle py-20 sm:py-24 lg:py-28"
      data-orbix-division="engineering"
    >
      <Container>
        <SectionHeading
          description="ORBIX is not only a record of vehicles. The same dataset feeds a comparison engine and a laboratory of independently tested aerospace calculators."
          eyebrow="Engineering and analysis"
          title="The numbers behind the vehicles."
          titleId="analysis-preview-title"
        />

        <div className="mt-14 grid gap-12 border-t border-border-subtle pt-12 lg:grid-cols-2 lg:gap-20">
          {CAPABILITIES.map((item) => (
            <div key={item.href}>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-4 max-w-prose leading-8 text-muted">
                {item.body}
              </p>
              <Link className="orbix-home-link mt-6" href={item.href}>
                {item.label} <ArrowUpRight aria-hidden="true" size={15} />
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
