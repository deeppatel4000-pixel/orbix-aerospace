import { Container } from "@/components/layout/container";
import { LearnIntro } from "@/features/learn/components/learn-intro";
import { LearningPathwaySection } from "@/features/learn/components/learning-pathway-section";
import { listLearningAreas } from "@/features/learn/data";

/**
 * Learn (spec 9): a typographic hero whose figure is the numbered index of
 * the six pathways, then each pathway as a numbered chapter.
 */
export function LearnPage() {
  const learningAreas = listLearningAreas();

  return (
    <>
      <LearnIntro areas={learningAreas} />
      {/* The .orbix-section rhythm, except that from 1024px the hero's own
          bottom padding is the gap, so chapter 01's rule and heading show on
          a 1440x1000 screen. The `!` is needed: .orbix-section is declared in
          the utilities layer after Tailwind's own utilities, so a plain
          lg:pt-0 would lose to it. */}
      <div className="orbix-section lg:pt-0!">
        <Container>
          {learningAreas.map((area, index) => (
            <LearningPathwaySection
              area={area}
              key={area.id}
              number={index + 1}
            />
          ))}
        </Container>
      </div>
    </>
  );
}
