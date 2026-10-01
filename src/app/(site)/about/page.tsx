import { AboutPage, legalMetadata } from "@/features/legal";

export const metadata = legalMetadata({
  description:
    "A free educational site about aircraft, launch vehicles and aerospace engineering, made by a high school senior. Where its data comes from and how to get in touch.",
  path: "/about",
  title: "About",
});

export default function AboutPageRoute() {
  return <AboutPage />;
}
