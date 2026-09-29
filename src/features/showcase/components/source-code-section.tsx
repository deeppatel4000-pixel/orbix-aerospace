import { ButtonLink } from "@/components/ui/button-link";
import { formatCode } from "@/components/ui/readout";
import { siteLegal } from "@/config/site-legal";
import {
  ShowcaseSection,
  ShowcaseText,
} from "@/features/showcase/components/showcase-section";

export const SOURCE_REPOSITORY_URL = siteLegal.sourceCodeUrl;

export function SourceCodeSection() {
  return (
    <ShowcaseSection
      id="source-code"
      lead="The full source, including the calculators, their unit tests and the browser tests, is on GitHub."
      number={5}
      title="Source code"
    >
      <ShowcaseText>
        <ButtonLink
          arrow="external"
          href={SOURCE_REPOSITORY_URL}
          variant="secondary"
        >
          View the ORBIX repository on GitHub
        </ButtonLink>
        <p className="orbix-data orbix-data--sm mt-4 text-text-muted">
          {formatCode(SOURCE_REPOSITORY_URL.replace(/^https:\/\//, ""))}
        </p>
      </ShowcaseText>
    </ShowcaseSection>
  );
}
