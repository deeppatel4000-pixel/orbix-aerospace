import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui";

/**
 * "How values are sourced" (spec 14, Home, step 5).
 *
 * Written to match the data as it is today: vehicle records store each value
 * with its unit and, where one applies, a qualifier, but they do not yet carry
 * a per-value citation. The copy says so rather than claiming full tracing
 * (spec 13.4).
 */
export function SourcingNote() {
  return (
    <section aria-labelledby="home-sourcing-title">
      <Container>
        <div className="border-t border-border pt-8">
          <h2 className="orbix-h2" id="home-sourcing-title">
            How values are sourced
          </h2>
          <p className="mt-3 max-w-[68ch] text-text-secondary">
            Vehicle figures are taken from publicly available specifications and
            stored with their units and, where it applies, a qualifier such as
            nominal, approximate or minimum. Records do not yet cite a source
            for every individual value, so treat them as reference figures for
            study, not for operational use.
          </p>
          <ButtonLink className="mt-4" href="/about#sources" variant="link">
            Read how ORBIX sources vehicle values
            <ArrowRight aria-hidden="true" size={16} />
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
