"use client";

import { useId, useRef, type PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/cn";

import { polarToSvg, sampleConic, toSvgPath, type Point } from "./conic-path";
import { createStretchMap, type StretchMap } from "./stretch-map";
import { formatAltitudeKm, type TransferModel } from "./transfer-model";
import { useFigureFontSize } from "./use-figure-font-size";

/** Drawing geometry, in viewBox units. */
export const CANVAS_VIEW_WIDTH = 440;
const CENTRE: Point = { x: 220, y: 186 };
export const CANVAS_DRAWN_MAX_RADIUS = 140;
export const CANVAS_DRAWN_EARTH_RADIUS = 44;
/** Text size before measurement (server render), in viewBox units. */
const FALLBACK_FONT_SIZE = 15;
/** Where the drag handle sits on the target ring. */
const HANDLE_ANGLE = (-3 * Math.PI) / 4;
/** Smallest radius Earth is drawn at, so it stays visible as a dot. */
const EARTH_MIN_DRAWN_RADIUS = 2;

export interface TransferCanvasCraft {
  readonly radiusMetres: number;
  readonly sweptAngleRadians: number;
}

export interface TransferCanvasProps {
  readonly initialAltitudeMetres: number;
  readonly targetAltitudeMetres: number;
  /** Earth's radius used by the analysis, metres. */
  readonly planetRadiusMetres: number;
  /** The computed transfer, or null when both orbits are the same. */
  readonly model: TransferModel | null;
  /** The craft's current position, if one is shown. */
  readonly craft?: TransferCanvasCraft;
  /** Accessible name of the drawing. */
  readonly title: string;
  /** Accessible description, computed from the same numbers. */
  readonly description: string;
  readonly className?: string;
  /**
   * The stretch map to draw with. Omitted, it is fitted to the two
   * altitudes. The explorer passes the map frozen at the start of a drag,
   * so the ring stays under the pointer.
   */
  readonly map?: StretchMap;
  /** Shows a "Drag the orbit" label beside the handle (before first use). */
  readonly dragHint?: boolean;
  /** Pointer drag of the target orbit begins. */
  readonly onTargetDragStart?: () => void;
  /**
   * Pointer drag of the target orbit moves: the pointer's distance from
   * Earth's centre, in drawing units.
   */
  readonly onTargetDrag?: (drawnRadius: number) => void;
  readonly onTargetDragEnd?: () => void;
}

/** The stretch map a canvas uses for a pair of altitudes. */
export function transferCanvasMap(
  planetRadiusMetres: number,
  initialAltitudeMetres: number,
  targetAltitudeMetres: number,
): StretchMap {
  return createStretchMap({
    drawnMaxRadius: CANVAS_DRAWN_MAX_RADIUS,
    drawnPlanetRadius: CANVAS_DRAWN_EARTH_RADIUS,
    maxAltitudeMetres: Math.max(initialAltitudeMetres, targetAltitudeMetres),
    planetRadiusMetres,
  });
}

function onCircle(radius: number, angle: number): Point {
  return {
    x: CENTRE.x + radius * Math.cos(angle),
    y: CENTRE.y - radius * Math.sin(angle),
  };
}

/**
 * The shared orbit drawing (v4 plan, section 5): Earth at a fixed drawn
 * radius, both circular orbits and the transfer half-ellipse sampled from
 * the true conic and stretched outward by altitude, labelled on the paths.
 * Burn 1 is on the right; the craft travels counter-clockwise over the top
 * to burn 2 on the left.
 */
export function TransferCanvas({
  className,
  craft,
  description,
  dragHint = false,
  initialAltitudeMetres,
  map: mapProp,
  model,
  onTargetDrag,
  onTargetDragEnd,
  onTargetDragStart,
  planetRadiusMetres,
  targetAltitudeMetres,
  title,
}: TransferCanvasProps) {
  const titleId = useId();
  const descriptionId = useId();
  const { fontSize, svgRef } = useFigureFontSize(
    CANVAS_VIEW_WIDTH,
    FALLBACK_FONT_SIZE,
  );
  const draggingRef = useRef(false);

  const map =
    mapProp ??
    transferCanvasMap(
      planetRadiusMetres,
      initialAltitudeMetres,
      targetAltitudeMetres,
    );
  const earthRadius = Math.max(EARTH_MIN_DRAWN_RADIUS, map.drawnPlanetRadius);
  // "Earth" goes inside the disc when it fits, otherwise to its left.
  const earthLabelInside = earthRadius >= 1.7 * fontSize;
  const startRadius = map.altitudeToDrawn(initialAltitudeMetres);
  const targetRadius = map.altitudeToDrawn(targetAltitudeMetres);
  const outerRadius = Math.max(startRadius, targetRadius);
  const innerRadius = Math.min(startRadius, targetRadius);
  const targetIsOuter = targetRadius >= startRadius;

  // The transfer arc, sampled from the true conic and drawn through the map.
  const arcPoints = model
    ? sampleConic({
        eccentricity: model.eccentricity,
        fromTrueAnomalyRadians: model.raising ? 0 : Math.PI,
        periapsisAngleRadians: model.raising ? 0 : Math.PI,
        semiMajorAxisMetres: model.semiMajorAxisMetres,
        toTrueAnomalyRadians: model.raising ? Math.PI : 2 * Math.PI,
      }).map((point) => polarToSvg(point, map, CENTRE))
    : [];
  const arcPath = arcPoints.length > 0 ? toSvgPath(arcPoints) : null;

  // "Transfer" sits above the arc's highest drawn point, or above the
  // outer ring there when the gap is too small for the text.
  let transferLabel: Point | null = null;
  // Direction of travel: an arrowhead 30% of the way along the drawn arc,
  // along its tangent (clear of the label over the top). The craft always
  // moves counter-clockwise in the drawing.
  let arrowPoints: string | null = null;
  if (arcPoints.length > 1) {
    const top = arcPoints.reduce((best, point) =>
      point.y < best.y ? point : best,
    );
    const dx = top.x - CENTRE.x;
    const ringY = CENTRE.y - Math.sqrt(Math.max(0, outerRadius ** 2 - dx ** 2));
    const underRing = top.y - 0.9 * fontSize;
    transferLabel = {
      x: top.x,
      y:
        underRing - 0.6 * fontSize > ringY + 2
          ? underRing
          : ringY - 0.9 * fontSize,
    };

    const lengths = [0];
    for (let index = 1; index < arcPoints.length; index++) {
      const a = arcPoints[index - 1]!;
      const b = arcPoints[index]!;
      lengths.push(lengths[index - 1]! + Math.hypot(b.x - a.x, b.y - a.y));
    }
    const goal = 0.3 * lengths[lengths.length - 1]!;
    const index = Math.max(
      1,
      lengths.findIndex((length) => length >= goal),
    );
    const a = arcPoints[index - 1]!;
    const b = arcPoints[index]!;
    const segment = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const ux = (b.x - a.x) / segment;
    const uy = (b.y - a.y) / segment;
    const t = (goal - lengths[index - 1]!) / segment;
    const tip = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    const corner = (along: number, across: number) =>
      `${(tip.x + ux * along - uy * across).toFixed(2)},${(tip.y + uy * along + ux * across).toFixed(2)}`;
    arrowPoints = [corner(5, 0), corner(-5, 4.5), corner(-5, -4.5)].join(" ");
  }

  const burn1 = onCircle(startRadius, 0);
  const burn2 = onCircle(targetRadius, Math.PI);
  const handle = onCircle(targetRadius, HANDLE_ANGLE);
  // Each burn is labelled beside its own marker, just under the line of
  // apsides (the arc leaves and arrives above it), so the label reads as
  // the place the burn happens, on whichever ring that is. A ground-colour
  // stroke under the glyphs breaks a ring line the label crosses.
  const burnLabelY = CENTRE.y + 0.95 * fontSize;
  const craftPoint = craft
    ? onCircle(map.radiusToDrawn(craft.radiusMetres), craft.sweptAngleRadians)
    : null;

  const startLabel = `Start ${formatAltitudeKm(initialAltitudeMetres)} km`;
  const targetLabel = `Target ${formatAltitudeKm(targetAltitudeMetres)} km`;
  const outerLabel = targetIsOuter ? targetLabel : startLabel;
  const innerLabelText = targetIsOuter ? startLabel : targetLabel;
  // The inner orbit's label goes under its ring: outside it when the gap
  // to the outer ring allows, otherwise inside it, raised by the ring's
  // sag over half the label's width (Plex Sans, about 0.56 em a character)
  // so the curve clears both ends of the text.
  const innerHalfWidth = 0.28 * fontSize * innerLabelText.length;
  const innerSag =
    innerRadius > innerHalfWidth
      ? innerRadius - Math.sqrt(innerRadius ** 2 - innerHalfWidth ** 2)
      : innerRadius;
  const innerLabelY =
    outerRadius - innerRadius >= 3.2 * fontSize ||
    innerRadius - earthRadius < 2 * fontSize + innerSag
      ? CENTRE.y + innerRadius + 1.3 * fontSize
      : CENTRE.y + innerRadius - innerSag - 0.5 * fontSize;
  const draggable = Boolean(onTargetDrag);

  function radialDistance(event: ReactPointerEvent<SVGElement>): number | null {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse(),
    );
    return Math.hypot(point.x - CENTRE.x, point.y - CENTRE.y);
  }

  function handlePointerDown(event: ReactPointerEvent<SVGElement>) {
    if (!onTargetDrag || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    onTargetDragStart?.();
  }

  function handlePointerMove(event: ReactPointerEvent<SVGElement>) {
    if (!draggingRef.current || !onTargetDrag) return;
    const distance = radialDistance(event);
    if (distance === null) return;
    onTargetDrag(distance);
  }

  function handlePointerEnd(event: ReactPointerEvent<SVGElement>) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onTargetDragEnd?.();
  }

  const dragHandlers = draggable
    ? {
        onLostPointerCapture: handlePointerEnd,
        onPointerCancel: handlePointerEnd,
        onPointerDown: handlePointerDown,
        onPointerMove: handlePointerMove,
        onPointerUp: handlePointerEnd,
      }
    : {};

  // Cropped to the outer ring and its labels.
  const viewTop = CENTRE.y - CANVAS_DRAWN_MAX_RADIUS - 1.6 * fontSize;
  const viewHeight = 2 * CANVAS_DRAWN_MAX_RADIUS + 3.3 * fontSize;

  return (
    <svg
      aria-labelledby={`${titleId} ${descriptionId}`}
      className={cn("block h-auto w-full overflow-visible", className)}
      fontSize={fontSize}
      ref={svgRef}
      role="img"
      viewBox={`0 ${viewTop.toFixed(2)} ${CANVAS_VIEW_WIDTH} ${viewHeight.toFixed(2)}`}
    >
      <title id={titleId}>{title}</title>
      <desc id={descriptionId}>{description}</desc>

      {/* Earth: a solid ground disc, so the orbits read apart from it. */}
      <circle
        cx={CENTRE.x}
        cy={CENTRE.y}
        fill="var(--bg-inset)"
        r={earthRadius}
        stroke="var(--rule-strong)"
        strokeWidth={0.75}
      />
      <text
        dominantBaseline="central"
        fill="var(--orbix-text-muted)"
        textAnchor={earthLabelInside ? "middle" : "end"}
        x={earthLabelInside ? CENTRE.x : CENTRE.x - earthRadius - 8}
        y={CENTRE.y}
      >
        Earth
      </text>

      {/* Starting orbit: solid. */}
      <circle
        cx={CENTRE.x}
        cy={CENTRE.y}
        fill="none"
        r={startRadius}
        stroke="var(--orbix-text-muted)"
        strokeWidth={1.5}
      />
      {/* Target orbit: dashed, so it reads without colour. */}
      <circle
        cx={CENTRE.x}
        cy={CENTRE.y}
        fill="none"
        r={targetRadius}
        stroke="var(--orbix-text-primary)"
        strokeDasharray="3 5"
        strokeWidth={1.5}
      />

      {arcPath ? (
        <path
          d={arcPath}
          fill="none"
          stroke="var(--accent)"
          strokeLinecap="round"
          strokeWidth={2.25}
        />
      ) : null}
      {arrowPoints ? (
        <polygon fill="var(--accent)" points={arrowPoints} />
      ) : null}

      {/* Direct labels. */}
      <text
        fill="var(--orbix-text-muted)"
        textAnchor="middle"
        x={CENTRE.x}
        y={CENTRE.y + outerRadius + 1.3 * fontSize}
      >
        {outerLabel}
      </text>
      {innerRadius !== outerRadius ? (
        <text
          fill="var(--orbix-text-muted)"
          textAnchor="middle"
          x={CENTRE.x}
          y={innerLabelY}
        >
          {innerLabelText}
        </text>
      ) : null}
      {model ? (
        <>
          {transferLabel ? (
            <text
              dominantBaseline="central"
              fill="var(--orbix-text-primary)"
              textAnchor="middle"
              x={transferLabel.x}
              y={transferLabel.y}
            >
              Transfer
            </text>
          ) : null}
          <circle cx={burn1.x} cy={burn1.y} fill="var(--accent)" r={4.5} />
          <circle cx={burn2.x} cy={burn2.y} fill="var(--accent)" r={4.5} />
          <text
            dominantBaseline="central"
            fill="var(--orbix-text-primary)"
            paintOrder="stroke"
            stroke="var(--orbix-bg-page)"
            strokeLinejoin="round"
            strokeWidth={4}
            x={burn1.x + 8}
            y={burnLabelY}
          >
            Burn 1
          </text>
          <text
            dominantBaseline="central"
            fill="var(--orbix-text-primary)"
            textAnchor="end"
            paintOrder="stroke"
            stroke="var(--orbix-bg-page)"
            strokeLinejoin="round"
            strokeWidth={4}
            x={burn2.x - 8}
            y={burnLabelY}
          >
            Burn 2
          </text>
        </>
      ) : null}

      {craftPoint ? (
        <circle
          cx={craftPoint.x}
          cy={craftPoint.y}
          fill="var(--orbix-text-primary)"
          r={6}
          stroke="var(--orbix-bg-page)"
          strokeWidth={2}
        />
      ) : null}

      {draggable ? (
        <g className="cursor-grab touch-none active:cursor-grabbing">
          {/* Wide invisible stroke: the whole target ring can be dragged. */}
          <circle
            cx={CENTRE.x}
            cy={CENTRE.y}
            fill="none"
            pointerEvents="stroke"
            r={targetRadius}
            stroke="transparent"
            strokeWidth={24}
            {...dragHandlers}
          />
          <circle
            cx={handle.x}
            cy={handle.y}
            fill="var(--orbix-bg-page)"
            r={7}
            stroke="var(--orbix-text-primary)"
            strokeWidth={2}
          />
          {/* 44px touch target around the handle. */}
          <circle
            cx={handle.x}
            cy={handle.y}
            fill="transparent"
            r={22}
            {...dragHandlers}
          />
          {dragHint ? (
            <text
              fill="var(--orbix-text-primary)"
              pointerEvents="none"
              textAnchor="end"
              x={handle.x - 14}
              y={handle.y}
            >
              {/* Two short lines, so the hint stays inside the drawing. */}
              <tspan dy="-0.2em" x={handle.x - 14}>
                Drag the
              </tspan>
              <tspan dy="1.15em" x={handle.x - 14}>
                orbit
              </tspan>
            </text>
          ) : null}
        </g>
      ) : null}
    </svg>
  );
}
