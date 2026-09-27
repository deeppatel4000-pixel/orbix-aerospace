import { CookiesPage, legalMetadata } from "@/features/legal";

export const metadata = legalMetadata({
  description:
    "ORBIX sets no cookies and shows no cookie banner. How the Engineering Lab scenario library uses local storage on your device, and how to clear it.",
  path: "/cookies",
  title: "Cookies and local storage",
});

export default function CookiesPageRoute() {
  return <CookiesPage />;
}
