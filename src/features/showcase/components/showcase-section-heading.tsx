import { cn } from "@/lib/cn";

interface ShowcaseSectionHeadingProps {
  align?: "left" | "center";
  className?: string;
  description: string;
  eyebrow: string;
  title: string;
  titleId: string;
}

export function ShowcaseSectionHeading({
  align = "left",
  className,
  description,
  eyebrow,
  title,
  titleId,
}: ShowcaseSectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      <p className="orbix-kicker">{eyebrow}</p>
      <h2
        className="font-display mt-4 text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
        id={titleId}
      >
        {title}
      </h2>
      <p className="mt-5 text-lg leading-8 text-muted">{description}</p>
    </div>
  );
}
