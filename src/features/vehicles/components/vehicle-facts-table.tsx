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
      // The caption names the list; an "Item / Record" header row over two
      // plain columns was chrome, so it stays for screen readers only.
      // (DataTable has no prop to hide its header; raised with T1.)
      // From 48rem a fixed layout with the label column at 40 percent, so
      // the values start on the same line on every profile. The sheet fills
      // the section track like every other profile table, so all tables
      // share one right edge.
      className="md:[&_table]:table-fixed md:[&_tbody_th]:w-2/5 [&_thead]:sr-only"
      columns={[
        { cell: (fact) => fact.label, header: "Item", key: "label" },
        { cell: (fact) => fact.value, header: "Record", key: "value" },
      ]}
      getRowKey={(fact) => fact.label}
      rows={facts}
    />
  );
}
