import type { LearningArea } from "@/features/learn/types";

interface LearnContentsProps {
  areas: readonly LearningArea[];
}

/**
 * "Contents" list of in-page links to each pathway. Sticky beside the text
 * from 1024px; a plain list above the text below that. The label is not a
 * heading so the page keeps one h2 per pathway.
 */
export function LearnContents({ areas }: LearnContentsProps) {
  return (
    <nav aria-labelledby="learn-contents-label" className="lg:sticky lg:top-18">
      <p className="orbix-label text-foreground" id="learn-contents-label">
        Contents
      </p>
      <ol className="mt-3 border-l border-border">
        {areas.map((area) => (
          <li key={area.id}>
            <a
              className="block py-2 pl-4 text-sm leading-6 text-text-secondary transition-colors hover:text-accent hover:underline focus-visible:text-accent"
              href={`#${area.id}`}
            >
              {area.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
