import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui";

/**
 * "How values are sourced" (design v2, spec 9, Home): a short note, set as a
 * small label column beside the text under a hairline from 1024px. Below that
 * the section index's closing rule above is the only separator, so the two
 * rules do not read as a doubled line.
 *
 * Written to match the data as it is today: vehicle records store each value
 * with its unit and, where one applies, a qualifier, but they do not yet carry
 * a per-value citation. The copy says so rather than claiming full tracing.
 */
export function SourcingNote() {
  return (
    <section aria-labelledby="home-sourcing-title" className="pb-16 sm:pb-24">
      <Container>
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6 lg:border-t lg:border-border lg:pt-8">
          <h2 className="orbix-h3 lg:col-span-4" id="home-sourcing-title">
            How values are sourced
          </h2>
          <div className="lg:col-span-8">
            <p className="max-w-[68ch] text-pretty text-text-secondary">
              Vehicle figures are taken from publicly available specifications
              and stored with their units and, where it applies, a qualifier
              such as nominal, approximate or minimum. Records do not yet cite a
              source for every individual value, so treat them as reference
              figures for study, not for operational use.
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
        </div>
      </Container>
    </section>
  );
}
