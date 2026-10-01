import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui";
import { siteLegal } from "@/config/site-legal";

/**
 * Authorship (v4 plan sections 2 and 4.5): three sentences in the owner's
 * voice, each one stated on the build log ("My role", "How I used AI",
 * "Project facts"), then links to the build log and the public history.
 * The framing is fixed: the idea, research and decisions are Deep's, and
 * AI coding assistants wrote the code under his direction.
 */
export function Authorship() {
  return (
    <section
      aria-labelledby="home-authorship-title"
      className="border-t border-border-subtle"
    >
      <Container className="py-12">
        <div className="max-w-[44rem]">
          <h2 className="orbix-h2" id="home-authorship-title">
            Who made it
          </h2>
          <p className="mt-5 text-pretty text-text-secondary">
            I started ORBIX in August 2026 and decided what it covers. I
            researched the engineering behind each tool and set the design,
            accessibility and legal requirements the site had to meet. Codex and
            then Claude Code wrote the code from my instructions; the full
            history is public on GitHub.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2">
            <ButtonLink arrow="right" href="/build-log" variant="tertiary">
              How I built it
            </ButtonLink>
            <ButtonLink
              arrow="external"
              href={siteLegal.sourceCodeUrl}
              rel="noopener noreferrer"
              variant="tertiary"
            >
              Source code on GitHub
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
