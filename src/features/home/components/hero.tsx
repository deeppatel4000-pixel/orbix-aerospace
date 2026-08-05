import {
  ArrowDownRight,
  ArrowRight,
  Binary,
  Orbit,
  Plane,
  Radar,
  Rocket,
  Sigma,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { siteConfig } from "@/config/site";

const consoleSystems = [
  { icon: Plane, label: "Flight systems", status: "READY" },
  { icon: Rocket, label: "Launch systems", status: "READY" },
  { icon: Sigma, label: "Engineering methods", status: "STAGED" },
  { icon: Binary, label: "Learning modules", status: "STAGED" },
] as const;

const missionDisciplines = [
  "Aerodynamics",
  "Propulsion",
  "Orbital mechanics",
  "Systems engineering",
] as const;

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border/70">
      <div
        aria-hidden="true"
        className="technical-grid absolute inset-0 -z-20 [mask-image:linear-gradient(to_bottom,black,transparent_92%)] opacity-60"
      />
      <div
        aria-hidden="true"
        className="absolute -top-40 left-[62%] -z-10 h-[42rem] w-[42rem] rounded-full border border-accent/10 shadow-[0_0_160px_rgb(87_215_255/0.08)]"
      />

      <Container className="grid min-h-[calc(100svh-4.5rem)] items-center gap-14 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.75fr)] lg:gap-20 lg:py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-3 border-l-2 border-accent pl-3 font-mono text-xs tracking-[0.18em] text-accent uppercase">
            <Orbit aria-hidden="true" size={15} strokeWidth={1.8} />
            {siteConfig.wordmark} {"//"} {siteConfig.tagline}
          </div>

          <h1 className="mt-7 text-5xl leading-[0.96] font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl xl:text-[5rem]">
            Read the engineering behind
            <span className="block text-accent">flight and launch.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
            {siteConfig.description}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink className="w-full sm:w-auto" href="#featured-vehicles">
              Explore featured vehicles
              <ArrowDownRight aria-hidden="true" size={17} />
            </ButtonLink>
            <ButtonLink
              className="w-full sm:w-auto"
              href="#engineering-modules"
              variant="secondary"
            >
              View engineering modules
              <ArrowRight aria-hidden="true" size={17} />
            </ButtonLink>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border/70 pt-5">
            <span className="font-mono text-[0.68rem] tracking-[0.18em] text-muted uppercase">
              Mission scope
            </span>
            <span className="text-sm text-foreground">Aircraft</span>
            <span className="text-sm text-foreground">Launch vehicles</span>
            <span className="text-sm text-foreground">
              Engineering fundamentals
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:justify-self-end">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface/90 shadow-2xl shadow-black/35 backdrop-blur">
            <div className="flex items-center justify-between border-b border-border bg-background/45 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_10px_rgb(87_215_255/0.8)]" />
                <p className="font-mono text-[0.68rem] tracking-[0.18em] text-muted uppercase">
                  Systems console // ORBIX-01
                </p>
              </div>
              <span className="font-mono text-[0.65rem] text-accent">
                ONLINE
              </span>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-[0.82fr_1.18fr] sm:p-6">
              <div className="technical-grid relative flex min-h-48 items-center justify-center overflow-hidden rounded-xl border border-border bg-background/55 sm:min-h-full">
                <div
                  aria-hidden="true"
                  className="absolute h-40 w-40 rounded-full border border-accent/20"
                />
                <div
                  aria-hidden="true"
                  className="absolute h-24 w-24 rotate-45 border border-dashed border-accent/25"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-5 top-1/2 h-px bg-accent/15"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-y-5 left-1/2 w-px bg-accent/15"
                />
                <Radar
                  aria-hidden="true"
                  className="relative text-accent drop-shadow-[0_0_16px_rgb(87_215_255/0.28)]"
                  size={56}
                  strokeWidth={1.25}
                />
                <span className="absolute bottom-3 left-3 font-mono text-[0.6rem] tracking-[0.14em] text-muted uppercase">
                  Learning space
                </span>
              </div>

              <div>
                <p className="font-mono text-[0.65rem] tracking-[0.16em] text-muted uppercase">
                  Curriculum systems
                </p>
                <ul className="mt-3 space-y-2">
                  {consoleSystems.map((system) => (
                    <li
                      className="flex items-center gap-3 rounded-lg border border-border/80 bg-background/40 px-3 py-3"
                      key={system.label}
                    >
                      <system.icon
                        aria-hidden="true"
                        className="shrink-0 text-accent"
                        size={16}
                        strokeWidth={1.7}
                      />
                      <span className="min-w-0 flex-1 text-xs font-medium text-foreground">
                        {system.label}
                      </span>
                      <span className="font-mono text-[0.58rem] tracking-wider text-muted">
                        {system.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <dl className="grid grid-cols-2 border-t border-border bg-background/35">
              <div className="border-r border-border px-5 py-4">
                <dt className="font-mono text-[0.6rem] tracking-[0.16em] text-muted uppercase">
                  Operating mode
                </dt>
                <dd className="mt-1.5 text-sm font-medium">Education</dd>
              </div>
              <div className="px-5 py-4">
                <dt className="font-mono text-[0.6rem] tracking-[0.16em] text-muted uppercase">
                  Platform phase
                </dt>
                <dd className="mt-1.5 text-sm font-medium">Foundation</dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>

      <div className="border-t border-border/70 bg-background/45">
        <Container>
          <ul
            aria-label={`${siteConfig.name} engineering disciplines`}
            className="grid grid-cols-2 divide-x divide-y divide-border/70 sm:grid-cols-4 sm:divide-y-0"
          >
            {missionDisciplines.map((discipline, index) => (
              <li
                className="flex items-center gap-3 px-3 py-4 first:pl-0 sm:px-5"
                key={discipline}
              >
                <span className="font-mono text-[0.6rem] text-accent">
                  0{index + 1}
                </span>
                <span className="text-xs text-muted sm:text-sm">
                  {discipline}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </section>
  );
}
