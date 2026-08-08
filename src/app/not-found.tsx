import { ArrowLeft } from "lucide-react";

import { OrbixBackground } from "@/components/brand/orbix-background";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-5rem)] items-center overflow-hidden border-b border-border/70">
      <OrbixBackground variant="technical" />
      <Container className="relative py-[var(--space-section-compact)]">
        <div className="max-w-4xl">
          <p className="orbix-kicker">Navigation control // Error 404</p>
          <h1 className="orbix-display-lg mt-[var(--space-stack-compact)]">
            This route is off the flight plan.
          </h1>
          <div className="orbix-brand-rule my-[var(--space-stack)] max-w-sm" />
          <p className="orbix-body-lead max-w-[var(--measure-copy)]">
            The page may have moved, or its workspace has not been established
            yet. Return to the ORBIX command index to continue exploring.
          </p>
          <ButtonLink
            className="mt-[var(--space-stack)]"
            href="/"
            variant="secondary"
          >
            <ArrowLeft aria-hidden="true" size={17} />
            Return home
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
