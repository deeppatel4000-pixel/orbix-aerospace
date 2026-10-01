/**
 * Header navigation (v4 plan section 3): five links, in this order. The
 * wordmark links home, so Home is not listed.
 */
export const navigationItems = [
  { href: "/engineering-lab", label: "Engineering Lab" },
  { href: "/verification", label: "Verification" },
  { href: "/aircraft", label: "Aircraft" },
  { href: "/rockets", label: "Rockets" },
  { href: "/build-log", label: "How I built it" },
] as const;

/**
 * Footer site links (v4 plan section 3). The mobile menu shows the same
 * group under the header links.
 */
export const footerNavigationItems = [
  { href: "/compare", label: "Compare" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
  { href: "/credits", label: "Image credits" },
] as const;

/** Footer legal pages. */
export const legalNavigationItems = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/accessibility", label: "Accessibility" },
] as const;
