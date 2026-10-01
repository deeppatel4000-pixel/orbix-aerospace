import { Container } from "@/components/layout/container";
import { LearnIntro } from "@/features/learn/components/learn-intro";
import { LearningPathwaySection } from "@/features/learn/components/learning-pathway-section";
import { listLearningAreas } from "@/features/learn/data";

/**
 * Learn (spec v3 section 11): a typographic hero with a plain contents
 * list, then the pathways on the page ground.
 */
export function LearnPage() {
  const learningAreas = listLearningAreas();

  return (
    <>
      <LearnIntro areas={learningAreas} />
      {/* A full-width 1px rule closes the hero, so the scope note reads
          as part of the hero and the gap above the first pathway is at
          least the gap between pathways (spec 6). */}
      <Container>
        <div className="orbix-section orbix-rule-top">
          {learningAreas.map((area, index) => (
            <LearningPathwaySection
              area={area}
              key={area.id}
              number={index + 1}
            />
          ))}
        </div>
      </Container>
    </>
  );
}
