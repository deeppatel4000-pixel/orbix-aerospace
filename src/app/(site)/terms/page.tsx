import { TermsPage, legalMetadata } from "@/features/legal";

export const metadata = legalMetadata({
  description:
    "Terms for using ORBIX, a free educational site: simplified models for learning only, no warranty, MIT-licensed code, trademarks and Massachusetts governing law.",
  path: "/terms",
  title: "Terms of use",
});

export default function TermsPageRoute() {
  return <TermsPage />;
}
