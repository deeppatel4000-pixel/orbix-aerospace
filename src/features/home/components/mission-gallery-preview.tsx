import { ArrowUpRight, Orbit } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { listMissionPresets } from "@/features/engineering-lab/missions";
import type { MissionPresetCategory } from "@/features/engineering-lab/types";

const categoryLabels: Record<MissionPresetCategory, string> = {
  "deep-space-concept": "Deep space concept",
  "lunar-transfer": "Lunar transfer",
  "orbital-deployment": "Orbital deployment",
  "orbital-logistics": "Orbital logistics",
  "reentry-demonstration": "Reentry demonstration",
};

export function MissionGalleryPreview() {
  const missions = listMissionPresets().slice(0, 3);

  return (
    <section
      aria-labelledby="mission-gallery-preview-title"
      className="relative overflow-hidden border-b border-border bg-[#040812] py-20 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(87,215,255,0.1),transparent_32%)]"
      />
      <Container className="relative">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="orbix-kicker">Curated educational missions</p>
            <h2
              className="font-display mt-4 text-4xl leading-none font-semibold tracking-[-0.045em] sm:text-5xl"
              id="mission-gallery-preview-title"
            >
              Start with a mission concept. Follow the systems it activates.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
              Existing presets connect orbital, vehicle, thermal, and review
              workflows through shared mission inputs. This preview displays
              configurations only; it does not generate engineering values.
            </p>
          </div>
          <ButtonLink href="/showcase" variant="secondary">
            Browse all mission concepts
            <ArrowUpRight aria-hidden="true" size={16} />
          </ButtonLink>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {missions.map((mission, index) => (
            <article
              className="orbix-frame flex min-h-72 flex-col border-border bg-surface/75 p-6 sm:p-7"
              key={mission.id}
            >
              <div className="flex items-center justify-between gap-4">
                <Orbit
                  aria-hidden="true"
                  className="text-accent"
                  size={19}
                  strokeWidth={1.6}
                />
                <span className="font-mono text-[0.58rem] tracking-[0.14em] text-muted uppercase">
                  Mission 0{index + 1}
                </span>
              </div>
              <p className="mt-9 font-mono text-[0.6rem] tracking-[0.13em] text-accent uppercase">
                {categoryLabels[mission.category]}
              </p>
              <h3 className="font-display mt-3 text-2xl font-semibold tracking-[-0.035em]">
                {mission.name}
              </h3>
              <p className="mt-4 flex-1 text-sm leading-6 text-muted">
                {mission.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <ButtonLink href="/engineering-lab#mission-preset-launcher">
            Open mission preset launcher
            <ArrowUpRight aria-hidden="true" size={16} />
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
