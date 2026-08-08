import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Flame, Layers3, Ruler, Weight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ArchitecturePanel } from "@/features/rockets/components/architecture-panel";
import { EngineeringNotesPanel } from "@/features/rockets/components/engineering-notes-panel";
import { PerformancePanel } from "@/features/rockets/components/performance-panel";
import { PropulsionPanel } from "@/features/rockets/components/propulsion-panel";
import { RelatedRockets } from "@/features/rockets/components/related-rockets";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import { RocketMissionApplications } from "@/features/rockets/components/rocket-mission-applications";
import { RocketMissionOverview } from "@/features/rockets/components/rocket-mission-overview";
import { RocketProfileCta } from "@/features/rockets/components/rocket-profile-cta";
import { RocketTechnicalDashboard } from "@/features/rockets/components/rocket-technical-dashboard";
import { RocketVisualPanel } from "@/features/rockets/components/rocket-visual-panel";
import { getRocketVisual, listRockets } from "@/features/rockets/data";
import { formatRocketMeasurement } from "@/features/rockets/utils";
import type { Rocket } from "@/features/vehicles/types";

interface RocketProfileProps {
  rocket: Rocket;
}

const profileNavigation = [
  { href: "#overview", label: "Overview" },
  { href: "#vehicle-image", label: "Vehicle Image" },
  { href: "#technical-dashboard", label: "Dashboard" },
  { href: "#architecture", label: "Architecture" },
  { href: "#propulsion", label: "Propulsion" },
  { href: "#performance", label: "Performance" },
  { href: "#engineering-notes", label: "Engineering Notes" },
  { href: "#mission-applications", label: "Applications" },
  { href: "#registry-vehicles", label: "Registry" },
] as const;

export function RocketProfile({ rocket }: RocketProfileProps) {
  const visual = getRocketVisual(rocket.id);
  const height = formatRocketMeasurement(rocket.dimensions.height);
  const liftoffMass = formatRocketMeasurement(rocket.mass.liftoff);
  const liftoffThrust = formatRocketMeasurement(
    rocket.performance.liftoffThrust,
  );
  const relatedRockets = listRockets()
    .filter((candidate) => candidate.id !== rocket.id)
    .slice(0, 4);

  return (
    <article className="bg-[#030711]">
      <header className="relative isolate min-h-[78svh] overflow-hidden border-b border-signal/20 bg-[#02050a]">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_82%_40%,rgba(56,131,166,0.2),transparent_34%),linear-gradient(90deg,rgba(2,5,10,0.98)_0%,rgba(2,5,10,0.86)_43%,rgba(2,5,10,0.38)_100%),linear-gradient(180deg,rgba(2,5,10,0.4)_0%,rgba(2,5,10,0.1)_42%,rgba(2,5,10,0.98)_100%)]"
        />
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 -z-10 opacity-20 mix-blend-screen"
        />
        <div
          aria-hidden="true"
          className="absolute right-[10%] bottom-0 -z-10 h-2/3 w-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(242,188,104,0.18),transparent_68%)]"
        />

        <Container className="flex min-h-[78svh] flex-col py-8 sm:py-10 lg:py-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 font-mono text-[0.64rem] tracking-[0.12em] text-white/60 uppercase">
              <li>
                <Link
                  className="rounded-sm transition-colors hover:text-signal focus-visible:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
                  href="/"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={13} />
              </li>
              <li>
                <Link
                  className="rounded-sm transition-colors hover:text-signal focus-visible:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
                  href="/rockets"
                >
                  Rockets
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={13} />
              </li>
              <li aria-current="page" className="text-white">
                {rocket.name}
              </li>
            </ol>
          </nav>

          <div className="mt-auto grid gap-10 pt-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(21rem,0.68fr)] lg:items-end lg:gap-14">
            <div className="max-w-4xl pb-2 lg:pb-8">
              <p className="flex items-center gap-3 font-mono text-[0.66rem] tracking-[0.2em] text-signal uppercase">
                <Flame aria-hidden="true" size={16} />
                Launch operations dossier // {rocket.id}
              </p>
              <h1 className="font-display mt-5 text-5xl leading-[0.9] font-semibold tracking-[-0.055em] text-balance text-white sm:text-7xl lg:text-[5.75rem]">
                {rocket.name}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-white/72 sm:text-lg sm:leading-8">
                {rocket.description}
              </p>
              <ul
                aria-label="Supported mission regimes"
                className="mt-7 flex flex-wrap gap-2"
              >
                {rocket.performance.supportedOrbits.map((orbit) => (
                  <li
                    className="border border-signal/30 bg-black/50 px-3 py-1.5 font-mono text-[0.62rem] tracking-[0.13em] text-signal uppercase backdrop-blur-md"
                    key={orbit}
                  >
                    {orbit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative min-h-[27rem] sm:min-h-[34rem] lg:min-h-[42rem]">
              {visual ? (
                <Image
                  alt={visual.alt}
                  className="object-contain object-bottom drop-shadow-[0_30px_55px_rgba(0,0,0,0.8)]"
                  fill
                  priority
                  quality={90}
                  sizes="(max-width: 1023px) 100vw, 46vw"
                  src={visual.src}
                />
              ) : (
                <RocketImage
                  className="absolute inset-0"
                  fillContainer
                  rocket={rocket}
                  sizes="(max-width: 1023px) 100vw, 46vw"
                />
              )}
              <div
                aria-hidden="true"
                className="absolute inset-x-[8%] bottom-0 h-px bg-gradient-to-r from-transparent via-signal/70 to-transparent shadow-[0_0_28px_rgb(242_188_104/0.7)]"
              />
            </div>
          </div>

          <aside
            aria-label="Launch vehicle summary"
            className="relative mt-6 border border-white/15 bg-black/58 backdrop-blur-xl"
          >
            <dl className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Ruler, label: "Vehicle height", value: height.value },
                {
                  icon: Weight,
                  label: "Liftoff mass",
                  value: liftoffMass.value,
                },
                {
                  icon: Flame,
                  label: "Liftoff thrust",
                  value: liftoffThrust.value,
                },
                {
                  icon: Layers3,
                  label: "Stage elements",
                  value: String(rocket.stages.length).padStart(2, "0"),
                },
              ].map((item) => (
                <div className="bg-black/62 p-4 sm:p-5" key={item.label}>
                  <dt className="flex items-center gap-2 font-mono text-[0.58rem] tracking-[0.12em] text-white/50 uppercase">
                    <item.icon aria-hidden="true" size={13} /> {item.label}
                  </dt>
                  <dd className="orbix-telemetry-value mt-2 text-base text-white">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </Container>
      </header>

      <div className="sticky top-[5.5rem] z-30 border-b border-signal/18 bg-[#030711]/92 backdrop-blur-xl">
        <Container>
          <nav
            aria-label="Rocket dossier sections"
            className="[scrollbar-width:thin] overflow-x-auto"
          >
            <ul className="flex min-w-max items-center gap-1 py-3">
              {profileNavigation.map((item, index) => (
                <li key={item.href}>
                  <a
                    className="inline-flex min-h-11 items-center border border-transparent px-3.5 text-sm text-muted transition-colors hover:border-signal/25 hover:bg-signal/8 hover:text-signal focus-visible:border-signal focus-visible:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                    href={item.href}
                  >
                    <span className="mr-2 font-mono text-[0.58rem] text-signal">
                      {String(index + 1).padStart(2, "0")}
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
        <RocketMissionOverview rocket={rocket} />
        <RocketVisualPanel rocket={rocket} />
        <RocketTechnicalDashboard rocket={rocket} />
        <ArchitecturePanel stages={rocket.stages} />
        <PropulsionPanel stages={rocket.stages} />
        <PerformancePanel
          dimensions={rocket.dimensions}
          mass={rocket.mass}
          performance={rocket.performance}
        />
        <EngineeringNotesPanel notes={rocket.engineeringAnalysis} />
        <RocketMissionApplications performance={rocket.performance} />
        <RelatedRockets currentRocket={rocket} rockets={relatedRockets} />
        <RocketProfileCta rocket={rocket} />
      </Container>
    </article>
  );
}
