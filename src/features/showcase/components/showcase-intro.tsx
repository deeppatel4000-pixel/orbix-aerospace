import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";

export function ShowcaseIntro() {
  return (
    <div className="border-b border-border">
      <Container className="pt-12 pb-8">
        <p className="orbix-label">Project notes</p>
        <h1 className="orbix-h1 mt-2 text-text-primary">How ORBIX is built</h1>
        <p className="orbix-lead mt-4">
          ORBIX keeps its engineering calculations in plain TypeScript modules
          and uses React only to collect inputs and display the typed results.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/engineering-lab">
            Open the Engineering Lab
            <ArrowRight aria-hidden="true" size={16} />
          </ButtonLink>
          <ButtonLink href="#source-code" variant="secondary">
            Find the source code
          </ButtonLink>
        </div>
      </Container>
    </div>
  );
}
