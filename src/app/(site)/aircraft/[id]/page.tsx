import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  AircraftProfile,
  formatAircraftMetaDescription,
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
      description: "No aircraft record exists at this address.",
    };
  }

  const title = `${aircraft.name} specifications`;
  const description = formatAircraftMetaDescription(aircraft);
  const url = `/aircraft/${aircraft.id}`;

  return {
    alternates: { canonical: url },
    description,
    openGraph: {
      description,
      locale: "en_US",
      siteName: "ORBIX",
      title: `${title} | ORBIX`,
      type: "article",
      url,
    },
    title,
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
