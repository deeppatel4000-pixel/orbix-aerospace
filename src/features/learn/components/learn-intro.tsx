import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionIndex } from "@/components/ui/section-index";
import type { LearningArea } from "@/features/learn/types";

interface LearnIntroProps {
  areas: readonly LearningArea[];
}

/**
 * Typographic hero (spec 9, Learn). No honest photograph or diagram fits a
 * page of theory, so the pathway index is the hero's figure: from 1024px
 * the H1, lead, actions and scope note take columns 1 to 7 and the index
 * takes columns 8 to 12, top-aligned with the eyebrow. Below that the
 * index follows the scope note.
 */
export function LearnIntro({ areas }: LearnIntroProps) {
  const [firstArea] = areas;

  return (
    <div className="orbix-blueprint-minor relative">
      <Container className="pt-10 pb-4 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-12">
        <Breadcrumbs
          items={[{ href: "/", label: "Home" }, { label: "Learn" }]}
        />
        <div className="mt-12 grid gap-y-10 sm:gap-y-16 lg:mt-16 lg:grid-cols-12 lg:gap-x-12">
          <div className="min-w-0 lg:col-span-7">
            <Eyebrow>Six reading pathways</Eyebrow>
            <h1 className="orbix-h1 mt-5 max-w-[14ch] text-text-primary">
              Learn the physics{" "}
              <span className="orbix-accent-word">behind the lab.</span>
            </h1>
            <p className="orbix-lead mt-8">
              Each pathway explains the core ideas of one discipline, sets out
              its governing equations where it has them, links to the
              Engineering Lab tools that apply them, and lists published
              references.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3">
              <ButtonLink arrow="right" href="/engineering-lab" size="lg">
                Open the Engineering Lab
              </ButtonLink>
              {firstArea ? (
                <ButtonLink
                  arrow="down"
                  href={`#${firstArea.id}`}
                  variant="tertiary"
                >
                  Start with pathway 01
                </ButtonLink>
              ) : null}
            </div>
            <p className="mt-10 max-w-[37rem] text-sm leading-6 text-pretty text-text-muted">
              This page explains general theory. Its two diagrams are drawn from
              preset inputs by the same components the Engineering Lab and
              Showcase use. The Engineering Lab uses simplified models intended
              for learning, not for operational or design decisions.
            </p>
          </div>

          <nav
            aria-labelledby="learn-contents-title"
            className="min-w-0 lg:col-span-5 lg:col-start-8"
          >
            <h2
              className="orbix-caps text-text-muted"
              id="learn-contents-title"
            >
              Contents
            </h2>
            <SectionIndex
              className="mt-4 [&_h3]:text-[1.25rem] [&_h3]:leading-[1.1] sm:[&_h3]:text-[1.5rem] [&>li]:py-3 sm:[&>li]:py-4"
              items={areas.map((area) => ({
                href: `#${area.id}`,
                id: area.id,
                title: area.title,
              }))}
            />
          </nav>
        </div>
      </Container>
    </div>
  );
}
