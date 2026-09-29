import type { ReactNode } from "react";

import { siteLegal } from "@/config/site-legal";
import {
  ReadingPage,
  type ReadingTocItem,
} from "@/features/legal/components/reading-page";
import { formatLegalDate } from "@/features/legal/lib/format-legal-date";

export type LegalTocItem = ReadingTocItem;

interface LegalPageProps {
  readonly children: ReactNode;
  /** Label above the H1, for example "Policies". */
  readonly eyebrow: string;
  readonly lead: string;
  readonly title: string;
  /** Trailing words of the H1, drawn in the accent. */
  readonly titleAccent?: string;
  /** Sections listed in the "On this page" list. Omit on short pages. */
  readonly toc?: readonly LegalTocItem[];
}

/**
 * About, Credits and the legal pages: the shared reading layout with the
 * revision date set in the left rail as a document fact.
 */
export function LegalPage({
  children,
  eyebrow,
  lead,
  title,
  titleAccent,
  toc,
}: LegalPageProps) {
  return (
    <ReadingPage
      eyebrow={eyebrow}
      lead={lead}
      meta={[
        {
          label: "Last updated",
          value: (
            <time className="orbix-data" dateTime={siteLegal.lastUpdated}>
              {formatLegalDate(siteLegal.lastUpdated)}
            </time>
          ),
        },
      ]}
      title={title}
      titleAccent={titleAccent}
      toc={toc}
    >
      {children}
    </ReadingPage>
  );
}
