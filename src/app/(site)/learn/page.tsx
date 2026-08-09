import type { Metadata } from "next";

import { LearnPage } from "@/features/learn";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Six conceptual learning pathways connecting core aerospace physics to the Engineering Laboratory modules that calculate them.",
};

export default function Learn() {
  return <LearnPage />;
}
