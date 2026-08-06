import Image from "next/image";

import { cn } from "@/lib/cn";

interface OrbixWordmarkProps {
  className?: string;
  priority?: boolean;
  sizes?: string;
  title?: string;
}

export function OrbixWordmark({
  className,
  priority = false,
  sizes = "160px",
  title,
}: OrbixWordmarkProps) {
  return (
    <span
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn(
        "orbix-official-wordmark relative block aspect-[1055/400] shrink-0",
        className,
      )}
      role={title ? "img" : undefined}
    >
      <Image
        alt=""
        className="object-contain"
        fill
        priority={priority}
        quality={90}
        sizes={sizes}
        src="/brand/orbix-wordmark-transparent.png"
      />
    </span>
  );
}
