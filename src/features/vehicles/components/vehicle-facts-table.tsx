import type { ReactNode } from "react";
import { keepDesignations } from "@/lib/designations";

export interface VehicleFact {
  readonly label: string;
  /** Taken from the vehicle record only; never defaulted or invented. */
  readonly value: ReactNode;
}

interface VehicleFactsTableProps {
  facts: readonly VehicleFact[];
}

/**
 * The profile Overview (spec 6, 11): who built the vehicle, where, when it
 * first flew and how it is arranged, as an open definition list, label
 * beside value from 40rem, separated by space only.
 */
export function VehicleFactsTable({ facts }: VehicleFactsTableProps) {
  return (
    <dl className="grid max-w-[46rem] gap-y-4 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-x-8">
      {facts.map((fact) => (
        <div className="contents" key={fact.label}>
          <dt className="orbix-label pt-0.5">{fact.label}</dt>
          <dd className="-mt-3 text-foreground sm:mt-0">
            {keepDesignations(fact.value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
