import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  RocketProfile,
  formatRocketMetaDescription,
  getRocketById,
  listRocketIds,
} from "@/features/rockets";
import { socialOpenGraph } from "@/lib/social-image";

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
      title: "Launch vehicle not found",
      description: "No launch vehicle record exists at this address.",
    };
  }

  const title = `${rocket.name} specifications`;
  const description = formatRocketMetaDescription(rocket);
  const url = `/rockets/${rocket.id}`;

  return {
    alternates: { canonical: url },
    description,
    openGraph: {
      ...socialOpenGraph,
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

export default async function RocketDetailPage({
  params,
}: RocketDetailPageProps) {
  const { id } = await params;
  const rocket = getRocketById(id);

  if (!rocket) notFound();

  return <RocketProfile rocket={rocket} />;
}
