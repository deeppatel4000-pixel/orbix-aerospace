"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { buttonClass } from "@/components/ui/button-class";
import { DataTable } from "@/components/ui/data-table";
import { formatFigure } from "@/components/ui/readout";
import { RecordRow } from "@/components/ui/record-row";
import { EARTH_MEAN_RADIUS_METRES } from "@/features/engineering-lab/calculators";
import { cn } from "@/lib/cn";

import { formatStretchFactor, type StretchMap } from "./stretch-map";
import {
  altitudeToPosition,
  selectionForAltitude,
  selectionForStop,
  snapTarget,
  TARGET_MIN_ALTITUDE_METRES,
  TARGET_SCALE_STEPS,
  TARGET_STOPS,
  type TargetSelection,
} from "./target-scale";
import { TransferCanvas, transferCanvasMap } from "./transfer-canvas";
import {
  burnDecimals,
  computeTransferModel,
  craftStateAt,
  formatAltitudeKm,
  formatDuration,
  formatSpeed,
  narrateTransfer,
  totalDecimals,
  TRANSFER_ASSUMPTIONS,
  type TransferModel,
} from "./transfer-model";
import { usePrefersReducedMotion, useScrubber } from "./use-scrubber";

/** Real time the Play button takes to run the whole coast. */
export const TRANSFER_PLAY_DURATION_MS = 8_000;
/**
 * Past the outer ring, dragging across the drawn altitude span moves half
 * the log scale.
 */
const DRAG_SPAN_STEPS = TARGET_SCALE_STEPS / 2;
/** Scrubber positions; reduced motion steps it in halves. */
const SCRUBBER_STEPS = 1_000;
/** Delay before the live region announces a new total. */
const ANNOUNCE_DELAY_MS = 500;

export interface TransferExplorerProps {
  /**
   * `full` (default): drawing beside the controls, with narration, the
   * craft's playback and the table. `compact`: a hero-sized column with
   * the drawing, the total, the slider and a link to the lab.
   */
  readonly variant?: "compact" | "full";
  /** Starting circular orbit altitude, metres. Default 200 km. */
  readonly initialAltitudeMetres?: number;
  /** Target altitude the explorer opens on, metres. Default GEO. */
  readonly defaultTargetAltitudeMetres?: number;
  /** Compact only: where "Open in the Engineering Lab" goes. */
  readonly labHref?: string;
  /**
   * Compact only: classes for that link, for example to hide it where the
   * page already offers the lab right after the explorer.
   */
  readonly labLinkClassName?: string;
  readonly className?: string;
}

interface TableRow {
  readonly step: string;
  readonly altitude: string;
  readonly before: string;
  readonly after: string;
  readonly deltaV: string;
  readonly time: string;
}

function tableRows(model: TransferModel): TableRow[] {
  const d1 = burnDecimals(model.firstBurnDeltaVMetresPerSecond);
  const d2 = burnDecimals(model.secondBurnDeltaVMetresPerSecond);
  return [
    {
      after: formatSpeed(model.departureSpeedMetresPerSecond, d1),
      altitude: formatAltitudeKm(model.initial.altitudeMetres),
      before: formatSpeed(model.initial.circularSpeedMetresPerSecond, d1),
      deltaV: formatSpeed(model.firstBurnDeltaVMetresPerSecond, d1),
      step: "Burn 1",
      time: formatDuration(0),
    },
    {
      after: formatSpeed(model.target.circularSpeedMetresPerSecond, d2),
      altitude: formatAltitudeKm(model.target.altitudeMetres),
      before: formatSpeed(model.arrivalSpeedMetresPerSecond, d2),
      deltaV: formatSpeed(model.secondBurnDeltaVMetresPerSecond, d2),
      step: "Burn 2",
      time: formatDuration(model.transferTimeSeconds),
    },
    {
      after: "",
      altitude: "",
      before: "",
      deltaV: formatSpeed(
        model.totalDeltaVMetresPerSecond,
        totalDecimals(model),
      ),
      step: "Total",
      time: "",
    },
  ];
}

function valueText(selection: TargetSelection): string {
  const km = `${formatAltitudeKm(selection.altitudeMetres)} km`;
  return selection.stop ? `${km}, ${selection.stop.description}` : km;
}

/**
 * Slider position for a pointer `drawnRadius` from Earth's centre, read on
 * the map frozen when the drag began, so the ring stays under the pointer.
 * Past the outer ring the drag continues on the slider's log scale.
 */
export function dragPosition(map: StretchMap, drawnRadius: number): number {
  if (drawnRadius <= map.drawnMaxRadius) {
    const altitude = map.drawnToAltitude(drawnRadius);
    return altitude <= TARGET_MIN_ALTITUDE_METRES
      ? 0
      : altitudeToPosition(altitude);
  }
  const beyond =
    (drawnRadius - map.drawnMaxRadius) /
    (map.drawnMaxRadius - map.drawnPlanetRadius);
  return Math.min(
    TARGET_SCALE_STEPS,
    altitudeToPosition(map.maxAltitudeMetres) + beyond * DRAG_SPAN_STEPS,
  );
}

/**
 * V1 Transfer Explorer (v4 plan, section 5). Drag the target orbit, or use
 * the range input that mirrors it, and every number updates from the
 * Engineering Lab's Hohmann analysis. Play runs the craft along the arc on
 * Kepler timing; it never starts on its own and is absent under reduced
 * motion, where the position slider moves in three steps instead.
 */
export function TransferExplorer({
  className,
  defaultTargetAltitudeMetres = 35_786_000,
  initialAltitudeMetres = 200_000,
  labHref = "/engineering-lab",
  labLinkClassName,
  variant = "full",
}: TransferExplorerProps) {
  const full = variant === "full";
  const ids = {
    assumptions: useId(),
    scrubber: useId(),
    scrubberHelp: useId(),
    stops: useId(),
    target: useId(),
  };

  const [selection, setSelection] = useState<TargetSelection>(() =>
    selectionForAltitude(defaultTargetAltitudeMetres),
  );
  // Latest selection for pointer handlers; written only in `choose`.
  const selectionRef = useRef(selection);
  // The map frozen at the start of a pointer drag (null when not dragging).
  const [dragMap, setDragMap] = useState<StretchMap | null>(null);
  const dragMapRef = useRef<StretchMap | null>(null);
  const [touched, setTouched] = useState(false);

  const reducedMotion = usePrefersReducedMotion();
  const scrubber = useScrubber({
    durationMs: TRANSFER_PLAY_DURATION_MS,
    reducedMotion,
  });
  const { pause, setProgress } = scrubber;

  const model = useMemo(
    () => computeTransferModel(initialAltitudeMetres, selection.altitudeMetres),
    [initialAltitudeMetres, selection.altitudeMetres],
  );
  // Under reduced motion the position slider has three stations (0, half,
  // end); a position left between them by play shows the nearest one.
  const progress = reducedMotion
    ? Math.round(scrubber.progress * 2) / 2
    : scrubber.progress;
  const craft = model ? craftStateAt(model, progress) : null;
  const narration = model ? narrateTransfer(model) : null;
  const planetRadiusMetres =
    model?.planetRadiusMetres ?? EARTH_MEAN_RADIUS_METRES;
  const fittedMap = transferCanvasMap(
    planetRadiusMetres,
    initialAltitudeMetres,
    selection.altitudeMetres,
  );
  // While dragging, draw on the frozen map so the ring follows the
  // pointer; once the target passes the frozen outer ring, the fitted map
  // keeps the ring on the edge. Release rescales.
  const map =
    dragMap &&
    Math.max(initialAltitudeMetres, selection.altitudeMetres) <=
      dragMap.maxAltitudeMetres
      ? dragMap
      : fittedMap;

  function choose(next: TargetSelection) {
    if (next.altitudeMetres !== selectionRef.current.altitudeMetres) {
      pause();
      setTouched(true);
    }
    selectionRef.current = next;
    setSelection(next);
  }

  // Announce the new total once the user stops moving the target.
  const [announcement, setAnnouncement] = useState("");
  const announceText = model
    ? `Total ${formatSpeed(model.totalDeltaVMetresPerSecond, totalDecimals(model))} metres per second, transfer time ${formatDuration(model.transferTimeSeconds)}.`
    : "Target is the starting orbit. No transfer.";
  // Nothing is announced for the state the explorer opens on.
  const [openingText] = useState(announceText);
  useEffect(() => {
    if (announceText === openingText && announcement === "") return;
    const timer = window.setTimeout(
      () => setAnnouncement(announceText),
      ANNOUNCE_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [announceText, announcement, openingText]);

  const startKm = formatAltitudeKm(initialAltitudeMetres);
  const targetKm = formatAltitudeKm(selection.altitudeMetres);
  const title = `Hohmann transfer from ${startKm} km to ${targetKm} km`;
  const scaleSentence = map.toScale
    ? "Drawn to scale."
    : `Earth is to scale; heights above it are drawn ${formatStretchFactor(map.stretchFactor)} times taller.`;
  const description = model
    ? `Earth with a circular orbit at ${startKm} km and a circular orbit at ${targetKm} km, joined by half an ellipse travelled counter-clockwise. Burn 1 is on the right at ${startKm} km and burn 2 on the left at ${targetKm} km. ${scaleSentence}`
    : `Earth with one circular orbit at ${startKm} km. The target is the same orbit, so there is no transfer.`;

  // In the full layout the drawing stays in view beside the longer
  // controls column (narration, playback) while the page scrolls.
  const figure = (
    <figure
      className={cn(
        "m-0 min-w-0",
        full &&
          "@min-[56rem]:sticky @min-[56rem]:top-[calc(var(--header-height)+env(safe-area-inset-top,0px)+1rem)] @min-[56rem]:self-start",
      )}
    >
      <TransferCanvas
        craft={
          full && craft
            ? {
                radiusMetres: craft.radiusMetres,
                sweptAngleRadians: craft.sweptAngleRadians,
              }
            : undefined
        }
        className={full ? undefined : "mx-auto max-w-[30rem]"}
        description={description}
        dragHint={!touched}
        initialAltitudeMetres={initialAltitudeMetres}
        map={map}
        model={model}
        onTargetDrag={(drawnRadius) => {
          const frozen = dragMapRef.current;
          if (!frozen) return;
          choose(
            snapTarget(
              selectionRef.current.position,
              dragPosition(frozen, drawnRadius),
            ),
          );
        }}
        onTargetDragEnd={() => {
          dragMapRef.current = null;
          setDragMap(null);
        }}
        onTargetDragStart={() => {
          dragMapRef.current = fittedMap;
          setDragMap(fittedMap);
          setTouched(true);
        }}
        planetRadiusMetres={planetRadiusMetres}
        targetAltitudeMetres={selection.altitudeMetres}
        title={title}
      />
      <figcaption className="mt-3 text-sm text-muted">
        {map.toScale ? (
          "Drawn to scale."
        ) : (
          <>
            Earth is to scale; heights above it are drawn{" "}
            <span className="font-mono">
              {formatFigure(formatStretchFactor(map.stretchFactor))}
            </span>{" "}
            times taller.
          </>
        )}{" "}
        Drag the dashed target orbit or use the slider.
      </figcaption>
    </figure>
  );

  const targetNote = selection.stop?.note;
  const targetControl = (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <label className="text-sm font-medium text-muted" htmlFor={ids.target}>
          Target orbit altitude
        </label>
        <output
          aria-hidden="true"
          className="font-mono text-lg whitespace-nowrap text-foreground tabular-nums"
          htmlFor={ids.target}
        >
          {formatFigure(targetKm)}
          <span className="ml-1 text-sm text-muted">km</span>
        </output>
      </div>
      {targetNote ? <p className="text-sm text-muted">{targetNote}</p> : null}
      <input
        aria-describedby={ids.assumptions}
        aria-valuetext={valueText(selection)}
        className="h-11 w-full cursor-pointer accent-[var(--accent)]"
        id={ids.target}
        max={TARGET_SCALE_STEPS}
        min={0}
        onChange={(event) =>
          choose(
            snapTarget(
              selectionRef.current.position,
              Number(event.currentTarget.value),
            ),
          )
        }
        step={1}
        type="range"
        value={Math.round(selection.position)}
      />
      <div className="flex justify-between font-mono text-sm text-muted">
        <span>160 km</span>
        <span>{formatFigure("400,000")} km</span>
      </div>
      {full ? (
        <div
          aria-labelledby={ids.stops}
          className="mt-1 flex flex-nowrap items-center gap-2"
          role="group"
        >
          <span className="mr-1 text-sm text-muted" id={ids.stops}>
            Jump to
          </span>
          {TARGET_STOPS.map((stop) => (
            <button
              aria-pressed={selection.stop?.id === stop.id}
              className={buttonClass({ variant: "secondary" })}
              key={stop.id}
              onClick={() => choose(selectionForStop(stop))}
              type="button"
            >
              {stop.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  const d1 = model ? burnDecimals(model.firstBurnDeltaVMetresPerSecond) : 0;
  const d2 = model ? burnDecimals(model.secondBurnDeltaVMetresPerSecond) : 0;

  // The answer: total delta-v, the one large figure.
  const primary = model ? (
    <dl className="m-0 flex flex-wrap items-end gap-x-10 gap-y-4">
      <div className="flex min-w-0 flex-col gap-1">
        <dt className="text-sm font-medium text-muted">Total delta-v</dt>
        <dd className="orbix-readout-lg m-0 whitespace-nowrap text-foreground">
          {formatFigure(
            formatSpeed(model.totalDeltaVMetresPerSecond, totalDecimals(model)),
          )}
          <span className="ml-1.5 text-base text-muted">m/s</span>
        </dd>
      </div>
      {full ? null : (
        <div className="flex min-w-0 flex-col gap-1">
          <dt className="text-sm font-medium text-muted">Transfer time</dt>
          <dd className="m-0 font-mono text-lg whitespace-nowrap text-foreground tabular-nums">
            {formatFigure(formatDuration(model.transferTimeSeconds))}
          </dd>
        </div>
      )}
    </dl>
  ) : (
    <p className="text-base">
      The target is the starting orbit, so there is no transfer and no burn.
    </p>
  );

  const readouts = model ? (
    <RecordRow
      items={[
        {
          label: "Burn 1",
          unit: "m/s",
          value: formatSpeed(model.firstBurnDeltaVMetresPerSecond, d1),
        },
        {
          label: "Burn 2",
          unit: "m/s",
          value: formatSpeed(model.secondBurnDeltaVMetresPerSecond, d2),
        },
        {
          kind: "figure",
          label: "Transfer time",
          value: formatDuration(model.transferTimeSeconds),
        },
      ]}
    />
  ) : null;

  const scrubberStep = reducedMotion ? SCRUBBER_STEPS / 2 : 1;
  const craftText = craft
    ? `${formatDuration(craft.elapsedSeconds)} after burn 1, ${formatAltitudeKm(craft.altitudeMetres)} km up, ${formatSpeed(craft.speedMetresPerSecond)} m/s`
    : "";

  const playback =
    model && craft ? (
      <div className="flex flex-col gap-2">
        <label
          className="text-sm font-medium text-muted"
          htmlFor={ids.scrubber}
        >
          Craft position
        </label>
        <input
          aria-describedby={ids.scrubberHelp}
          aria-valuetext={craftText}
          className="h-11 w-full cursor-pointer accent-[var(--accent)]"
          id={ids.scrubber}
          max={SCRUBBER_STEPS}
          min={0}
          onChange={(event) => {
            scrubber.pause();
            setProgress(Number(event.currentTarget.value) / SCRUBBER_STEPS);
          }}
          step={scrubberStep}
          type="range"
          value={Math.round(progress * SCRUBBER_STEPS)}
        />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {reducedMotion ? null : (
            <Button
              aria-pressed={scrubber.playing}
              className="min-w-[9.5rem]"
              onClick={() =>
                scrubber.playing ? scrubber.pause() : scrubber.play()
              }
              variant="secondary"
            >
              {scrubber.playing ? "Pause" : "Play the coast"}
            </Button>
          )}
          <p
            className="min-w-0 flex-1 text-sm text-muted"
            id={ids.scrubberHelp}
          >
            {reducedMotion
              ? "Reduced motion is on, so the craft moves in three steps: burn 1, halfway in time, burn 2."
              : `Play runs the ${formatDuration(model.transferTimeSeconds)} coast in ${TRANSFER_PLAY_DURATION_MS / 1_000} seconds.`}
          </p>
        </div>
        <RecordRow
          items={[
            {
              kind: "figure",
              label: "Since burn 1",
              value: formatDuration(craft.elapsedSeconds),
            },
            {
              label: "Altitude",
              unit: "km",
              value: formatAltitudeKm(craft.altitudeMetres),
            },
            {
              label: "Speed",
              unit: "m/s",
              value: formatSpeed(craft.speedMetresPerSecond),
            },
          ]}
        />
      </div>
    ) : null;

  const table = model ? (
    <details>
      <summary className="cursor-pointer text-sm font-medium text-muted underline decoration-1 underline-offset-[3px] hover:text-foreground">
        Show the numbers as a table
      </summary>
      <DataTable
        caption={title}
        className="mt-4"
        columns={[
          { cell: (row: TableRow) => row.step, header: "Step", key: "step" },
          {
            cell: (row: TableRow) => row.altitude,
            header: "Altitude",
            key: "altitude",
            numeric: true,
            unit: "km",
          },
          {
            cell: (row: TableRow) => row.before,
            header: "Speed before",
            key: "before",
            numeric: true,
            unit: "m/s",
          },
          {
            cell: (row: TableRow) => row.after,
            header: "Speed after",
            key: "after",
            numeric: true,
            unit: "m/s",
          },
          {
            cell: (row: TableRow) => row.deltaV,
            header: "Delta-v",
            key: "deltaV",
            numeric: true,
            unit: "m/s",
          },
          {
            cell: (row: TableRow) => row.time,
            header: "Time after burn 1",
            key: "time",
            numeric: true,
          },
        ]}
        getRowKey={(row) => row.step}
        rows={tableRows(model)}
        singleLineCells
      />
    </details>
  ) : null;

  const assumptions = (
    <p className="text-sm text-muted" id={ids.assumptions}>
      {TRANSFER_ASSUMPTIONS}
    </p>
  );

  const live = (
    <p aria-live="polite" className="sr-only">
      {announcement}
    </p>
  );

  if (!full) {
    return (
      <div className={cn("flex min-w-0 flex-col gap-5", className)}>
        {figure}
        {primary}
        {targetControl}
        <div className="flex flex-col gap-2">
          <ButtonLink
            arrow="right"
            className={labLinkClassName}
            href={labHref}
            variant="tertiary"
          >
            Open in the Engineering Lab
          </ButtonLink>
          {assumptions}
        </div>
        {live}
      </div>
    );
  }

  return (
    <div className={cn("@container flex min-w-0 flex-col gap-8", className)}>
      <div className="grid min-w-0 gap-x-12 gap-y-8 @min-[56rem]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {figure}
        <div className="flex min-w-0 flex-col gap-7">
          {targetControl}
          <div className="flex flex-col gap-5">
            {primary}
            {readouts}
          </div>
          {narration ? (
            <ol className="m-0 flex list-none flex-col gap-3 p-0 text-base">
              <li>{narration.burn1}</li>
              <li>{narration.coast}</li>
              <li>{narration.burn2}</li>
            </ol>
          ) : null}
          {playback}
          {assumptions}
        </div>
      </div>
      {table}
      {live}
    </div>
  );
}
