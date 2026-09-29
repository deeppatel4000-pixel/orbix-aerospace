import type { Metadata, Viewport } from "next";
import { B612_Mono, IBM_Plex_Sans } from "next/font/google";

import { siteConfig } from "@/config/site";

import "./globals.css";

/**
 * ORBIX typography (design v2, spec 5) is self-hosted through
 * `next/font/google`: the files are downloaded at build time and served from
 * this origin, so there is no runtime request to a third party and no extra
 * dependency. Both families are licensed under the SIL Open Font License 1.1.
 *
 * IBM Plex Sans carries display, headings, body and interface text. The
 * `wdth` axis is loaded for the condensed display cut (`font-stretch: 84%`,
 * see `.orbix-display` and `.orbix-h1` in `src/styles/orbix-foundations.css`).
 */
const plexSans = IBM_Plex_Sans({
  axes: ["wdth"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-plex-sans",
});

/**
 * B612 Mono, designed for Airbus cockpit displays, sets data: readouts, spec
 * values, units, table figures and small uppercase labels.
 */
const b612Mono = B612_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-b612-mono",
  weight: ["400", "700"],
});

const productionUrl = "https://orbix-aerospace.vercel.app";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  applicationName: siteConfig.wordmark,
  category: "education",
  description: siteConfig.description,
  keywords: [
    "aerospace engineering",
    "aircraft education",
    "rocket science",
    "orbital mechanics",
    "spacecraft mission design",
    "engineering education",
    "STEM",
  ],
  metadataBase: new URL(productionUrl),
  // The 1200x630 social preview image comes from src/app/opengraph-image.tsx
  // and twitter-image.tsx; no static image is declared here so the file
  // convention is the single source.
  openGraph: {
    description: siteConfig.description,
    locale: "en_US",
    siteName: siteConfig.wordmark,
    title: `${siteConfig.wordmark} | ${siteConfig.tagline}`,
    type: "website",
    url: "/",
  },
  title: {
    default: `${siteConfig.wordmark} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.wordmark}`,
  },
  twitter: {
    card: "summary_large_image",
    description: siteConfig.description,
    title: `${siteConfig.wordmark} | ${siteConfig.tagline}`,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#03060c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${b612Mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
