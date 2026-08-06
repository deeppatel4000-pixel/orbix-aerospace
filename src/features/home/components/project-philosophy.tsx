import { BookOpenCheck, Eye, Scale } from "lucide-react";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/features/home/components/section-heading";

const principles = [
  {
    description:
      "Begin with real systems and the engineering questions they invite.",
    icon: Eye,
    number: "01",
    title: "Observe the system",
  },
  {
    description:
      "Show assumptions, units, relationships, and limitations alongside every result.",
    icon: Scale,
    number: "02",
    title: "Expose the tradeoffs",
  },
  {
    description:
      "Connect each vehicle and tool to concepts learners can carry forward.",
    icon: BookOpenCheck,
    number: "03",
    title: "Build understanding",
  },
] as const;

export function ProjectPhilosophy() {
  return (
    <section
      aria-labelledby="project-philosophy-title"
      className="orbix-section relative isolate overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="technical-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,transparent,black,transparent)] opacity-35"
      />
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-20">
          <SectionHeading
            description="Orbix is a transparent learning environment: serious enough for engineering students, approachable enough for a first encounter with the field."
            eyebrow="Project philosophy"
            title="Make the reasoning visible."
            titleId="project-philosophy-title"
          />

          <div className="orbix-premium-card">
            <div className="flex items-center justify-between border-b border-border bg-background/40 px-5 py-3.5">
              <span className="font-mono text-[0.65rem] tracking-[0.16em] text-muted uppercase">
                Learning protocol // ORBIX-PHI-01
              </span>
              <span className="font-mono text-[0.62rem] text-accent">
                ACTIVE
              </span>
            </div>

            <ol className="divide-y divide-border">
              {principles.map((principle) => (
                <li
                  className="grid gap-5 p-6 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-start sm:p-7"
                  key={principle.number}
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
                    {principle.number}
                  </span>
                </li>
              ))}
            </ol>

            <div className="border-t border-border bg-accent/5 px-6 py-5 sm:px-7">
              <p className="max-w-2xl text-sm leading-6 text-foreground">
                The platform explains the method, not only the answer.
                Educational clarity remains the primary design constraint.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
