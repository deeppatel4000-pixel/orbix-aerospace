import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { OrbixEnvironmentBackdrop } from "@/components/brand/orbix-environment";
import { OrbixWordmark } from "@/components/brand/orbix-wordmark";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

/**
 * The homepage hero.
 *
 * ## What changed and why
 *
 * The previous hero gave its most valuable space to a 3D-bevelled raster
 * wordmark, then rendered the same four discipline labels twice in one
 * viewport — once as `01`-`04` beneath the buttons and again as
 * `SYS-01`-`SYS-04` inside a panel — while three `aria-hidden` ellipses
 * orbited the mark and two "status" chips with glowing dots reported no state
 * at all.
 *
 * This states what ORBIX is in words, over real orbital photography, with two
 * destinations. The disciplines appear once. Nothing here pretends to be
 * telemetry.
 *
 * ## Calls to action
 *
 * Primary goes to the aircraft registry — the largest completed system, and
 * one the old homepage never linked to. Secondary goes to the Engineering
 * Laboratory, which is what distinguishes ORBIX from a catalogue. Neither is
 * a vague "Get started".
 */
const DISCIPLINES = [
  "Orbital mechanics",
  "Vehicle analysis",
  "Atmospheric entry",
  "Thermal protection",
] as const;

export function Hero() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate overflow-hidden border-b border-border-subtle"
    >
      <OrbixEnvironmentBackdrop priority theme="orbital" />
      {/* A single scrim. The previous hero stacked a brand glow, an
          environment backdrop, a starfield and a grid overlay. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--orbix-bg-page)_0%,color-mix(in_srgb,var(--orbix-bg-page)_78%,transparent)_52%,transparent_100%)]"
      />

      <Container className="flex min-h-[calc(88svh-5.5rem)] flex-col justify-center py-20 lg:py-28">
        <p className="orbix-profile-hero__classification">
          Aerospace systems · Engineering · Research
        </p>

        {/*
         * The wordmark is the logo, not type.
         *
         * `h1` is kept so the document still opens with a real level-one
         * heading; its accessible name comes from the image's alt, which is the
         * whole point of alt text on a logo that IS the heading. No `sr-only`
         * duplicate sits beside it — that would announce "ORBIX ORBIX".
         *
         * The transparent PNG sits directly on the hero scrim: no plate, no
         * glow, no box. Width is fluid and drives height through the
         * component's own `aspect-[1055/400]`, so the mark tracks the clamp
         * behaviour the display type had and never outgrows the copy beneath.
         *
         * `sizes` restates `clamp(168px, 23vw, 240px)` in media-query form, so
         * the two odd breakpoints are derived rather than chosen: 23vw reaches
         * 168px at a 730px viewport and 240px at a 1044px one, which is exactly
         * where the clamp stops tracking the viewport at each end. It selects
         * which rendition to download and changes no geometry.
         */}
        <h1 className="mt-6" id="home-hero-title">
          <OrbixWordmark
            alt={siteConfig.wordmark}
            className="w-[clamp(10.5rem,23vw,15rem)]"
            priority
            sizes="(min-width: 1044px) 240px, (min-width: 731px) 23vw, 168px"
          />
        </h1>

        <p className="text-muted-strong mt-7 max-w-[46rem] text-lg leading-9">
          An educational aerospace platform that connects landmark aircraft and
          launch vehicles to the orbital mechanics, entry physics and thermal
          analysis behind them — with every value traced back to its published
          source.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link className="orbix-home-cta" href="/aircraft">
            Explore the aircraft registry
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
          <Link
            className="orbix-home-cta orbix-home-cta--secondary"
            href="/engineering-lab"
          >
            Open the Engineering Laboratory
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>

        {/* The disciplines, stated once. */}
        <ul className="mt-16 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-3 border-t border-border-subtle pt-6 sm:grid-cols-4">
          {DISCIPLINES.map((discipline) => (
            <li className="text-sm leading-6 text-muted" key={discipline}>
              {discipline}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
