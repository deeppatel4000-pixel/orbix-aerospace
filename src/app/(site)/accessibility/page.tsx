import { AccessibilityPage, legalMetadata } from "@/features/legal";

export const metadata = legalMetadata({
  description:
    "The ORBIX accessibility target (WCAG 2.2 Level AA), the measures taken, known limitations such as the 3D visualizations, and how to report a problem.",
  path: "/accessibility",
  title: "Accessibility statement",
});

export default function AccessibilityPageRoute() {
  return <AccessibilityPage />;
}
