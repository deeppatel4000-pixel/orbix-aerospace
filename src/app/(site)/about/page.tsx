import { AboutPage, legalMetadata } from "@/features/legal";

export const metadata = legalMetadata({
  description:
    "What ORBIX is: a free educational site about aircraft, launch vehicles and aerospace engineering, built by a student. Where its data comes from and how to get in touch.",
  path: "/about",
  title: "About",
});

export default function AboutPageRoute() {
  return <AboutPage />;
}
