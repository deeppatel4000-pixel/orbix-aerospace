import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { listLearningAreas } from "@/features/learn/data";
import { SectionHeading } from "@/features/home/components/section-heading";

/**
 * Research and learning: `/learn`.
 *
 * The pathway titles are read from the same dataset the Learn route renders,
 * so this preview cannot drift out of step with the real content or invent a
 * pathway that does not exist.
 *
 * Presented as a numbered index rather than lesson cards — the ordering is
 * real (the pathways build on one another), and a research contents page is a
 * more honest frame for this material than a course catalogue.
 */
export function ResearchPreview() {
  const areas = listLearningAreas();

  return (
    <section
      aria-labelledby="research-preview-title"
      className="border-b border-border-subtle py-20 sm:py-24 lg:py-28"
      data-orbix-division="research"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <div>
            <SectionHeading
              description="Six pathways connect the physics to the calculators that implement it, so a result can always be traced back to the equation behind it."
              eyebrow="Research and learning"
              title="Understand the engineering, not just the numbers."
              titleId="research-preview-title"
            />
            <Link className="orbix-home-link mt-8" href="/learn">
              Open the learning pathways{" "}
              <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
          </div>

          <ol className="flex flex-col">
            {areas.map((area, index) => (
              <li
                className="flex gap-6 border-t border-border-subtle py-4 last:border-b"
                key={area.id}
              >
                <span className="orbix-data orbix-data--sm pt-1 text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-muted-strong leading-7">
                  {area.title}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
