import type { Metadata } from "next";

import { EngineeringDashboard } from "@/features/engineering-lab";

const title = "Engineering Lab";
const description =
  "Educational calculators for rocket propulsion, aerodynamics, compressible flow, atmospheric entry and orbital mechanics, with equations, units and stated assumptions.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} | ORBIX`,
    description,
  },
};

export default function EngineeringLabPage() {
  return <EngineeringDashboard />;
}
