import type { Metadata, Viewport } from "next";

import { siteConfig } from "@/config/site";

import "./globals.css";

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
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
