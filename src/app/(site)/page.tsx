import type { Metadata } from "next";

import { HomePage } from "@/features/home/home-page";

const title = "ORBIX: aircraft, launch vehicles and aerospace engineering";
const description =
  "An educational project about aircraft, launch vehicles and the engineering behind them, with vehicle records, side-by-side comparison, and calculators for orbital mechanics, compressible flow and atmospheric entry.";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description,
  openGraph: {
    description,
    locale: "en_US",
    siteName: "ORBIX",
    title,
    type: "website",
    url: "/",
  },
  title: { absolute: title },
  twitter: {
    card: "summary",
    description,
    title,
  },
};

export default function Home() {
  return <HomePage />;
}
