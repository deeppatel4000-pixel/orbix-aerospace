import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  AircraftProfile,
  getAircraftById,
  listAircraftIds,
} from "@/features/aircraft";

interface AircraftDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return listAircraftIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: AircraftDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const aircraft = getAircraftById(id);

  if (!aircraft) {
    return {
      title: "Aircraft not found",
    };
  }

  return {
    title: aircraft.name,
    description: aircraft.description,
  };
}

export default async function AircraftDetailPage({
  params,
}: AircraftDetailPageProps) {
  const { id } = await params;
  const aircraft = getAircraftById(id);

  if (!aircraft) notFound();

  return <AircraftProfile aircraft={aircraft} />;
}
