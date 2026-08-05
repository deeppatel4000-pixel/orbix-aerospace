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
  themeColor: "#07111f",
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
