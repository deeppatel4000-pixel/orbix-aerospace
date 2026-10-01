import { DataTable } from "@/components/ui/data-table";
import {
  formatAircraftVariantStatus,
  formatFirstFlight,
} from "@/features/aircraft/utils";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { AircraftVariant } from "@/features/vehicles/types";

interface VariantsPanelProps {
  name: string;
  variants: readonly AircraftVariant[];
}

/**
 * The variant's name only when it adds something to the designation: not
 * for "F-22A" / "F-22A", nor for "F-22A" / "F-22A Raptor" on the F-22
 * Raptor's own page, where the rest of the name repeats the vehicle name.
 */
function variantSubName(variant: AircraftVariant, vehicleName: string) {
  if (variant.name === variant.designation) return undefined;
  if (variant.name.startsWith(variant.designation)) {
    const rest = variant.name.slice(variant.designation.length).trim();
    if (rest === "" || vehicleName.includes(rest)) return undefined;
  }
  return variant.name;
}

/** Dated variants by first flight, then those with no published date. */
function byFirstFlight(variants: readonly AircraftVariant[]) {
  return [...variants].sort((a, b) => {
    if (a.firstFlight && b.firstFlight) {
      return a.firstFlight.localeCompare(b.firstFlight);
    }
    return a.firstFlight ? -1 : b.firstFlight ? 1 : 0;
  });
}

/**
 * History and variants (spec 9): one row per recorded variant in order of
 * first flight. This replaces a separate History section, whose entries
 * were the same first-flight dates (and, for a single-variant aircraft,
 * only the date already given in the Overview).
 */
export function VariantsPanel({ name, variants }: VariantsPanelProps) {
  return (
    <VehicleProfileSection
      description="Each variant in the record in order of first flight, with its status and the date where one is published."
      id="variants"
      title="History and variants"
    >
      <DataTable
        singleLineCells
        caption={`${name} variants by first flight`}
        columns={[
          {
            // The name sits under the designation as a muted line, and only
            // when it says more than the designation and the vehicle name.
            cell: (variant) => {
              const subName = variantSubName(variant, name);
              return (
                <>
                  <span className="block whitespace-nowrap">
                    {variant.designation}
                  </span>
                  {subName ? (
                    <span className="block text-sm font-normal text-muted md:min-w-[10rem]">
                      {subName}
                    </span>
                  ) : null}
                </>
              );
            },
            header: "Variant",
            key: "designation",
          },
          {
            cell: (variant) => (
              <span className="whitespace-nowrap">
                {formatAircraftVariantStatus(variant.status)}
              </span>
            ),
            // On a phone status and first flight are set under the
            // designation, so the notes keep the rest of the width.
            foldInto: "designation",
            header: "Status",
            key: "status",
          },
          {
            cell: (variant) =>
              variant.firstFlight ? (
                <time
                  className="whitespace-nowrap"
                  dateTime={variant.firstFlight}
                >
                  {formatFirstFlight(variant.firstFlight)}
                </time>
              ) : (
                <span className="text-muted">Not published</span>
              ),
            foldCell: (variant) =>
              variant.firstFlight ? (
                <>
                  First flight{" "}
                  <time
                    className="whitespace-nowrap"
                    dateTime={variant.firstFlight}
                  >
                    {formatFirstFlight(variant.firstFlight)}
                  </time>
                </>
              ) : (
                "First flight not published"
              ),
            foldInto: "designation",
            header: "First flight",
            key: "first-flight",
          },
          {
            // At least 14rem from 48rem (18rem below, set by the `wrap`
            // column), so a note sets in a few lines instead of a narrow
            // column several lines taller than the rest of the row. 16rem
            // made the table scroll in the 1024px section column.
            cell: (variant) => (
              <span className="block md:min-w-[14rem]">
                {variant.notes ?? (
                  <span className="text-muted">None recorded</span>
                )}
              </span>
            ),
            header: "Notes",
            key: "notes",
            wrap: true,
          },
        ]}
        getRowKey={(variant) => variant.id}
        rows={byFirstFlight(variants)}
      />
    </VehicleProfileSection>
  );
}
