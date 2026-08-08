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
    <div className={cn("max-w-[46rem]", className)}>
      <p className="orbix-kicker flex items-center gap-3">
        <span aria-hidden="true" className="h-px w-8 bg-accent/80" />
        {eyebrow}
      </p>
      <h2
        className="font-display mt-5 text-4xl leading-[0.98] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-[3.5rem]"
        id={titleId}
      >
        {title}
      </h2>
      <p className="mt-6 max-w-[42rem] text-base leading-8 text-muted sm:text-lg">
        {description}
      </p>
    </div>
  );
}
