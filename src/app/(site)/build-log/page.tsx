import { BuildLogPage } from "@/features/build-log";
import { legalMetadata } from "@/features/legal";

export const metadata = legalMetadata({
  description:
    "How Deep Patel, a high school student planning to study aerospace engineering, created ORBIX: his idea and research, his role, and how he used AI coding assistants to build the software.",
  path: "/build-log",
  title: "How I built ORBIX",
});

export default function BuildLogPageRoute() {
  return <BuildLogPage />;
}
