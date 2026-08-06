import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Factory,
  Flame,
  Globe2,
  Layers3,
  Orbit,
  Tags,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { ArchitecturePanel } from "@/features/rockets/components/architecture-panel";
import { EngineeringNotesPanel } from "@/features/rockets/components/engineering-notes-panel";
import { PerformancePanel } from "@/features/rockets/components/performance-panel";
import { ProfileSection } from "@/features/rockets/components/profile-section";
import { PropulsionPanel } from "@/features/rockets/components/propulsion-panel";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import {
  formatRocketFirstFlight,
  formatRocketMeasurement,
} from "@/features/rockets/utils";
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
  const height = formatRocketMeasurement(rocket.dimensions.height);
  const liftoffMass = formatRocketMeasurement(rocket.mass.liftoff);
  const liftoffThrust = formatRocketMeasurement(
    rocket.performance.liftoffThrust,
  );

  return (
    <article className="bg-[#030711]">
      <header className="group relative isolate min-h-[72svh] overflow-hidden border-b border-atmosphere/25 bg-[#02050a]">
        <RocketImage
          fillContainer
          imageClassName="saturate-[0.86] contrast-[1.08]"
          priority
          rocket={rocket}
          sizes="100vw"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,5,10,0.3)_0%,rgba(2,5,10,0.48)_38%,rgba(2,5,10,0.98)_100%)]"
        />
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 opacity-20 mix-blend-screen"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(ellipse_at_bottom,rgba(242,188,104,0.15),transparent_72%)]"
        />

        <Container className="relative flex min-h-[72svh] flex-col py-8 sm:py-10">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-white/65">
              <li>
                <Link
                  className="rounded-sm transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  href="/"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} />
              </li>
              <li>
                <Link
                  className="rounded-sm transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  href="/rockets"
                >
                  Rockets
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} />
              </li>
              <li aria-current="page" className="text-white">
                {rocket.name}
              </li>
            </ol>
          </nav>

          <div className="mt-auto grid gap-8 pt-28 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end">
            <div className="max-w-4xl">
              <p className="flex items-center gap-3 font-mono text-xs tracking-[0.18em] text-signal uppercase">
                <Flame aria-hidden="true" size={16} />
                Launch vehicle profile // {rocket.id}
              </p>
              <h1 className="font-display mt-5 text-5xl leading-[0.94] font-semibold tracking-[-0.055em] text-balance text-white sm:text-6xl lg:text-8xl">
                {rocket.name}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                {rocket.description}
              </p>
              <ul
                aria-label="Supported mission regimes"
                className="mt-6 flex flex-wrap gap-2"
              >
                {rocket.performance.supportedOrbits.map((orbit) => (
                  <li
                    className="border border-white/15 bg-black/45 px-3 py-1.5 font-mono text-[0.65rem] tracking-[0.12em] text-accent uppercase backdrop-blur-sm"
                    key={orbit}
                  >
                    {orbit}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="orbix-frame border-white/15 bg-black/45 p-5 backdrop-blur-md sm:p-6">
              <p className="font-mono text-[0.62rem] tracking-[0.16em] text-signal uppercase">
                Pad telemetry // Recorded
              </p>
              <dl className="mt-4 grid gap-px bg-white/10">
                {[
                  ["Vehicle height", height.value],
                  ["Liftoff mass", liftoffMass.value],
                  ["Liftoff thrust", liftoffThrust.value],
                ].map(([label, value]) => (
                  <div className="bg-black/40 p-3.5" key={label}>
                    <dt className="font-mono text-[0.58rem] tracking-[0.12em] text-white/50 uppercase">
                      {label}
                    </dt>
                    <dd className="orbix-telemetry-value mt-1.5 text-base text-white">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>
        </Container>
      </header>

      <div className="sticky top-18 z-30 border-b border-atmosphere/20 bg-[#030711]/92 backdrop-blur-xl">
        <Container>
          <nav aria-label="Rocket profile sections" className="overflow-x-auto">
            <ul className="flex min-w-max items-center gap-1 py-3">
              {profileNavigation.map((item, index) => (
                <li key={item.href}>
                  <a
                    className="inline-flex min-h-11 items-center rounded-full px-3.5 text-sm text-muted transition-colors hover:bg-white/5 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    href={item.href}
                  >
                    <span className="mr-2 font-mono text-[0.6rem] text-signal">
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
          <div className="orbix-frame overflow-hidden border-atmosphere/20 bg-surface/70">
            <dl className="grid gap-px bg-atmosphere/20 sm:grid-cols-2">
              <div className="bg-[#080d17] p-5 sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <Factory aria-hidden="true" size={14} /> Manufacturer
                </dt>
                <dd className="mt-3 text-sm font-medium">
                  {rocket.manufacturer}
                </dd>
              </div>
              <div className="bg-[#080d17] p-5 sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <Globe2 aria-hidden="true" size={14} /> Country
                </dt>
                <dd className="mt-3 text-sm font-medium">
                  {rocket.country.name} ({rocket.country.isoCode})
                </dd>
              </div>
              <div className="bg-[#080d17] p-5 sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <CalendarDays aria-hidden="true" size={14} /> First integrated
                  flight
                </dt>
                <dd className="mt-3 text-sm font-medium">
                  {formatRocketFirstFlight(rocket.firstFlight)}
                </dd>
              </div>
              <div className="bg-[#080d17] p-5 sm:p-6">
                <dt className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                  <Tags aria-hidden="true" size={14} /> Vehicle category
                </dt>
                <dd className="mt-3 text-sm font-medium">Launch vehicle</dd>
              </div>
            </dl>

            <div className="border-t border-atmosphere/20 p-5 sm:p-6">
              <p className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                <Layers3 aria-hidden="true" size={14} /> Recorded architecture
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {rocket.stages.length} propulsion elements are represented in
                this configuration. Parallel boosters and core stages are
                recorded separately when they operate in the same flight phase.
              </p>
              <p className="mt-4 flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.14em] text-accent uppercase">
                <Orbit aria-hidden="true" size={14} />
                {rocket.performance.supportedOrbits.length} mission regimes
                recorded
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

        <div className="border-t border-atmosphere/20 py-12">
          <ButtonLink href="/rockets" variant="secondary">
            <ArrowLeft aria-hidden="true" size={16} />
            Back to Rocket Explorer
          </ButtonLink>
        </div>
      </Container>
    </article>
  );
}
