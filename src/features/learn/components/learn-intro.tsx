import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button-link";

/** Page intro (spec 14): breadcrumb, h1, one lead paragraph, one action. */
export function LearnIntro() {
  return (
    <div className="border-b border-border pt-12 pb-8">
      <Container>
        <Breadcrumbs
          items={[{ href: "/", label: "Home" }, { label: "Learn" }]}
        />
        <h1 className="orbix-h1 mt-6 text-foreground">Learn</h1>
        <p className="orbix-lead mt-4">
          Six reading pathways on the physics behind the Engineering Lab
          calculators. Each one explains the core ideas, links to the
          calculators that apply them, and lists published references.
        </p>
        <p className="mt-4 max-w-prose text-sm leading-6 text-muted">
          This page explains general theory and calculates nothing. The
          Engineering Lab calculators use simplified models intended for
          learning, not for operational or design decisions.
        </p>
        <div className="mt-6">
          <ButtonLink href="/engineering-lab">
            Open the Engineering Lab
            <ArrowRight aria-hidden="true" size={16} />
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
