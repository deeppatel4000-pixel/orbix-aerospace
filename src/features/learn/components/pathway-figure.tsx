import { ExternalLink } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { getAircraftVisual } from "@/features/aircraft/data/aircraft-visuals";
import { OrbitDiagram } from "@/features/engineering-lab/components/visualization";
import { getRocketVisual } from "@/features/rockets/data/rocket-visuals";
import { AllowanceBars } from "@/features/showcase/components/mission-diagrams";
import { getShowcaseMissionById } from "@/features/showcase/data/mission-showcase";
import { formatImageCredit } from "@/features/vehicles/components/vehicle-figure";
import type { VehiclePhotographRecord } from "@/features/vehicles/components/vehicle-photograph";
import { cn } from "@/lib/cn";

/**
 * One figure for each pathway that has an honest one (spec v3 sections 6,
 * 7 and 11): credited public-domain photographs from `public/images`, shown
 * whole as hard-edged plates (no frame, radius or fill), and diagrams drawn
 * by the Engineering Lab and Showcase components from preset inputs, as
 * linework on the ground. The entry pathway has none: no entry photograph
 * is in `public/images` and no lab preset starts from orbit, so its
 * equations carry it.
 *
 * One catalogue caption below each figure (spec 6): "Fig. 1  An F-22
 * Raptor in flight. ... U.S. Air Force, public domain. Source." in 14px
 * muted Plex Sans with the figure number in ink. The portrait photograph
 * alone sets its caption beside it from 640px. The two diagrams carry no
 * note of their own: their scale and preset facts are folded into the one
 * catalogue caption. Every caption states what is shown and where it
 * comes from; none states a vehicle figure that is not already in the
 * photograph's record.
 *
 * Below 640px the photographs bleed across the 16px page gutters, as a
 * band (spec 7); the caption stays in the text column.
 */

/** Pathways with a figure, in page order. Figures are numbered in it. */
const FIGURE_AREA_IDS = [
  "aerodynamics-flight-fundamentals",
  "propulsion-vehicle-performance",
  "high-speed-compressible-flow",
  "orbital-mechanics-mission-design",
  "mission-operations-engineering-communication",
] as const;

/**
 * Photograph sizes, measured: the figure track renders about 44.3rem wide
 * at 1440px (8 of 12 columns), the portrait about 27rem.
 */
const TRACK_SIZES = "(min-width: 72rem) 45rem, (min-width: 64rem) 62vw, 100vw";
const PORTRAIT_SIZES =
  "(min-width: 72rem) 27rem, (min-width: 40rem) 60vw, 100vw";

/**
 * The one pathway whose figure leaves the 8-column track: from 1024px the
 * orbit drawing sits after the key ideas across all 12 columns, larger and
 * centred, so the page changes scale once (tells T19).
 */
export const WIDE_FIGURE_AREA_ID = "orbital-mechanics-mission-design";

/** The Engineering Lab hero's transfer (engineering-dashboard.tsx). */
const HERO_TRANSFER = {
  finalAltitudeMetres: 35_786_000,
  initialAltitudeMetres: 400_000,
} as const;

interface PathwayFigureProps {
  /** The pathway's `id`. */
  areaId: string;
}

export function PathwayFigure({ areaId }: PathwayFigureProps) {
  const figureIndex = (FIGURE_AREA_IDS as readonly string[]).indexOf(areaId);
  if (figureIndex === -1) return null;
  const captionId = `${areaId}-figure-caption`;
  const label = `Fig. ${figureIndex + 1}`;

  switch (areaId) {
    case "aerodynamics-flight-fundamentals": {
      const visual = getAircraftVisual("f-22-raptor");
      if (!visual) return null;
      return (
        <PhotoFigure
          captionId={captionId}
          name="F-22 Raptor"
          visual={visual}
          label={label}
        >
          An F-22 Raptor in flight. In steady, level flight the wing&apos;s lift
          equals the aircraft&apos;s weight and the engines&apos; thrust equals
          its drag. The lift and drag equations below say how each depends on
          airspeed, air density and wing area.
        </PhotoFigure>
      );
    }

    case "propulsion-vehicle-performance": {
      const visual = getRocketVisual("saturn-v");
      if (!visual) return null;
      return (
        <PhotoFigure
          captionId={captionId}
          name="Saturn V"
          portrait
          visual={visual}
          label={label}
        >
          Saturn V lifting off for Apollo 11 from Launch Complex 39A. Most of a
          launch vehicle&apos;s mass at liftoff is propellant, which is why the
          rocket equation rewards high exhaust velocity and staging. Saturn V
          dropped two stages before reaching orbit.
        </PhotoFigure>
      );
    }

    case "high-speed-compressible-flow": {
      const visual = getAircraftVisual("sr-71-blackbird");
      if (!visual) return null;
      return (
        <PhotoFigure
          captionId={captionId}
          name="SR-71 Blackbird"
          visual={visual}
          label={label}
        >
          NASA&apos;s SR-71B. Each engine inlet carries a conical spike that
          moves fore and aft with Mach number. The spike&apos;s conical shock,
          followed by a normal shock inside the inlet, slows the air to subsonic
          speed before it reaches the engine.
        </PhotoFigure>
      );
    }

    case "orbital-mechanics-mission-design": {
      // OrbitDiagram is its own <figure>; its `caption` slot replaces the
      // default scale note, so the legend and one catalogue caption are
      // the only text under the drawing. Placed wide by the section.
      return (
        <div className="mx-auto w-full lg:max-w-[50rem]">
          <OrbitDiagram
            caption={
              <span className="block max-w-[38rem] text-pretty">
                <span className="orbix-caption__number">{label}</span> A Hohmann
                transfer from a 400 km circular orbit to geostationary altitude,
                35,786 km, drawn to scale from the computed altitudes. The same
                drawing heads the Engineering Lab, where the Hohmann transfer
                analyzer computes the two burns.
              </span>
            }
            description="A circular orbit at 400 km, a circular orbit at 35,786 km, and the half ellipse that joins them, drawn to scale around Earth."
            finalAltitudeMetres={HERO_TRANSFER.finalAltitudeMetres}
            initialAltitudeMetres={HERO_TRANSFER.initialAltitudeMetres}
            size="large"
            title="Hohmann transfer from low Earth orbit to geostationary altitude"
          />
        </div>
      );
    }

    case "mission-operations-engineering-communication": {
      const mission = getShowcaseMissionById("mars-transfer-concept");
      if (!mission || mission.diagram.kind !== "allowances") return null;
      return (
        <figure aria-labelledby={captionId} className="m-0 mt-14">
          {/* AllowanceBars (Showcase) sets a short label above the bars and
              a note below them. On Learn both are folded into the catalogue
              caption: the label stays only as the inner figure's accessible
              name (sr-only) and the note is hidden, so each figure has one
              caption voice. */}
          <div className="[&_.orbix-figure>figcaption]:hidden [&_.orbix-figure>p:first-child]:sr-only">
            <AllowanceBars
              diagram={mission.diagram}
              missionId={`learn-${mission.preset.id}`}
            />
          </div>
          <Caption id={captionId} label={label}>
            Delta-v allowances for the {mission.preset.name} preset, in flight
            order, as the Showcase page presents them. The allowances are preset
            inputs, not optimized trajectory values; their sum is the only
            derived number. Every bar shares one scale and every value carries
            its unit.
          </Caption>
        </figure>
      );
    }

    default:
      return null;
  }
}

function PhotoFigure({
  captionId,
  children,
  label,
  name,
  portrait = false,
  visual,
}: {
  captionId: string;
  /** Caption text. */
  children: ReactNode;
  label: string;
  name: string;
  /** A tall subject: 5 of 8 columns, caption beside it from 640px. */
  portrait?: boolean;
  visual: VehiclePhotographRecord;
}) {
  return (
    <figure
      aria-labelledby={captionId}
      className={cn(
        "m-0 mt-14",
        portrait && "grid gap-6 sm:grid-cols-8 sm:gap-x-8",
      )}
    >
      {/* A hard-edged plate: no frame, radius or fill (spec 3.2, 7). The
          tonal treatment matches the vehicle profile photographs. */}
      <div className={cn("max-sm:-mx-4", portrait && "sm:col-span-5")}>
        <Image
          alt={visual.alt}
          className="block h-auto w-full rounded-none [filter:saturate(0.9)]"
          height={visual.height}
          sizes={portrait ? PORTRAIT_SIZES : TRACK_SIZES}
          src={visual.src}
          width={visual.width}
        />
      </div>
      <Caption
        className={portrait ? "sm:col-span-3 sm:mt-0 sm:self-end" : undefined}
        id={captionId}
        label={label}
      >
        {children}
        <PhotoCredit name={name} visual={visual} />
      </Caption>
    </figure>
  );
}

/**
 * "Photo: NASA, public domain. Source." closing the caption sentence. The
 * licence links to its terms where the record gives them.
 */
function PhotoCredit({
  name,
  visual,
}: {
  name: string;
  visual: VehiclePhotographRecord;
}) {
  const credit = formatImageCredit(visual);
  const license = visual.license
    ?.trim()
    .replace(/^Public domain/, "public domain");

  return (
    <span>
      {" "}
      {credit ?? (license ? "Licence:" : null)}
      {license ? (credit ? ", " : " ") : null}
      {license && visual.licenseUrl ? (
        <a href={visual.licenseUrl} rel="noreferrer" target="_blank">
          {license}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        license
      )}
      {credit || license ? ". " : null}
      <a
        className="inline-flex items-center gap-1"
        href={visual.sourceUrl}
        rel="noreferrer"
        target="_blank"
      >
        Source
        <span className="sr-only">
          {" "}
          of the {name} photograph (opens in a new tab)
        </span>
        <ExternalLink aria-hidden="true" size={12} />
      </a>
    </span>
  );
}

function Caption({
  children,
  className,
  id,
  label,
}: {
  children: ReactNode;
  /** Placement. Default: below the plate. */
  className?: string;
  id: string;
  label: string;
}) {
  return (
    <figcaption
      className={cn("orbix-caption max-w-[38rem] text-pretty", className)}
      id={id}
    >
      <span className="orbix-caption__number">{label}</span> {children}
    </figcaption>
  );
}
