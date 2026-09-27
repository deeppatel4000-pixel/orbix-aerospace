import { ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";

import { OrbixWordmark } from "@/components/brand/orbix-wordmark";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui";
import { siteConfig } from "@/config/site";
import { listAircraft } from "@/features/aircraft/data";
import { listRockets } from "@/features/rockets/data";
import { getRocketVisual } from "@/features/rockets/data/rocket-visuals";

/**
 * Homepage intro (spec 14, Home, steps 1 and 2).
 *
 * Left: the wordmark as the `h1`, one lead paragraph that says plainly what
 * ORBIX is, and two destinations. Right, from 1024px: one credited real
 * photograph in a `<figure>`. No backdrop, no overlay, nothing behind text.
 *
 * The photograph, alt text, credit, licence and source page all come from the
 * typed Saturn V record in `rocket-visuals.ts`, so a re-sourced file carries
 * its own attribution here and a renamed field fails type checking.
 */
const HERO_ROCKET_ID = "saturn-v";

const SOURCE_HOST_LABELS: Readonly<Record<string, string>> = {
  "commons.wikimedia.org": "Wikimedia Commons",
};

function sourceLabel(sourceUrl: string): string {
  const host = new URL(sourceUrl).hostname;
  return SOURCE_HOST_LABELS[host] ?? host.replace(/^www\./, "");
}

export function Hero() {
  const vehicleCount = listAircraft().length + listRockets().length;
  const visual = getRocketVisual(HERO_ROCKET_ID);

  return (
    <section aria-labelledby="home-title" className="border-b border-border">
      <Container className="grid gap-12 pt-12 pb-8 lg:grid-cols-12 lg:gap-6 lg:pb-12">
        <div className="flex flex-col justify-center lg:col-span-7">
          {/* The wordmark is the heading. Its accessible name comes from the
              image alt, so no visually hidden duplicate sits beside it. */}
          <h1 id="home-title">
            <OrbixWordmark
              alt={siteConfig.wordmark}
              className="w-[clamp(10.5rem,23vw,15rem)]"
              priority
              sizes="(min-width: 1044px) 240px, (min-width: 731px) 23vw, 168px"
            />
          </h1>

          <p className="orbix-lead mt-6">
            ORBIX is an educational project about aircraft, launch vehicles and
            the engineering behind them. It has records of {vehicleCount}{" "}
            landmark vehicles, a side-by-side comparison, and calculators for
            orbital mechanics, compressible flow and atmospheric entry.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/aircraft" variant="primary">
              Browse the aircraft registry
              <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
            <ButtonLink href="/engineering-lab" variant="secondary">
              Open the Engineering Lab
              <ArrowRight aria-hidden="true" size={16} />
            </ButtonLink>
          </div>
        </div>

        {visual ? (
          <figure className="w-full max-w-sm lg:col-span-5 lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-border bg-surface">
              <Image
                alt={visual.alt}
                className="object-cover"
                fill
                priority
                sizes="(min-width: 1152px) 440px, (min-width: 1024px) 38vw, 384px"
                src={visual.src}
                style={{ objectPosition: visual.objectPosition }}
              />
            </div>
            <figcaption className="orbix-label mt-3">
              Apollo 11 Saturn V lifting off from Launch Complex 39A, 16 July
              1969. Credit: {visual.credit}.{" "}
              <a
                className="orbix-link"
                href={visual.licenseUrl}
                rel="noreferrer"
                target="_blank"
              >
                {visual.license}
                <span className="sr-only">
                  {" "}
                  (licence terms, opens in a new tab)
                </span>
              </a>
              .{" "}
              <a
                className="orbix-link inline-flex items-center gap-1"
                href={visual.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                Source: {sourceLabel(visual.sourceUrl)}
                <span className="sr-only"> (opens in a new tab)</span>
                <ExternalLink aria-hidden="true" size={14} />
              </a>
            </figcaption>
          </figure>
        ) : null}
      </Container>
    </section>
  );
}
