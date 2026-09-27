import {
  ArchitectureSection,
  EngineeringBoundaries,
  MissionPresets,
  QualityChecks,
  ShowcaseIntro,
  SourceCodeSection,
} from "@/features/showcase/components";
import { SHOWCASE_MISSIONS } from "@/features/showcase/data/mission-showcase";

/**
 * The portfolio and architecture page (spec 14, `/showcase`). There is no
 * screenshots section: the spec allows only authentic screenshots of the
 * current build, and none have been captured since the redesign.
 */
export function ShowcasePage() {
  return (
    <div className="pb-16">
      <ShowcaseIntro />
      <ArchitectureSection />
      <MissionPresets missions={SHOWCASE_MISSIONS} />
      <EngineeringBoundaries />
      <QualityChecks />
      <SourceCodeSection />
    </div>
  );
}
