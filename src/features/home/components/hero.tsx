import { Command, FlaskConical, Orbit } from "lucide-react";

import { OrbixBackground } from "@/components/brand/orbix-background";
import { OrbixEnvironmentBackdrop } from "@/components/brand/orbix-environment";
import { OrbixMissionArray } from "@/components/brand/orbix-mission-array";
import { OrbixWordmark } from "@/components/brand/orbix-wordmark";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";

const disciplines = [
  ["01", "Orbital mechanics"],
  ["02", "Mission systems"],
  ["03", "Atmospheric entry"],
  ["04", "Thermal protection"],
] as const;

export function Hero() {
  return (
    <section className="orbix-brand-glow relative isolate overflow-hidden border-b border-accent/15">
      <OrbixEnvironmentBackdrop priority theme="orbital" />
      <OrbixBackground className="-z-10 opacity-75" />

      <Container className="grid min-h-[calc(100svh-5.5rem)] items-center gap-16 py-20 lg:grid-cols-[minmax(0,1.12fr)_minmax(24rem,0.68fr)] lg:gap-24 lg:py-24">
        <div className="relative max-w-4xl">
          <div className="orbix-kicker flex items-center gap-3">
            <Orbit aria-hidden="true" size={15} strokeWidth={1.6} />
            Mission design // Engineering analysis // Visualization
          </div>

          <div className="mt-6 flex items-end gap-4">
            <h1 aria-label="ORBIX" className="w-full max-w-[42rem]">
              <OrbixWordmark className="w-full" priority />
            </h1>
            <span
              className="mb-1 hidden h-2 w-2 rounded-full bg-telemetry shadow-[0_0_16px_var(--telemetry-green)] sm:block"
              aria-hidden="true"
            />
          </div>

          <p className="font-display mt-4 max-w-3xl text-2xl leading-tight font-medium tracking-[-0.025em] text-foreground sm:text-3xl lg:text-[2.65rem]">
            Advanced Aerospace Engineering Laboratory
          </p>

          <p className="mt-7 max-w-[42rem] text-lg leading-8 text-muted sm:text-xl">
            <span className="font-medium text-foreground">
              Design missions.
            </span>{" "}
            Analyze spacecraft. Explore orbital systems through transparent,
            educational engineering workflows built for serious technical
            learning.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              className="w-full sm:w-auto"
              href="/engineering-lab#mission-control-dashboard"
            >
              <Command aria-hidden="true" size={17} />
              Launch Mission Control
            </ButtonLink>
            <ButtonLink
              className="w-full sm:w-auto"
              href="/engineering-lab"
              variant="secondary"
            >
              <FlaskConical aria-hidden="true" size={17} />
              Explore Engineering Lab
            </ButtonLink>
          </div>

          <div className="mt-14 grid max-w-[42rem] grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-border/75 bg-border/70 sm:grid-cols-4">
            {disciplines.map(([code, label]) => (
              <div className="bg-background/88 px-4 py-4" key={code}>
                <span className="font-mono text-[0.58rem] tracking-[0.14em] text-accent">
                  {code}
                </span>
                <p className="mt-1.5 text-xs leading-5 text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-lg lg:mx-0 lg:justify-self-end">
          <OrbixMissionArray />
        </div>
      </Container>

      <div className="border-t border-border/70 bg-surface/45">
        <Container className="flex flex-col gap-2 py-3 font-mono text-[0.6rem] tracking-[0.14em] text-muted uppercase sm:flex-row sm:items-center sm:justify-between">
          <span>Platform status // Public educational release</span>
          <span className="inline-flex items-center gap-2 text-telemetry">
            <span className="h-1.5 w-1.5 rounded-full bg-telemetry" />
            Systems available
          </span>
        </Container>
      </div>
    </section>
  );
}
