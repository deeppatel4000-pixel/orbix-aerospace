import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";

import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";

export const metadata: Metadata = {
  title: "Learn",
  description: "Build aerospace engineering knowledge with guided lessons.",
};

export default function LearnPage() {
  return (
    <FeaturePlaceholder
      description="A future guided learning area that connects core physics and engineering concepts to real aerospace systems and design decisions."
      eyebrow="Learning pathways"
      icon={GraduationCap}
      plannedItems={[
        "Concept-first learning modules",
        "Progressive engineering pathways",
        "Glossary and supporting references",
      ]}
      title="Learn"
    />
  );
}
