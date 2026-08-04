import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Factory,
  Globe2,
  Layers3,
  Rocket as RocketIcon,
  Tags,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { ArchitecturePanel } from "@/features/rockets/components/architecture-panel";
import { EngineeringNotesPanel } from "@/features/rockets/components/engineering-notes-panel";
import { PerformancePanel } from "@/features/rockets/components/performance-panel";
import { ProfileSection } from "@/features/rockets/components/profile-section";
import { PropulsionPanel } from "@/features/rockets/components/propulsion-panel";
import { formatRocketFirstFlight } from "@/features/rockets/utils";
import type { Rocket } from "@/features/vehicles/types";

interface RocketProfileProps {
  rocket: Rocket;
}

const profileNavigation = [
  { href: "#overview", label: "Overview" },
  { href: "#architecture", label: "Architecture" },
  { href: "#propulsion", label: "Propulsion" },
  { href: "#performance", label: "Performance" },
  { href: "#engineering-notes", label: "Engineering Notes" },
] as const;

export function RocketProfile({ rocket }: RocketProfileProps) {
  return (
    <article>
      <header className="relative isolate overflow-hidden border-b border-border/70 py-12 sm:py-16 lg:py-20">
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_95%)] opacity-55"
        />
        <Container>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <li>
                <Link className="transition-colors hover:text-accent" href="/">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} />
              </li>
              <li>
                <Link
                  className="transition-colors hover:text-accent"
                  href="/rockets"
                >
                  Rockets
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} />
              </li>
              <li aria-current="page" className="text-foreground">
                {rocket.name}
              </li>
            </ol>
          </nav>

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end">
            <div className="max-w-4xl">
              <p className="flex items-center gap-3 font-mono text-xs tracking-[0.18em] text-accent uppercase">
                <RocketIcon aria-hidden="true" size={16} />
                Rocket profile // {rocket.id}
              </p>
              <h1 className="mt-6 text-5xl leading-none font-semibold tracking-[-0.055em] text-balance sm:text-6xl lg:text-7xl">
                {rocket.name}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-muted sm:text-xl">
                {rocket.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                {rocket.performance.supportedOrbits.map((orbit) => (
                  <span
                    className="rounded-full border border-accent/20 bg-accent/8 px-3 py-1.5 text-xs font-medium text-accent"
                    key={orbit}
                  >
                    {orbit}
                  </span>
                ))}
              </div>
            </div>

            <div className="technical-grid relative flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface/75">
              <div
                aria-hidden="true"
                className="absolute h-44 w-44 rounded-full border border-accent/15"
              />
              <div
                aria-hidden="true"
                className="absolute h-36 w-20 rounded-full border border-dashed border-accent/20"
              />
              <RocketIcon
                aria-hidden="true"
                className="relative text-accent drop-shadow-[0_0_24px_rgb(87_215_255/0.24)]"
                size={78}
                strokeWidth={1.05}
              />
              <span className="absolute right-4 bottom-4 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                Vehicle visual pending
              </span>
            </div>
          </div>
        </Container>
      </header>

      <div className="sticky top-18 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <Container>
          <nav aria-label="Rocket profile sections" className="overflow-x-auto">
            <ul className="flex min-w-max items-center gap-1 py-3">
              {profileNavigation.map((item, index) => (
                <li key={item.href}>
                  <a
                    className="inline-flex min-h-10 items-center rounded-full px-3.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-accent"
                    href={item.href}
                  >
                    <span className="mr-2 font-mono text-[0.6rem] text-accent">
                      0{index + 1}
                    </span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </div>

      <Container>
        <ProfileSection
          description="Vehicle identity, program origin, first integrated flight, and recorded architecture scope."
          eyebrow="01 // Identity"
          id="overview"
          title="Overview"
        >
          <div className="rounded-2xl border border-border bg-surface/65">
            <dl className="grid sm:grid-cols-2">
              <div className="border-b border-border p-5 sm:border-r sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <Factory aria-hidden="true" size={14} />
                  Manufacturer
                </dt>
                <dd className="mt-3 text-sm font-medium">
                  {rocket.manufacturer}
                </dd>
              </div>
              <div className="border-b border-border p-5 sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <Globe2 aria-hidden="true" size={14} />
                  Country
                </dt>
                <dd className="mt-3 text-sm font-medium">
                  {rocket.country.name} ({rocket.country.isoCode})
                </dd>
              </div>
              <div className="border-b border-border p-5 sm:border-r sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <CalendarDays aria-hidden="true" size={14} />
                  First integrated flight
                </dt>
                <dd className="mt-3 text-sm font-medium">
                  {formatRocketFirstFlight(rocket.firstFlight)}
                </dd>
              </div>
              <div className="border-b border-border p-5 sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <Tags aria-hidden="true" size={14} />
                  Vehicle category
                </dt>
                <dd className="mt-3 text-sm font-medium">Launch vehicle</dd>
              </div>
            </dl>

            <div className="p-5 sm:p-6">
              <p className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                <Layers3 aria-hidden="true" size={14} />
                Recorded architecture
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {rocket.stages.length} propulsion elements are represented in
                this configuration. Parallel boosters and core stages are
                recorded separately when they operate in the same flight phase.
              </p>
            </div>
          </div>
        </ProfileSection>

        <ArchitecturePanel stages={rocket.stages} />
        <PropulsionPanel stages={rocket.stages} />
        <PerformancePanel
          dimensions={rocket.dimensions}
          mass={rocket.mass}
          performance={rocket.performance}
        />
        <EngineeringNotesPanel notes={rocket.engineeringAnalysis} />

        <div className="border-t border-border py-12">
          <ButtonLink href="/rockets" variant="secondary">
            <ArrowLeft aria-hidden="true" size={16} />
            Back to Rocket Explorer
          </ButtonLink>
        </div>
      </Container>
    </article>
  );
}
