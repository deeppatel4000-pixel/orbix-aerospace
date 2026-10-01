import { ButtonLink } from "@/components/ui/button-link";
import {
  EquationBlock,
  type EquationVariable,
} from "@/components/ui/equation-block";
import {
  PathwayFigure,
  WIDE_FIGURE_AREA_ID,
} from "@/features/learn/components/pathway-figure";
import {
  formatEquation,
  withSubscripts,
} from "@/features/learn/components/with-subscripts";
import type {
  LearnEquationVariable,
  LearningArea,
} from "@/features/learn/types";
import { cn } from "@/lib/cn";

/**
 * The lab-link rail is quieter than a tertiary button (secondary text,
 * regular weight, no underline at rest; the arrow and the list mark them
 * as links) so a column of links does not compete with the chapter text. It keeps the 44px target and
 * turns accent on hover.
 */
const RAIL_LINK =
  "justify-start text-left text-[0.9375rem] font-normal text-text-secondary decoration-transparent hover:text-accent hover:decoration-accent focus-visible:decoration-accent";

/**
 * The quote and rail headings are plain sentence-case labels (spec 3.6).
 */
const MINOR_HEADING = "text-[0.8125rem] leading-5 font-medium text-text-muted";

/**
 * One legend entry. A unit written with `^` (a fractional power such as
 * "kg^1/2/m") needs a real superscript, and one with parentheses
 * ("J/(kg K)") needs them in Plex, since B612 Mono draws them almost
 * square. EquationBlock's `unit` slot takes only a string, so either unit
 * is set at the end of the meaning.
 */
function legendEntry(variable: LearnEquationVariable): EquationVariable {
  const symbol = withSubscripts(variable.symbol);
  if (!variable.unit || !/[\^(]/.test(variable.unit)) {
    return {
      meaning: withSubscripts(variable.meaning),
      symbol,
      unit: variable.unit,
    };
  }
  return {
    meaning: (
      <>
        {withSubscripts(variable.meaning)}, in {withSubscripts(variable.unit)}
      </>
    ),
    symbol,
  };
}

/**
 * The pathways whose "Why it matters" is set as a display-cut pull quote:
 * the first, which opens the page, and the entry pathway, which has no
 * figure. The others set it as a run-in paragraph after the summary, so
 * the six pathways do not repeat one rhythm (tells: identical section
 * rhythm).
 */
const PULL_QUOTE_AREA_IDS: ReadonlySet<string> = new Set([
  "aerodynamics-flight-fundamentals",
  "atmospheric-entry-thermal-protection",
]);

interface LearningPathwaySectionProps {
  area: LearningArea;
  /** Pathway number, from 1. Used only for the key-idea and equation
   * reference numbers (1.1, 1.2), never as a decorative chapter numeral. */
  number: number;
}

/**
 * One pathway (spec v3 section 11, Learn). Pathways are separated by
 * space and the 48px division rule above each heading (spec 6); there is
 * no chapter numeral and no "Pathway 0N" label. The heading is followed by
 * the summary, "Why it matters" (a display-cut pull quote in two pathways,
 * a run-in paragraph in the rest), and the figure where the pathway has
 * one. Key ideas keep their real reference numbers (1.1) and
 * each display equation carries the same number at the right margin.
 *
 * DOM order is summary, lab links, key ideas, then further reading, so
 * the lab links come early on a phone. From 1024px the links move to a
 * sticky rail in columns 9 to 12 by grid placement; the rail sticks inside
 * a grid item that ends with the key ideas. One pathway's figure
 * (WIDE_FIGURE_AREA_ID) is not in the track: it follows the key ideas
 * across all 12 columns, after the rail ends. No boxes anywhere: rules
 * only between the rows of the key-idea and reading lists.
 */
export function LearningPathwaySection({
  area,
  number,
}: LearningPathwaySectionProps) {
  const titleId = `${area.id}-title`;
  const wideFigure = area.id === WIDE_FIGURE_AREA_ID;

  return (
    <section
      aria-labelledby={titleId}
      className="scroll-mt-20 pb-24 last:pb-0 sm:pb-32"
      id={area.id}
    >
      <h2
        className="orbix-h2 orbix-heading-rule text-text-primary max-[359px]:text-[1.875rem]! sm:max-w-[22ch]"
        id={titleId}
      >
        {area.title}
      </h2>

      <div className="mt-10 grid gap-y-14 sm:mt-12 lg:grid-cols-12 lg:gap-x-12">
        <div className="min-w-0 lg:col-span-8 lg:col-start-1 lg:row-start-1">
          <p className="max-w-[38rem] text-lg leading-[1.65] text-pretty text-text-primary">
            {withSubscripts(area.summary)}
          </p>

          {PULL_QUOTE_AREA_IDS.has(area.id) ? (
            <div className="mt-12">
              <h3 className={MINOR_HEADING}>Why it matters</h3>
              <p className="font-display mt-3 max-w-[40rem] text-[clamp(1.25rem,1.7vw,1.5rem)] leading-[1.35] tracking-[-0.015em] text-pretty text-text-primary [--font-display-weight:500]">
                {withSubscripts(area.whyItMatters)}
              </p>
            </div>
          ) : (
            <p className="mt-6 max-w-[38rem] leading-[1.65] text-pretty text-text-secondary">
              <strong className="font-medium text-text-primary">
                Why it matters.
              </strong>{" "}
              {withSubscripts(area.whyItMatters)}
            </p>
          )}

          {wideFigure ? null : <PathwayFigure areaId={area.id} />}
        </div>

        {/* The grid item spans only the rows beside the rail (it stretches
            to their height), and the aside sticks inside it, so the rail
            stops at the end of the key ideas and never rides over the
            wide figure. */}
        <div
          className={cn(
            "min-w-0 lg:col-span-4 lg:col-start-9 lg:row-start-1",
            wideFigure ? "lg:row-span-2" : "lg:row-span-3",
          )}
        >
          <aside
            aria-label={`${area.title}: related tools and pages`}
            className="lg:sticky lg:top-24"
          >
            <h3 className={MINOR_HEADING}>In the Engineering Lab</h3>
            <ul className="mt-2">
              {area.labAnchors.map((anchor) => (
                <li key={anchor.anchorId}>
                  <ButtonLink
                    arrow="right"
                    className={RAIL_LINK}
                    href={`/engineering-lab#${anchor.anchorId}`}
                    variant="tertiary"
                  >
                    {anchor.label}
                  </ButtonLink>
                </li>
              ))}
            </ul>

            {area.explorationLinks.length > 0 ? (
              <>
                <h3 className={`mt-10 ${MINOR_HEADING}`}>See it in ORBIX</h3>
                <ul className="mt-2 space-y-3">
                  {area.explorationLinks.map((link) => (
                    <li key={link.href}>
                      <ButtonLink
                        arrow="right"
                        className={RAIL_LINK}
                        href={link.href}
                        variant="tertiary"
                      >
                        {link.label}
                      </ButtonLink>
                      <p className="text-sm leading-6 text-text-muted">
                        {link.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </aside>
        </div>

        <div className="min-w-0 lg:col-span-8 lg:col-start-1 lg:row-start-2">
          <h3 className="orbix-h3 text-text-primary">Key ideas</h3>
          <ol className="mt-4">
            {area.keyIdeas.map((idea, index) => {
              const reference = `${number}.${index + 1}`;
              return (
                <li
                  className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-y-4 border-border-subtle py-5 [&+&]:border-t"
                  key={idea.text}
                >
                  <span
                    aria-hidden="true"
                    className="self-baseline text-[0.875rem] font-medium text-text-muted tabular-nums"
                  >
                    {reference}
                  </span>
                  <p className="max-w-[35.25rem] self-baseline leading-[1.65] text-pretty text-text-secondary">
                    {withSubscripts(idea.text)}
                  </p>
                  {idea.equation ? (
                    <EquationBlock
                      className="col-start-2"
                      equation={formatEquation(idea.equation)}
                      label={idea.equationLabel}
                      number={reference}
                      spokenAs={idea.spokenAs}
                      variables={idea.variables?.map(legendEntry)}
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>

        {wideFigure ? (
          <div className="min-w-0 lg:col-span-12 lg:row-start-3">
            <PathwayFigure areaId={area.id} />
          </div>
        ) : null}

        <div
          className={cn(
            "min-w-0 lg:col-span-8 lg:col-start-1",
            wideFigure ? "lg:row-start-4" : "lg:row-start-3",
          )}
        >
          <h3 className="orbix-h3 text-text-primary">Further reading</h3>
          <ul className="mt-4">
            {area.furtherReading.map((reference) => (
              <li
                className="border-border-subtle py-4 leading-[1.55] [&+&]:border-t"
                key={reference.title}
              >
                <span className="block max-w-[38rem]">
                  {reference.href ? (
                    <a className="orbix-link" href={reference.href}>
                      {reference.title}
                    </a>
                  ) : (
                    <cite className="text-text-primary not-italic">
                      {reference.title}
                    </cite>
                  )}
                </span>
                <span className="mt-1 block max-w-[38rem] text-sm text-text-muted">
                  {reference.source}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
