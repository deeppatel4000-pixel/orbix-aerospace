import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteShell } from "@/components/layout/site-shell";
import { SkipLink } from "@/components/layout/skip-link";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PhotoHero } from "@/components/ui/photo-hero";
import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";

export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * 404 (spec 9): a display "Off course." line over the US Air Force F-15C photo,
 * with a way home and into both registries. "Off course." is the H1; the
 * plain "Page not found" eyebrow above it and the document title name the
 * page for assistive technology and search.
 *
 * `app/not-found.tsx` sits outside the (site) layout, so it renders the site
 * chrome itself to keep the header, main and footer on every page.
 */
export default function NotFound() {
  const visual = getAircraftVisual("f-15-eagle");

  const content = (
    <>
      <Eyebrow>Page not found</Eyebrow>
      <h1 className="orbix-display mt-5 text-text-primary">
        Off <span className="orbix-accent-word">course.</span>
      </h1>
      <p className="orbix-lead mt-6">
        The page you asked for does not exist or has moved. The registries and
        the home page are still where you left them.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
        <ButtonLink arrow="right" href="/" variant="primary">
          Go to the home page
        </ButtonLink>
        {/* The two registry links wrap as a pair, never one alone. */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-1">
          <ButtonLink arrow="right" href="/aircraft" variant="tertiary">
            Aircraft registry
          </ButtonLink>
          <ButtonLink arrow="right" href="/rockets" variant="tertiary">
            Launch vehicle registry
          </ButtonLink>
        </div>
      </div>
    </>
  );

  return (
    <SiteShell>
      <SkipLink />
      <SiteHeader />
      <main className="flex-1" id="main-content">
        {visual ? (
          // The F-15C is not the hero of home or either registry (only of
          // its own profile; the registries lead with the B-2 and the
          // Saturn V, home with the SR-71), so this page reads as its own.
          <PhotoHero
            visual={{ ...visual, objectPosition: visual.heroObjectPosition }}
          >
            {content}
          </PhotoHero>
        ) : (
          <div className="mx-auto w-full max-w-[72rem] px-4 py-24 sm:px-6 lg:px-8">
            {content}
          </div>
        )}
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
