import type { Metadata } from "next";

import { AircraftExplorer, listAircraft } from "@/features/aircraft";

export const metadata: Metadata = {
  title: "Aircraft Explorer",
  description:
    "Explore U.S. military aircraft through structured engineering profiles.",
};

export default function AircraftPage() {
  return <AircraftExplorer aircraft={listAircraft()} />;
}
