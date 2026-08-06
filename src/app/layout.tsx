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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
