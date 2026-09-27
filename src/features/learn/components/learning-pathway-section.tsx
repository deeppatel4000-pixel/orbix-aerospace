import Link from "next/link";

import type { LearningArea } from "@/features/learn/types";

interface LearningPathwaySectionProps {
  area: LearningArea;
}

/**
 * One reading pathway (spec 14, `/learn`): h2, summary, "Key ideas", "Try it
 * in the lab", "See it in ORBIX" and "Further reading", set as prose at the
 * 68ch measure. No per-pathway colour, no icon wells, no decorative numbers.
 */
export function LearningPathwaySection({ area }: LearningPathwaySectionProps) {
  const titleId = `${area.id}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className="mt-6 scroll-mt-18 border-t border-border-subtle pt-6 first:mt-0 first:border-t-0 first:pt-0 sm:mt-8 sm:pt-8"
      id={area.id}
    >
      <h2 className="orbix-h2 text-foreground" id={titleId}>
        {area.title}
      </h2>
      <div className="orbix-prose mt-4">
        <p className="text-foreground">{area.summary}</p>
        <p>{area.whyItMatters}</p>

        <h3>Key ideas</h3>
        <ul>
          {area.keyIdeas.map((idea) => (
            <li key={idea.text}>
              {idea.equation ? (
                <span className="mb-1 block">
                  <code className="text-foreground">{idea.equation}</code>
                </span>
              ) : null}
              {idea.text}
            </li>
          ))}
        </ul>

        <h3>Try it in the lab</h3>
        <ul>
          {area.labAnchors.map((anchor) => (
            <li key={anchor.anchorId}>
              <Link href={`/engineering-lab#${anchor.anchorId}`}>
                {anchor.label}
                <span className="sr-only">, Engineering Lab calculator</span>
              </Link>
            </li>
          ))}
        </ul>

        {area.explorationLinks.length > 0 ? (
          <>
            <h3>See it in ORBIX</h3>
            <ul>
              {area.explorationLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>. {link.description}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <h3>Further reading</h3>
        <ul>
          {area.furtherReading.map((reference) => (
            <li key={reference.title}>
              {reference.href ? (
                <a href={reference.href}>{reference.title}</a>
              ) : (
                <cite className="text-foreground not-italic">
                  {reference.title}
                </cite>
              )}
              . {reference.source}.
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
