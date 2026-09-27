import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShowcaseCapture } from "@/features/showcase/components/showcase-capture";
import {
  getShowcaseMissionById,
  SHOWCASE_MISSIONS,
} from "@/features/showcase/data/mission-showcase";

interface ShowcaseCapturePageProps {
  readonly params: Promise<{ id: string }>;
}

/**
 * Internal presentation view used for portfolio screenshots. It has no site
 * chrome and duplicates content from `/showcase`, so it is never indexed.
 */
const robots: Metadata["robots"] = { follow: false, index: false };

export function generateStaticParams() {
  return SHOWCASE_MISSIONS.map((mission) => ({ id: mission.preset.id }));
}

export async function generateMetadata({
  params,
}: ShowcaseCapturePageProps): Promise<Metadata> {
  const { id } = await params;
  const mission = getShowcaseMissionById(id);

  if (!mission) {
    return { robots, title: "Mission preset not found" };
  }

  const title = `${mission.preset.name} presentation view`;
  const description = `The ${mission.preset.name} educational mission preset on one screen: its inputs, a diagram drawn from them where they support one, and the Engineering Lab analyses its inputs run.`;

  return {
    description,
    openGraph: { description, title: `${title} | ORBIX` },
    robots,
    title,
  };
}

export default async function ShowcaseCapturePage({
  params,
}: ShowcaseCapturePageProps) {
  const { id } = await params;
  const mission = getShowcaseMissionById(id);

  if (!mission) {
    notFound();
  }

  return <ShowcaseCapture mission={mission} />;
}
