import type { Metadata } from "next";
import { FlaskConical } from "lucide-react";

import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";

export const metadata: Metadata = {
  title: "Engineering Lab",
  description: "Apply aerospace engineering principles in guided tools.",
};

export default function EngineeringLabPage() {
  return (
    <FeaturePlaceholder
      description="A future hands-on workspace for applying equations, testing assumptions, and seeing how inputs affect aerospace engineering outcomes."
      eyebrow="Applied engineering"
      icon={FlaskConical}
      plannedItems={[
        "Guided engineering calculators",
        "Transparent formulas and assumptions",
        "Educational interactive simulations",
      ]}
      title="Engineering Lab"
    />
  );
}
