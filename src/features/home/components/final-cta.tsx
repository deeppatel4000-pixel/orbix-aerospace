import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";

/**
 * The homepage ending.
 *
 * Deliberately quiet: a technical platform does not need a marketing banner to
 * close on. Two real destinations, on the page ground, with a rule above them.
 */
export function FinalCta() {
  return (
    <section aria-labelledby="home-final-cta-title" className="py-20 sm:py-24">
      <Container>
        <h2
          className="font-display max-w-[24ch] text-3xl font-semibold tracking-tight sm:text-4xl"
          id="home-final-cta-title"
        >
          Start with a vehicle, or start with the equations.
        </h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="orbix-home-cta" href="/rockets">
            Explore launch vehicles
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
          <Link
            className="orbix-home-cta orbix-home-cta--secondary"
            href="/compare"
          >
            Compare vehicles
            <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
