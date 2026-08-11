import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import Link from "next/link";

import { AircraftImage } from "@/features/aircraft/components/aircraft-image";
import { RocketImage } from "@/features/rockets/components/rocket-image";
import { VehicleMediaFrame } from "@/features/vehicles/components/vehicle-media-frame";
import type {
  ComparisonCategory,
  ComparisonVehicle,
} from "@/features/compare/types";

/**
 * Column identity for the comparison matrix.
 *
 * ## Why this exists
 *
 * Measured on the shipped Compare route with three vehicles selected, the
 * page rendered exactly ONE image — the hero backdrop. The matrix identified
 * its columns by name and manufacturer alone, so a comparison of physical
 * vehicles carried no picture of any of them.
 *
 * This is a comparison header, deliberately NOT a `VehicleRecordCard`: no
 * description, no specification, no hover lift. Its whole job is to make the
 * matrix columns unmistakable and offer a route into each profile.
 *
 * ## Media geometry
 *
 * Reuses `VehicleMediaFrame` with the same domain variants the rest of ORBIX
 * uses — landscape for aircraft, portrait for launch vehicles — so vertical
 * rockets are never forced through a wide cover crop. Compare only ever shows
 * one category at a time (a single `category` governs the whole query, and
 * mixed-domain comparison is unsupported), so every column in a given
 * comparison shares one aspect and the row cannot go ragged.
 *
 * `AircraftImage` and `RocketImage` are used unmodified; neither has any
 * Compare-specific behaviour added.
 */
interface ComparisonIdentityStripProps {
  category: ComparisonCategory;
  vehicles: readonly ComparisonVehicle[];
}

export function ComparisonIdentityStrip({
  category,
  vehicles,
}: ComparisonIdentityStripProps) {
  const isAircraft = category === "aircraft";

  return (
    <ul
      aria-label="Vehicles in this comparison"
      className="orbix-compare-identity"
      data-vehicle-count={vehicles.length}
      // Drives the grid template so a two-vehicle comparison produces two
      // equal columns rather than two thirds of a three-column layout.
      style={{ "--orbix-compare-columns": vehicles.length } as CSSProperties}
    >
      {vehicles.map((vehicle) => (
        <li key={vehicle.id}>
          <VehicleMediaFrame
            aspect={isAircraft ? "landscape" : "portrait"}
            className="rounded-lg"
          >
            {isAircraft ? (
              <AircraftImage
                aircraft={{ id: vehicle.id, name: vehicle.name }}
                fillContainer
                imageClassName="saturate-[0.85]"
                sizes="(max-width: 767px) 45vw, 30vw"
              />
            ) : (
              <RocketImage
                fillContainer
                imageClassName="saturate-[0.85]"
                rocket={{ id: vehicle.id, name: vehicle.name }}
                sizes="(max-width: 767px) 45vw, 30vw"
              />
            )}
          </VehicleMediaFrame>

          <p className="orbix-compare-identity__name">{vehicle.name}</p>
          <p className="orbix-compare-identity__meta">{vehicle.manufacturer}</p>
          <Link className="orbix-home-link" href={vehicle.detailHref}>
            Open profile <ArrowUpRight aria-hidden="true" size={14} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
