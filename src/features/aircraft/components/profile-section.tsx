import type { ReactNode } from "react";

interface ProfileSectionProps {
  children: ReactNode;
  description: string;
  eyebrow: string;
  id: string;
  title: string;
}

export function ProfileSection({
  children,
  description,
  eyebrow,
  id,
  title,
}: ProfileSectionProps) {
  const titleId = id + "-title";

  return (
    <section
      aria-labelledby={titleId}
      className="scroll-mt-28 border-t border-tactical/25 py-16 sm:py-20 lg:py-24"
      id={id}
    >
      <div className="grid gap-10 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-16 xl:gap-20">
        <div className="self-start lg:sticky lg:top-32">
          <p className="font-mono text-[0.66rem] tracking-[0.2em] text-tactical-amber uppercase">
            {eyebrow}
          </p>
          <h2
            className="font-display mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl"
            id={titleId}
          >
            {title}
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-muted">
            {description}
          </p>
          <div
            aria-hidden="true"
            className="mt-6 hidden h-px w-20 bg-tactical-amber/55 lg:block"
          />
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}
