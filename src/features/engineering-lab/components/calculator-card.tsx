import type { ReactNode } from "react";

import styles from "./calculator-card.module.css";

interface CalculatorCardProps {
  children: ReactNode;
  /** One sentence stating what the module calculates or shows. */
  description: string;
  headingLevel?: 2 | 3;
  id: string;
  /**
   * The tool's number in the Engineering Lab index ("01"), set in B612 Mono
   * in the accent above the title so the index and the panel read as one
   * system. Decorative: the index already announces it.
   */
  number?: string;
  title: string;
}

/**
 * The frame every Engineering Lab module renders in (spec 14): the module
 * name as a heading, one sentence of purpose, then the module itself. The
 * visual treatment lives in `calculator-card.module.css`.
 */
export function CalculatorCard({
  children,
  description,
  headingLevel = 2,
  id,
  number,
  title,
}: CalculatorCardProps) {
  const titleId = id + "-title";
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <article aria-labelledby={titleId} className={styles.card} id={id}>
      <header className={styles.header}>
        {number ? (
          <p
            aria-hidden="true"
            className="orbix-data mb-2 text-xs leading-none text-accent"
          >
            {number}
          </p>
        ) : null}
        <Heading className="orbix-h2 text-foreground" id={titleId}>
          {title}
        </Heading>
        <p className="mt-2 max-w-[68ch] text-base leading-7 text-text-secondary">
          {description}
        </p>
      </header>
      <div className={styles.workspace}>{children}</div>
    </article>
  );
}
