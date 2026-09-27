import {
  formatAircraftVariantStatus,
  formatFirstFlight,
} from "@/features/aircraft/utils";
import { DataTable } from "@/features/vehicles/components/data-table";
import { VehicleProfileSection } from "@/features/vehicles/components/vehicle-profile-section";
import type { AircraftVariant } from "@/features/vehicles/types";

interface VariantsPanelProps {
  name: string;
  variants: readonly AircraftVariant[];
}

/** Variants (spec 14): one row per recorded variant. */
export function VariantsPanel({ name, variants }: VariantsPanelProps) {
  return (
    <VehicleProfileSection id="variants" title="Variants">
      <DataTable
        caption={`${name} variants`}
        columns={[
          { label: "Designation" },
          { label: "Name" },
          { label: "Status" },
          { label: "First flight" },
          { label: "Notes" },
        ]}
        rows={variants.map((variant) => ({
          cells: [
            <span key="name">{variant.name}</span>,
            <span className="whitespace-nowrap" key="status">
              {formatAircraftVariantStatus(variant.status)}
            </span>,
            variant.firstFlight ? (
              <span className="whitespace-nowrap" key="flight">
                {formatFirstFlight(variant.firstFlight)}
              </span>
            ) : (
              <span className="text-muted" key="flight">
                Not published
              </span>
            ),
            variant.notes ? (
              <span key="notes">{variant.notes}</span>
            ) : (
              <span className="text-muted" key="notes">
                None recorded
              </span>
            ),
          ],
          header: (
            <span className="whitespace-nowrap">{variant.designation}</span>
          ),
          key: variant.id,
        }))}
      />
    </VehicleProfileSection>
  );
}
