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
    <div className={cn("max-w-[44rem]", className)}>
      <p className="orbix-kicker">{eyebrow}</p>
      <h2
        className="font-display mt-5 text-4xl leading-[1.02] font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
        id={titleId}
      >
        {title}
      </h2>
      <p className="mt-6 max-w-[42rem] text-lg leading-8 text-muted">
        {description}
      </p>
    </div>
  );
}
