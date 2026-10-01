import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";

import { ProfileSectionNav, type ProfileNavItem } from "./profile-section-nav";

interface VehicleProfileLayoutProps {
  /** The profile sections, in reading order. */
  children: ReactNode;
  /**
   * The photographs, after the sections: from 64rem they run the full
   * container width, past the "On this page" column.
   */
  gallery?: ReactNode;
  /** The profile hero. */
  hero: ReactNode;
  navigation: readonly ProfileNavItem[];
  /** Related vehicles, after the sections. */
  related?: ReactNode;
}

/**
 * The profile template (spec 9, 11): the photo hero, then from 64rem a
 * plain "On this page" list in its own left column, sticky beside the
 * sections so it never covers them, and the sections to its right. The
 * gallery then takes the full width and the related vehicles return to
 * the sections' column. Below 64rem everything is one column, with the
 * list once above the sections, not sticky.
 */
export function VehicleProfileLayout({
  children,
  gallery,
  hero,
  navigation,
  related,
}: VehicleProfileLayoutProps) {
  return (
    <article>
      {hero}
      <Container className="pb-16 sm:pb-24 lg:grid lg:grid-cols-12 lg:gap-x-6">
        <div className="pt-4 pb-10 lg:col-span-3 lg:pt-12 lg:pb-0">
          <ProfileSectionNav items={navigation} />
        </div>
        <div className="min-w-0 lg:col-span-9">
          {/* The first section's rule would sit right under the hero. */}
          <div className="lg:[&>section:first-child]:border-t-0">
            {children}
          </div>
        </div>
        {gallery ? (
          <div className="min-w-0 lg:col-span-12">{gallery}</div>
        ) : null}
        {related ? (
          <div className="min-w-0 lg:col-span-9 lg:col-start-4">{related}</div>
        ) : null}
      </Container>
    </article>
  );
}
