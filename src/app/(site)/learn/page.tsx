import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { LearnPage } from "@/features/learn";
import { socialOpenGraph, socialTwitter } from "@/lib/social-image";

const title = "Learn";
const description =
  "Six reading pathways on the physics behind the ORBIX Engineering Lab: aerodynamics, propulsion, compressible flow, atmospheric entry, orbital mechanics and engineering communication, with links to the Engineering Lab tools and to published references.";

export const metadata: Metadata = {
  alternates: { canonical: "/learn" },
  description,
  openGraph: {
    ...socialOpenGraph,
    description,
    locale: "en_US",
    siteName: siteConfig.wordmark,
    title: `${title} | ${siteConfig.wordmark}`,
    type: "website",
    url: "/learn",
  },
  title,
  twitter: {
    ...socialTwitter,
    description,
    title: `${title} | ${siteConfig.wordmark}`,
  },
};

export default function Learn() {
  return <LearnPage />;
}
