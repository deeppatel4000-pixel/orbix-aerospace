import { BookOpenCheck, Command, Orbit, ShieldCheck } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ShowcaseSectionHeading } from "@/features/showcase/components/showcase-section-heading";

const featuredSystems = [
  {
    code: "SYS-01",
    description:
      "A command-center interface that organizes mission telemetry, visualization, replay, and technical review.",
    icon: Command,
    items: ["Workspace navigation", "Telemetry presentation", "Mission replay"],
    title: "Mission Control",
  },
  {
    code: "SYS-02",
    description:
      "Typed orbital workflows connect circular-orbit context to transfers, budgets, and inclination changes.",
    icon: Orbit,
    items: ["Transfer analysis", "Delta-v budgeting", "Plane changes"],
    title: "Orbital Engineering",
  },
  {
    code: "SYS-03",
    description:
      "Vehicle-level workflows connect atmospheric entry, thermal history, TPS sizing, and configuration comparisons.",
    icon: ShieldCheck,
    items: ["Reentry evaluation", "TPS analysis", "Vehicle comparison"],
    title: "Spacecraft Systems",
  },
  {
    code: "SYS-04",
    description:
      "Completed engineering outputs become accessible reports, briefings, design reviews, and demonstrations.",
    icon: BookOpenCheck,
    items: ["Mission reports", "Engineering briefings", "Guided demos"],
    title: "Presentation Layer",
  },
] as const;

export function EngineeringSystemsOverview() {
  return (
    <section
      aria-labelledby="showcase-systems-title"
      className="py-24 sm:py-32"
    >
      <Container>
        <ShowcaseSectionHeading
          align="center"
          description="ORBIX demonstrates technical depth by connecting focused engineering modules instead of collapsing every discipline into one opaque workflow."
          eyebrow="Featured systems"
          title="Four layers. One engineering narrative."
          titleId="showcase-systems-title"
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {featuredSystems.map((system) => (
            <article
              className="orbix-premium-card orbix-premium-card--interactive group p-6 sm:p-7"
              key={system.code}
            >
              <div
                aria-hidden="true"
                className="absolute top-0 right-0 h-28 w-28 rounded-full bg-accent/5 blur-3xl transition-colors group-hover:bg-accent/10"
              />
              <div className="flex items-start justify-between gap-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/20 bg-accent/5 text-accent">
                  <system.icon aria-hidden="true" size={20} strokeWidth={1.7} />
                </span>
                <span className="font-mono text-[0.62rem] tracking-[0.14em] text-muted">
                  {system.code}
                </span>
              </div>
              <h3 className="mt-6 text-2xl font-semibold tracking-[-0.025em]">
                {system.title}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                {system.description}
              </p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-3">
                {system.items.map((item) => (
                  <li
                    className="rounded-lg border border-border bg-background/45 px-3 py-2.5 text-xs text-foreground"
                    key={item}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
