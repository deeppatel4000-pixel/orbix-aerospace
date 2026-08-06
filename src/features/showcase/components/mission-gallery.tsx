import { ArrowUpRight, Eye, Focus, Gauge, Layers3 } from "lucide-react";
import Link from "next/link";

import {
  getOrbixEnvironmentLabel,
  OrbixEnvironmentBackdrop,
} from "@/components/brand/orbix-environment";
import { Container } from "@/components/layout/container";
import { ShowcaseSectionHeading } from "@/features/showcase/components/showcase-section-heading";
import { getShowcaseMissionEnvironment } from "@/features/showcase/data/mission-environments";
import type { ShowcaseMission } from "@/features/showcase/data/mission-showcase";

interface MissionGalleryProps {
  readonly missions: readonly ShowcaseMission[];
}

const detailGroups = [
  {
    icon: Eye,
    key: "availableVisualizations",
    title: "Visualization coverage",
  },
  {
    icon: Gauge,
    key: "analysisAvailability",
    title: "Analysis available",
  },
  {
    icon: Focus,
    key: "engineeringFocus",
    title: "Engineering focus",
  },
] as const;

export function MissionGallery({ missions }: MissionGalleryProps) {
  return (
    <section
      aria-labelledby="showcase-mission-gallery-title"
      className="relative overflow-hidden border-b border-border/70 bg-surface/20 py-24 sm:py-32"
      id="mission-gallery"
    >
      <Container>
        <ShowcaseSectionHeading
          description="Five typed educational presets demonstrate how ORBIX connects mission architecture, engineering analysis, technical visualization, and review. No values are generated for this gallery."
          eyebrow="Mission gallery"
          title="Start with a mission concept. Follow the systems it activates."
          titleId="showcase-mission-gallery-title"
        />

        <div className="mt-12 grid gap-5 xl:grid-cols-2">
          {missions.map((mission, index) => {
            const environment = getShowcaseMissionEnvironment(
              mission.preset.id,
            );

            return (
              <article
                className="orbix-premium-card orbix-premium-card--interactive group"
                key={mission.preset.id}
              >
                <div className="relative isolate aspect-[16/6] min-h-44 overflow-hidden border-b border-border">
                  <OrbixEnvironmentBackdrop
                    className="z-0"
                    sizes="(min-width: 1280px) 50vw, 100vw"
                    theme={environment}
                  />
                  <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5">
                    <span className="orbix-environment-label bg-background/65 backdrop-blur-md">
                      {getOrbixEnvironmentLabel(environment)}
                    </span>
                    <span className="font-mono text-[0.56rem] tracking-[0.14em] text-foreground/70 uppercase">
                      Original ORBIX visual
                    </span>
                  </div>
                </div>
                <div className="border-b border-border bg-surface/65 p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="font-mono text-[0.62rem] tracking-[0.16em] text-accent uppercase">
                        Mission 0{index + 1} · {mission.categoryLabel}
                      </p>
                      <h3 className="font-display mt-3 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                        {mission.preset.name}
                      </h3>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-accent/20 bg-accent/5 text-accent">
                      <Layers3 aria-hidden="true" size={18} />
                    </span>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
                    <span className="sr-only">Mission purpose: </span>
                    {mission.preset.description}
                  </p>

                  <div
                    className="mt-5 flex flex-wrap gap-2"
                    aria-label="Included systems"
                  >
                    {mission.includedSystems.map((system) => (
                      <span
                        className="border border-border bg-background/70 px-3 py-1.5 font-mono text-[0.6rem] tracking-[0.08em] text-foreground uppercase"
                        key={system}
                      >
                        {system}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid gap-px bg-border md:grid-cols-3">
                  {detailGroups.map((group) => (
                    <section
                      aria-labelledby={`${mission.preset.id}-${group.key}`}
                      className="bg-background p-5"
                      key={group.key}
                    >
                      <div className="flex items-center gap-2 text-accent">
                        <group.icon aria-hidden="true" size={15} />
                        <h4
                          className="font-mono text-[0.6rem] tracking-[0.12em] uppercase"
                          id={`${mission.preset.id}-${group.key}`}
                        >
                          {group.title}
                        </h4>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {mission[group.key].map((item) => (
                          <li
                            className="text-xs leading-5 text-muted"
                            key={item}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-border bg-surface/35 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    className="inline-flex min-h-11 items-center justify-center gap-2 bg-accent px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.08em] text-orbital uppercase transition-colors hover:bg-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
                    href={`/showcase-capture/${mission.preset.id}`}
                  >
                    Open capture view
                    <ArrowUpRight aria-hidden="true" size={16} />
                  </Link>
                  <Link
                    className="inline-flex min-h-11 items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                    href="/engineering-lab#mission-control-dashboard"
                  >
                    Explore Engineering Lab
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
