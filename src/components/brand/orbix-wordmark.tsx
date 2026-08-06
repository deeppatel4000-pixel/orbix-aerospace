import Image from "next/image";

import { cn } from "@/lib/cn";

interface OrbixWordmarkProps {
  className?: string;
  priority?: boolean;
  title?: string;
}

export function OrbixWordmark({
  className,
  priority = false,
  title,
}: OrbixWordmarkProps) {
  return (
    <span
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn(
        "orbix-official-wordmark relative block aspect-[2.64/1] shrink-0",
        className,
      )}
      role={title ? "img" : undefined}
    >
      <Image
        alt=""
        className="object-contain"
        fill
        priority={priority}
        sizes="(max-width: 640px) 180px, 360px"
        src="/brand/orbix-wordmark.png"
      />
    </span>
  );
}
