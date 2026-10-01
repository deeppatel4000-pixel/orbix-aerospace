import { PrivacyPage, legalMetadata } from "@/features/legal";

export const metadata = legalMetadata({
  description:
    "ORBIX collects no personal information: no accounts, analytics, advertising or cookies. What the host logs and why nothing is stored on your device.",
  path: "/privacy",
  title: "Privacy policy",
});

export default function PrivacyPageRoute() {
  return <PrivacyPage />;
}
