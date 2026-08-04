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
      className="scroll-mt-28 border-t border-border py-16 sm:py-20"
      id={id}
    >
      <div className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="font-mono text-[0.68rem] tracking-[0.18em] text-accent uppercase">
            {eyebrow}
          </p>
          <h2
            className="mt-3 text-3xl font-semibold tracking-[-0.035em]"
            id={titleId}
          >
            {title}
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted">{description}</p>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}
