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

export function generateStaticParams() {
  return SHOWCASE_MISSIONS.map((mission) => ({ id: mission.preset.id }));
}

export async function generateMetadata({
  params,
}: ShowcaseCapturePageProps): Promise<Metadata> {
  const { id } = await params;
  const mission = getShowcaseMissionById(id);

  if (!mission) {
    return { title: "Mission Capture" };
  }

  return {
    description: `Capture-ready portfolio presentation for the ${mission.preset.name} educational mission preset.`,
    robots: { follow: false, index: false },
    title: `${mission.preset.name} Capture`,
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
