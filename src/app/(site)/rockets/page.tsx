import type { Metadata } from "next";

import { listRockets, RocketExplorer } from "@/features/rockets";

export const metadata: Metadata = {
  title: "Rocket Explorer",
  description:
    "Explore U.S. launch vehicles through structured engineering profiles.",
};

export default function RocketsPage() {
  return <RocketExplorer rockets={listRockets()} />;
}
