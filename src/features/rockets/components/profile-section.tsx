import type { ReactNode } from "react";

import {
  VehicleProfileSection,
  type VehicleProfileSectionMode,
} from "@/features/vehicles/components/vehicle-profile-section";

interface ProfileSectionProps {
  children: ReactNode;
  description: string;
  eyebrow: string;
  id: string;
  /**
   * Optional. Omitted, the shared primitive uses `record` — the historic
   * rail-beside-content layout — so every section that has not yet adopted a
   * mode renders as before.
   */
  mode?: VehicleProfileSectionMode;
  title: string;
}

/**
 * Thin adapter over the shared vehicle profile section.
 *
 * The prop contract is unchanged, so the existing consumers in this feature
 * need no edits. It exists so mode adoption can proceed section by section
 * rather than as one import rewrite across ~20 files.
 */
export function ProfileSection(props: ProfileSectionProps) {
  return <VehicleProfileSection {...props} />;
}
