import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * The shared visual grammar for vehicle profile sections.
 *
 * ## Why this exists
 *
 * Aircraft and rocket profiles each stack about twelve sections, and every one
 * of them rendered through a per-domain `ProfileSection` wrapper with an
 * identical shape: a left rail carrying a small uppercase eyebrow, an h2 and a
 * description, beside a content column. Twelve different kinds of information
 * — narrative, specifications, performance data, propulsion architecture,
 * imagery — all read as one repeated container, because one wrapper made them
 * all the same.
 *
 * The two wrappers had identical prop signatures
 * (`children`, `description`, `eyebrow`, `id`, `title`) and differed only in
 * cosmetics, so they collapse into this primitive cleanly.
 *
 * ## Modes
 *
 * A mode selects the RELATIONSHIP between a section's header and its content,
 * and how much width the content is allowed. It is not five unrelated designs:
 * every mode shares ORBIX typography, spacing, tokens and the division accent.
 *
 *   record        Left rail beside content. The historic layout, and the
 *                 DEFAULT — so the ~20 sections not yet migrated keep
 *                 rendering exactly as before. Suits structured factual
 *                 records where the label column aids scanning.
 *
 *   editorial     Header above, prose constrained to a reading measure.
 *                 For overview and historical narrative, which was previously
 *                 squeezed into a content column beside a rail.
 *
 *   data          Header above, content at full width. Performance metrics
 *                 and dashboards need horizontal room; the rail was taking a
 *                 third of it.
 *
 *   configuration Rail retained for orientation, content at full width. For
 *                 propulsion, staging and system architecture, where the
 *                 grouping is the content.
 *
 *   media         Minimal header, section chrome retreats so imagery carries
 *                 the visual weight.
 *
 * ## Division awareness
 *
 * The eyebrow uses `--orbix-division-accent`, which already resolves to amber
 * on `/aircraft/*` and orbital cyan on `/rockets/*` through the shell's
 * `data-orbix-division`. That reproduces both domains' previous accent colours
 * without either wrapper hardcoding one.
 */
export type VehicleProfileSectionMode =
  "configuration" | "data" | "editorial" | "media" | "record";

interface VehicleProfileSectionProps {
  children: ReactNode;
  className?: string;
  description: string;
  eyebrow: string;
  id: string;
  /** Defaults to `record`, which preserves the historic layout. */
  mode?: VehicleProfileSectionMode;
  title: string;
}

/** Modes that keep the header in a left rail beside the content. */
const railModes = new Set<VehicleProfileSectionMode>([
  "configuration",
  "record",
]);

export function VehicleProfileSection({
  children,
  className,
  description,
  eyebrow,
  id,
  mode = "record",
  title,
}: VehicleProfileSectionProps) {
  const titleId = `${id}-title`;
  const usesRail = railModes.has(mode);

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        // `scroll-mt` keeps anchored sections clear of the sticky header.
        // Unchanged from both previous wrappers so existing deep links land
        // in the same place.
        "orbix-profile-section scroll-mt-40",
        className,
      )}
      data-profile-mode={mode}
      id={id}
    >
      <div
        className={cn(
          usesRail &&
            "grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16",
        )}
      >
        <div className={cn(mode === "media" && "max-w-2xl")}>
          <p className="orbix-profile-section__eyebrow">{eyebrow}</p>
          <h2 className="orbix-profile-section__title" id={titleId}>
            {title}
          </h2>
          <p
            className={cn(
              "orbix-profile-section__description",
              // Beside a rail the description is already narrow; stacked
              // above full-width content it needs an explicit measure or it
              // runs to 1200px.
              !usesRail && "max-w-2xl",
            )}
          >
            {description}
          </p>
        </div>

        <div
          className={cn(
            !usesRail && "mt-10",
            // Editorial is the one mode that constrains its own content:
            // prose is unreadable at full container width.
            mode === "editorial" && "max-w-[68ch]",
          )}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
