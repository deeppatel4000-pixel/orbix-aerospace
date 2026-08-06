import { ArrowDown, ArrowUpRight, Database, Flame, Orbit } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { RocketCard } from "@/features/rockets/components/rocket-card";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import { getRocketVisual } from "@/features/rockets/data";
import { formatRocketMeasurement } from "@/features/rockets/utils";
import type { Rocket as RocketVehicle } from "@/features/vehicles/types";

interface RocketExplorerProps {
  rockets: readonly RocketVehicle[];
}

const registryPlacement = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-7",
  "lg:col-span-12",
] as const;

export function RocketExplorer({ rockets }: RocketExplorerProps) {
  const flagship = rockets[0];
  const profileLabel = rockets.length === 1 ? "profile" : "profiles";

  if (!flagship) {
    return (
      <section className="orbix-section">
        <Container>
          <div className="orbix-frame technical-grid mx-auto max-w-3xl border-atmosphere/25 bg-surface/80 p-10 text-center sm:p-16">
            <Database
              aria-hidden="true"
              className="mx-auto text-accent"
              size={28}
            />
            <h1 className="font-display mt-5 text-4xl font-semibold">
              Rocket Explorer
            </h1>
            <p className="mt-4 text-muted">
              No launch vehicle profiles are available in the registry.
            </p>
          </div>
        </Container>
      </section>
    );
  }

  const height = formatRocketMeasurement(flagship.dimensions.height);
  const thrust = formatRocketMeasurement(flagship.performance.liftoffThrust);
  const liftoffMass = formatRocketMeasurement(flagship.mass.liftoff);

  return (
    <>
      <section className="group relative isolate min-h-[calc(100svh-5.5rem)] overflow-hidden border-b border-atmosphere/25 bg-[#02050a]">
        <RocketImage
          fillContainer
          imageClassName="saturate-[0.82] contrast-[1.08]"
          priority
          rocket={flagship}
          sizes="100vw"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,5,10,0.98)_0%,rgba(2,5,10,0.9)_36%,rgba(2,5,10,0.38)_68%,rgba(2,5,10,0.35)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(2,5,10,0.68)_0%,rgba(2,5,10,0.9)_62%,rgba(2,5,10,1)_100%)]"
        />
        <div
          aria-hidden="true"
          className="technical-grid absolute inset-0 opacity-20 mix-blend-screen"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-44 bg-[radial-gradient(ellipse_at_bottom,rgba(242,188,104,0.22),transparent_70%)]"
        />

        <Container className="relative flex min-h-[calc(100svh-5.5rem)] items-end py-12 sm:py-16 lg:items-center lg:py-20">
          <div className="w-full max-w-3xl">
            <p className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-signal uppercase">
              <Flame aria-hidden="true" size={16} strokeWidth={1.7} />
              Launch operations // Vehicle registry
            </p>
            <h1 className="font-display mt-6 text-5xl leading-[0.92] font-semibold tracking-[-0.055em] text-balance text-white sm:text-6xl lg:text-8xl">
              Rocket
              <span className="block text-accent">Explorer</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
              Enter a launch-operations registry built around vehicle staging,
              propulsion systems, payload capability, and configuration-specific
              engineering data.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#launch-vehicle-registry">
                Enter vehicle registry
                <ArrowDown aria-hidden="true" size={16} />
              </ButtonLink>
              <ButtonLink href={`/rockets/${flagship.id}`} variant="secondary">
                Open {flagship.name}
                <ArrowUpRight aria-hidden="true" size={16} />
              </ButtonLink>
            </div>

            <div className="mt-10 border-y border-white/15 bg-black/20 backdrop-blur-sm">
              <dl className="grid grid-cols-2 sm:grid-cols-4">
                <div className="border-r border-b border-white/10 p-4 sm:border-b-0">
                  <dt className="font-mono text-[0.58rem] tracking-[0.14em] text-white/50 uppercase">
                    Featured vehicle
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-white">
                    {flagship.name}
                  </dd>
                </div>
                <div className="border-b border-white/10 p-4 sm:border-r sm:border-b-0">
                  <dt className="font-mono text-[0.58rem] tracking-[0.14em] text-white/50 uppercase">
                    Height
                  </dt>
                  <dd className="orbix-telemetry-value mt-2 text-sm text-accent">
                    {height.value}
                  </dd>
                </div>
                <div className="border-r border-white/10 p-4">
                  <dt className="font-mono text-[0.58rem] tracking-[0.14em] text-white/50 uppercase">
                    Liftoff mass
                  </dt>
                  <dd className="orbix-telemetry-value mt-2 text-sm text-accent">
                    {liftoffMass.value}
                  </dd>
                </div>
                <div className="p-4">
                  <dt className="font-mono text-[0.58rem] tracking-[0.14em] text-white/50 uppercase">
                    Liftoff thrust
                  </dt>
                  <dd className="orbix-telemetry-value mt-2 text-sm text-signal">
                    {thrust.value}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="available-rockets-title"
        className="orbix-section-compact relative overflow-hidden bg-[#030711]"
        id="launch-vehicle-registry"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(87,215,255,0.1),transparent_28%),radial-gradient(circle_at_10%_58%,rgba(242,188,104,0.07),transparent_24%)]"
        />
        <Container className="relative">
          <div className="grid gap-8 border-b border-atmosphere/20 pb-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <p className="font-mono text-xs tracking-[0.18em] text-signal uppercase">
                Launch vehicle registry
              </p>
              <h2
                className="font-display mt-3 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl"
                id="available-rockets-title"
              >
                Integrated launch systems
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
                Compare public vehicle architectures through complete visual
                profiles while retaining the qualifiers attached to every
                recorded engineering value.
              </p>
            </div>

            <aside className="orbix-frame border-atmosphere/25 bg-surface/75 p-5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center border border-atmosphere/30 bg-atmosphere/10 text-accent">
                  <Orbit aria-hidden="true" size={19} strokeWidth={1.7} />
                </span>
                <div>
                  <p className="font-mono text-[0.62rem] tracking-[0.14em] text-muted uppercase">
                    Registry status
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    Dataset connected
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                <span className="text-sm text-muted">
                  Available {profileLabel}
                </span>
                <span className="font-mono text-2xl text-accent">
                  {String(rockets.length).padStart(2, "0")}
                </span>
              </div>
            </aside>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-12">
            {rockets.map((rocket, index) => {
              const visual = getRocketVisual(rocket.id);

              return (
                <RocketCard
                  className={registryPlacement[index] ?? "lg:col-span-6"}
                  key={rocket.id}
                  rocket={rocket}
                  sizes={
                    index === 0
                      ? "(max-width: 1023px) 100vw, 58vw"
                      : index === 4
                        ? "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 100vw"
                        : undefined
                  }
                  treatment={visual?.cardTreatment}
                />
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
