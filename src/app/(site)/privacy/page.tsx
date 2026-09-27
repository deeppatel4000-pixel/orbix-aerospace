import { PrivacyPage, legalMetadata } from "@/features/legal";

export const metadata = legalMetadata({
  description:
    "ORBIX collects no personal information: no accounts, analytics, advertising or cookies. What the host logs, what stays on your device, and how to remove it.",
  path: "/privacy",
  title: "Privacy policy",
});

export default function PrivacyPageRoute() {
  return <PrivacyPage />;
}
