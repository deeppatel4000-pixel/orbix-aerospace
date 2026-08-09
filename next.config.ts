import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    // Required from Next.js 16: a local `next/image` src carrying a query
    // string must be explicitly allowed via `localPatterns`, otherwise the
    // build fails with `next-image-unconfigured-localpatterns`. ORBIX's site
    // logo requests `/brand/orbix-wordmark-transparent.png?surface=site-chrome`
    // (see src/components/layout/site-logo.tsx), so both shapes are declared:
    // every local asset without a query string, plus that one surface marker.
    // Declaring `localPatterns` at all makes it an allowlist, so the
    // no-query-string entry is required to keep every other image working.
    localPatterns: [
      { pathname: "/**", search: "" },
      { pathname: "/brand/**", search: "?surface=site-chrome" },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
