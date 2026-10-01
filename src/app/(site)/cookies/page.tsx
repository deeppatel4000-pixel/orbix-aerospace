import { CookiesPage, legalMetadata } from "@/features/legal";

export const metadata = legalMetadata({
  description:
    "ORBIX sets no cookies, shows no cookie banner and stores nothing in your browser. What the hosting provider does.",
  path: "/cookies",
  title: "Cookies and local storage",
});

export default function CookiesPageRoute() {
  return <CookiesPage />;
}
