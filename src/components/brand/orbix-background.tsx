import { cn } from "@/lib/cn";

interface OrbixBackgroundProps {
  className?: string;
  variant?: "orbital" | "technical";
}

export function OrbixBackground({
  className,
  variant = "orbital",
}: OrbixBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="orbix-starfield absolute inset-0" />
      <div className="orbix-grid absolute inset-0 opacity-70" />
      {variant === "orbital" ? (
        <svg
          className="absolute top-[-14%] right-[-24%] h-[110%] w-[88%] text-accent/18"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 760 760"
        >
          <circle
            cx="380"
            cy="380"
            r="116"
            stroke="currentColor"
            strokeWidth="1"
          />
          <ellipse
            cx="380"
            cy="380"
            rx="305"
            ry="142"
            stroke="currentColor"
            strokeDasharray="4 8"
            strokeWidth="1"
            transform="rotate(-18 380 380)"
          />
          <ellipse
            cx="380"
            cy="380"
            rx="350"
            ry="205"
            stroke="var(--plasma-violet)"
            strokeOpacity="0.16"
            strokeWidth="1"
            transform="rotate(32 380 380)"
          />
          <path
            d="M52 380h656M380 52v656"
            stroke="currentColor"
            strokeDasharray="2 14"
            strokeOpacity="0.5"
          />
          <circle cx="656" cy="228" fill="var(--orbital-cyan)" r="4" />
          <circle cx="183" cy="550" fill="var(--plasma-violet)" r="3" />
        </svg>
      ) : (
        <div className="absolute inset-y-0 right-[12%] w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
      )}
      <div className="orbix-atmosphere-glow absolute -right-56 -bottom-80 h-[44rem] w-[44rem] rounded-full" />
    </div>
  );
}
