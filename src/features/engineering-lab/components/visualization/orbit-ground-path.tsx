export type GroundTrackViewMode = "ground" | "orbit";

export interface OrbitGroundPathProps {
  readonly animationPaused: boolean;
  readonly mode: GroundTrackViewMode;
}

export function OrbitGroundPath({
  animationPaused,
  mode,
}: OrbitGroundPathProps) {
  const markerClassName =
    "motion-reduce:animate-none " +
    (animationPaused ? "" : "motion-safe:animate-pulse");

  if (mode === "orbit") {
    return (
      <g aria-label="Illustrative orbit projection">
        <ellipse
          cx="360"
          cy="210"
          fill="none"
          rx="216"
          ry="86"
          stroke="#73d2c7"
          strokeDasharray="7 5"
          strokeWidth="2"
          transform="rotate(-18 360 210)"
        />
        <circle
          className={markerClassName}
          cx="538"
          cy="144"
          fill="#f2ead4"
          r="5"
          stroke="#73d2c7"
          strokeWidth="3"
        />
        <circle
          cx="538"
          cy="144"
          fill="none"
          r="12"
          stroke="#73d2c7"
          strokeOpacity="0.35"
        />
        <text
          fill="#a8babd"
          fontFamily="monospace"
          fontSize="10"
          x="553"
          y="140"
        >
          SPACECRAFT MARKER
        </text>
      </g>
    );
  }

  return (
    <g aria-label="Illustrative surface ground track">
      <path
        d="M 60 235 C 128 126 205 126 270 224 S 408 320 470 206 S 590 106 660 194"
        fill="none"
        stroke="#73d2c7"
        strokeDasharray="8 5"
        strokeLinecap="round"
        strokeWidth="2.5"
      />
      <path
        d="M 60 235 C 128 126 205 126 270 224 S 408 320 470 206 S 590 106 660 194"
        fill="none"
        stroke="#73d2c7"
        strokeOpacity="0.14"
        strokeWidth="10"
      />
      <circle
        className={markerClassName}
        cx="470"
        cy="206"
        fill="#f2ead4"
        r="5"
        stroke="#73d2c7"
        strokeWidth="3"
      />
      <circle
        cx="470"
        cy="206"
        fill="none"
        r="12"
        stroke="#73d2c7"
        strokeOpacity="0.35"
      />
      <text fill="#a8babd" fontFamily="monospace" fontSize="10" x="485" y="201">
        ILLUSTRATIVE POSITION
      </text>
    </g>
  );
}
