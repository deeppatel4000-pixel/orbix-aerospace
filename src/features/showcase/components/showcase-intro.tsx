import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { formatIndexNumber } from "@/components/ui/section-index";

/** The page's sections in order; numbers match each section heading. */
const SHOWCASE_CONTENTS = [
  {
    href: "#architecture",
    summary: "Five layers, from data to React",
    title: "Architecture",
  },
  {
    href: "#mission-presets",
    summary: "The five Engineering Lab presets and their inputs",
    title: "Mission presets",
  },
  {
    href: "#engineering-boundaries",
    summary: "Six rules the code follows",
    title: "Engineering boundaries",
  },
  {
    href: "#quality-checks",
    summary: "Two GitHub Actions workflows",
    title: "Quality checks",
  },
  {
    href: "#source-code",
    summary: "The repository on GitHub",
    title: "Source code",
  },
] as const;

/**
 * Typographic hero on the minor blueprint grid (spec 6 and 9): eyebrow,
 * two-tone H1, lead and two actions, with the numbered page contents and a
 * one-line summary of each section set beside it from 64rem.
 */
export function ShowcaseIntro() {
  return (
    <div className="orbix-blueprint-minor relative">
      <Container className="grid gap-12 pt-14 pb-8 sm:pt-20 sm:pb-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-16 lg:pb-0">
        <div>
          <Eyebrow>Project notes</Eyebrow>
          <h1 className="orbix-h1 mt-6 max-w-[10ch] text-text-primary">
            Inside <span className="orbix-accent-word">ORBIX</span>
          </h1>
          <p className="orbix-lead mt-6">
            ORBIX keeps its engineering calculations in plain TypeScript modules
            and uses React components to collect inputs and display the results.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink arrow="right" href="/engineering-lab">
              Open the Engineering Lab
            </ButtonLink>
            <ButtonLink arrow="down" href="#source-code" variant="secondary">
              Find the source code
            </ButtonLink>
          </div>
        </div>

        <nav
          aria-labelledby="showcase-contents-title"
          className="border-t border-border pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8"
        >
          <p
            className="orbix-caps text-text-muted"
            id="showcase-contents-title"
          >
            On this page
          </p>
          <ol className="mt-2">
            {SHOWCASE_CONTENTS.map((item, index) => (
              <li key={item.href}>
                <a
                  className="group grid grid-cols-[2.5rem_minmax(0,1fr)] items-baseline gap-x-3 border-b border-border-subtle py-2.5 transition-colors duration-200 ease-[var(--motion-ease)] [li:last-child>&]:border-b-0"
                  href={item.href}
                >
                  <span aria-hidden="true" className="orbix-data text-accent">
                    {formatIndexNumber(index + 1)}
                  </span>
                  <span className="text-[1.0625rem] leading-snug font-medium text-text-primary underline-offset-4 group-hover:underline">
                    {item.title}
                  </span>
                  <span className="col-start-2 mt-0.5 text-[0.8125rem] text-text-muted max-sm:hidden">
                    {item.summary}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </Container>
    </div>
  );
}
