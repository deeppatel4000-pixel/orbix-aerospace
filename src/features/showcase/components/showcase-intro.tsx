import { ButtonLink } from "@/components/ui/button-link";
import type { ReadingTocItem } from "@/features/legal/components/reading-page";

/**
 * The page's sections in order, for the shared "On this page" list.
 * The list follows this order, so it always matches the sections.
 */
export const SHOWCASE_CONTENTS: readonly ReadingTocItem[] = [
  { id: "architecture", title: "Architecture" },
  { id: "mission-presets", title: "Mission presets" },
  { id: "engineering-boundaries", title: "Engineering boundaries" },
  { id: "quality-checks", title: "Quality checks" },
  { id: "source-code", title: "Source code" },
];

/** The lead under the H1. */
export function ShowcaseLead() {
  return (
    <p>
      ORBIX keeps its engineering calculations in plain TypeScript modules and
      uses React components to collect inputs and display the results.
    </p>
  );
}

/** The two actions under the lead. */
export function ShowcaseActions() {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <ButtonLink arrow="right" href="/engineering-lab">
        Open the Engineering Lab
      </ButtonLink>
      <ButtonLink arrow="down" href="#source-code" variant="secondary">
        Find the source code
      </ButtonLink>
    </div>
  );
}
