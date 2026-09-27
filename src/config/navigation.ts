export const navigationItems = [
  { href: "/", label: "Home" },
  { href: "/aircraft", label: "Aircraft" },
  { href: "/rockets", label: "Rockets" },
  { href: "/compare", label: "Compare" },
  { href: "/engineering-lab", label: "Engineering Lab" },
  { href: "/showcase", label: "Showcase" },
  { href: "/learn", label: "Learn" },
] as const;

/**
 * Footer "About" group (spec 10, 14). The pages are built by the imagery
 * and legal task.
 */
export const legalNavigationItems = [
  { href: "/about", label: "About" },
  { href: "/credits", label: "Image credits" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/accessibility", label: "Accessibility" },
] as const;
