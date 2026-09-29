import type { Metadata } from "next";

import { ShowcasePage } from "@/features/showcase";
import { socialOpenGraph, socialTwitter } from "@/lib/social-image";

const description =
  "Inside ORBIX: the data, calculator, analysis and report layers beneath React, the five mission presets shown from their inputs, and the checks that run in CI.";

const socialTitle = "Inside ORBIX | ORBIX";

export const metadata: Metadata = {
  alternates: { canonical: "/showcase" },
  description,
  openGraph: {
    ...socialOpenGraph,
    description,
    locale: "en_US",
    siteName: "ORBIX",
    title: socialTitle,
    type: "website",
    url: "/showcase",
  },
  title: "Inside ORBIX",
  twitter: {
    ...socialTwitter,
    description,
    title: socialTitle,
  },
};

export default function ProjectShowcasePage() {
  return <ShowcasePage />;
}
