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
  readonly lead: string;
  /** Optional art-directed photograph under the intro rule. */
  readonly plate?: ReactNode;
  readonly title: string;
  /** Sections listed in the "On this page" list. Omit on short pages. */
  readonly toc?: readonly LegalTocItem[];
}

/**
 * About, Credits and the legal pages: the shared reading layout with the
 * revision date set in the left rail as a document fact.
 */
export function LegalPage({
  children,
  lead,
  plate,
  title,
  toc,
}: LegalPageProps) {
  return (
    <ReadingPage
      lead={lead}
      meta={[
        {
          label: "Last updated",
          value: (
            <time dateTime={siteLegal.lastUpdated}>
              {formatLegalDate(siteLegal.lastUpdated)}
            </time>
          ),
        },
      ]}
      plate={plate}
      title={title}
      toc={toc}
    >
      {children}
    </ReadingPage>
  );
}
