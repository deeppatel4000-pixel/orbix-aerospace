import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { siteLegal } from "@/config/site-legal";
import { formatLegalDate } from "@/features/legal/lib/format-legal-date";

export interface LegalTocItem {
  readonly id: string;
  readonly title: string;
}

interface LegalPageProps {
  readonly children: ReactNode;
  /** Short name used in the breadcrumb, for example "Privacy". */
  readonly crumb: string;
  readonly lead: string;
  readonly title: string;
  /** Sections listed in the "On this page" navigation. Omit on short pages. */
  readonly toc?: readonly LegalTocItem[];
}

/**
 * Reading template for About, Credits and the legal pages (spec 14): intro
 * with breadcrumb, one h1, one lead paragraph and the revision date, then
 * prose at a 68ch measure. Long pages get an "On this page" list, which sits
 * above the text on small screens and in a sticky column from 1024px.
 */
export function LegalPage({
  children,
  crumb,
  lead,
  title,
  toc,
}: LegalPageProps) {
  const hasToc = toc !== undefined && toc.length > 0;

  return (
    <>
      <div className="border-b border-border pt-12 pb-8">
        <Container>
          <Breadcrumbs
            items={[{ href: "/", label: "Home" }, { label: crumb }]}
          />
          <h1 className="orbix-h1 mt-4">{title}</h1>
          <p className="orbix-lead mt-4">{lead}</p>
          <p className="orbix-label mt-4">
            Last updated{" "}
            <time dateTime={siteLegal.lastUpdated}>
              {formatLegalDate(siteLegal.lastUpdated)}
            </time>
          </p>
        </Container>
      </div>

      <Container className="py-12 sm:py-16">
        <div
          className={
            hasToc ? "lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-6" : ""
          }
        >
          {hasToc ? (
            <nav
              aria-labelledby="legal-toc-heading"
              className="mb-12 border-b border-border pb-8 lg:sticky lg:top-18 lg:col-span-3 lg:mb-0 lg:border-b-0 lg:pb-0"
            >
              <h2 className="orbix-h4 text-text-primary" id="legal-toc-heading">
                On this page
              </h2>
              <ol className="mt-3 space-y-2 text-sm">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      className="text-text-secondary underline-offset-4 hover:text-text-primary hover:underline"
                      href={`#${item.id}`}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <div
            className={`orbix-prose break-words ${hasToc ? "lg:col-span-8 lg:col-start-5" : ""}`}
          >
            {children}
          </div>
        </div>
      </Container>
    </>
  );
}
