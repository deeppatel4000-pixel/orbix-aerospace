import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { OrbixWordmark } from "@/components/brand/orbix-wordmark";
import { Container } from "@/components/layout/container";
import { Tag } from "@/components/ui/tag";
import { MissionBody } from "@/features/showcase/components/mission-presets";
import type { ShowcaseMission } from "@/features/showcase/data/mission-showcase";

interface ShowcaseCaptureProps {
  readonly mission: ShowcaseMission;
}

const detailGroups = [
  {
    key: "availableVisualizations",
    title: "Where it appears in the Engineering Lab",
  },
  { key: "analysisAvailability", title: "Analyses its inputs run" },
  { key: "engineeringFocus", title: "Engineering focus" },
] as const;

/**
 * A single mission preset on one screen, without site chrome, for portfolio
 * screenshots. It lives outside the `(site)` layout and is not indexed.
 */
export function ShowcaseCapture({ mission }: ShowcaseCaptureProps) {
  return (
    <main
      aria-labelledby="capture-mission-title"
      className="min-h-screen bg-background text-foreground"
    >
      <Container className="flex min-h-screen flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-4">
          <p className="flex items-center gap-3">
            <OrbixWordmark className="h-6 w-16" />
            <span className="sr-only">ORBIX</span>
            <span className="orbix-label">
              Mission preset presentation view
            </span>
          </p>
          <Link
            className="orbix-link inline-flex items-center gap-1 text-sm"
            href="/showcase#mission-presets"
          >
            <ArrowLeft aria-hidden="true" size={14} />
            Back to How ORBIX is built
          </Link>
        </header>

        <div className="flex-1 py-12">
          <p className="orbix-label">{mission.categoryLabel}</p>
          <h1
            className="orbix-h1 mt-2 text-text-primary"
            id="capture-mission-title"
          >
            {mission.preset.name}
          </h1>
          <p className="orbix-lead mt-4">{mission.preset.description}</p>

          <ul aria-label="Systems used" className="mt-4 flex flex-wrap gap-2">
            {mission.includedSystems.map((system) => (
              <li key={system}>
                <Tag>{system}</Tag>
              </li>
            ))}
          </ul>

          <MissionBody className="mt-8" mission={mission} />

          <div className="mt-8 grid gap-6 border-t border-border-subtle pt-8 md:grid-cols-3">
            {detailGroups.map((group) => (
              <section aria-labelledby={`capture-${group.key}`} key={group.key}>
                <h2
                  className="orbix-h4 text-text-primary"
                  id={`capture-${group.key}`}
                >
                  {group.title}
                </h2>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-text-secondary">
                  {mission[group.key].map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <footer className="border-t border-border py-4">
          <p className="orbix-label">
            Educational mission preset. Values shown are preset inputs,
            converted to display units.
            {mission.diagram.kind === "allowances"
              ? " The only derived value is the sum of the delta-v allowances."
              : null}
            {mission.diagram.kind === "transfer" &&
            mission.diagram.planetRadiusSource === "calculator-default"
              ? " The Earth radius used for the scale drawing is the calculators’ standard value, not a preset input."
              : null}
          </p>
        </footer>
      </Container>
    </main>
  );
}
