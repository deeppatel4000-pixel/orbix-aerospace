import { memo } from "react";

export interface EarthModelProps {
  readonly label?: string;
  readonly showGrid?: boolean;
}

export const EarthModel = memo(function EarthModel({
  label = "Earth reference body",
  showGrid = true,
}: EarthModelProps) {
  return (
    <figure
      aria-label={label}
      className="relative aspect-square w-44 sm:w-56 lg:w-64"
      role="img"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-4 rounded-full bg-[#4fc5d4]/12 blur-xl motion-safe:animate-pulse"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden rounded-full border border-[#7dd7dd]/35 shadow-[inset_-32px_-20px_55px_rgba(0,0,0,0.92),inset_18px_10px_34px_rgba(102,226,219,0.14),0_0_38px_rgba(73,181,190,0.2)]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 25%, rgba(150,231,223,0.45), transparent 18%), radial-gradient(ellipse at 38% 42%, rgba(40,116,107,0.85) 0 12%, transparent 13%), radial-gradient(ellipse at 60% 65%, rgba(32,91,83,0.85) 0 15%, transparent 16%), linear-gradient(135deg, #123d4b 0%, #0a2535 48%, #02070b 100%)",
        }}
      >
        <div className="absolute inset-y-0 right-0 w-[46%] bg-gradient-to-l from-black/90 via-black/45 to-transparent" />
        <div className="absolute top-[13%] left-[17%] h-[28%] w-[28%] rounded-full bg-white/8 blur-md" />

        {showGrid ? (
          <div className="absolute inset-0 opacity-35">
            <span className="absolute top-1/2 right-[4%] left-[4%] h-px bg-[#9be3df]/30" />
            <span className="absolute top-[28%] right-[8%] left-[8%] h-[18%] rounded-[50%] border-t border-[#9be3df]/25" />
            <span className="absolute right-[8%] bottom-[28%] left-[8%] h-[18%] rounded-[50%] border-b border-[#9be3df]/25" />
            <span className="absolute top-[4%] bottom-[4%] left-1/2 w-[34%] -translate-x-1/2 rounded-[50%] border-x border-[#9be3df]/25" />
            <span className="absolute top-[4%] bottom-[4%] left-1/2 w-[70%] -translate-x-1/2 rounded-[50%] border-x border-[#9be3df]/15" />
          </div>
        ) : null}
      </div>
      <figcaption className="sr-only">
        {label}. Stylized day and night hemispheres with atmospheric glow.
      </figcaption>
    </figure>
  );
});
