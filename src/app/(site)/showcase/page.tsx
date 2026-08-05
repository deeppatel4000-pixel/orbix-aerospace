import type { Metadata } from "next";

import { ShowcasePage } from "@/features/showcase";

export const metadata: Metadata = {
  title: "Project Showcase",
  description:
    "Explore the ORBIX aerospace engineering platform, mission-control experience, technical architecture, and educational design philosophy.",
};

export default function ProjectShowcasePage() {
  return <ShowcasePage />;
}
