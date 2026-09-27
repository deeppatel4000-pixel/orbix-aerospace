export type GroundTrackViewMode = "ground" | "orbit";

export interface OrbitGroundPathProps {
  readonly mode: GroundTrackViewMode;
}

/** The illustrative path and marker. Static: nothing pulses or moves. */
export function OrbitGroundPath({ mode }: OrbitGroundPathProps) {
  if (mode === "orbit") {
    return (
      <g aria-label="Illustrative orbit projection">
        <ellipse
          cx="360"
          cy="210"
          fill="none"
          rx="216"
          ry="86"
          stroke="var(--orbix-data-1)"
          strokeDasharray="7 5"
          strokeWidth="2"
          transform="rotate(-18 360 210)"
        />
        <circle
          cx="538"
          cy="144"
          fill="var(--orbix-data-2)"
          r="5"
          stroke="var(--orbix-surface)"
          strokeWidth="2"
        />
        <text
          fill="var(--orbix-data-axis)"
          fontFamily="var(--font-interface), sans-serif"
          fontSize="14"
          textAnchor="end"
          x="528"
          y="132"
        >
          Spacecraft (illustrative)
        </text>
      </g>
    );
  }

  return (
    <g aria-label="Illustrative surface ground track">
      <path
        d="M 60 235 C 128 126 205 126 270 224 S 408 320 470 206 S 590 106 660 194"
        fill="none"
        stroke="var(--orbix-data-1)"
        strokeDasharray="8 5"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <circle
        cx="470"
        cy="206"
        fill="var(--orbix-data-2)"
        r="5"
        stroke="var(--orbix-surface)"
        strokeWidth="2"
      />
      <text
        fill="var(--orbix-data-axis)"
        fontFamily="var(--font-interface), sans-serif"
        fontSize="14"
        x="484"
        y="200"
      >
        Illustrative position
      </text>
    </g>
  );
}
