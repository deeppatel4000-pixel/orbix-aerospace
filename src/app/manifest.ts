import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#0e1114",
    description: siteConfig.description,
    display: "standalone",
    icons: [{ src: "/icon.png", sizes: "465x465", type: "image/png" }],
    name: "ORBIX",
    short_name: "ORBIX",
    start_url: "/",
    theme_color: "#0e1114",
  };
}
