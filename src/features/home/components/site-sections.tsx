import Link from "next/link";

import { Container } from "@/components/layout/container";

/**
 * "What is here" (spec 14, Home, step 3).
 *
 * A plain list of the site's sections: an `h3` link and one sentence each.
 * Two columns from 768px, no cards, no icons. Every sentence describes what
 * the route contains today, nothing it might contain later.
 */
const SECTIONS = [
  {
    description:
      "Records of military aircraft such as the F-22 Raptor and SR-71 Blackbird, with dimensions, performance, propulsion and variants.",
    href: "/aircraft",
    title: "Aircraft",
  },
  {
    description:
      "Records of launch vehicles from Saturn V to Starship, with stages, liftoff thrust, payload capacity and supported orbits.",
    href: "/rockets",
    title: "Launch vehicles",
  },
  {
    description:
      "Up to three aircraft, or up to three launch vehicles, side by side in one table with units and qualifiers kept.",
    href: "/compare",
    title: "Compare",
  },
  {
    description:
      "Calculators for lift and drag, the standard atmosphere, the rocket equation, orbital transfers, shock waves and entry heating.",
    href: "/engineering-lab",
    title: "Engineering Lab",
  },
  {
    description:
      "Reading pathways from flight fundamentals to orbital mechanics and atmospheric entry, each linked to the calculators that apply it.",
    href: "/learn",
    title: "Learn",
  },
  {
    description:
      "How ORBIX is put together: its architecture, the limits of its engineering models, and the checks it runs.",
    href: "/showcase",
    title: "How ORBIX is built",
  },
] as const;

export function SiteSections() {
  return (
    <section aria-labelledby="home-sections-title">
      <Container>
        <h2 className="orbix-h2" id="home-sections-title">
          What is here
        </h2>
        <ul className="mt-6 grid gap-x-6 border-t border-border-subtle md:grid-cols-2">
          {SECTIONS.map((section) => (
            <li
              className="border-b border-border-subtle py-4"
              key={section.href}
            >
              <h3 className="orbix-h3">
                <Link className="orbix-link" href={section.href}>
                  {section.title}
                </Link>
              </h3>
              <p className="mt-1 max-w-[60ch] text-sm leading-6 text-text-secondary">
                {section.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
