import type { Metadata } from "next";

import { EngineeringDashboard } from "@/features/engineering-lab";
import { socialOpenGraph } from "@/lib/social-image";

const title = "Engineering Lab";
const description =
  "Educational calculators for rocket propulsion, aerodynamics, compressible flow and orbits, with equations, units and stated assumptions.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...socialOpenGraph,
    title: `${title} | ORBIX`,
    description,
  },
};

export default function EngineeringLabPage() {
  return <EngineeringDashboard />;
}
