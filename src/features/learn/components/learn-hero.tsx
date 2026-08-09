import { ArrowUpRight, Compass, FlaskConical } from "lucide-react";

import { OrbixEnvironmentBackdrop } from "@/components/brand/orbix-environment";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button-link";
import { StatusBadge } from "@/components/ui/status-badge";

export function LearnHero() {
  return (
    <header className="orbix-brand-glow relative isolate overflow-hidden border-b border-laboratory/20 py-20 sm:py-28">
      <OrbixEnvironmentBackdrop priority theme="laboratory" />
      <Container>
        <Breadcrumbs
          items={[{ href: "/", label: "Home" }, { label: "Learn" }]}
        />

        <div className="mt-8 max-w-4xl">
          <p className="flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
            <Compass aria-hidden="true" size={16} strokeWidth={1.7} />
            Conceptual reference // Learning pathways
          </p>
          <h1 className="font-display mt-6 text-5xl leading-[0.98] font-semibold tracking-[-0.05em] text-balance sm:text-6xl lg:text-7xl">
            Learn the physics behind ORBIX.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted sm:text-xl">
            Six pathways connect core aerospace concepts to the Engineering
            Laboratory modules that calculate them — from lift and propulsion
            through compressible flow, atmospheric entry, orbital mechanics, and
            mission review.
          </p>

          <StatusBadge className="mt-8" tone="info">
            Conceptual explanations, not calculated output
          </StatusBadge>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
            Everything explained on this page is general aerospace theory. No
            vehicle specification or mission result is computed here — follow
            any laboratory link to run the validated calculators yourself.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/engineering-lab">
              <FlaskConical aria-hidden="true" size={17} />
              Open the Engineering Laboratory
            </ButtonLink>
            <ButtonLink
              href="#aerodynamics-flight-fundamentals"
              variant="secondary"
            >
              Start with pathway one
              <ArrowUpRight aria-hidden="true" size={16} />
            </ButtonLink>
          </div>
        </div>
      </Container>
    </header>
  );
}
