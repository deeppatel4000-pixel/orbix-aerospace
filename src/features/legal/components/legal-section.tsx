import type { ReactNode } from "react";

interface LegalSectionProps {
  readonly children: ReactNode;
  readonly id: string;
  readonly title: string;
}

/** One h2 section of a reading page, addressable by `#id`. */
export function LegalSection({ children, id, title }: LegalSectionProps) {
  const headingId = `${id}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className="scroll-mt-16 space-y-4"
      id={id}
    >
      <h2 id={headingId}>{title}</h2>
      {children}
    </section>
  );
}
