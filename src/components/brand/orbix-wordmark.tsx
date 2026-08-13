import Image from "next/image";

import { cn } from "@/lib/cn";

interface OrbixWordmarkProps {
  /**
   * Text describing the mark, when the mark itself is the content.
   *
   * Defaults to empty, which is right wherever a visible or `sr-only` label
   * already names the link — the site header, for one — because a decorative
   * duplicate would make assistive technology announce "ORBIX ORBIX". Pass a
   * value only where the image is the sole carrier of the name, such as the
   * homepage `h1`; the wrapper then stops hiding itself so the alt is reachable.
   */
  alt?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  source?: string;
  title?: string;
}

export function OrbixWordmark({
  alt = "",
  className,
  priority = false,
  sizes = "160px",
  source = "/brand/orbix-wordmark-transparent.png",
  title,
}: OrbixWordmarkProps) {
  const named = Boolean(title) || alt !== "";

  return (
    <span
      aria-hidden={named ? undefined : true}
      aria-label={title}
      className={cn(
        "orbix-official-wordmark relative block aspect-[1055/400] shrink-0",
        className,
      )}
      role={title ? "img" : undefined}
    >
      <Image
        alt={alt}
        className="object-contain"
        fill
        priority={priority}
        quality={90}
        sizes={sizes}
        src={source}
      />
    </span>
  );
}
