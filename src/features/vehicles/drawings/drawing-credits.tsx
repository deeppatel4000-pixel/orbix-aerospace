import Link from "next/link";
import { Fragment } from "react";

import {
  getVehicleDrawing,
  type VehicleDrawing,
} from "@/features/vehicles/data/gallery-drawings";

interface CreditedVehicle {
  readonly id: string;
  readonly name: string;
}

interface CreditGroup {
  readonly drawing: VehicleDrawing;
  readonly names: string[];
}

/**
 * Underlined like a caption link wherever the credit is set, so a link is
 * never told apart by color alone (WCAG 1.4.1).
 */
const LINK =
  "underline decoration-1 underline-offset-[3px] hover:text-ink" as const;

/** "A", "A and B", "A, B and C". */
function joinNames(names: readonly string[]) {
  if (names.length < 2) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/** The credit without the license name, which is printed as its own link. */
function author(drawing: VehicleDrawing) {
  return drawing.credit.replace(`, ${drawing.license}`, "");
}

/** Short license name: "public domain" or "CC BY-SA 4.0". */
function licenceName(drawing: VehicleDrawing) {
  return drawing.license.startsWith("Public domain")
    ? "public domain"
    : drawing.license;
}

/**
 * The vehicles' outline drawings, grouped by source drawing, in the order
 * given. Vehicles with no drawing are skipped.
 */
export function drawingCreditGroups(
  vehicles: readonly CreditedVehicle[],
): readonly CreditGroup[] {
  const groups = new Map<string, CreditGroup>();
  for (const vehicle of vehicles) {
    const drawing = getVehicleDrawing(vehicle.id);
    if (!drawing) continue;
    const group = groups.get(drawing.sourceUrl) ?? { drawing, names: [] };
    group.names.push(vehicle.name);
    groups.set(drawing.sourceUrl, group);
  }
  return [...groups.values()];
}

/**
 * The credit line for traced outlines, one sentence per source drawing:
 * "F-22 Raptor: U.S. Air Force, via Wikimedia Commons, public domain.
 * Source." A CC BY-SA source adds what was changed and that the outline is
 * shared under the same license, as the license asks.
 */
export function DrawingCredits({
  vehicles,
}: {
  vehicles: readonly CreditedVehicle[];
}) {
  const groups = drawingCreditGroups(vehicles);
  if (groups.length === 0) return null;

  return (
    <>
      {groups.map(({ drawing, names }, index) => {
        const label = joinNames(names);
        return (
          <Fragment key={drawing.sourceUrl}>
            {index > 0 ? " " : null}
            {label}: {author(drawing)},{" "}
            <a
              aria-label={`${drawing.license}, license of the ${label} drawing`}
              className={LINK}
              href={drawing.licenseUrl}
              rel="noopener noreferrer license"
            >
              {licenceName(drawing)}
            </a>
            {drawing.shareAlike
              ? "; cropped, labels removed, outline shared under CC BY-SA 4.0"
              : ""}
            .{" "}
            <a
              aria-label={`Source drawing of the ${label}`}
              className={LINK}
              href={drawing.sourceUrl}
              rel="noopener noreferrer"
            >
              Source
            </a>
            .
          </Fragment>
        );
      })}
    </>
  );
}

/** The license every U.S. government drawing in the set carries. */
const US_GOVERNMENT_PD = "Public domain (U.S. government work)";

/**
 * A scale figure's source line, kept short (v4 plan section 7): the
 * public-domain U.S. government drawings in one phrase, named only when
 * other sources are in the set too; every CC BY-SA drawing credited in
 * full, with what was changed, as its license asks; then a link to every
 * source on the credits page.
 */
export function DrawingSourceNote({
  vehicles,
}: {
  vehicles: readonly CreditedVehicle[];
}) {
  const groups = drawingCreditGroups(vehicles);
  if (groups.length === 0) return null;

  const isGovernment = (group: CreditGroup) =>
    group.drawing.license === US_GOVERNMENT_PD;
  const government = groups.filter(isGovernment);
  const others = vehicles.filter((vehicle) =>
    groups.some(
      (group) => !isGovernment(group) && group.names.includes(vehicle.name),
    ),
  );
  const governmentNames = government.flatMap((group) => group.names);

  return (
    <>
      {government.length > 0
        ? others.length === 0
          ? "Outlines traced from U.S. government drawings, public domain. "
          : `${joinNames(governmentNames)} outlines traced from U.S. government drawings, public domain. `
        : null}
      {others.length > 0 ? (
        <>
          <DrawingCredits vehicles={others} />{" "}
        </>
      ) : null}
      Every source is listed on the{" "}
      <Link className={LINK} href="/credits#drawings">
        credits page
      </Link>
      .
    </>
  );
}
