import type { Metadata } from "next";

import { AircraftExplorer, listAircraft } from "@/features/aircraft";

const title = "Aircraft registry";
const description =
  "Military aircraft with their published specifications: dimensions, weights, engines, speed, range, service ceiling and variants, each linked to a full profile.";

export const metadata: Metadata = {
  alternates: { canonical: "/aircraft" },
  description,
  openGraph: {
    description,
    locale: "en_US",
    siteName: "ORBIX",
    title: `${title} | ORBIX`,
    type: "website",
    url: "/aircraft",
  },
  title,
};

export default function AircraftPage() {
  return <AircraftExplorer aircraft={listAircraft()} />;
}
