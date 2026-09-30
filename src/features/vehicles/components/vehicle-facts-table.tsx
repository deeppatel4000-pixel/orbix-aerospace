import type { ReactNode } from "react";

import { DataTable } from "@/components/ui/data-table";

export interface VehicleFact {
  readonly label: string;
  /** Taken from the vehicle record only; never defaulted or invented. */
  readonly value: ReactNode;
}

interface VehicleFactsTableProps {
  caption: string;
  facts: readonly VehicleFact[];
}

/**
 * The profile Overview (spec 9) as a short spec sheet: who built the
 * vehicle, where, when it first flew and how it is arranged, one fact per
 * row, in place of prose that only restated the record.
 */
export function VehicleFactsTable({ caption, facts }: VehicleFactsTableProps) {
  return (
    <DataTable
      caption={caption}
      className="md:max-w-[40rem]"
      columns={[
        { cell: (fact) => fact.label, header: "Item", key: "label" },
        { cell: (fact) => fact.value, header: "Record", key: "value" },
      ]}
      getRowKey={(fact) => fact.label}
      rows={facts}
    />
  );
}
