/**
 * A learning pathway's accent identity. Each value maps to an existing
 * ORBIX design-token color (see `src/styles/orbix-tokens.css`) so pathway
 * presentation never introduces new colors outside the design system.
 */
export type LearnAccent =
  "accent" | "atmosphere" | "laboratory" | "plasma" | "signal" | "tactical";

/**
 * Subset of `OrbixSurfaceVariant` (see `@/components/ui/orbix-surface`) that
 * makes sense for a static, non-interactive content panel. `hero` is
 * intentionally excluded — it is reserved for page-level hero treatment.
 */
export type LearnSurfaceVariant =
  "engineering" | "gallery" | "mission" | "report" | "telemetry" | "vehicle";

/**
 * A real, verified deep link into an Engineering Laboratory module. `label`
 * mirrors the analyzer's published title on `/engineering-lab` so a reader
 * recognizes the destination before they click through.
 */
export interface LearnLabAnchor {
  readonly anchorId: string;
  readonly label: string;
}

/**
 * A real, verified link elsewhere in ORBIX (a vehicle catalog, a specific
 * vehicle profile, the comparison engine, or the showcase) that lets a
 * reader see a pathway's concepts applied to published ORBIX content.
 */
export interface LearnExplorationLink {
  readonly description: string;
  readonly href: string;
  readonly label: string;
}

/**
 * One conceptual learning pathway. Every string field is general aerospace
 * theory — never a specific vehicle specification or a computed result.
 * Computed output only ever lives behind `labAnchors` links, inside the
 * Engineering Laboratory.
 */
export interface LearningArea {
  readonly accent: LearnAccent;
  readonly code: string;
  readonly concept: string;
  readonly explorationLinks: readonly LearnExplorationLink[];
  readonly id: string;
  readonly labAnchors: readonly LearnLabAnchor[];
  readonly realWorldContext: string;
  readonly surfaceVariant: LearnSurfaceVariant;
  readonly title: string;
  readonly whyItMatters: string;
}
