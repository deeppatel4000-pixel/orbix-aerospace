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
 * One figure for each pathway that has an honest one (spec 9, Learn), set
 * in the 8-column figure track after "Why it matters": credited
 * public-domain photographs from `public/images`, shown whole, and diagrams
 * drawn by the Engineering Lab and Showcase components from preset inputs.
 * The entry pathway has none: no entry photograph is in `public/images`
 * and no lab preset starts from orbit, so its equations carry it.
 *
 * One caption rule, like a museum label: the frame holds only the image or
 * drawing, and the caption sits outside it, below, at a 38rem measure under
 * a "FIGURE N" caps label. A photograph's credit, licence and source link
 * close its caption in 12px muted text. The portrait photograph is the only
 * exception to placement, with its caption beside it from 640px. Every
 * caption states what is shown and where it comes from; none states a
 * vehicle figure that is not already in the photograph's record.
 *
 * Accepted exception: AllowanceBars (Figure 5) is the Showcase owner's
 * DiagramPlate and carries its own in-frame heading, so that figure has a
 * title inside the frame as well as the caption outside it. Its plate is
 * already framed, so its registration marks are hidden here.
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
  const label = `Figure ${figureIndex + 1}`;

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
      // Not wrapped in DiagramPlate: the large OrbitDiagram draws its own
      // registration marks around the drawing, and a second set reads as
      // noise. It fills the 8-column track, so its marks share the right
      // edge of the rules and equation blocks. Its legend and scale note
      // sit below the marks.
      return (
        <figure aria-labelledby={captionId} className="m-0 mt-14">
          <div className="w-full">
            <OrbitDiagram
              description="A circular orbit at 400 km, a circular orbit at 35,786 km, and the half ellipse that joins them, drawn to scale around Earth."
              finalAltitudeMetres={HERO_TRANSFER.finalAltitudeMetres}
              initialAltitudeMetres={HERO_TRANSFER.initialAltitudeMetres}
              size="large"
              title="Hohmann transfer from low Earth orbit to geostationary altitude"
            />
          </div>
          <Caption id={captionId} label={label}>
            A Hohmann transfer from a 400 km circular orbit to geostationary
            altitude, 35,786 km. The same drawing heads the Engineering Lab,
            where the Hohmann transfer analyzer computes the two burns.
          </Caption>
        </figure>
      );
    }

    case "mission-operations-engineering-communication": {
      const mission = getShowcaseMissionById("mars-transfer-concept");
      if (!mission || mission.diagram.kind !== "allowances") return null;
      return (
        <figure aria-labelledby={captionId} className="m-0 mt-14">
          {/* AllowanceBars comes framed (a bordered DiagramPlate), and
              registration marks belong on an unframed drawing, so Learn
              hides the plate's marks and sets its in-frame note muted.
              A plain variant is requested from the Showcase owner. */}
          <div className="[&_.orbix-label]:text-text-muted [&_.orbix-reg-marks]:hidden">
            <AllowanceBars
              diagram={mission.diagram}
              missionId={`learn-${mission.preset.id}`}
            />
          </div>
          <Caption id={captionId} label={label}>
            Maneuver allowances entered for the {mission.preset.name} preset, as
            the Showcase page presents them. Every bar shares one scale and
            every value carries its unit, so a reviewer can check the budget
            line by line.
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
      {/* The tonal treatment matches the vehicle profile photographs. */}
      <div
        className={cn(
          "overflow-hidden rounded-md border border-border bg-surface",
          portrait && "sm:col-span-5",
        )}
      >
        <Image
          alt={visual.alt}
          className="block h-auto w-full [filter:saturate(0.85)_contrast(1.05)]"
          height={visual.height}
          sizes={portrait ? PORTRAIT_SIZES : TRACK_SIZES}
          src={visual.src}
          width={visual.width}
        />
      </div>
      <Caption
        className={portrait ? "sm:col-span-3 sm:self-end" : "mt-6"}
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
 * "Photo: NASA, public domain. Source", in 12px muted text at the end of
 * the caption. The licence links to its terms where the record gives them.
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
    <span className="mt-3 block text-xs leading-5 text-text-muted">
      {credit ?? (license ? "Licence:" : null)}
      {license ? (credit ? ", " : " ") : null}
      {license && visual.licenseUrl ? (
        <a
          className="orbix-link"
          href={visual.licenseUrl}
          rel="noreferrer"
          target="_blank"
        >
          {license}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        license
      )}
      {credit || license ? ". " : null}
      <a
        className="orbix-link inline-flex items-center gap-1"
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
  className = "mt-6",
  id,
  label,
}: {
  children: ReactNode;
  /** Placement. Default `mt-6`: below the frame. */
  className?: string;
  id: string;
  label: string;
}) {
  return (
    <figcaption
      className={cn(
        "max-w-[38rem] text-sm leading-6 text-pretty text-text-secondary",
        className,
      )}
      id={id}
    >
      <span className="orbix-caps mb-2 block text-text-muted">{label}</span>
      {children}
    </figcaption>
  );
}
