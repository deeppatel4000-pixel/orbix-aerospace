import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";

import { ProfileSectionNav, type ProfileNavItem } from "./profile-section-nav";

interface VehicleProfileLayoutProps {
  /** Secondary action under the section list, such as "Compare with...". */
  action?: ReactNode;
  /** The profile sections, in reading order. */
  children: ReactNode;
  /** The credited figure. */
  figure: ReactNode;
  /** The page intro. */
  intro: ReactNode;
  navigation: readonly ProfileNavItem[];
  /** Related vehicles, full width after the body grid. */
  related?: ReactNode;
}

/**
 * The profile template (spec 14). From 1024px: main column 8 of 12, aside 4
 * of 12. The aside holds the credited figure and, sticky below the site
 * header, the "On this page" list and the compare action. Below 1024px the
 * aside comes first, so the photograph and the section list lead the page.
 */
export function VehicleProfileLayout({
  action,
  children,
  figure,
  intro,
  navigation,
  related,
}: VehicleProfileLayoutProps) {
  return (
    <article>
      {intro}
      <Container className="py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-6">
          <aside
            aria-label="Photograph and page contents"
            className="flex flex-col gap-8 lg:order-2 lg:col-span-4"
          >
            {figure}
            <div className="flex flex-col gap-6 lg:sticky lg:top-18">
              <ProfileSectionNav items={navigation} />
              {action ? <div>{action}</div> : null}
            </div>
          </aside>
          <div className="flex min-w-0 flex-col gap-12 sm:gap-16 lg:order-1 lg:col-span-8">
            {children}
          </div>
        </div>
        {related ? <div className="mt-12 sm:mt-16">{related}</div> : null}
      </Container>
    </article>
  );
}
