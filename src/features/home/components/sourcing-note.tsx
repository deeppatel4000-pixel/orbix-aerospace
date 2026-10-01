import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui";

/**
 * How values are sourced (design v3, spec 11, Home): a sentence-case
 * heading and a short paragraph on the ground, in the same right-hand
 * column as the list above it from 1024px, about 56px under the last rule,
 * so it reads as the list's footnote.
 * The last row rule of the list above is the only separator.
 *
 * Written to match the data as it is today: vehicle records store each value
 * with its unit and, where one applies, a qualifier, but they do not yet carry
 * a per-value citation. The copy says so rather than claiming full tracing.
 */
export function SourcingNote() {
  return (
    <section aria-labelledby="home-sourcing-title" className="pb-16 sm:pb-24">
      <Container className="grid lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-8 lg:col-start-5">
          <h2 className="orbix-h4" id="home-sourcing-title">
            How values are sourced
          </h2>
          <p className="mt-3 max-w-[66ch] text-pretty text-text-secondary">
            Vehicle figures are taken from publicly available specifications and
            stored with their units and, where it applies, a qualifier such as
            nominal, approximate or minimum. Records do not yet cite a source
            for every individual value, so treat them as reference figures for
            study, not for operational use.
          </p>
          <ButtonLink
            arrow="right"
            className="mt-5"
            href="/about#sources"
            variant="tertiary"
          >
            Read how ORBIX sources vehicle values
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
