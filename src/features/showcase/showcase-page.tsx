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
 * The architecture page (`/showcase`), set as an editorial page (design v2,
 * spec 9): running text held to 68ch, diagrams and tables on the wider
 * figure track. There is no screenshots section: only authentic screenshots
 * of the current build are allowed, and none have been captured.
 */
export function ShowcasePage() {
  return (
    <div className="pb-20 sm:pb-28">
      <ShowcaseIntro />
      <ArchitectureSection />
      <MissionPresets missions={SHOWCASE_MISSIONS} />
      <EngineeringBoundaries />
      <QualityChecks />
      <SourceCodeSection />
    </div>
  );
}
