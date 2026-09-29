import type { CSSProperties, ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { formatIndexNumber } from "@/components/ui/section-index";
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
   * where the list moves into the page's left rail. In the rail the top
   * rule and the first row's top padding go, so the first label shares a
   * line with the first line of the lead beside it.
   */
  readonly layout?: "columns" | "rail" | "stacked";
}

/**
 * The one definition-list look of the editorial pages: a B612 Mono 11px
 * uppercase label, the value beside it (or under it in a narrow rail), and
 * a hairline rule between rows. Used for the document facts in the intro,
 * the verification case sheets and the build log's project facts.
 */
export function SpecList({
  className,
  items,
  layout = "columns",
}: SpecListProps) {
  return (
    <dl
      className={cn(
        "max-w-[68ch] border-t border-border-subtle text-[0.9375rem] leading-6",
        layout === "rail" && "xl:border-t-0",
        className,
      )}
    >
      {items.map((item) => (
        <div
          className={cn(
            "grid gap-x-6 gap-y-1 border-b border-border-subtle py-3",
            layout !== "stacked" && "sm:grid-cols-[9rem_minmax(0,1fr)]",
            layout === "rail" && "xl:grid-cols-1 xl:first:pt-0",
          )}
          key={item.label}
        >
          <dt className="orbix-caps pt-1 text-muted">{item.label}</dt>
          <dd className="min-w-0 break-words text-text-primary">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

interface ReadingPageProps {
  readonly children: ReactNode;
  /** Short label above the H1 (spec 8, Eyebrow). */
  readonly eyebrow: string;
  /** Extra intro content under the lead, for example a scope note. */
  readonly intro?: ReactNode;
  readonly lead: ReactNode;
  /** Document facts, set in the left rail on wide screens. */
  readonly meta?: readonly ReadingMetaItem[];
  /** H1 text before the accent part. */
  readonly title: string;
  /**
   * The trailing words of the H1, drawn in the division accent (spec 4,
   * "the second word of the H1"). Read together with `title`.
   */
  readonly titleAccent?: string;
  /** Sections listed in the "On this page" list. Omit on short pages. */
  readonly toc?: readonly ReadingTocItem[];
}

/**
 * Editorial reading layout (design v2 spec 9) for About, the legal pages,
 * the build log and verification.
 *
 * Intro: eyebrow, a display H1 with its last words in the accent, then the
 * lead. Body: from 80rem a 12-column grid with a sticky numbered "On this
 * page" list in the rail (3 columns) and the text in the other 9; below
 * 80rem the list sits above the text and tables get the full container
 * width. Running text keeps a 60ch measure; tables and figures use the
 * full track, and spec lists keep 68ch.
 *
 * Sections are numbered with a CSS counter (`LegalSection`), so the
 * numbers in the list and on the headings always agree without anyone
 * typing them.
 */
export function ReadingPage({
  children,
  eyebrow,
  intro,
  lead,
  meta,
  title,
  titleAccent,
  toc,
}: ReadingPageProps) {
  const hasToc = toc !== undefined && toc.length > 0;
  const hasMeta = meta !== undefined && meta.length > 0;
  const tocStyle = hasToc
    ? ({ "--toc-rows": Math.ceil(toc.length / 2) } as CSSProperties)
    : undefined;

  return (
    <>
      <div className="relative border-b border-border-subtle">
        <Container className="relative pt-12 pb-12 sm:pt-20 sm:pb-16 lg:pt-24">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="orbix-h1 mt-6 max-w-[18ch] text-text-primary">
            {title}
            {titleAccent ? (
              <>
                {" "}
                <span className="orbix-accent-word">{titleAccent}</span>
              </>
            ) : null}
          </h1>

          <div className="mt-10 grid xl:mt-14 xl:grid-cols-12 xl:gap-x-6">
            <div className="min-w-0 xl:col-span-9 xl:col-start-4 xl:row-start-1">
              <div className="orbix-lead">{lead}</div>
              {intro}
            </div>
            {hasMeta ? (
              <SpecList
                className="mt-8 xl:col-span-3 xl:col-start-1 xl:row-start-1 xl:mt-0 xl:self-start"
                items={meta}
                layout="rail"
              />
            ) : null}
          </div>
        </Container>
      </div>

      <Container className="pt-12 pb-20 sm:pt-16 sm:pb-28">
        <div className="xl:grid xl:grid-cols-12 xl:items-start xl:gap-x-6">
          {hasToc ? (
            <nav
              aria-labelledby="reading-toc-heading"
              className="mb-10 sm:mb-14 xl:sticky xl:top-24 xl:col-span-3 xl:mb-0 xl:max-h-[calc(100svh-8rem)] xl:overflow-y-auto xl:pb-4"
            >
              <h2 className="orbix-caps text-muted" id="reading-toc-heading">
                On this page
              </h2>
              <ol
                className="mt-4 grid border-t border-border-subtle sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-[repeat(var(--toc-rows),auto)] sm:gap-x-6 xl:grid-flow-row xl:grid-cols-1 xl:grid-rows-none"
                style={tocStyle}
              >
                {toc.map((item, index) => (
                  <li className="border-b border-border-subtle" key={item.id}>
                    <a
                      className="flex min-h-10 items-baseline gap-3 py-2 text-sm leading-snug text-text-secondary transition-colors hover:text-text-primary sm:min-h-11 sm:py-2.5"
                      href={`#${item.id}`}
                    >
                      <span
                        aria-hidden="true"
                        className="font-mono text-[0.6875rem] tracking-[0.12em] text-accent tabular-nums"
                      >
                        {formatIndexNumber(index + 1)}
                      </span>
                      <span>{item.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <div className="orbix-prose max-w-none! min-w-0 break-words [counter-reset:orbix-section] xl:col-span-9 xl:col-start-4">
            {children}
          </div>
        </div>
      </Container>
    </>
  );
}
