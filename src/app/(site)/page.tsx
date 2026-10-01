import type { Metadata } from "next";

import { HomePage } from "@/features/home/home-page";
import { socialOpenGraph, socialTwitter } from "@/lib/social-image";

const title = "ORBIX: aerospace engineering, explained with real vehicles";
const description =
  "A personal project by Deep Patel, a high school senior who plans to study aerospace engineering: calculators from lift and drag to orbital transfers, with selected results checked against published tables and worked examples.";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description,
  openGraph: {
    ...socialOpenGraph,
    description,
    locale: "en_US",
    siteName: "ORBIX",
    title,
    type: "website",
    url: "/",
  },
  title: { absolute: title },
  twitter: {
    ...socialTwitter,
    description,
    title,
  },
};

export default function Home() {
  return <HomePage />;
}
