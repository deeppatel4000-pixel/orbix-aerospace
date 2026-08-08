import { ArrowUpRight, Command, Plane, RadioTower, Rocket } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { RocketImage } from "@/features/rockets/components/rocket-image";

const registryExperiences = [
  {
    code: "AIRFRAME ARCHIVE",
    description:
      "Inspect landmark aircraft through technical dossiers, propulsion records, performance data, and engineering context.",
    href: "/aircraft",
    icon: Plane,
    label: "Enter Aircraft Explorer",
    title: "Aircraft dossiers",
    visual: {
      id: "f-22-raptor",
      kind: "aircraft",
      name: "F-22 Raptor",
    },
  },
  {
    code: "LAUNCH SYSTEMS",
    description:
      "Explore launch vehicles as complete systems spanning propulsion, staging, payload capability, and mission applications.",
    href: "/rockets",
    icon: Rocket,
    label: "Enter Rocket Explorer",
    title: "Launch vehicle dossiers",
    visual: {
      id: "falcon-9",
      kind: "rocket",
      name: "Falcon 9",
    },
  },
] as const;

export function FeaturedExperiences() {
  return (
    <section
      aria-labelledby="featured-experiences-title"
      className="relative overflow-hidden border-b border-border bg-[#030711] py-20 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="technical-grid absolute inset-0 opacity-25"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(87,215,255,0.09),transparent_28%),radial-gradient(circle_at_88%_78%,rgba(166,112,255,0.08),transparent_24%)]"
      />

      <Container className="relative">
        <div className="grid gap-8 border-b border-border/80 pb-9 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end">
          <div>
            <p className="orbix-kicker">Core platform experiences</p>
            <h2
              className="font-display mt-4 max-w-4xl text-4xl leading-[0.95] font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl"
              id="featured-experiences-title"
            >
              Explore the vehicles. Then connect the mission.
            </h2>
          </div>
          <p className="text-base leading-7 text-muted">
            Most learning tools isolate one equation or discipline. ORBIX keeps
            vehicle data, engineering analysis, and mission review connected
            while leaving assumptions and limitations visible.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <article className="orbix-frame relative overflow-hidden border-accent/30 bg-[#07101d] p-7 sm:p-9 lg:col-span-5 lg:min-h-[32rem] lg:p-10 xl:p-12">
            <div
              aria-hidden="true"
              className="technical-grid absolute inset-0 opacity-30"
            />
            <div
              aria-hidden="true"
              className="absolute -top-24 -right-16 h-96 w-96 rounded-full border border-accent/20 shadow-[0_0_120px_rgba(87,215,255,0.12)]"
            />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center justify-between gap-4">
                <p className="flex items-center gap-3 font-mono text-[0.64rem] tracking-[0.18em] text-accent uppercase">
                  <RadioTower aria-hidden="true" size={16} /> Flagship workspace
                </p>
                <span className="font-mono text-[0.58rem] tracking-[0.14em] text-telemetry uppercase">
                  Review workspace
                </span>
              </div>

              <div className="mt-20 max-w-3xl lg:mt-auto">
                <Command
                  aria-hidden="true"
                  className="text-accent"
                  size={30}
                  strokeWidth={1.4}
                />
                <h3 className="font-display mt-6 text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                  Mission Control
                </h3>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
                  Bring completed orbital, vehicle, reentry, thermal, and report
                  outputs into one review workspace without recalculating them.
                </p>
                <ButtonLink
                  className="mt-8 w-full sm:w-auto"
                  href="/engineering-lab#mission-control-dashboard"
                >
                  Review Mission Control
                  <ArrowUpRight aria-hidden="true" size={17} />
                </ButtonLink>
              </div>
            </div>
          </article>

          <div className="grid items-start gap-6 md:grid-cols-2 lg:col-span-7 lg:grid-cols-1 xl:grid-cols-2">
            {registryExperiences.map((experience) => (
              <article
                className="orbix-frame flex flex-col overflow-hidden border-border bg-surface/75"
                key={experience.title}
              >
                <div
                  className={
                    experience.visual.kind === "rocket"
                      ? "relative aspect-square overflow-hidden border-b border-border bg-background"
                      : "relative aspect-[4/3] overflow-hidden border-b border-border bg-background"
                  }
                >
                  {experience.visual.kind === "aircraft" ? (
                    <AircraftImage
                      aircraft={experience.visual}
                      fillContainer
                      imageClassName="saturate-[0.88] contrast-[1.06]"
                      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 29vw"
                    />
                  ) : (
                    <RocketImage
                      fillContainer
                      imageClassName="saturate-[0.9] contrast-[1.06]"
                      rocket={experience.visual}
                      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 29vw"
                    />
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(3,7,17,0.84)_100%)]"
                  />
                  <span className="absolute top-4 left-4 border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-[0.56rem] tracking-[0.14em] text-white/75 uppercase backdrop-blur-md">
                    {experience.code}
                  </span>
                  <span className="absolute right-4 bottom-4 flex h-10 w-10 items-center justify-center border border-white/20 bg-black/55 text-accent backdrop-blur-md">
                    <experience.icon
                      aria-hidden="true"
                      size={19}
                      strokeWidth={1.6}
                    />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.035em]">
                    {experience.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-muted">
                    {experience.description}
                  </p>
                  <ButtonLink
                    className="mt-6 w-full justify-between"
                    href={experience.href}
                    variant="secondary"
                  >
                    {experience.label}
                    <ArrowUpRight aria-hidden="true" size={16} />
                  </ButtonLink>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
