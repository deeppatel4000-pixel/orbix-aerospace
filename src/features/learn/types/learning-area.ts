/**
 * A deep link into an Engineering Lab module, reachable at
 * `/engineering-lab#<anchorId>`. `label` matches the module's heading on
 * `/engineering-lab` so a reader recognizes the destination. The heading
 * comes from the lab's `MODULES` map in engineering-dashboard.tsx, and
 * learning-areas.test.ts fails if the two drift apart.
 */
export interface LearnLabAnchor {
  readonly anchorId: string;
  readonly label: string;
}

/**
 * A link to another ORBIX route (a registry, a vehicle profile, Compare, or
 * the build log) where a pathway's ideas can be seen applied to published content.
 */
export interface LearnExplorationLink {
  readonly description: string;
  readonly href: string;
  readonly label: string;
}

/**
 * One symbol in an equation's variables legend. `symbol` may use `_x` for a
 * subscript ("C_L", "I_sp"). `unit` is omitted only for dimensionless
 * quantities, because the legend reads a missing unit that way.
 */
export interface LearnEquationVariable {
  readonly meaning: string;
  readonly symbol: string;
  readonly unit?: string;
}

/**
 * One key idea: a plain-language statement, optionally with the governing
 * relation written as a short equation. An idea with an equation is shown
 * as an `EquationBlock`, so it also names the relation (`equationLabel`),
 * says how a screen reader should read it (`spokenAs`), and defines every
 * symbol it uses (`variables`).
 */
export interface LearnKeyIdea {
  /**
   * The relation, with `_x` for subscripts and ` · ` between multiplied
   * terms, as on /engineering-lab. A `\n` separates relations set on
   * their own lines.
   */
  readonly equation?: string;
  readonly equationLabel?: string;
  readonly spokenAs?: string;
  readonly text: string;
  readonly variables?: readonly LearnEquationVariable[];
}

/**
 * A published reference. `href` is present when a stable public copy exists
 * (NASA and NACA documents); textbooks are cited without a link.
 */
export interface LearnReference {
  readonly href?: string;
  readonly source: string;
  readonly title: string;
}

/**
 * One reading pathway. Every string is general, textbook-level theory. No
 * vehicle specification or computed result is stated here; numbers are only
 * calculated behind the `labAnchors` links, in the Engineering Lab.
 */
export interface LearningArea {
  readonly explorationLinks: readonly LearnExplorationLink[];
  readonly furtherReading: readonly LearnReference[];
  readonly id: string;
  readonly keyIdeas: readonly LearnKeyIdea[];
  readonly labAnchors: readonly LearnLabAnchor[];
  readonly summary: string;
  readonly title: string;
  readonly whyItMatters: string;
}
