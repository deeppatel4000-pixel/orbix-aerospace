import { Braces, Eye, Layers3, Scale, TestTube2 } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { ShowcaseSectionHeading } from "@/features/showcase/components/showcase-section-heading";

const technologies = [
  "Next.js 15",
  "React 19",
  "TypeScript 5",
  "Tailwind CSS 4",
  "Vitest",
  "GitHub Actions",
] as const;

const principles = [
  {
    description:
      "Calculators own equations, analysis layers own composition, and React owns presentation.",
    icon: Layers3,
    title: "Separate responsibilities",
  },
  {
    description:
      "Typed inputs, explicit SI units, assumptions, and limitations stay close to every model.",
    icon: Scale,
    title: "Expose engineering context",
  },
  {
    description:
      "The platform explains how systems connect instead of presenting isolated final answers.",
    icon: Eye,
    title: "Make reasoning visible",
  },
] as const;

export function TechnologyAndPhilosophy() {
  return (
    <section
      aria-labelledby="showcase-philosophy-title"
      className="orbix-section relative isolate overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="technical-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,transparent,black,transparent)] opacity-30"
      />
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div>
            <ShowcaseSectionHeading
              description="ORBIX is built as both an engineering learning environment and a software architecture study in trustworthy technical communication."
              eyebrow="Technology and philosophy"
              title="Professional presentation, transparent models."
              titleId="showcase-philosophy-title"
            />

            <div className="mt-8 flex flex-wrap gap-2">
              {technologies.map((technology) => (
                <span
                  className="rounded-full border border-border bg-surface/75 px-3.5 py-2 font-mono text-[0.65rem] tracking-[0.08em] text-foreground"
                  key={technology}
                >
                  {technology}
                </span>
              ))}
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <ButtonLink href="/engineering-lab">
                Explore the platform
                <Braces aria-hidden="true" size={17} />
              </ButtonLink>
              <ButtonLink href="/learn" variant="secondary">
                View learning roadmap
                <TestTube2 aria-hidden="true" size={17} />
              </ButtonLink>
            </div>
          </div>

          <ol className="orbix-premium-card">
            {principles.map((principle, index) => (
              <li
                className="grid gap-5 border-b border-border p-6 last:border-b-0 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-start sm:p-7"
                key={principle.title}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background/55 text-accent">
                  <principle.icon
                    aria-hidden="true"
                    size={20}
                    strokeWidth={1.7}
                  />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{principle.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {principle.description}
                  </p>
                </div>
                <span className="font-mono text-xs text-muted">
                  0{index + 1}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
