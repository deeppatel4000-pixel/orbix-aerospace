/**
 * Operator and legal details shown in the footer and on the legal pages. One
 * place, so the contact address can be swapped for a dedicated ORBIX address
 * without touching components.
 */
export const siteLegal = {
  operatorName: "Deep Patel",
  contactEmail: "deep.patel4000@gmail.com",
  jurisdiction: "Commonwealth of Massachusetts, United States",
  /** ISO date (YYYY-MM-DD) the legal pages were last revised. */
  lastUpdated: "2026-09-27",
  /** Public source repository, as recorded in the git remote and README. */
  sourceCodeUrl: "https://github.com/deeppatel4000-pixel/orbix-aerospace",
  /** Hosting provider and its privacy policy. */
  hostName: "Vercel Inc.",
  hostPrivacyUrl: "https://vercel.com/legal/privacy-policy",
} as const;
