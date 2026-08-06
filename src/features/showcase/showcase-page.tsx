import {
  EngineeringSystemsOverview,
  MissionGallery,
  MissionControlPreview,
  PortfolioHighlights,
  ShowcaseHero,
  TechnologyAndPhilosophy,
  VisualizationShowcase,
} from "@/features/showcase/components";
import { SHOWCASE_MISSIONS } from "@/features/showcase/data/mission-showcase";

export function ShowcasePage() {
  return (
    <>
      <ShowcaseHero />
      <MissionGallery missions={SHOWCASE_MISSIONS} />
      <MissionControlPreview />
      <EngineeringSystemsOverview />
      <VisualizationShowcase />
      <PortfolioHighlights />
      <TechnologyAndPhilosophy />
    </>
  );
}
