import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";

import { ProfileSectionNav, type ProfileNavItem } from "./profile-section-nav";

interface VehicleProfileLayoutProps {
  /** The profile sections, in reading order. */
  children: ReactNode;
  /** The profile hero. */
  hero: ReactNode;
  navigation: readonly ProfileNavItem[];
  /** Related vehicles, after the sections. */
  related?: ReactNode;
}

/**
 * The profile template (spec 9): the photo hero, a sticky "On this page"
 * bar, then the sections as full-width spec sheets and the related
 * vehicles.
 */
export function VehicleProfileLayout({
  children,
  hero,
  navigation,
  related,
}: VehicleProfileLayoutProps) {
  return (
    <article>
      {hero}
      <ProfileSectionNav items={navigation} />
      <Container className="pb-16 sm:pb-24">
        {/* The first section's top rule would sit on the bar's own rule. */}
        <div className="[&>section:first-child]:border-t-0">{children}</div>
        {related}
      </Container>
    </article>
  );
}
