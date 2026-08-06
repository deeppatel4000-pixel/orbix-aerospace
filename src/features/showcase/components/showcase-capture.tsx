import { ArrowLeft, Eye, Focus, Gauge, Layers3 } from "lucide-react";
import Link from "next/link";

import { OrbixBackground } from "@/components/brand/orbix-background";
import { OrbixEnvironmentBackdrop } from "@/components/brand/orbix-environment";
import { OrbixMark } from "@/components/brand/orbix-mark";
import { OrbixWordmark } from "@/components/brand/orbix-wordmark";
import type { ShowcaseMission } from "@/features/showcase/data/mission-showcase";
import { getShowcaseMissionEnvironment } from "@/features/showcase/data/mission-environments";

interface ShowcaseCaptureProps {
  readonly mission: ShowcaseMission;
}

const captureGroups = [
  {
    icon: Layers3,
    key: "includedSystems",
    title: "Mission systems",
  },
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

export function ShowcaseCapture({ mission }: ShowcaseCaptureProps) {
  return (
    <main
      aria-labelledby="capture-mission-title"
      className="fixed inset-0 z-[100] overflow-y-auto bg-background text-foreground"
    >
      <OrbixEnvironmentBackdrop
        className="fixed"
        theme={getShowcaseMissionEnvironment(mission.preset.id)}
      />
      <OrbixBackground className="fixed -z-10 opacity-65" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[100rem] flex-col px-5 py-5 sm:px-8 lg:px-12 lg:py-8">
        <header className="flex flex-col gap-5 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 items-center justify-center border border-accent/30 bg-accent/5 text-accent shadow-[0_0_30px_rgb(73_215_255/0.12)]">
              <OrbixMark className="h-8 w-8" />
            </span>
            <div>
              <OrbixWordmark className="h-8 w-32" />
              <p className="mt-1 font-mono text-[0.62rem] tracking-[0.15em] text-muted uppercase">
                Portfolio capture mode // authentic preset data
              </p>
            </div>
          </div>
          <Link
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-lg border border-border bg-surface/80 px-4 py-2 text-sm text-foreground transition-colors hover:border-accent/40 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
            href="/showcase#mission-gallery"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            Return to showcase
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(34rem,1.15fr)] lg:gap-16 lg:py-14">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
              {mission.categoryLabel} · Educational mission
            </p>
            <h1
              className="font-display mt-5 max-w-3xl text-5xl leading-[0.96] font-semibold tracking-[-0.055em] text-balance sm:text-6xl xl:text-7xl"
              id="capture-mission-title"
            >
              {mission.preset.name}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-muted">
              {mission.preset.description}
            </p>

            <div className="orbix-premium-card mt-10 bg-accent/5 p-5">
              <p className="font-mono text-[0.62rem] tracking-[0.16em] text-accent uppercase">
                Presentation boundary
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                This capture view presents the existing mission preset and its
                available ORBIX workspaces. It does not run analyses or create
                replacement engineering values.
              </p>
            </div>
          </div>

          <div className="orbix-premium-card backdrop-blur">
            <div className="flex items-center justify-between gap-5 border-b border-border bg-background/55 px-6 py-4">
              <div>
                <p className="font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
                  Mission systems index
                </p>
                <p className="mt-1 text-sm text-foreground">
                  Source: typed educational preset catalog
                </p>
              </div>
              <span className="rounded-full border border-accent/25 bg-accent/5 px-3 py-1.5 font-mono text-[0.58rem] tracking-[0.12em] text-accent uppercase">
                Capture ready
              </span>
            </div>

            <div className="grid gap-px bg-border sm:grid-cols-2">
              {captureGroups.map((group) => (
                <section
                  aria-labelledby={`capture-${group.key}`}
                  className="min-h-44 bg-surface p-6"
                  key={group.key}
                >
                  <div className="flex items-center gap-3 text-accent">
                    <group.icon aria-hidden="true" size={17} />
                    <h2
                      className="font-mono text-[0.65rem] tracking-[0.14em] uppercase"
                      id={`capture-${group.key}`}
                    >
                      {group.title}
                    </h2>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {mission[group.key].map((item) => (
                      <li
                        className="flex items-start gap-3 text-sm leading-5 text-foreground"
                        key={item}
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex flex-col gap-2 border-t border-border py-5 font-mono text-[0.6rem] tracking-[0.12em] text-muted uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>Advanced Aerospace Engineering Laboratory</span>
          <span>Presentation view // No synthetic telemetry</span>
        </footer>
      </div>
    </main>
  );
}
