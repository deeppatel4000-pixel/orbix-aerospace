import { ArrowUpRight, Command, FlaskConical } from "lucide-react";

import { OrbixBackground } from "@/components/brand/orbix-background";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";

export function FinalCta() {
  return (
    <section
      aria-labelledby="home-final-cta-title"
      className="orbix-brand-glow relative isolate overflow-hidden py-24 sm:py-32"
    >
      <OrbixBackground className="-z-10 opacity-55" />
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <p className="orbix-kicker justify-center">
            ORBIX // Choose your entry point
          </p>
          <h2
            className="font-display mt-5 text-4xl leading-[0.95] font-semibold tracking-[-0.05em] text-balance sm:text-6xl"
            id="home-final-cta-title"
          >
            Review a mission or work from the equations up.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            Built for engineering students, educators, mentors, and technical
            reviewers. ORBIX supports educational exploration, not operational
            mission planning or flight certification.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/engineering-lab#mission-control-dashboard">
              <Command aria-hidden="true" size={17} />
              Review a mission
            </ButtonLink>
            <ButtonLink href="/engineering-lab" variant="secondary">
              <FlaskConical aria-hidden="true" size={17} />
              Work in Engineering Lab
              <ArrowUpRight aria-hidden="true" size={16} />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
