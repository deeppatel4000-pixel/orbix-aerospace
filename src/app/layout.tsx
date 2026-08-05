import type { Metadata, Viewport } from "next";

import { siteConfig } from "@/config/site";

import "./globals.css";

const productionUrl = "https://orbix-aerospace.vercel.app";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
  applicationName: siteConfig.name,
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
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    type: "website",
    url: "/",
  },
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  twitter: {
    card: "summary",
    description: siteConfig.description,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
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
