import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import styles from "./calculator-card.module.css";

interface CalculatorCardProps {
  children: ReactNode;
  description: string;
  eyebrow: string;
  headingLevel?: 2 | 3;
  icon: LucideIcon;
  id: string;
  title: string;
}

export function CalculatorCard({
  children,
  description,
  eyebrow,
  headingLevel = 2,
  icon: Icon,
  id,
  title,
}: CalculatorCardProps) {
  const titleId = id + "-title";
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <article aria-labelledby={titleId} className={styles.card} id={id}>
      <header className={`${styles.header} technical-grid`}>
        <div className={styles.headerLayout}>
          <span aria-hidden="true" className={styles.instrumentIndex}>
            LAB
          </span>
          <span className={styles.iconWell}>
            <Icon aria-hidden="true" size={23} strokeWidth={1.7} />
          </span>
          <div className="min-w-0">
            <p className={styles.eyebrow}>{eyebrow}</p>
            <Heading
              className="font-display mt-3 text-3xl leading-tight font-semibold tracking-[-0.04em] text-balance sm:text-4xl"
              id={titleId}
            >
              {title}
            </Heading>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted sm:text-[0.95rem] sm:leading-7">
              {description}
            </p>
          </div>
        </div>
      </header>
      <div className={styles.workspace}>{children}</div>
    </article>
  );
}
