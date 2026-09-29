import { Container } from "@/components/layout/container";
import { SectionIndex, type SectionIndexItem } from "@/components/ui";

/**
 * The rest of the site as a numbered section index (design v2, spec 9,
 * Home): a condensed H2 on the left and the 01 to 06 rows on the right from
 * 1024px. One sentence each, describing what the route contains today and
 * nothing it might contain later.
 */
const SECTIONS: readonly SectionIndexItem[] = [
  {
    description:
      "Up to three aircraft, or up to three launch vehicles, side by side in one table with units and qualifiers kept.",
    href: "/compare",
    title: "Compare",
  },
  {
    description:
      "Calculators for lift and drag, the standard atmosphere, the rocket equation, orbital transfers, shock waves and entry heating, each with its equation and assumptions.",
    href: "/engineering-lab",
    title: "Engineering Lab",
  },
  {
    description:
      "Six reading pathways, from aerodynamics and propulsion to atmospheric entry, orbital mechanics and engineering communication, each linked to the Engineering Lab tools that apply it.",
    href: "/learn",
    title: "Learn",
  },
  {
    description:
      "ORBIX calculations run with the inputs of published tables and worked examples, and their results compared with the published values.",
    href: "/verification",
    title: "Verification",
  },
  {
    description:
      "My idea and research, my role, and how I used AI coding assistants to build the software.",
    href: "/build-log",
    title: "How I built ORBIX",
  },
  {
    description:
      "The data, calculator, analysis and report layers beneath the interface, the five mission presets shown from their inputs, and the checks that run in CI.",
    href: "/showcase",
    title: "Showcase",
  },
];

export function SiteSections() {
  return (
    <section
      aria-labelledby="home-sections-title"
      className="orbix-section pt-0!"
    >
      <Container className="grid gap-8 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-4">
          <h2 className="orbix-h2 lg:sticky lg:top-24" id="home-sections-title">
            Beyond the registries.
          </h2>
        </div>
        <SectionIndex className="lg:col-span-8" items={SECTIONS} />
      </Container>
    </section>
  );
}
