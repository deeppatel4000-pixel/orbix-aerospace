import type { CSSProperties, ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/cn";

export interface ReadingTocItem {
  readonly id: string;
  readonly title: string;
}

export interface ReadingMetaItem {
  readonly label: string;
  readonly value: ReactNode;
}

export type SpecListItem = ReadingMetaItem;

interface SpecListProps {
  readonly className?: string;
  readonly items: readonly SpecListItem[];
  /**
   * `columns` (default) sets the label in a 9rem column beside the value
   * from 40rem up. `stacked` always puts the label above the value, for
   * narrow rails. `rail` uses columns below 80rem and stacks from 80rem,
   * where the list moves into the page's left rail.
   */
  readonly layout?: "columns" | "rail" | "stacked";
}

/**
 * The one definition-list look of the editorial pages (spec 6, key
 * figures): a sentence-case Plex Sans label in the muted ink, the value
 * beside it (or under it in a narrow rail), groups separated by space
 * alone. No rules and no enclosure. Used for the document facts in the
 * intro, the verification case sheets and the build log's project facts.
 */
export function SpecList({
  className,
  items,
  layout = "columns",
}: SpecListProps) {
  return (
    <dl
      className={cn(
        "flex max-w-[68ch] flex-col gap-3 text-[0.9375rem] leading-6",
        className,
      )}
    >
      {items.map((item) => (
        <div
          className={cn(
            "grid gap-x-6 gap-y-0.5",
            layout !== "stacked" && "sm:grid-cols-[9rem_minmax(0,1fr)]",
            layout === "rail" && "xl:grid-cols-1",
          )}
          key={item.label}
        >
          <dt className="orbix-label pt-0.5">{item.label}</dt>
          <dd className="min-w-0 break-words text-text-primary">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface TocListProps {
  readonly className?: string;
  readonly items: readonly ReadingTocItem[];
  readonly style?: CSSProperties;
}

/**
 * The plain "On this page" links: no numbers, no rules. Rows keep a 44px
 * target until 80rem; in the wide rail they tighten to 32px (still over
 * the 24px of WCAG 2.5.8) so a long list reads as a contents column.
 */
function TocList({ className, items, style }: TocListProps) {
  return (
    <ul className={cn("grid", className)} style={style}>
      {items.map((item) => (
        <li key={item.id}>
          <a
            className="flex min-h-11 items-center py-1.5 text-[0.9375rem] leading-snug text-text-secondary underline decoration-transparent underline-offset-3 transition-colors hover:text-text-primary hover:decoration-current xl:min-h-8 xl:py-1"
            href={`#${item.id}`}
          >
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

interface ReadingPageProps {
  readonly children: ReactNode;
  /**
   * Optional plain kicker above the H1 (spec 3.8: at most one, plain text,
   * no rule). The editorial pages pass none.
   */
  readonly eyebrow?: string;
  /** Extra intro content under the lead, for example a scope note. */
  readonly intro?: ReactNode;
  readonly lead: ReactNode;
  /** Document facts, set in the left rail on wide screens. */
  readonly meta?: readonly ReadingMetaItem[];
  /**
   * The page's art-directed photograph (spec 7), set under the intro rule
   * and above the sections, outside the prose so its caption keeps the
   * muted catalogue style.
   */
  readonly plate?: ReactNode;
  /** The H1, one colour (spec 3.8). */
  readonly title: string;
  /**
   * v2 split title, kept so older callers compile: appended to `title` in
   * the same colour. New callers pass the whole H1 as `title`.
   */
  readonly titleAccent?: string;
  /** Sections listed in the "On this page" list. Omit on short pages. */
  readonly toc?: readonly ReadingTocItem[];
}

/**
 * Editorial reading layout (spec 11) for About, the legal pages, the build
 * log and verification.
 *
 * Intro: a display H1 in one colour, then the lead, closed by one hairline
 * rule inside the container. An optional plate follows the rule. No kicker: the H1 names the page and the footer groups the pages.
 *
 * Body: from 80rem a 12-column grid with a sticky "On this page" list in
 * the rail (3 columns) and the text in the other 9; below 80rem the list
 * sits above the text in two columns and tables get the full container
 * width. The list is plain links: no numbers, no rules per item.
 * Paragraphs, lists, notes and table captions share one absolute measure
 * of 38.25rem (about 612px, 60ch of 17px body text, `LegalSection`).
 * Tables and figures use the full track.
 */
export function ReadingPage({
  children,
  eyebrow,
  intro,
  lead,
  meta,
  plate,
  title,
  titleAccent,
  toc,
}: ReadingPageProps) {
  const heading = titleAccent ? `${title} ${titleAccent}` : title;
  const hasToc = toc !== undefined && toc.length > 0;
  const hasMeta = meta !== undefined && meta.length > 0;
  // A long contents list folds behind a disclosure on phones, so the first
  // section is not a full screen away.
  const foldToc = hasToc && toc.length > 6;
  const tocStyle = hasToc
    ? ({ "--toc-rows": Math.ceil(toc.length / 2) } as CSSProperties)
    : undefined;

  return (
    <>
      <Container className="pt-12 sm:pt-20 lg:pt-24 xl:pt-28">
        {/* The intro rule hangs on the container edges, like every other
            rule on the page, instead of running to the viewport edge. */}
        <div className="border-b border-border-subtle pb-12 sm:pb-16">
          {eyebrow ? <Eyebrow className="mb-6">{eyebrow}</Eyebrow> : null}
          <h1 className="orbix-h1 max-w-[18ch] text-text-primary">{heading}</h1>

          <div className="mt-10 grid xl:mt-14 xl:grid-cols-12 xl:gap-x-6">
            <div className="min-w-0 xl:col-span-9 xl:col-start-4 xl:row-start-1">
              <div className="orbix-lead xl:text-[1.375rem]! xl:leading-[1.45]!">
                {lead}
              </div>
              {intro}
            </div>
            {hasMeta ? (
              <SpecList
                className="mt-8 xl:col-span-3 xl:col-start-1 xl:row-start-1 xl:mt-1 xl:self-start"
                items={meta}
                layout="rail"
              />
            ) : null}
          </div>
        </div>
      </Container>

      {plate ? (
        <div className="overflow-x-clip pt-12 sm:pt-16">
          <Container>{plate}</Container>
        </div>
      ) : null}

      <Container className="pt-12 pb-20 sm:pt-16 sm:pb-28">
        <div className="xl:grid xl:grid-cols-12 xl:items-start xl:gap-x-6">
          {hasToc ? (
            <nav
              aria-labelledby="reading-toc-heading"
              className="mb-12 sm:mb-16 xl:sticky xl:top-24 xl:col-span-3 xl:mb-0 xl:max-h-[calc(100svh-8rem)] xl:overflow-y-auto xl:pb-4"
            >
              <h2
                className={cn("orbix-label", foldToc && "max-sm:hidden")}
                id="reading-toc-heading"
              >
                On this page
              </h2>
              {foldToc ? (
                <details className="sm:hidden">
                  <summary className="orbix-label cursor-pointer py-3 hover:text-text-primary">
                    On this page
                  </summary>
                  <TocList items={toc} />
                </details>
              ) : null}
              <TocList
                className={cn(
                  "mt-3 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-[repeat(var(--toc-rows),auto)] sm:gap-x-6 xl:grid-flow-row xl:grid-cols-1 xl:grid-rows-none",
                  foldToc && "max-sm:hidden",
                )}
                items={toc}
                style={tocStyle}
              />
            </nav>
          ) : null}

          <div className="orbix-prose max-w-none! min-w-0 break-words xl:col-span-9 xl:col-start-4">
            {children}
          </div>
        </div>
      </Container>
    </>
  );
}
