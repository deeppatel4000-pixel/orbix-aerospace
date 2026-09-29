import type { Metadata } from "next";

import { listRockets, RocketExplorer } from "@/features/rockets";
import { socialOpenGraph } from "@/lib/social-image";

const title = "Launch vehicle registry";
const description =
  "Launch vehicles with their published specifications: stages, engines, liftoff thrust, height and payload to each destination orbit, each linked to a full profile.";

export const metadata: Metadata = {
  alternates: { canonical: "/rockets" },
  description,
  openGraph: {
    ...socialOpenGraph,
    description,
    locale: "en_US",
    siteName: "ORBIX",
    title: `${title} | ORBIX`,
    type: "website",
    url: "/rockets",
  },
  title,
};

export default function RocketsPage() {
  return <RocketExplorer rockets={listRockets()} />;
}
