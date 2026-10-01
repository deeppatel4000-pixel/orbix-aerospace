import Link from "next/link";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui";
import { siteLegal } from "@/config/site-legal";
import { TransferExplorer } from "@/features/orbits";

/**
 * Homepage hero (v4 plan section 4.1, design v3 sections 5 and 7).
 *
 * Text column: the thesis H1, a lead that names the author and his grade,
 * the authorship byline, then one primary action (the Engineering Lab) and
 * one secondary (Verification). Right column: the Transfer Explorer in its
 * compact form, live numbers visible, on the page ground. There is no
 * photograph in the hero.
 *
 * From 64rem the H1 is sized by its own column (container units), as in the
 * split photo hero, so it sets in about four lines. Below 64rem everything
 * stacks in DOM order: thesis and lead, the explorer, then the byline and
 * the actions, so the first screen at 390 by 844 shows the thesis, the
 * name and grade, and the explorer's drawing (v4 plan section 9).
 */
export function Hero() {
  return (
    <section aria-labelledby="home-title">
      <Container className="grid gap-8 pt-8 pb-14 sm:pt-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-14 lg:gap-y-0 lg:pt-14 lg:pb-16">
        <div className="@container min-w-0 lg:col-start-1 lg:row-start-1">
          <h1
            className="orbix-h1 text-foreground lg:[--h1-size:max(2.75rem,min(var(--text-h1),12.5cqi))]"
            id="home-title"
          >
            Aerospace engineering, explained with real vehicles.
          </h1>
          <p className="orbix-lead mt-6">
            ORBIX is a personal project by {siteLegal.operatorName}, a high
            school senior who plans to study aerospace engineering. Its
            calculators run from lift and drag to orbital transfers, and
            selected results are checked against published tables and worked
            examples.
          </p>
        </div>

        <section
          aria-labelledby="home-explorer-title"
          className="mx-auto w-full max-w-[30rem] min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mr-0 lg:max-w-[28rem]"
        >
          <h2
            className="orbix-h4 mb-5 text-foreground"
            id="home-explorer-title"
          >
            Transfer Explorer
          </h2>
          <TransferExplorer
            labHref="/engineering-lab#hohmann-transfer-analyzer"
            // Below 64rem the byline and "Open the Engineering Lab" follow
            // the explorer directly, so its own lab link would repeat it.
            labLinkClassName="max-lg:hidden"
            variant="compact"
          />
        </section>

        {/* After the explorer in the DOM, so on a phone the drawing starts
            on the first screen; from 64rem it sits in the text column under
            the lead. */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-2 lg:mt-5">
          <p className="max-w-[58ch] text-[0.9375rem] leading-6 text-pretty text-text-secondary">
            The idea, the research and the decisions are mine; AI coding
            assistants wrote the code under my direction.{" "}
            <Link
              className="text-foreground underline decoration-[var(--orbix-border-control)] decoration-1 underline-offset-[3px] hover:decoration-current"
              href="/build-log"
            >
              How I built it
            </Link>
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <ButtonLink
              arrow="right"
              href="/engineering-lab"
              size="lg"
              variant="primary"
            >
              Open the Engineering Lab
            </ButtonLink>
            <ButtonLink arrow="right" href="/verification" variant="secondary">
              See how it is checked
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
