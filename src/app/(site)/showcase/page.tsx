import type { Metadata } from "next";

import { ShowcasePage } from "@/features/showcase";

export const metadata: Metadata = {
  title: "Project Showcase",
  description:
    "Explore five ORBIX educational mission concepts, the mission-control experience, engineering systems, visualizations, and technical architecture.",
};

export default function ProjectShowcasePage() {
  return <ShowcasePage />;
}
