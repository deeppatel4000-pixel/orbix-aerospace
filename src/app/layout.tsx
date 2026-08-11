import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import { siteConfig } from "@/config/site";

import "./globals.css";

/**
 * ORBIX typography is self-hosted so the product's identity is identical on
 * every operating system.
 *
 * Before this, no web font was loaded at all: `--font-interface` resolved to
 * Aptos (Microsoft Office) and `--font-display` to Bahnschrift (Windows only).
 * On macOS and Linux those fall through to Arial and Arial Narrow, so ORBIX
 * rendered in a different typeface depending on who opened it.
 *
 * `next/font/google` downloads the files at build time and serves them from
 * this origin — there is no runtime request to Google, no external CDN in the
 * critical path, and no new package dependency (`next/font` ships with Next).
 * Nothing is fetched by the browser from a third party.
 *
 * IBM Plex was commissioned as the corporate typeface of an engineering
 * company, which is the register ORBIX wants: humanist and readable, but
 * disciplined rather than friendly. It is licensed under the SIL Open Font
 * License 1.1.
 *
 * Only TWO families are loaded, because the sans is variable and carries a
 * `wdth` axis (75-100). The condensed display voice ORBIX previously borrowed
 * from Bahnschrift is therefore the *same typeface* at a narrower width, not a
 * second font file — see `--font-display` and `.font-display` in
 * `src/styles/`. Weight is variable across 100-700, so headings and UI share
 * one download.
 */
const plexSans = IBM_Plex_Sans({
  axes: ["wdth"],
  display: "swap",
  subsets: ["latin"],
  variable: "--font-plex-sans",
});

/**
 * The data voice. Loaded at the three weights the interface actually uses, to
 * keep the payload honest.
 */
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
    "engineering learning",
    "STEM",
  ],
  metadataBase: new URL(productionUrl),
  openGraph: {
    description: siteConfig.description,
    images: [
      {
        alt: "ORBIX official brand identity",
        height: 1536,
        url: "/brand/orbix-brand-suite.png",
        width: 2816,
      },
    ],
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
    images: ["/brand/orbix-brand-suite.png"],
    title: `${siteConfig.wordmark} | ${siteConfig.tagline}`,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#02040a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `data-scroll-behavior="smooth"` is required from Next.js 16 onward.
    // `src/styles/orbix-foundations.css` sets `scroll-behavior: smooth` on
    // `html`. Next 15 silently forced `scroll-behavior: auto` for the duration
    // of a route transition so navigation snapped to the top instantly; Next 16
    // only does that when this attribute is present. Without it, every route
    // change would animate-scroll instead of snapping — a UX regression, and a
    // source of screenshot flakiness for the visual suite, which could capture
    // a page mid-scroll. Reduced-motion behaviour is unaffected: the
    // `prefers-reduced-motion` rule in `orbix-motion.css` still overrides
    // `scroll-behavior` to `auto`.
    <html
      lang="en"
      className={`${plexSans.variable} ${plexMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
