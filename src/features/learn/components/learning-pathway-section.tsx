import { ButtonLink } from "@/components/ui/button-link";
import {
  EquationBlock,
  type EquationVariable,
} from "@/components/ui/equation-block";
import { formatIndexNumber } from "@/components/ui/section-index";
import { PathwayFigure } from "@/features/learn/components/pathway-figure";
import {
  formatEquation,
  withSubscripts,
} from "@/features/learn/components/with-subscripts";
import type {
  LearnEquationVariable,
  LearningArea,
} from "@/features/learn/types";

/**
 * The lab-link rail is quieter than a tertiary button (secondary text,
 * regular weight, underline in the control colour) so a column of links
 * does not compete with the chapter text. It keeps the 44px target and
 * turns accent on hover.
 */
const RAIL_LINK =
  "justify-start text-left text-[0.9375rem] font-normal text-text-secondary decoration-border-control hover:text-accent hover:decoration-accent";

/**
 * The quote and rail headings are plain sentence-case labels, not caps:
 * caps are kept for data-like labels (Pathway 0N, Figure N and equation
 * names), so a chapter's first screen carries one caps line, not four.
 */
const MINOR_HEADING =
  "text-[0.8125rem] leading-5 font-medium text-text-secondary";

/**
 * One legend entry. A unit written with `^` (a fractional power such as
 * "kg^1/2/m") needs a real superscript, and EquationBlock's `unit` slot
 * takes only a string, so that unit is set at the end of the meaning.
 */
function legendEntry(variable: LearnEquationVariable): EquationVariable {
  const symbol = withSubscripts(variable.symbol);
  if (!variable.unit?.includes("^")) {
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

interface LearningPathwaySectionProps {
  area: LearningArea;
  /** Chapter number, from 1. */
  number: number;
}

/**
 * One pathway as a numbered chapter (spec 9, Learn).
 *
 * The large faint numeral (the accent at 16 percent over the page ground,
 * decorative and hidden from assistive technology) sits top right at every
 * width. Below 640px the header is a two-row grid: "Pathway 0N" and a
 * 5.5rem numeral share the first row, and the heading has the second row
 * to itself, so the numeral never shortens a heading line. From 640px the
 * header is block flow and the numeral is placed absolutely.
 * "Pathway 0N" is the number's accessible carrier.
 * The rail names the tools. "Why it matters" is set in the display cut
 * under a 1px accent rule, so it reads as a pull quote, not a second lede.
 * After "Why it matters" comes the pathway's figure, where it has one.
 *
 * Right edges in the chapter body: every hairline rule (the accent rule
 * over "Why it matters" included), equation block and figure spans the
 * 8-column figure track. Running text stops at a 38rem measure inside it.
 * The pull quote alone runs to 40rem: its display size sets fewer
 * characters per line, and at 38rem the longest quote takes one more line
 * at 1440px. It has no rule of its own, so its 2rem longer measure reads
 * as a looser line, not a third rule edge. DOM order is summary, lab links, then key ideas and
 * further reading, so the lab links come early on a phone. From 1024px the
 * links move to a sticky rail in columns 9 to 12 by grid placement, which
 * keeps the visual order the same as the DOM order.
 */
export function LearningPathwaySection({
  area,
  number,
}: LearningPathwaySectionProps) {
  const titleId = `${area.id}-title`;
  const chapter = formatIndexNumber(number);

  return (
    <section
      aria-labelledby={titleId}
      className="relative scroll-mt-20 border-t border-border pt-10 pb-20 last:pb-0 sm:pt-14 sm:pb-24"
      id={area.id}
    >
      <header className="relative grid grid-cols-[1fr_auto] items-end sm:block">
        <p className="orbix-caps mb-1 self-end text-text-muted sm:mb-4">
          Pathway {chapter}
        </p>
        {/* Below 640px the numeral is the right item of the first grid row,
            level with "Pathway 0N", and the heading has the second row to
            itself. From 640px it is placed absolutely, top right, 40px
            below the section rule. pr-[0.06em] offsets the trailing
            negative tracking, so the ink of the last digit ends flush with
            the container edge. Below 360px the heading steps down from the
            2rem H2 floor to 1.875rem: at 2rem "Atmospheric entry and" is
            about 292px in a 288px column, and the balanced wrap then leaves
            "Atmospheric" alone on the first line. */}
        <span
          aria-hidden="true"
          className="font-display pointer-events-none block pr-[0.06em] text-[5.5rem] leading-[0.78] tracking-[-0.06em] text-[color-mix(in_srgb,var(--accent)_16%,var(--bg-page))] select-none sm:absolute sm:-top-4 sm:right-0 sm:text-[clamp(6rem,17vw,13.5rem)] sm:leading-[0.8]"
        >
          {chapter}
        </span>
        <h2
          className="orbix-h2 col-span-2 mt-3 text-text-primary max-[359px]:text-[1.875rem]! sm:mt-0 sm:max-w-[22ch]"
          id={titleId}
        >
          {area.title}
        </h2>
      </header>

      <div className="relative mt-10 grid gap-y-14 sm:mt-14 lg:grid-cols-12 lg:gap-x-12">
        <div className="min-w-0 lg:col-span-8 lg:col-start-1 lg:row-start-1">
          <p className="max-w-[38rem] text-lg leading-[1.65] text-pretty text-text-primary">
            {withSubscripts(area.summary)}
          </p>

          <div className="mt-12 border-t border-accent pt-5">
            <h3 className={MINOR_HEADING}>Why it matters</h3>
            <p className="font-display mt-4 max-w-[40rem] text-[clamp(1.25rem,1.7vw,1.5rem)] leading-[1.35] tracking-[-0.015em] text-pretty text-text-primary [--font-display-weight:500]">
              {withSubscripts(area.whyItMatters)}
            </p>
          </div>

          <PathwayFigure areaId={area.id} />
        </div>

        <aside
          aria-label={`${area.title}: related tools and pages`}
          className="min-w-0 lg:sticky lg:top-24 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1 lg:self-start"
        >
          <div className="border-t border-border pt-4">
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
          </div>

          {area.explorationLinks.length > 0 ? (
            <div className="mt-10 border-t border-border pt-4">
              <h3 className={MINOR_HEADING}>See it in ORBIX</h3>
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
            </div>
          ) : null}
        </aside>

        <div className="min-w-0 lg:col-span-8 lg:col-start-1 lg:row-start-2">
          <h3 className="orbix-h3 text-text-primary">Key ideas</h3>
          <ol className="mt-5 border-t border-border-subtle">
            {area.keyIdeas.map((idea, index) => (
              <li
                className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-y-4 border-b border-border-subtle py-5"
                key={idea.text}
              >
                <span
                  aria-hidden="true"
                  className="self-baseline font-sans text-[0.8125rem] font-medium tracking-normal text-accent tabular-nums"
                >
                  {`${number}.${index + 1}`}
                </span>
                <p className="max-w-[35.25rem] self-baseline leading-[1.65] text-pretty text-text-secondary">
                  {withSubscripts(idea.text)}
                </p>
                {idea.equation ? (
                  <EquationBlock
                    className="col-span-2"
                    equation={formatEquation(idea.equation)}
                    label={idea.equationLabel}
                    spokenAs={idea.spokenAs}
                    variables={idea.variables?.map(legendEntry)}
                  />
                ) : null}
              </li>
            ))}
          </ol>

          <h3 className="orbix-h3 mt-16 text-text-primary">Further reading</h3>
          <ul className="mt-5 border-t border-border-subtle">
            {area.furtherReading.map((reference) => (
              <li
                className="border-b border-border-subtle py-4 leading-[1.55]"
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
