import Image from "next/image";

import { cn } from "@/lib/cn";

interface OrbixMarkProps {
  className?: string;
  priority?: boolean;
  sizes?: string;
  title?: string;
}

export function OrbixMark({
  className,
  priority = false,
  sizes = "96px",
  title,
}: OrbixMarkProps) {
  return (
    <span
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn(
        "orbix-official-emblem relative block shrink-0 overflow-hidden rounded-[22%] drop-shadow-[0_0_18px_var(--plasma-violet)]",
        className,
      )}
      role={title ? "img" : undefined}
    >
      <Image
        alt=""
        className="scale-[1.16] object-contain mix-blend-screen"
        fill
        priority={priority}
        quality={90}
        sizes={sizes}
        src="/brand/orbix-app-mark.png"
      />
    </span>
  );
}
