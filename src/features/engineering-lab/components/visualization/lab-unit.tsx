import { cn } from "@/lib/cn";

/** Units set tight against their value: "50%", "28.5°". */
const TIGHT_UNITS = new Set(["%", "°"]);

/**
 * The unit after a lab figure, set the same way in every mission tool (the
 * report, metrics grid, viewer, replay, scene, briefing and demo): muted, at
 * 0.8em, after one space, matching the shared `RecordRow` unit. A percent or
 * degree sign sits tight against its value.
 *
 * The space is real text inside the unit span, so copied text and screen
 * readers get "120.41 m/s" rather than "120.41m/s".
 */
export function LabUnit({
  className,
  unit,
}: {
  readonly className?: string;
  readonly unit: string;
}) {
  return (
    <span className={cn("text-[0.8em] text-muted", className)}>
      {TIGHT_UNITS.has(unit) ? unit : ` ${unit}`}
    </span>
  );
}
