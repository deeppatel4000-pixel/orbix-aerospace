import { Container } from "@/components/layout/container";
import { LearnContents } from "@/features/learn/components/learn-contents";
import { LearnIntro } from "@/features/learn/components/learn-intro";
import { LearningPathwaySection } from "@/features/learn/components/learning-pathway-section";
import { listLearningAreas } from "@/features/learn/data";

/**
 * Reading layout (spec 14, `/learn`): intro, then from 1024px a sticky
 * 3-column "Contents" list beside 9 columns of pathway text.
 */
export function LearnPage() {
  const learningAreas = listLearningAreas();

  return (
    <>
      <LearnIntro />
      <div className="orbix-section">
        <Container>
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-6">
            <div className="border-b border-border-subtle pb-8 lg:col-span-3 lg:border-b-0 lg:pb-0">
              <LearnContents areas={learningAreas} />
            </div>
            <div className="mt-8 min-w-0 lg:col-span-9 lg:mt-0">
              {learningAreas.map((area) => (
                <LearningPathwaySection area={area} key={area.id} />
              ))}
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
