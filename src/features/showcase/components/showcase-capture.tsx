import { OrbixWordmark } from "@/components/brand/orbix-wordmark";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { keepCompounds } from "@/features/showcase/components/keep-compounds";
import { MissionBody } from "@/features/showcase/components/mission-presets";
import type { ShowcaseMission } from "@/features/showcase/data/mission-showcase";

interface ShowcaseCaptureProps {
  readonly mission: ShowcaseMission;
}

/**
 * Short labels so each fits one line in a third of the text column. The
 * lists name Engineering Lab tools, the analyses the preset's inputs run,
 * and its engineering focus.
 */
const detailGroups = [
  { key: "availableVisualizations", title: "Used in the Lab" },
  { key: "analysisAvailability", title: "Analyses" },
  { key: "engineeringFocus", title: "Focus" },
] as const;

/** The three detail lists, across the page in one row of three from 40rem. */
function CaptureDetails({ mission }: { mission: ShowcaseMission }) {
  return (
    <div className="grid gap-5 border-t border-border-subtle pt-4 sm:grid-cols-3 sm:gap-x-8">
      {detailGroups.map((group) => (
        <section aria-labelledby={`capture-${group.key}`} key={group.key}>
          <h2
            className="orbix-caps whitespace-nowrap text-text-muted"
            id={`capture-${group.key}`}
          >
            {group.title}
          </h2>
          <ul className="mt-2 grid gap-1.5 text-sm text-text-secondary">
            {mission[group.key].map((item) => (
              // An 8px hairline dash in place of a round bullet.
              <li
                className="flex items-start gap-2.5 before:mt-[calc(0.5lh-0.5px)] before:h-px before:w-2 before:shrink-0 before:bg-border-control"
                key={item}
              >
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/**
 * A single mission preset on one screen, without site chrome, for portfolio
 * screenshots. Every preset uses one template: from 1024px the figure (or
 * the entry conditions in its place) holds the first column and the title
 * and tables the second; the three detail lists run across both below,
 * and the note on the values sits in the title block, so a 1440x900
 * capture shows the whole preset. It lives outside the `(site)` layout
 * and is not indexed.
 */
export function ShowcaseCapture({ mission }: ShowcaseCaptureProps) {
  return (
    <main
      aria-labelledby="capture-mission-title"
      className="min-h-screen bg-background text-foreground"
      data-division="space"
    >
      <Container className="flex min-h-screen flex-col">
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border py-3">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <OrbixWordmark className="h-9 w-[5.934rem]" sizes="95px" />
            <span className="sr-only">ORBIX</span>
            {/* The caption for the whole view, in the title block. */}
            <span className="orbix-label">
              Educational mission preset. Values are preset inputs converted to
              display units, except where a caption says otherwise.
            </span>
          </p>
          <ButtonLink
            arrow="back"
            href="/showcase#mission-presets"
            variant="tertiary"
          >
            Back to Inside ORBIX
          </ButtonLink>
        </header>

        <div className="flex flex-1 flex-col justify-center py-8 sm:py-12 lg:py-4">
          <MissionBody
            footer={<CaptureDetails mission={mission} />}
            header={
              <div className="max-w-[68ch]">
                <Eyebrow>{mission.categoryLabel}</Eyebrow>
                <h1
                  className="orbix-h2 mt-2 text-balance text-text-primary"
                  id="capture-mission-title"
                >
                  {mission.preset.name}
                </h1>
                <p className="orbix-lead mt-2">
                  {keepCompounds(mission.preset.description)}
                </p>
              </div>
            }
            mission={mission}
            variant="capture"
          />
        </div>
      </Container>
    </main>
  );
}
