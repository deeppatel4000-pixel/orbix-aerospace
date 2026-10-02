import type { Metadata, Viewport } from "next";
import { B612_Mono, IBM_Plex_Sans } from "next/font/google";

import { siteConfig } from "@/config/site";
import { siteLegal } from "@/config/site-legal";

import "./globals.css";

/**
 * ORBIX typography (design v3, spec 5) is self-hosted through
 * `next/font/google`: the files are downloaded at build time and served from
 * this origin, so there is no runtime request to a third party and no extra
 * dependency. Both families are licensed under the SIL Open Font License 1.1.
 *
 * IBM Plex Sans carries display, headings, body, labels and interface text,
 * and the Greek letters and fractions B612 Mono lacks.
 * The `wdth` axis is loaded for the condensed display cut (`font-stretch:
 * 84%`, see `.orbix-h1` in `src/styles/orbix-foundations.css`). There is no
 * serif: the long-form serif question is decided in spec 5.
 */
const plexSans = IBM_Plex_Sans({
  axes: ["wdth"],
  display: "swap",
  // Greek for the symbols in equations (ρ, γ, Δ): B612 Mono has no Greek,
  // so the telemetry stack falls back to Plex Sans for them (see
  // `--font-telemetry`). Its unicode-range keeps the file off pages
  // without Greek.
  subsets: ["latin", "greek"],
  variable: "--font-plex-sans",
});

/**
 * B612 Mono, designed for Airbus cockpit displays, sets figures, units and
 * equations only (spec 5). Never labels.
 */
const b612Mono = B612_Mono({
  // B612 Mono has no Greek. An empty fallback list stops next/font adding its
  // "B612 Mono Fallback" face (local Arial, no unicode-range), which would
  // draw ρ, Δ and μ before IBM Plex in `--font-telemetry`.
  adjustFontFallback: false,
  fallback: [],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-b612-mono",
  weight: ["400", "700"],
});

const productionUrl = siteConfig.url;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  alternateName: ["Orbix", "ORBIX aerospace"],
  author: {
    "@type": "Person",
    name: siteLegal.operatorName,
  },
  description: siteConfig.description,
  inLanguage: "en-US",
  name: siteConfig.wordmark,
  url: siteConfig.url,
};

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
  // Google Search Console ownership token (public by design).
  verification: {
    google: "sJI8wxoBdpUn5PYcNhs2dFnujf_DZ5mqPyuGZPiAseE",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#07090d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${b612Mono.variable}`}>
      {/* Browser extensions such as Grammarly add attributes to <body> before
          React hydrates. suppressHydrationWarning covers only this element's
          own attributes, so real mismatches deeper in the tree still warn. */}
      <body suppressHydrationWarning>
        {children}
        <script
          // Structured data so search engines know the site's name and
          // author. Static JSON built from config, no user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          type="application/ld+json"
        />
      </body>
    </html>
  );
}
