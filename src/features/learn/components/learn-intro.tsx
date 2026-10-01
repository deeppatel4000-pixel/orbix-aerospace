import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button-link";
import type { LearningArea } from "@/features/learn/types";

interface LearnIntroProps {
  areas: readonly LearningArea[];
}

/**
 * Typographic hero (spec v3 section 11, Learn). No honest photograph fits
 * a page of theory, so the hero is type on the solid ground: from 1024px
 * the H1, lead, actions and scope note take columns 1 to 7 and the
 * contents take columns 9 to 12. The contents are a plain list of links:
 * no numbers, no per-item rules (spec 3.7, 9).
 */
export function LearnIntro({ areas }: LearnIntroProps) {
  const [firstArea] = areas;

  return (
    <Container className="pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-16">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Learn" }]} />
      <div className="mt-12 grid gap-y-12 sm:gap-y-16 lg:mt-16 lg:grid-cols-12 lg:gap-x-12">
        <div className="min-w-0 lg:col-span-7">
          <h1 className="orbix-h1 max-w-[14ch] text-text-primary">
            Learn the physics behind the lab.
          </h1>
          <p className="orbix-lead mt-8">
            Six reading pathways. Each explains the core ideas of one
            discipline, sets out its governing equations where it has them,
            links to the Engineering Lab tools that apply them, and lists
            published references.
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
                Start with the first pathway
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
          className="min-w-0 lg:col-span-4 lg:col-start-9"
        >
          <h2 className="orbix-label" id="learn-contents-title">
            Contents
          </h2>
          <ul className="mt-3 space-y-1">
            {areas.map((area) => (
              <li key={area.id}>
                <Link
                  className="inline-flex min-h-11 items-center py-1 text-[1.0625rem] leading-[1.3] font-medium text-text-secondary underline decoration-transparent decoration-1 underline-offset-[3px] transition-colors hover:text-accent hover:decoration-accent focus-visible:decoration-accent sm:text-[1.125rem]"
                  href={`#${area.id}`}
                >
                  {area.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </Container>
  );
}
