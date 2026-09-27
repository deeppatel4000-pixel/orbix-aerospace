import type { Metadata } from "next";

import { ShowcasePage } from "@/features/showcase";

const description =
  "How ORBIX is built: the data, calculator, analysis and report layers beneath React, the five mission presets shown from their inputs, and the checks that run in CI.";

const socialTitle = "How ORBIX is built | ORBIX";

export const metadata: Metadata = {
  alternates: { canonical: "/showcase" },
  description,
  openGraph: {
    description,
    locale: "en_US",
    siteName: "ORBIX",
    title: socialTitle,
    type: "website",
    url: "/showcase",
  },
  title: "How ORBIX is built",
  twitter: {
    card: "summary",
    description,
    title: socialTitle,
  },
};

export default function ProjectShowcasePage() {
  return <ShowcasePage />;
}
