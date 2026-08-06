import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#02040a",
    description: "ORBIX — Advanced Aerospace Engineering Laboratory",
    display: "standalone",
    icons: [{ src: "/icon.png", sizes: "465x465", type: "image/png" }],
    name: "ORBIX — Advanced Aerospace Engineering Laboratory",
    short_name: "ORBIX",
    start_url: "/",
    theme_color: "#02040a",
  };
}
