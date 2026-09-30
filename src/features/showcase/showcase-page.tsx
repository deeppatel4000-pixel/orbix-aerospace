import {
  ArchitectureSection,
  EngineeringBoundaries,
  MissionPresets,
  QualityChecks,
  SHOWCASE_CONTENTS,
  ShowcaseActions,
  ShowcaseLead,
  SourceCodeSection,
} from "@/features/showcase/components";
import { SHOWCASE_MISSIONS } from "@/features/showcase/data/mission-showcase";
import { ReadingPage } from "@/features/legal/components/reading-page";

/**
 * The architecture page (`/showcase`), on the shared editorial reading
 * layout of /verification (design v2, spec 9): from 80rem a sticky numbered
 * "On this page" list in the left rail and the sections in the reading
 * track beside it; running text keeps the reading measure, diagrams and
 * tables take the full track. There is no screenshots section: only
 * authentic screenshots of the current build are allowed, and none have
 * been captured.
 */
export function ShowcasePage() {
  return (
    <ReadingPage
      eyebrow="Project notes"
      intro={<ShowcaseActions />}
      lead={<ShowcaseLead />}
      title="Inside"
      titleAccent="ORBIX"
      toc={SHOWCASE_CONTENTS}
    >
      <ArchitectureSection />
      <MissionPresets missions={SHOWCASE_MISSIONS} />
      <EngineeringBoundaries />
      <QualityChecks />
      <SourceCodeSection />
    </ReadingPage>
  );
}
