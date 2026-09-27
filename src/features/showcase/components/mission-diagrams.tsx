import type { MissionDiagram } from "@/features/showcase/data/mission-showcase";
import { formatShowcaseNumber } from "@/features/showcase/components/format";

type TransferDiagram = Extract<MissionDiagram, { kind: "transfer" }>;
type AllowanceDiagram = Extract<MissionDiagram, { kind: "allowances" }>;

const HALF = 160;
const OUTER_RADIUS = 150;

function LegendSwatch({ dash, stroke }: { dash?: string; stroke: string }) {
  return (
    <svg aria-hidden="true" className="h-2 w-6 shrink-0" viewBox="0 0 24 8">
      <line
        stroke={stroke}
        strokeDasharray={dash}
        strokeWidth="2"
        x1="0"
        x2="24"
        y1="4"
        y2="4"
      />
    </svg>
  );
}

/**
 * Two circular orbits and the half ellipse that joins them, drawn to scale
 * around the planet. The ellipse has its focus at the planet's centre,
 * periapsis on the inner orbit and apoapsis on the outer one.
 */
export function TransferOrbitDiagram({
  diagram,
  missionId,
}: {
  diagram: TransferDiagram;
  missionId: string;
}) {
  const planet = diagram.planetRadiusKilometres;
  const inner = planet + diagram.initialAltitudeKilometres;
  const outer = planet + diagram.finalAltitudeKilometres;
  const scale = OUTER_RADIUS / outer;
  const r1 = inner * scale;
  const r2 = outer * scale;
  const semiMajor = (r1 + r2) / 2;
  const semiMinor = Math.sqrt(r1 * r2);
  const initial = formatShowcaseNumber(diagram.initialAltitudeKilometres);
  const final = formatShowcaseNumber(diagram.finalAltitudeKilometres);
  const captionId = `${missionId}-transfer-caption`;

  return (
    <figure aria-labelledby={captionId}>
      <svg
        aria-label={`Scale drawing: transfer from a ${initial} km circular orbit to a ${final} km circular orbit around Earth.`}
        className="mx-auto h-auto w-full max-w-[16rem]"
        role="img"
        viewBox={`0 0 ${HALF * 2} ${HALF * 2}`}
      >
        <circle
          cx={HALF}
          cy={HALF}
          fill="var(--orbix-surface-raised)"
          r={planet * scale}
          stroke="var(--orbix-border-strong)"
        />
        <circle
          cx={HALF}
          cy={HALF}
          fill="none"
          r={r1}
          stroke="var(--orbix-data-4)"
          strokeDasharray="2 3"
          strokeWidth="1.5"
        />
        <circle
          cx={HALF}
          cy={HALF}
          fill="none"
          r={r2}
          stroke="var(--orbix-data-1)"
          strokeWidth="2"
        />
        <path
          d={`M ${HALF - r1} ${HALF} A ${semiMajor} ${semiMinor} 0 0 1 ${HALF + r2} ${HALF}`}
          fill="none"
          stroke="var(--orbix-data-2)"
          strokeDasharray="6 4"
          strokeWidth="2"
        />
        <circle
          cx={HALF - r1}
          cy={HALF}
          fill="var(--orbix-data-2)"
          r="4"
          stroke="var(--orbix-surface)"
          strokeWidth="2"
        />
        <circle
          cx={HALF + r2}
          cy={HALF}
          fill="var(--orbix-data-2)"
          r="4"
          stroke="var(--orbix-surface)"
          strokeWidth="2"
        />
      </svg>
      <ul aria-label="Diagram key" className="orbix-label mt-3 grid gap-1">
        <li className="flex items-center gap-2">
          <LegendSwatch dash="2 3" stroke="var(--orbix-data-4)" />
          Initial orbit, {initial} km
        </li>
        <li className="flex items-center gap-2">
          <LegendSwatch stroke="var(--orbix-data-1)" />
          Target orbit, {final} km
        </li>
        <li className="flex items-center gap-2">
          <LegendSwatch dash="6 4" stroke="var(--orbix-data-2)" />
          Transfer half ellipse, dots mark the two burns
        </li>
      </ul>
      <figcaption className="orbix-label mt-2" id={captionId}>
        Drawn to scale from the preset altitudes and{" "}
        {diagram.planetRadiusSource === "calculator-default"
          ? "the calculators’ standard Earth radius"
          : "the preset’s planet radius"}{" "}
        of {formatShowcaseNumber(planet)} km.
        {r1 < 8
          ? " At this scale Earth and the initial orbit shrink to the burn marker at the center."
          : null}
      </figcaption>
    </figure>
  );
}

/** The preset's ordered maneuver allowances as bars on one scale. */
export function AllowanceBars({
  diagram,
  missionId,
}: {
  diagram: AllowanceDiagram;
  missionId: string;
}) {
  const largest = Math.max(
    ...diagram.maneuvers.map((maneuver) => maneuver.deltaVMetresPerSecond),
  );
  const captionId = `${missionId}-allowances-caption`;

  return (
    <figure aria-labelledby={captionId}>
      <figcaption className="orbix-h4 text-text-primary" id={captionId}>
        Delta-v allowances, in flight order
      </figcaption>
      <ol className="mt-3 grid gap-3">
        {diagram.maneuvers.map((maneuver) => (
          <li key={maneuver.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 text-sm">
              <span className="text-text-secondary">{maneuver.name}</span>
              <span className="orbix-data text-text-primary">
                {formatShowcaseNumber(maneuver.deltaVMetresPerSecond)}{" "}
                <span className="text-muted">m/s</span>
              </span>
            </div>
            <div aria-hidden="true" className="mt-1 h-1 rounded-sm bg-border">
              <div
                className="h-1 rounded-sm bg-data-1"
                style={{
                  width: `${(maneuver.deltaVMetresPerSecond / largest) * 100}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 border-t border-border-subtle pt-3 text-sm">
        <span className="text-text-secondary">Sum of the allowances</span>
        <span className="orbix-data text-text-primary">
          {formatShowcaseNumber(diagram.sumMetresPerSecond)}{" "}
          <span className="text-muted">m/s</span>
        </span>
      </p>
      <p className="orbix-label mt-2">
        Allowances are preset inputs, not optimized trajectory values.
      </p>
    </figure>
  );
}
