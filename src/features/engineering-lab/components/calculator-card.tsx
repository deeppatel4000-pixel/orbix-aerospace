import type { ReactNode } from "react";

import styles from "./calculator-card.module.css";

interface CalculatorCardProps {
  children: ReactNode;
  /** One sentence stating what the module calculates or shows. */
  description: string;
  headingLevel?: 2 | 3;
  id: string;
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
  title,
}: CalculatorCardProps) {
  const titleId = id + "-title";
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <article aria-labelledby={titleId} className={styles.card} id={id}>
      <header className={styles.header}>
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
