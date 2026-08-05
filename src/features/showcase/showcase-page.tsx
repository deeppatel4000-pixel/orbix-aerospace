import {
  EngineeringSystemsOverview,
  MissionControlPreview,
  ShowcaseHero,
  TechnologyAndPhilosophy,
  VisualizationShowcase,
} from "@/features/showcase/components";

export function ShowcasePage() {
  return (
    <>
      <ShowcaseHero />
      <MissionControlPreview />
      <EngineeringSystemsOverview />
      <VisualizationShowcase />
      <TechnologyAndPhilosophy />
    </>
  );
}
