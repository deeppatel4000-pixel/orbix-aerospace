import { ButtonLink } from "@/components/ui/button-link";
import { formatCode } from "@/components/ui/readout";
import { siteLegal } from "@/config/site-legal";
import { ArchitectureFigure } from "@/features/build-log/components/architecture-figure";
import { QualityChecks } from "@/features/build-log/components/quality-checks";
import { ContactEmailLink } from "@/features/legal/components/contact-email-link";
import { LegalSection } from "@/features/legal/components/legal-section";
import {
  ReadingPage,
  SpecList,
  type ReadingTocItem,
} from "@/features/legal/components/reading-page";
import { verificationGroups } from "@/features/verification/data/verification-cases";
import { summarizeVerification } from "@/features/verification/lib/display";

const toc: readonly ReadingTocItem[] = [
  { id: "why", title: "Why I made ORBIX" },
  { id: "my-role", title: "My role" },
  { id: "ai", title: "How I built it" },
  { id: "why-this-way", title: "Why I built it this way" },
  { id: "learned", title: "What I learned" },
  { id: "checks", title: "How the engineering is checked" },
  { id: "structure", title: "How it is organized" },
  { id: "facts", title: "Project facts" },
];

/**
 * "How I built ORBIX": the project story in the owner's own voice.
 *
 * Follows the reading-page pattern of the legal pages (spec 14) but without a
 * "Last updated" line, because that date belongs to the legal documents.
 * Every statement here must stay checkable against the repository: the first
 * commit date, the co-author lines in the git history, the stack in
 * package.json, the folder layers in the figure and the commands in
 * `.github/workflows`. "How it is organized" (`#structure`) is where the
 * removed `/showcase` page redirects.
 */
export function BuildLogPage() {
  // Counted from the same cases the Verification page prints, so the
  // figures here always match it.
  const verification = summarizeVerification(verificationGroups);

  return (
    <ReadingPage
      lead={
        <p>
          ORBIX is a personal project by {siteLegal.operatorName}. I planned it
          and researched the engineering behind it, and I used AI coding
          assistants as my build tools.
        </p>
      }
      title="How I built ORBIX"
      toc={toc}
    >
      <LegalSection id="why" title="Why I made ORBIX">
        <p>
          I plan to study aerospace engineering. I wanted one place where I
          could look at real aircraft and launch vehicles and work through the
          engineering behind them: lift and drag, the rocket equation, orbital
          transfers, shock waves and entry heating. ORBIX is that place, and it
          is free for anyone to use.
        </p>
      </LegalSection>

      <LegalSection id="my-role" title="My role">
        <p>
          ORBIX was my idea, and I planned all of it: which aircraft and launch
          vehicles to cover, which calculators to build, how the pages fit
          together, and how the site should look. I researched the engineering
          behind the tools and directed every version, sending work back until
          it met the standard I set.
        </p>
      </LegalSection>

      <LegalSection id="ai" title="How I built it">
        <p>
          I used AI coding assistants (Codex by OpenAI, then Claude Code by
          Anthropic) as my build tools. They wrote the code from my
          instructions, and they helped draft text and gather vehicle data,
          sources and image licenses, which I reviewed.
        </p>
        <p>
          The project history is public on{" "}
          <a href={siteLegal.sourceCodeUrl}>GitHub</a>. Commits made with Claude
          Code are marked as co-authored by it.
        </p>
      </LegalSection>

      <LegalSection id="why-this-way" title="Why I built it this way">
        <p>
          AI is changing how software is written, and engineers in every field
          will work alongside these tools. I wanted to learn to use them well:
          to describe exactly what I want, to check what comes back, and to turn
          my own ideas and research into something other people can use.
        </p>
      </LegalSection>

      <LegalSection id="learned" title="What I learned">
        <p>
          Building ORBIX taught me the basics of every aircraft and launch
          vehicle in it: what each one was designed to do and how its design
          serves that purpose.
        </p>
        <p>
          The bigger lesson came from the Engineering Lab. Before any tool could
          be built, I had to research how it works: which equation it uses, what
          goes into it, and what the result means. Across every tool in the lab,
          that meant learning how lift, drag, thrust, gravity, shock waves and
          heating actually behave, and working out a way for each one to be
          calculated.
        </p>
        <p>
          I also learned what it is like to run simulations: change one input,
          run it again, and see how an orbital transfer or a shock wave
          responds.
        </p>
        <p>
          And I got real experience with how software gets made, from planning
          features to testing and fixing mistakes, along with using AI as a
          professional tool: giving precise instructions, checking what comes
          back, and not accepting something until it is right.
        </p>
      </LegalSection>

      <LegalSection id="checks" title="How the engineering is checked">
        <p>
          The Verification page runs selected Engineering Lab calculations with
          the inputs of a published table or worked example and prints each
          result beside the published value. The results are not typed in: they
          come from the same functions the lab uses.
        </p>
        <p>
          {verification.withinRounding} of {verification.total} compared values
          fall within the rounding of the published figure. The other{" "}
          {verification.outsideRounding} are shown as they are, with a note on
          each.
        </p>
        <ButtonLink
          arrow="right"
          className="self-start"
          href="/verification"
          variant="tertiary"
        >
          See how ORBIX results compare with published reference values.
        </ButtonLink>
      </LegalSection>

      <LegalSection id="structure" title="How it is organized">
        <p>
          The code is split into four layers. Vehicle records, mission presets
          and material data come first. Each calculator is a small function for
          one calculation, such as a Hohmann transfer, and analyses combine
          several calculators into one study. React components draw the pages
          and import from the layers above, and the equations stay out of them.
        </p>
        {/* The figure and tables take the full reading track; the reading
            layout's prose list markers and indents stop here. */}
        <div className="mt-2 min-w-0 [&_li+li]:mt-0!">
          <ArchitectureFigure />
        </div>
        <p className="mt-6">
          Two GitHub Actions workflows run the checks below. The first six run
          together as{" "}
          <code className="orbix-data orbix-data--sm whitespace-nowrap">
            {formatCode("npm run validate", { breakAfterSlash: false })}
          </code>
          .
        </p>
        <div className="mt-2 min-w-0">
          <QualityChecks />
        </div>
      </LegalSection>

      <LegalSection id="facts" title="Project facts">
        <SpecList
          items={[
            { label: "Started", value: "August 2026" },
            { label: "Built with", value: "Next.js, React, TypeScript" },
            {
              label: "Source code",
              value: (
                <a className="wrap-anywhere" href={siteLegal.sourceCodeUrl}>
                  {siteLegal.sourceCodeUrl.replace(/^https:\/\//, "")}
                </a>
              ),
            },
            { label: "Contact", value: <ContactEmailLink /> },
          ]}
        />
      </LegalSection>
    </ReadingPage>
  );
}
