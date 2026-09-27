import { ExternalLink } from "lucide-react";

import { ShowcaseSection } from "@/features/showcase/components/showcase-section";

export const SOURCE_REPOSITORY_URL =
  "https://github.com/deeppatel4000-pixel/orbix-aerospace";

export function SourceCodeSection() {
  return (
    <ShowcaseSection
      id="source-code"
      lead="The full source, including the calculators, their unit tests and the browser tests, is on GitHub."
      title="Source code"
    >
      <p>
        <a
          className="orbix-link inline-flex items-center gap-1"
          href={SOURCE_REPOSITORY_URL}
          rel="noreferrer"
          target="_blank"
        >
          View the ORBIX repository on GitHub
          <ExternalLink aria-hidden="true" size={14} />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </p>
      <p className="orbix-label mt-2">
        github.com/deeppatel4000-pixel/orbix-aerospace
      </p>
    </ShowcaseSection>
  );
}
