import { Container } from "@/components/layout/container";
import { SectionNavigation } from "@/components/ui/section-navigation";
import { LearnHero } from "@/features/learn/components/learn-hero";
import { LearningPathwaySection } from "@/features/learn/components/learning-pathway-section";
import { listLearningAreas } from "@/features/learn/data";

export function LearnPage() {
  const learningAreas = listLearningAreas();
  const navigationItems = learningAreas.map((area) => ({
    id: area.id,
    label: area.title,
  }));

  return (
    <>
      <LearnHero />
      <SectionNavigation items={navigationItems} label="Learning pathways" />
      <div className="orbix-section">
        <Container>
          {learningAreas.map((area, index) => (
            <LearningPathwaySection
              area={area}
              key={area.id}
              sequence={index + 1}
            />
          ))}
        </Container>
      </div>
    </>
  );
}
