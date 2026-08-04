import type { Metadata } from "next";
import { Scale } from "lucide-react";

import { FeaturePlaceholder } from "@/components/layout/feature-placeholder";

export const metadata: Metadata = {
  title: "Compare",
  description: "Compare aerospace vehicles through an engineering lens.",
};

export default function ComparePage() {
  return (
    <FeaturePlaceholder
      description="A future analysis workspace for placing vehicles side by side and understanding the engineering tradeoffs behind their differences."
      eyebrow="Tradeoff analysis"
      icon={Scale}
      plannedItems={[
        "Side-by-side technical characteristics",
        "Normalized engineering units",
        "Clear explanations of design tradeoffs",
      ]}
      title="Compare"
    />
  );
}
