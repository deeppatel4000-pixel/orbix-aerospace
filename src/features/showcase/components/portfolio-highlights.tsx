import { Blocks, GraduationCap, ShieldCheck, TestTube2 } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ShowcaseSectionHeading } from "@/features/showcase/components/showcase-section-heading";

const highlights = [
  {
    description:
      "Feature domains, pure calculators, orchestration layers, and rendering components remain independently inspectable.",
    icon: Blocks,
    label: "Modular architecture",
  },
  {
    description:
      "Physics stays in pure TypeScript while React receives typed outputs and owns only interaction or communication.",
    icon: ShieldCheck,
    label: "Engineering separation",
  },
  {
    description:
      "Vitest regression coverage, TypeScript, ESLint, formatting, CI, and production builds protect the portfolio release.",
    icon: TestTube2,
    label: "Automated validation",
  },
  {
    description:
      "Every simplified model is framed by units, assumptions, limitations, and an explicit educational-use boundary.",
    icon: GraduationCap,
    label: "Educational modeling",
  },
] as const;

export function PortfolioHighlights() {
  return (
    <section
      aria-labelledby="showcase-portfolio-highlights-title"
      className="orbix-section border-y border-border/70 bg-surface/20"
    >
      <Container>
        <ShowcaseSectionHeading
          align="center"
          description="ORBIX is a portfolio study in both aerospace learning and maintainable full-stack engineering. The system is designed to make technical boundaries as visible as the interface."
          eyebrow="Portfolio highlights"
          title="Technical depth that is easy to inspect."
          titleId="showcase-portfolio-highlights-title"
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {highlights.map((highlight, index) => (
            <article
              className="orbix-premium-card orbix-premium-card--interactive p-6"
              key={highlight.label}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/5 text-accent">
                  <highlight.icon aria-hidden="true" size={18} />
                </span>
                <span className="font-mono text-[0.6rem] tracking-[0.14em] text-muted">
                  0{index + 1}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-semibold">{highlight.label}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                {highlight.description}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
