import type { Metadata } from "next";

import { EngineeringDashboard } from "@/features/engineering-lab";
import { siteConfig } from "@/config/site";
import { socialOpenGraph, socialTwitter } from "@/lib/social-image";

const title = "Engineering Lab";
const description =
  "Educational calculators for rocket propulsion, aerodynamics, compressible flow and orbits, with equations, units and stated assumptions.";

export const metadata: Metadata = {
  alternates: { canonical: "/engineering-lab" },
  title,
  description,
  openGraph: {
    ...socialOpenGraph,
    title: `${title} | ${siteConfig.wordmark}`,
    description,
    locale: "en_US",
    siteName: siteConfig.wordmark,
    type: "website",
    url: "/engineering-lab",
  },
  twitter: {
    ...socialTwitter,
    description,
    title: `${title} | ${siteConfig.wordmark}`,
  },
};

export default function EngineeringLabPage() {
  return <EngineeringDashboard />;
}
