import { cn } from "@/lib/cn";

interface SectionHeadingProps {
  className?: string;
  description: string;
  eyebrow: string;
  title: string;
  titleId: string;
}

export function SectionHeading({
  className,
  description,
  eyebrow,
  title,
  titleId,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">
        {eyebrow}
      </p>
      <h2
        className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
        id={titleId}
      >
        {title}
      </h2>
      <p className="mt-5 text-lg leading-8 text-muted">{description}</p>
    </div>
  );
}
