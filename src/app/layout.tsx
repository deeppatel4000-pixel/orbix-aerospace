import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { siteConfig } from "@/config/site";

import "./globals.css";

/**
 * ORBIX typography is self-hosted through `next/font/google`: the files are
 * downloaded at build time and served from this origin, so there is no
 * runtime request to a third party and no extra dependency. IBM Plex Sans and
 * IBM Plex Mono are licensed under the SIL Open Font License 1.1.
 *
 * Plex Sans carries prose, headings and interface text at normal width
 * (spec 5). The `wdth` axis is still loaded so existing `font-stretch`
 * declarations resolve, but no condensed cut is used.
 */
const plexSans = IBM_Plex_Sans({
  axes: ["wdth"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-plex-sans",
});

/** Machine values: numbers with units, equations, identifiers. */
const plexMono = IBM_Plex_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
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
  // The brand board is no longer used as the social preview image (spec
  // 12.4). Until a real home page screenshot or a typographic image exists,
  // no preview image is declared.
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
    card: "summary",
    description: siteConfig.description,
    title: `${siteConfig.wordmark} | ${siteConfig.tagline}`,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0e1114",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
