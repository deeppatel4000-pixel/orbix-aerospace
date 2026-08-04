import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getRocketById,
  listRocketIds,
  RocketProfile,
} from "@/features/rockets";

interface RocketDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return listRocketIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: RocketDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const rocket = getRocketById(id);

  if (!rocket) {
    return {
      title: "Rocket not found",
    };
  }

  return {
    title: rocket.name,
    description: rocket.description,
  };
}

export default async function RocketDetailPage({
  params,
}: RocketDetailPageProps) {
  const { id } = await params;
  const rocket = getRocketById(id);

  if (!rocket) notFound();

  return <RocketProfile rocket={rocket} />;
}
