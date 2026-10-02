import { CreditsPage, legalMetadata } from "@/features/legal";

export const metadata = legalMetadata({
  description:
    "Credits and licenses for the vehicle photographs, fonts, icons and open-source software used on ORBIX, plus trademark and non-affiliation notes.",
  path: "/credits",
  title: "Image credits and licenses",
});

export default function CreditsPageRoute() {
  return <CreditsPage />;
}
