import {
  getVehicleDrawing,
  type VehicleDrawing,
} from "@/features/vehicles/data/gallery-drawings";
import { cn } from "@/lib/cn";

/** A drawing area in metres. */
export interface OutlineBox {
  readonly heightM: number;
  readonly widthM: number;
}

/**
 * The smallest box that holds every drawing at one scale: the widest
 * outline's width and the tallest (or longest) outline's height. Outlines
 * drawn in this box share one scale.
 */
export function sharedOutlineBox(
  drawings: readonly (VehicleDrawing | undefined)[],
): OutlineBox {
  const drawn = drawings.filter(
    (drawing): drawing is VehicleDrawing => drawing !== undefined,
  );
  return {
    heightM: Math.max(1, ...drawn.map((drawing) => drawing.heightM)),
    widthM: Math.max(1, ...drawn.map((drawing) => drawing.widthM)),
  };
}

/** The outline for each id, in order, skipping ids with no drawing. */
export function drawingsFor(ids: readonly string[]) {
  return ids.map((id) => getVehicleDrawing(id));
}

interface VehicleOutlineProps {
  /**
   * The area the outline sits in, in metres. Pass a shared box so several
   * outlines read at one scale; omitted, the outline fills its own box.
   */
  box?: OutlineBox;
  className?: string;
  drawing: VehicleDrawing;
}

/**
 * One traced outline (spec 8): a 1.5px line in the current colour, no
 * fill, centred across the box. A launch vehicle (side view) stands on the
 * bottom edge; an aircraft (top view, nose up) hangs from the top edge, so
 * noses line up. Decorative: the text beside it names the vehicle.
 */
export function VehicleOutline({
  box,
  className,
  drawing,
}: VehicleOutlineProps) {
  const area = box ?? { heightM: drawing.heightM, widthM: drawing.widthM };
  // A little room on every side so the stroke is never clipped.
  const pad = Math.max(area.widthM, area.heightM) * 0.03;
  const x = (area.widthM - drawing.widthM) / 2;
  const y = drawing.view === "side" ? area.heightM - drawing.heightM : 0;

  return (
    <svg
      aria-hidden="true"
      className={cn("block overflow-visible", className)}
      data-outline-of={drawing.vehicleId}
      focusable="false"
      preserveAspectRatio={
        drawing.view === "side" ? "xMidYMax meet" : "xMidYMid meet"
      }
      viewBox={`${-pad} ${-pad} ${area.widthM + 2 * pad} ${area.heightM + 2 * pad}`}
    >
      <path
        d={drawing.d}
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth={1.5}
        transform={`translate(${round(x)} ${round(y)})`}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function round(value: number) {
  return Math.round(value * 1000) / 1000;
}
