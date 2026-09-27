import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";

interface ShowcaseSectionProps {
  readonly children: ReactNode;
  /** The first section sits under the intro's own rule, so it draws none. */
  readonly first?: boolean;
  readonly id: string;
  readonly lead?: string;
  readonly title: string;
}

/** A page section: hairline above, h2, optional one-sentence lead. */
export function ShowcaseSection({
  children,
  first = false,
  id,
  lead,
  title,
}: ShowcaseSectionProps) {
  const titleId = `${id}-title`;

  return (
    <section aria-labelledby={titleId} className="pt-12 sm:pt-16" id={id}>
      <Container>
        <div
          className={first ? undefined : "border-t border-border-subtle pt-8"}
        >
          <h2 className="orbix-h2 text-text-primary" id={titleId}>
            {title}
          </h2>
          {lead ? (
            <p className="mt-3 max-w-[68ch] text-text-secondary">{lead}</p>
          ) : null}
          <div className="mt-8">{children}</div>
        </div>
      </Container>
    </section>
  );
}
