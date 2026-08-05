import type { Metadata } from "next";

import { EngineeringDashboard } from "@/features/engineering-lab";

export const metadata: Metadata = {
  title: "Engineering Laboratory",
  description:
    "Apply aerospace engineering equations with validated, transparent calculators.",
};

export default function EngineeringLabPage() {
  return <EngineeringDashboard />;
}
