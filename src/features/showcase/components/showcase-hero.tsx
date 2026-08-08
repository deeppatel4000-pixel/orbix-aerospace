import { ArrowRight, GitBranch, Orbit } from "lucide-react";

import { OrbixBackground } from "@/components/brand/orbix-background";
import { OrbixEnvironmentBackdrop } from "@/components/brand/orbix-environment";
import { OrbixMark } from "@/components/brand/orbix-mark";
import { OrbixWordmark } from "@/components/brand/orbix-wordmark";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";

const missionFlow = [
  { label: "Mission inputs", status: "CONFIGURE" },
  { label: "Engineering analysis", status: "COMPUTE" },
  { label: "Mission reports", status: "DOCUMENT" },
  { label: "Visualization systems", status: "COMMUNICATE" },
  { label: "Design review", status: "PRESENT" },
] as const;

const platformSignals = [
  "Pure TypeScript physics",
  "Typed mission contracts",
  "Server-first architecture",
  "Automated validation",
] as const;

export function ShowcaseHero() {
  return (
    <section className="orbix-brand-glow relative isolate overflow-hidden border-b border-accent/15">
      <OrbixEnvironmentBackdrop priority theme="orbital" />
      <OrbixBackground className="-z-10 opacity-75" />

      <Container className="grid min-h-[calc(100svh-5.5rem)] items-center gap-16 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.78fr)] lg:gap-24 lg:py-24">
        <div className="max-w-3xl">
          <div className="orbix-kicker inline-flex items-center gap-3">
            <Orbit aria-hidden="true" size={15} strokeWidth={1.8} />
            ORBIX // Portfolio showcase
          </div>

          <OrbixWordmark
            className="mt-5 w-full max-w-[30rem]"
            priority
            sizes="(max-width: 640px) calc(100vw - 2.5rem), 480px"
          />

          <h1 className="font-display mt-3 text-5xl leading-[0.94] font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl xl:text-[5rem]">
            Mission archive.
            <span className="mt-2 block text-accent">Engineering in view.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
            ORBIX connects orbital mechanics, atmospheric entry, vehicle
            evaluation, thermal protection, technical reporting, and mission
            visualization inside one educational engineering environment.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink className="w-full sm:w-auto" href="/engineering-lab">
              Enter Engineering Lab
              <ArrowRight aria-hidden="true" size={17} />
            </ButtonLink>
            <ButtonLink
              className="w-full sm:w-auto"
              href="https://github.com/deeppatel4000-pixel/orbix-aerospace"
              target="_blank"
              rel="noreferrer"
              variant="secondary"
            >
              View source on GitHub
              <GitBranch aria-hidden="true" size={17} />
            </ButtonLink>
          </div>

          <dl className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            {platformSignals.map((signal, index) => (
              <div className="bg-background/90 px-4 py-4" key={signal}>
                <dt className="font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
                  Platform signal 0{index + 1}
                </dt>
                <dd className="mt-1.5 text-sm font-medium text-foreground">
                  {signal}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:justify-self-end">
          <div className="orbix-premium-card backdrop-blur">
            <div className="flex items-center justify-between border-b border-border bg-background/45 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgb(87_215_255/0.8)]" />
                <p className="font-mono text-[0.68rem] tracking-[0.18em] text-muted uppercase">
                  Engineering pipeline
                </p>
              </div>
              <OrbixMark className="h-8 w-8" />
            </div>

            <ol className="divide-y divide-border p-2">
              {missionFlow.map((stage, index) => (
                <li
                  className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-3 py-4"
                  key={stage.label}
                >
                  <span className="flex h-8 w-8 items-center justify-center border border-accent/25 bg-accent/5 font-mono text-[0.65rem] text-accent">
                    0{index + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {stage.label}
                  </span>
                  <span className="font-mono text-[0.58rem] tracking-wider text-muted">
                    {stage.status}
                  </span>
                </li>
              ))}
            </ol>

            <div className="border-t border-border bg-gradient-to-r from-accent/[0.07] to-plasma/[0.04] px-5 py-4">
              <p className="text-sm leading-6 text-foreground">
                Each layer consumes typed outputs from the layer before it.
                Presentation never becomes the source of engineering truth.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
